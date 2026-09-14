import {
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
  Wallet,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "@/features/payment/services/razorpay.service";


interface Props {

  totalAmount: number;

  checkoutQuoteId: string;

  /*
   * Optional wallet amount already selected/held for this checkout.
   * The server remains the source of truth; this is only used for
   * displaying the expected payment split in the UI.
   */
  walletAmountPaise?: number;

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

  walletAmountPaise = 0,

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


  const localWalletAmount =
    Math.max(
      0,
      Number(walletAmountPaise || 0)
    ) / 100;


  const hasWallet =
    localWalletAmount > 0;


  const estimatedPayableAmount =
    Math.max(
      0,
      totalAmount - localWalletAmount
    );


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

      setError("");

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
          checkoutQuoteId
        );


      const serverWalletAmountPaise =
        Number(
          razorpayOrder.wallet_amount_paise || 0
        );


      const serverWalletAmount =
        serverWalletAmountPaise / 100;


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

        if (
          !razorpayOrder.wallet_hold_id ||
          serverWalletAmountPaise <= 0
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
          `wallet_${razorpayOrder.wallet_hold_id}`;


        onSuccess({

          verified: true,

          walletOnly: true,

          walletHoldId:
            razorpayOrder.wallet_hold_id,

          walletAmountPaise:
            serverWalletAmountPaise,

          walletAmount:
            serverWalletAmount,

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
          hasWallet || serverWalletAmountPaise > 0
            ? "Jewellery Purchase • Wallet + Online Payment"
            : "Jewellery Purchase",

        order_id:
          razorpayOrder.id,


        handler:
          async function (
            response: any
          ) {

            try {

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

          ondismiss: () => {

            setLoading(false);

            setError(
              "Payment was cancelled. You can try again whenever you're ready."
            );

          },

        },


        /*
         * Razorpay payment-failure callback.
         * The customer remains on the Payment step and can retry.
         */

        callback: {

          failure: (
            response: any
          ) => {

            console.error(
              "Razorpay payment failed:",
              response
            );

            setLoading(false);

            setError(
              response?.error?.description ||
              "Payment failed. Please try again."
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


      setError(

        err?.message ||
        "Payment failed. Please try again."

      );


      setLoading(false);

    }

  }


  /*
   * Use the server amount once the payment request is made, but
   * keep the initial UI based on the current checkout props.
   */

  const displayedPayableAmount =
    hasWallet
      ? estimatedPayableAmount
      : totalAmount;


  return (

    <div className="space-y-5">


      <h3 className="text-lg font-semibold">
        Payment
      </h3>


      {
        hasWallet && (

          <div
            className="
              rounded-2xl
              border
              border-neutral-200
              bg-neutral-50
              p-4
            "
          >

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
                hasWallet &&
                estimatedPayableAmount <= 0
                  ? "Wallet Payment"
                  : "Secure Online Payment"
              }
            </p>

            <p className="text-sm text-neutral-500">

              {
                hasWallet &&
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
                  Wallet
                </span>

                <span className="font-medium">
                  −₹{localWalletAmount.toFixed(2)}
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
          hasWallet &&
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

  );

}
