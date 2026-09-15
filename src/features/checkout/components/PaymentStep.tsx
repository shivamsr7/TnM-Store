import {
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  releaseCheckoutInventoryReservation,
  checkCheckoutInventoryAvailability,
} from "@/features/payment/services/razorpay.service";


interface Props {

  totalAmount: number;

  checkoutQuoteId: string;

  customerId: string;

  customerPhone?: string | null;

  /*
   * Optional wallet amount already selected/held for this checkout.
   * The server remains the source of truth; this is only used for
   * displaying the expected payment split in the UI.
   */
  walletAmountPaise?: number;

  /*
   * Optional Play & Earn Wallet amount already selected/held for
   * this checkout. The server remains the source of truth.
   */
  playEarnWalletAmountPaise?: number;

  playEarnWalletHoldId?: string | null;

  /*
   * Called immediately when payment succeeds, before server-side
   * verification/order completion finishes.
   */
  onPaymentSuccessStart?: () => void;

  onSuccess: (paymentData: any) => void;

}


export default function PaymentStep({

  totalAmount,

  checkoutQuoteId,

  customerId,

  customerPhone = null,

  walletAmountPaise = 0,

  playEarnWalletAmountPaise = 0,

  playEarnWalletHoldId = null,

  onPaymentSuccessStart,

  onSuccess,

}: Props) {


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");

  const [
    inventoryError,
    setInventoryError,
  ] = useState("");

  const [
    inventoryAvailabilityStatus,
    setInventoryAvailabilityStatus,
  ] = useState<"checking" | "available" | "unavailable">("checking");


  /*
   * Once Razorpay invokes the success handler, keep the inventory
   * reservation intact while payment verification/order recovery
   * is running. Razorpay may close the modal immediately after the
   * success handler, so ondismiss must not release the reservation
   * in that case.
   */
  const paymentSuccessHandlerStartedRef =
    useRef(false);


  const localWalletAmount =
    Math.max(
      0,
      Number(walletAmountPaise || 0)
    ) / 100;


  const localPlayEarnWalletAmount =
    Math.max(
      0,
      Number(playEarnWalletAmountPaise || 0)
    ) / 100;


  const hasWallet =
    localWalletAmount > 0;


  const hasPlayEarnWallet =
    localPlayEarnWalletAmount > 0;


  const estimatedPayableAmount =
    Math.max(
      0,
      totalAmount -
      localWalletAmount -
      localPlayEarnWalletAmount
    );


  /*
   * If this customer was blocked because another customer temporarily
   * reserved the last piece, keep checking the server-side availability
   * while the popup is open. When the other reservation is released or
   * expires, the popup updates automatically without a page refresh.
   */
  useEffect(() => {

    if (
      !inventoryError ||
      inventoryAvailabilityStatus !== "checking" ||
      !checkoutQuoteId ||
      !customerId
    ) {
      return;
    }

    let mounted = true;
    let checking = false;

    const checkAvailability = async () => {

      if (checking) {
        return;
      }

      checking = true;

      try {

        const available =
          await checkCheckoutInventoryAvailability(
            checkoutQuoteId,
            customerId,
            customerPhone
          );

        if (!mounted) {
          return;
        }

        if (available === "available") {
          setInventoryAvailabilityStatus("available");
        } else if (available === "unavailable") {
          setInventoryAvailabilityStatus("unavailable");
        }

      } catch (availabilityError) {

        console.error(
          "Could not refresh checkout inventory availability:",
          availabilityError
        );

      } finally {

        checking = false;

      }

    };

    checkAvailability();

    const intervalId =
      window.setInterval(
        checkAvailability,
        2500
      );

    return () => {

      mounted = false;

      window.clearInterval(
        intervalId
      );

    };

  }, [
    inventoryError,
    inventoryAvailabilityStatus,
    checkoutQuoteId,
    customerId,
    customerPhone,
  ]);


  async function handlePayment() {

    if (loading) {
      return;
    }


    if (!checkoutQuoteId) {

      setError(
        "Secure checkout quote is missing. Please return to the address step and try again."
      );

      return;

    }


    try {

      paymentSuccessHandlerStartedRef.current =
        false;

      setError("");
      setInventoryError("");

      setLoading(true);


      /*
       * Create the payment from the server-side secure quote.
       *
       * The server decides:
       * - whether wallet credit is being used
       * - how much wallet credit is applied
       * - whether Razorpay is required
       * - the exact Razorpay payable amount
       */

      const razorpayOrder =
        await createRazorpayOrder(
          checkoutQuoteId,
          {
            playEarnWalletHoldId:
              playEarnWalletHoldId,
            playEarnWalletAmountPaise:
              Math.max(
                0,
                Number(
                  playEarnWalletAmountPaise || 0
                )
              ),
          }
        );


      const serverWalletAmountPaise =
        Number(
          razorpayOrder.wallet_amount_paise || 0
        );


      const serverPlayEarnWalletAmountPaise =
        Number(
          razorpayOrder.play_earn_wallet_amount_paise || 0
        );


      const serverWalletAmount =
        serverWalletAmountPaise / 100;


      const serverPlayEarnWalletAmount =
        serverPlayEarnWalletAmountPaise / 100;


      const payableAmountPaise =
        Number(
          razorpayOrder.payable_amount_paise ??
          razorpayOrder.amount ??
          0
        );





      /*
       * =========================================================
       * WALLET-ONLY PAYMENT
       * =========================================================
       *
       * When the wallet covers the complete order, the server
       * returns payment_required=false and no Razorpay order ID.
       *
       * Do not open Razorpay in this case.
       */

      if (
        razorpayOrder.payment_required === false ||
        payableAmountPaise <= 0
      ) {

        const hasServerRegularWallet =
          Boolean(razorpayOrder.wallet_hold_id) &&
          serverWalletAmountPaise > 0;


        const hasServerPlayEarnWallet =
          Boolean(
            razorpayOrder.play_earn_wallet_hold_id
          ) &&
          serverPlayEarnWalletAmountPaise > 0;


        if (
          !hasServerRegularWallet &&
          !hasServerPlayEarnWallet
        ) {

          throw new Error(
            "Wallet payment details are missing. Please refresh checkout and try again."
          );

        }


        onPaymentSuccessStart?.();


        /*
         * Use a deterministic wallet transaction reference so
         * order creation can remain safely idempotent on retries.
         *
         * No Razorpay payment exists for a wallet-only checkout.
         */

        const walletTransactionId =
          razorpayOrder.wallet_hold_id
            ? `wallet_${razorpayOrder.wallet_hold_id}`
            : `play_earn_wallet_${razorpayOrder.play_earn_wallet_hold_id}`;


        onSuccess({

          verified: true,

          walletOnly: true,

          walletHoldId:
            razorpayOrder.wallet_hold_id ?? null,

          walletAmountPaise:
            serverWalletAmountPaise,

          walletAmount:
            serverWalletAmount,

          playEarnWalletHoldId:
            razorpayOrder.play_earn_wallet_hold_id ??
            playEarnWalletHoldId ??
            null,

          playEarnWalletAmountPaise:
            serverPlayEarnWalletAmountPaise,

          playEarnWalletAmount:
            serverPlayEarnWalletAmount,

          payableAmountPaise:
            0,

          payableAmount:
            0,

          paymentTransactionId:
            walletTransactionId,

          razorpay_payment_id:
            null,

          razorpay_order_id:
            null,

          razorpay_signature:
            null,

          verification: {

            success: true,

            verified: true,

            walletOnly: true,

            checkoutQuoteId,

            walletHoldId:
              razorpayOrder.wallet_hold_id,

            walletAmountPaise:
              serverWalletAmountPaise,

            playEarnWalletHoldId:
              razorpayOrder.play_earn_wallet_hold_id ??
              playEarnWalletHoldId ??
              null,

            playEarnWalletAmountPaise:
              serverPlayEarnWalletAmountPaise,

            payableAmountPaise:
              0,

          },

        });

        return;

      }


      /*
       * =========================================================
       * RAZORPAY PAYMENT
       * =========================================================
       *
       * For a partial-wallet checkout, Razorpay is opened only
       * for the remaining amount.
       *
       * The amount comes exclusively from the server response.
       */

      if (
        !razorpayOrder.id
      ) {

        throw new Error(
          "Razorpay order was not created. Please try again."
        );

      }


      const options = {

        key:
          import.meta.env.VITE_RAZORPAY_KEY_ID,

        /*
         * This is the server-created Razorpay amount.
         * It is already reduced by the wallet amount when wallet
         * credit is being used.
         */

        amount:
          razorpayOrder.amount,

        currency:
          razorpayOrder.currency,

        name:
          "T&M Jewels",

        description:
          hasWallet ||
          hasPlayEarnWallet ||
          serverWalletAmountPaise > 0 ||
          serverPlayEarnWalletAmountPaise > 0
            ? "Jewellery Purchase • Wallet + Online Payment"
            : "Jewellery Purchase",

        order_id:
          razorpayOrder.id,


        handler:
          async function (
            response: any
          ) {

            try {

              paymentSuccessHandlerStartedRef.current =
                true;

              /*
               * Razorpay has already reported payment success.
               * Tell CheckoutDialog immediately so it can switch
               * to its blocking processing state.
               */

              onPaymentSuccessStart?.();


              setLoading(true);


              /*
               * Verify the signature AND verify the exact
               * Razorpay payable amount server-side.
               *
               * The verification function now understands the
               * wallet deduction and validates Razorpay against
               * the remaining amount.
               */

              const verification =
                await verifyRazorpayPayment({

                  razorpay_payment_id:
                    response.razorpay_payment_id,

                  razorpay_order_id:
                    response.razorpay_order_id,

                  razorpay_signature:
                    response.razorpay_signature,

                  checkoutQuoteId,

                });


              if (
                verification.success
              ) {

                onSuccess({

                  ...response,

                  verified: true,

                  walletOnly: false,

                  walletHoldId:
                    verification.walletHoldId ??
                    razorpayOrder.wallet_hold_id ??
                    null,

                  walletAmountPaise:
                    Number(
                      verification.walletAmountPaise ??
                      razorpayOrder.wallet_amount_paise ??
                      0
                    ),

                  playEarnWalletHoldId:
                    verification.playEarnWalletHoldId ??
                    razorpayOrder.play_earn_wallet_hold_id ??
                    playEarnWalletHoldId ??
                    null,

                  playEarnWalletAmountPaise:
                    Number(
                      verification.playEarnWalletAmountPaise ??
                      razorpayOrder.play_earn_wallet_amount_paise ??
                      playEarnWalletAmountPaise ??
                      0
                    ),

                  payableAmountPaise:
                    Number(
                      verification.payableAmountPaise ??
                      razorpayOrder.payable_amount_paise ??
                      razorpayOrder.amount ??
                      0
                    ),

                  paymentTransactionId:
                    response.razorpay_payment_id,

                  verification,

                });

              }

              else {

                setError(
                  verification?.error ||
                  "We couldn't confirm your payment yet. Please don't try paying again immediately."
                );

                setLoading(false);

              }

            }

            catch (error: any) {

              console.error(
                "Razorpay verification failed:",
                error
              );


              setError(

                error?.message ||
                "We couldn't confirm your payment yet. Please don't try paying again immediately."

              );


              setLoading(false);

            }

          },


        prefill: {

          name: "",

          email: "",

          contact: "",

        },


        theme: {

          color:
            "#000000",

        },


        modal: {

          ondismiss: async () => {

            if (paymentSuccessHandlerStartedRef.current) {
              return;
            }

            setLoading(false);

            try {

              await releaseCheckoutInventoryReservation(
                checkoutQuoteId,
                customerId,
                customerPhone
              );

            } catch (releaseError) {

              console.error(
                "Failed to release inventory reservation after payment dismissal:",
                releaseError
              );

            }

            setError(
              "Payment was cancelled. Your item has been released, and you can try again whenever you're ready."
            );

          },

        },


        /*
         * Razorpay payment-failure callback.
         * The customer remains on the Payment step and can retry.
         */

        callback: {

          failure: async (
            response: any
          ) => {

            console.error(
              "Razorpay payment failed:",
              response
            );

            paymentSuccessHandlerStartedRef.current =
              false;

            setLoading(false);

            try {

              await releaseCheckoutInventoryReservation(
                checkoutQuoteId,
                customerId,
                customerPhone
              );

            } catch (releaseError) {

              console.error(
                "Failed to release inventory reservation after payment failure:",
                releaseError
              );

            }

            setError(
              response?.error?.description ||
              "Payment failed. Your item has been released, so you can try again."
            );

          },

        },

      };


      const razorpay =
        new window.Razorpay(
          options
        );


      razorpay.open();

    }

    catch (err: any) {

      console.error(
        "Payment creation failed:",
        err
      );


      const errorMessage =
        err?.message ||
        "Payment failed. Please try again.";

      if (
        errorMessage.includes("This item just went out of stock") ||
        errorMessage.toLowerCase().includes("out of stock")
      ) {
        setInventoryError(errorMessage);
        setError("");
      } else {
        setError(errorMessage);
      }

      setLoading(false);

    }

  }


  /*
   * Use the server amount once the payment request is made, but
   * keep the initial UI based on the current checkout props.
   */

  const displayedPayableAmount =
    hasWallet || hasPlayEarnWallet
      ? estimatedPayableAmount
      : totalAmount;


  return (
    <>
      {inventoryError && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            flex
            items-center
            justify-center
            bg-black/60
            px-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="inventory-error-title"
        >
          <div
            className="
              relative
              w-full
              max-w-md
              overflow-hidden
              rounded-3xl
              border
              border-neutral-200/80
              bg-white
              p-6
              text-center
              shadow-2xl
              sm:p-8
            "
          >
            <div
              className="
                mx-auto
                flex
                h-16
                w-16
                items-center
                justify-center
                rounded-full
                border
                border-amber-200
                bg-amber-50
                text-2xl
                shadow-sm
              "
            >
              ✨
            </div>

            <div className="mt-5">
              <p
                className="
                  text-xs
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-amber-700
                "
              >
                Almost yours
              </p>

              <h2
                id="inventory-error-title"
                className="
                  mt-2
                  text-xl
                  font-semibold
                  tracking-tight
                  text-neutral-900
                "
              >
                This piece was just reserved
              </h2>

              <p className="mt-3 text-sm leading-6 text-neutral-600">
                {inventoryError
                  .replace(
                    'This item just went out of stock. Please review your cart before paying: ',
                    ''
                  )
                  .replace(/^"|"$/g, '')}
                {" "}was just reserved by another customer and is no longer
                available right now.
              </p>

              <div className="mt-5 flex items-center justify-center gap-2 text-sm">
                {inventoryAvailabilityStatus === "available" ? (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                      ✓
                    </span>
                    <span className="font-medium text-emerald-700">
                      Available again
                    </span>
                  </>
                ) : inventoryAvailabilityStatus === "unavailable" ? (
                  <>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                      ×
                    </span>
                    <span className="font-medium text-neutral-700">
                      No longer available
                    </span>
                  </>
                ) : (
                  <>
                    <span className="relative flex h-5 w-5 items-center justify-center">
                      <span className="absolute h-5 w-5 animate-ping rounded-full bg-amber-200 opacity-60" />
                      <span className="relative h-2 w-2 rounded-full bg-amber-500" />
                    </span>
                    <span className="font-medium text-neutral-700">
                      Checking availability…
                    </span>
                  </>
                )}
              </div>

              <p className="mt-2 text-xs leading-5 text-neutral-500">
                {inventoryAvailabilityStatus === "available"
                  ? "The reservation has been released. You can safely try again."
                  : inventoryAvailabilityStatus === "unavailable"
                    ? "Another customer completed the purchase, so this piece is no longer available."
                    : "We’ll let you know as soon as this piece becomes available again."}
              </p>

              <p className="mt-2 text-[11px] leading-5 text-neutral-400">
                We’ve stopped the payment so you won’t be charged for an unavailable item.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setInventoryError("");
                setInventoryAvailabilityStatus("checking");
              }}
              className="
                mt-6
                w-full
                rounded-xl
                bg-black
                px-5
                py-3.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-neutral-800
                focus:outline-none
                focus:ring-2
                focus:ring-black
                focus:ring-offset-2
              "
            >
              Review My Cart
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">


      <h3 className="text-lg font-semibold">
        Payment
      </h3>


      {
        (hasWallet || hasPlayEarnWallet) && (

          <div
            className="
              rounded-2xl
              border
              border-neutral-200
              bg-neutral-50
              p-4
            "
          >

            <div className="space-y-3">

              {
                hasWallet && (
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        shadow-sm
                      "
                    >
                      <Wallet size={18} />
                    </div>

                    <div className="min-w-0">

                      <p className="font-medium">
                        T&M Wallet applied
                      </p>

                      <p className="text-sm text-neutral-500">
                        ₹{localWalletAmount.toFixed(2)} will be used from your wallet.
                      </p>

                    </div>

                  </div>
                )
              }


              {
                hasPlayEarnWallet && (
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-white
                        shadow-sm
                      "
                    >
                      <Wallet size={18} />
                    </div>

                    <div className="min-w-0">

                      <p className="font-medium">
                        Play & Earn Wallet applied
                      </p>

                      <p className="text-sm text-neutral-500">
                        ₹{localPlayEarnWalletAmount.toFixed(2)} will be used from your Play & Earn Wallet.
                      </p>

                    </div>

                  </div>
                )
              }

            </div>

          </div>

        )
      }


      <div
        className="
          rounded-2xl
          border
          bg-neutral-50
          p-5
        "
      >

        <div className="flex items-center gap-3">

          <div
            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-white
              shadow-sm
            "
          >

            <CreditCard size={20} />

          </div>


          <div>

            <p className="font-medium">
              {
                (hasWallet || hasPlayEarnWallet) &&
                estimatedPayableAmount <= 0
                  ? "Wallet Payment"
                  : "Secure Online Payment"
              }
            </p>

            <p className="text-sm text-neutral-500">

              {
                (hasWallet || hasPlayEarnWallet) &&
                estimatedPayableAmount <= 0
                  ? "Your wallet covers this order"
                  : "UPI • Cards • Net Banking"
              }

            </p>

          </div>

        </div>

      </div>


      <div
        className="
          rounded-2xl
          border
          p-5
        "
      >

        <div className="space-y-3">

          <div className="flex justify-between">

            <span className="text-neutral-600">
              Order Total
            </span>

            <span className="font-medium">
              ₹{totalAmount.toFixed(2)}
            </span>

          </div>


          {
            hasWallet && (

              <div className="flex justify-between">

                <span className="text-neutral-600">
                  T&M Wallet
                </span>

                <span className="font-medium">
                  −₹{localWalletAmount.toFixed(2)}
                </span>

              </div>

            )
          }


          {
            hasPlayEarnWallet && (

              <div className="flex justify-between">

                <span className="text-neutral-600">
                  Play & Earn Wallet
                </span>

                <span className="font-medium">
                  −₹{localPlayEarnWalletAmount.toFixed(2)}
                </span>

              </div>

            )
          }

          <div
            className="
              flex
              justify-between
              border-t
              pt-3
            "
          >

            <span className="font-medium">
              Amount Payable
            </span>

            <span className="text-lg font-semibold">
              ₹{displayedPayableAmount.toFixed(2)}
            </span>

          </div>

        </div>

      </div>


      <button

        onClick={
          handlePayment
        }

        disabled={
          loading
        }

        className="
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-xl
          bg-black
          py-3.5
          font-medium
          text-white
          transition
          hover:bg-neutral-800
          disabled:cursor-not-allowed
          disabled:opacity-60
        "

      >

        {
          loading

            ? (

              <>

                <Loader2
                  size={18}
                  className="animate-spin"
                />

                {
                  hasWallet &&
                  estimatedPayableAmount <= 0
                    ? "Processing Order..."
                    : "Processing Payment..."
                }

              </>

            )

            : displayedPayableAmount <= 0
              ? "Place Order"
              : `Pay ₹${displayedPayableAmount.toFixed(2)}`
        }

      </button>


      {
        error && (

          <div
            className="
              rounded-xl
              bg-red-50
              px-4
              py-3
              text-center
              text-sm
              text-red-600
            "
          >

            {error}

          </div>

        )
      }


      <div
        className="
          flex
          items-center
          justify-center
          gap-2
          text-sm
          text-neutral-500
        "
      >

        <ShieldCheck size={16} />

        {
          (hasWallet || hasPlayEarnWallet) &&
          estimatedPayableAmount <= 0
            ? "Your wallet payment is securely processed"
            : "Secure payment powered by Razorpay"
        }

      </div>


      <div
        className="
          flex
          items-center
          justify-center
          gap-2
          text-xs
          text-neutral-400
        "
      >

        <CheckCircle2 size={14} />

        Your payment details are protected

      </div>


    </div>
    </>
  );

}
