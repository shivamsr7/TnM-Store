import {
  X,
  ShieldCheck,
  UserRound,
  MapPin,
  CreditCard,
  Loader2,
} from "lucide-react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useState,
  useEffect,
} from "react";

import OrderSuccess from "./OrderSuccess";
import PaymentStep from "./PaymentStep";
import LoginStep from "./LoginStep";
import AddressStep from "./AddressStep";

import {
  useCustomerStore,
} from "@/features/customers/store/customer.store";

import {
  getCustomerByPhone,
  createCustomer,
} from "@/features/customers/services/customer.service";

import {
  createOrder,
} from "@/features/orders/services/order.service";

import {
  useCartStore,
} from "@/features/cart/store/cart.store";

import {
  useDeliveryCheck,
} from "@/features/shipping/hooks/useDeliveryCheck";

interface Props {
  open: boolean;
  onClose: () => void;
}


const STEPS = [
  {
    key: "login",
    label: "Login",
    icon: UserRound,
  },
  {
    key: "address",
    label: "Address",
    icon: MapPin,
  },
  {
    key: "payment",
    label: "Payment",
    icon: CreditCard,
  },
];


const FREE_GIFT_AMOUNT = 1000;

const FREE_SHIPPING_AMOUNT = 2000;


export default function CheckoutDialog({
  open,
  onClose,
}: Props) {

  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer: authCustomer,
  } = useAuth();


  /*
   * =========================================================
   * STEP
   * =========================================================
   */

  const [
    step,
    setStep,
  ] = useState<
    "login" | "address" | "payment"
  >("login");


  /*
   * =========================================================
   * CUSTOMER
   * =========================================================
   */

  const [
    customer,
    setCustomer,
  ] = useState<any>(null);


  /*
   * =========================================================
   * SELECTED ADDRESS
   * =========================================================
   */

  const [
    selectedAddress,
    setSelectedAddress,
  ] = useState<any>(null);


  /*
   * =========================================================
   * ORDER SUCCESS
   * =========================================================
   */

  const [
    orderSuccess,
    setOrderSuccess,
  ] = useState(false);


  const [
    orderNumber,
    setOrderNumber,
  ] = useState("");


  /*
   * =========================================================
   * SHIPPING
   * =========================================================
   */

  const [
    shippingCharge,
    setShippingCharge,
  ] = useState(0);


  const [
    calculatingShipping,
    setCalculatingShipping,
  ] = useState(false);


  const [
    shippingError,
    setShippingError,
  ] = useState("");

  /*
   * =========================================================
   * SECURE SHIPPING QUOTE
   * =========================================================
   *
   * Created server-side by check-delivery.
   * This will become the source of truth for the final
   * order calculation in the next security step.
   */

  const [
    checkoutQuoteId,
    setCheckoutQuoteId,
  ] = useState<string | null>(null);


  /*
   * =========================================================
   * SHIPROCKET
   * =========================================================
   */

  const {
    mutate: checkDelivery,
  } = useDeliveryCheck();


  /*
   * =========================================================
   * CART
   * =========================================================
   */

  const {
    items,
    getTotal,
    discount,
    appliedCoupon,
    clearCart,
  } = useCartStore();


  const subtotal =
    getTotal();


  /*
   * =========================================================
   * FREE GIFT PROGRESS
   * =========================================================
   */

  const giftRemaining =
    Math.max(
      FREE_GIFT_AMOUNT - subtotal,
      0
    );


  const giftProgress =
    Math.min(
      (
        subtotal /
        FREE_GIFT_AMOUNT
      ) * 100,
      100
    );


  const giftUnlocked =
    subtotal >=
    FREE_GIFT_AMOUNT;


  /*
   * =========================================================
   * FREE SHIPPING PROGRESS
   * =========================================================
   */

  const shippingRemaining =
    Math.max(
      FREE_SHIPPING_AMOUNT - subtotal,
      0
    );


  const shippingProgress =
    Math.min(
      (
        subtotal /
        FREE_SHIPPING_AMOUNT
      ) * 100,
      100
    );


  const freeShippingByAmount =
    subtotal >=
    FREE_SHIPPING_AMOUNT;


  const freeShippingByCoupon =
    Boolean(
      appliedCoupon?.freeShipping
    );


  const freeShippingUnlocked =
    freeShippingByAmount ||
    freeShippingByCoupon;


  /*
   * =========================================================
   * FINAL SHIPPING
   * =========================================================
   */

  const finalShippingCharge =
    freeShippingUnlocked
      ? 0
      : shippingCharge;


  /*
   * =========================================================
   * FINAL TOTAL
   * =========================================================
   */

  const finalAmount =
    Math.max(
      subtotal - discount,
      0
    ) +
    finalShippingCharge;


  /*
   * =========================================================
   * AUTH CUSTOMER EFFECT
   * =========================================================
   */

  useEffect(() => {

    if (authCustomer) {

      setCustomer(
        authCustomer
      );

      setStep(
        "address"
      );

    }

  }, [
    authCustomer,
  ]);


  /*
   * =========================================================
   * RESET WHEN CHECKOUT OPENS
   * =========================================================
   */

  useEffect(() => {

    if (!open) {
      return;
    }


    setOrderSuccess(
      false
    );

    setOrderNumber(
      ""
    );

    setSelectedAddress(
      null
    );

    setShippingCharge(
      0
    );

    setShippingError(
      ""
    );

    setCheckoutQuoteId(
      null
    );

    setCalculatingShipping(
      false
    );


    setStep(
      authCustomer
        ? "address"
        : "login"
    );

  }, [
    open,
    authCustomer,
  ]);


  /*
   * =========================================================
   * LOGIN SUCCESS
   * =========================================================
   */

  async function handleLoginSuccess(
    data: {
      phone: string;
    }
  ) {

    try {

      const existingCustomer =
        await getCustomerByPhone(
          data.phone
        );


      if (existingCustomer) {

        setCustomer(
          existingCustomer
        );


        useCustomerStore
          .getState()
          .setCustomer(
            existingCustomer
          );


        setStep(
          "address"
        );


        return;

      }


      const newCustomer =
        await createCustomer({

          first_name:
            "Customer",

          phone:
            data.phone,

        });


      setCustomer(
        newCustomer
      );


      useCustomerStore
        .getState()
        .setCustomer(
          newCustomer
        );


      setStep(
        "address"
      );

    }

    catch (error) {

      console.error(
        "Customer login failed",
        error
      );

    }

  }


  /*
   * =========================================================
   * ADDRESS → PAYMENT
   * =========================================================
   */

  function handleAddressContinue(
    address: any
  ) {

    setShippingError(
      ""
    );


    setSelectedAddress(
      address
    );


    /*
     * =======================================================
     * PINCODE
     * =======================================================
     */

    const pincode =
      String(
        address?.postal_code ??
        ""
      ).trim();


    if (
      !/^\d{6}$/.test(
        pincode
      )
    ) {

      setShippingError(
        "Please select a valid delivery address with a 6-digit pincode."
      );

      return;

    }


    /*
     * =======================================================
     * START SECURE SHIPPING QUOTE
     * =======================================================
     *
     * We now send product IDs + quantities to the server.
     *
     * The server fetches the real product weights from the
     * database. Frontend weight is no longer trusted.
     *
     * Products without a stored weight use the server-side
     * 0.500 kg fallback.
     *
     * We also calculate Shiprocket even when the customer
     * qualifies for free shipping. The quote is still needed
     * as the server-side shipping reference for checkout.
     * =======================================================
     */

    setCalculatingShipping(
      true
    );


    setShippingCharge(
      0
    );


    setCheckoutQuoteId(
      null
    );


    // Give React one browser paint so the loading overlay is
    // visible before the Shiprocket/network request starts.
    window.setTimeout(() => {

      checkDelivery(

        {
          pincode,

        customerId:
          customer?.id ??
          null,

        paymentMethod:
          "prepaid",

        items:
          items.map(
            item => ({
              productId:
                item.productId,

              quantity:
                item.quantity,
            })
          ),

      },

      {

        onSuccess: (
          data
        ) => {

          const courier =
            data
              ?.data
              ?.available_courier_companies
              ?.[0];


          /*
           * No courier available
           */

          if (!courier) {

            setCalculatingShipping(
              false
            );

            setShippingCharge(
              0
            );

            setCheckoutQuoteId(
              null
            );

            setShippingError(
              "Sorry, delivery is not available for this pincode."
            );

            return;

          }


          /*
           * =================================================
           * SERVER-VERIFIED SHIPROCKET RATE
           * =================================================
           *
           * Prefer the rate returned by the secure quote.
           * Fall back to the courier response only for
           * compatibility with the existing delivery response.
           * =================================================
           */

          const quoteRate =
            Number(
              data
                ?.quote
                ?.shiprocket_rate ??
              data
                ?.verified_shipping
                ?.shiprocket_rate ??
              courier?.rate ??
              0
            );


          if (
            !Number.isFinite(
              quoteRate
            ) ||
            quoteRate < 0
          ) {

            setCalculatingShipping(
              false
            );

            setShippingCharge(
              0
            );

            setCheckoutQuoteId(
              null
            );

            setShippingError(
              "Unable to verify shipping charges. Please try again."
            );

            return;

          }


          /*
           * =================================================
           * FULL SHIPROCKET RATE
           * =================================================
           *
           * No ₹59 / ₹79 customer pricing rule anymore.
           *
           * If free shipping is unlocked, the customer pays
           * ₹0, but the secure quote still retains the real
           * Shiprocket rate.
           * =================================================
           */

          const customerShipping =
            freeShippingUnlocked
              ? 0
              : quoteRate;


          setShippingCharge(
            customerShipping
          );


          /*
           * Save the server-generated quote ID.
           */

          const quoteId =
            data
              ?.quote
              ?.id ??
            null;


          setCheckoutQuoteId(
            quoteId
          );


          /*
           * Save delivery information for UI/legacy usage.
           *
           * The quote ID is also stored here so the next
           * checkout-security step can use the same quote.
           */

          const deliveryInfo = {

            pincode,

            shippingCharge:
              quoteRate,

            customerShippingCharge:
              customerShipping,

            courier:
              courier?.courier_name ||
              "",

            checkoutQuoteId:
              quoteId,

            shipmentWeight:
              data
                ?.quote
                ?.shipment_weight ??
              data
                ?.verified_shipping
                ?.shipment_weight ??
              null,

          };


          localStorage.setItem(
            "tnm_delivery_info",
            JSON.stringify(
              deliveryInfo
            )
          );


          setShippingError(
            ""
          );


          setCalculatingShipping(
            false
          );


          /*
           * Only move to Payment after the secure shipping
           * quote has been successfully generated.
           */

          if (!quoteId) {

            setShippingError(
              "Unable to create a secure shipping quote. Please try again."
            );

            return;

          }


          setStep(
            "payment"
          );

        },


        onError: (
          error
        ) => {

          console.error(
            "Shipping calculation failed:",
            error
          );


          setCalculatingShipping(
            false
          );


          setShippingCharge(
            0
          );


          setCheckoutQuoteId(
            null
          );


          setShippingError(
            "Sorry, delivery is not available for this pincode."
          );

        },

      }

      );

    }, 50);

  }


  /*
   * =========================================================
   * PAYMENT SUCCESS
   * =========================================================
   */

  async function handlePaymentSuccess(
    payment: any
  ) {

    try {

      /*
       * A secure shipping quote must exist before an order
       * can proceed. The order RPC will be updated in the
       * next step to verify this quote server-side.
       */

      if (!checkoutQuoteId) {

        throw new Error(
          "Secure shipping quote is missing. Please return to the address step and try again."
        );

      }


      const result =
        await createOrder({

          customerId:
            customer?.id ??
            null,

          checkoutQuoteId:
            checkoutQuoteId,

          customer: {

            name:
              `${customer?.first_name ?? ""} ${customer?.last_name ?? ""}`,

            email:
              customer?.email ??
              null,

            phone:
              customer?.phone,

          },


          shipping: {

            fullName:
              selectedAddress.full_name,

            phone:
              selectedAddress.phone,

            address:
              `${selectedAddress.address_line_1} ${selectedAddress.address_line_2 ?? ""}`,

            city:
              selectedAddress.city,

            state:
              selectedAddress.state,

            pincode:
              selectedAddress.postal_code,

            landmark:
              null,

          },


          items:

            items.map(
              item => ({

                productId:
                  item.productId,

                productName:
                  item.name,

                productImage:
                  item.image ??
                  null,

                price:
                  item.price,

                quantity:
                  item.quantity,

                total:
                  item.price *
                  item.quantity,

              })
            ),


          subtotal,


          discount,


          /*
           * FINAL CUSTOMER SHIPPING CHARGE
           */

          shippingCharge:
            finalShippingCharge,


          tax:
            0,


          totalAmount:
            finalAmount,


          advanceAmount:
            finalAmount,


          paymentMethod:
            "prepaid",


          paymentTransactionId:
            payment.razorpay_payment_id,


          coupon:

            appliedCoupon

              ? {

                  id:
                    appliedCoupon.id,

                  code:
                    appliedCoupon.code,

                  discount:
                    appliedCoupon.discount,

                }

              : null,

        });


      setOrderNumber(
        result.orderNumber
      );


      clearCart();


      setOrderSuccess(
        true
      );

    }

    catch (error) {

      console.error(
        "Order creation failed",
        error
      );

    }

  }


  /*
   * =========================================================
   * CURRENT STEP INDEX
   * =========================================================
   */

  const currentStepIndex =
    STEPS.findIndex(
      item =>
        item.key === step
    );


  /*
   * =========================================================
   * CLOSED
   * =========================================================
   */

  if (!open) {
    return null;
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div

        className="
          fixed
          inset-0
          z-[1000]
          bg-black/50
          backdrop-blur-md
        "

        onClick={
          onClose
        }

      />


      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}

      <div

        className="
          fixed
          left-0
          top-0
          z-[1100]

          flex
          h-[100dvh]
          max-h-[100dvh]

          w-full
          max-w-none

          translate-x-0
          translate-y-0

          flex-col

          overflow-hidden

          rounded-none

          bg-white

          shadow-2xl

          motion-safe:animate-[checkoutIn_320ms_ease-out]

          md:left-1/2
          md:top-1/2
          md:h-auto
          md:max-h-[90vh]
          md:w-[calc(100%-32px)]
          md:max-w-[560px]
          md:-translate-x-1/2
          md:-translate-y-1/2
          md:rounded-3xl
        "

      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div

          className="
            shrink-0
            border-b
            border-neutral-100
            bg-white
            px-5
            pb-4
            pt-[calc(1rem+env(safe-area-inset-top))]
            shadow-[0_1px_0_rgba(0,0,0,0.03)]

            md:px-6
            md:py-5
          "

        >

          <div

            className="
              flex
              items-center
              justify-between
            "

          >

            <h2

              className="
                text-[28px]
                font-semibold
                tracking-[-0.03em]
                text-neutral-950
                motion-safe:animate-[fadeUp_300ms_ease-out]

                md:text-2xl
              "

            >

              {
                orderSuccess
                  ? "Order Confirmed"
                  : "Checkout"
              }

            </h2>


            <button

              onClick={
                onClose
              }

              className="
                rounded-full
                p-2.5
                text-neutral-700
                transition
                duration-200
                hover:rotate-90
                hover:bg-neutral-100
                active:scale-90
              "

            >

              <X
                size={20}
              />

            </button>

          </div>


          {/* =================================================
              CHECKOUT STEPS
          ================================================== */}

          {
            !orderSuccess && (

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-neutral-100
                  bg-neutral-50/70
                  px-3
                  py-3.5
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]

                  md:mt-6
                  md:px-4
                "
              >

                <div
                  className="
                    flex
                    items-start
                  "
                >

                  {
                    STEPS.map(
                      (
                        item,
                        index
                      ) => {

                        const Icon =
                          item.icon;

                        const completed =
                          index <
                          currentStepIndex;

                        const active =
                          index ===
                          currentStepIndex;

                        const available =
                          index <=
                          currentStepIndex;

                        return (

                          <div
                            key={
                              item.key
                            }
                            className="
                              flex
                              min-w-0
                              flex-1
                              items-start
                            "
                          >

                            <div
                              className="
                                flex
                                min-w-0
                                flex-1
                                flex-col
                                items-center
                              "
                            >

                              <button
                                type="button"
                                disabled={
                                  !available
                                }
                                onClick={() => {

                                  if (
                                    !available
                                  ) {
                                    return;
                                  }

                                  if (
                                    item.key ===
                                    "login"
                                  ) {

                                    if (
                                      !authCustomer
                                    ) {

                                      setStep(
                                        "login"
                                      );

                                    }

                                    return;

                                  }

                                  if (
                                    item.key ===
                                    "address"
                                  ) {

                                    setShippingError("");

                                    setStep(
                                      "address"
                                    );

                                    return;

                                  }

                                  if (
                                    item.key ===
                                    "payment"
                                  ) {

                                    setStep(
                                      "payment"
                                    );

                                  }

                                }}
                                className={`
                                  group
                                  relative
                                  flex
                                  h-11
                                  w-11
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  transition-all
                                  duration-300
                                  motion-safe:hover:scale-105
                                  motion-safe:active:scale-95

                                  ${
                                    active
                                      ? "border-[#C8A44D] bg-[#C8A44D] text-black shadow-[0_8px_24px_rgba(200,164,77,0.30)] ring-4 ring-[#C8A44D]/10"
                                      : completed
                                        ? "border-[#C8A44D] bg-[#C8A44D]/15 text-[#9A7A22] shadow-sm"
                                        : "border-neutral-200 bg-white text-neutral-400 shadow-sm"
                                  }

                                  ${
                                    available
                                      ? "cursor-pointer"
                                      : "cursor-default"
                                  }
                                `}
                              >

                                {
                                  completed
                                    ? (
                                      <span
                                        className="
                                          text-sm
                                          font-bold
                                          motion-safe:animate-[stepCheck_300ms_ease-out]
                                        "
                                      >
                                        ✓
                                      </span>
                                    )
                                    : (
                                      <Icon
                                        size={18}
                                        strokeWidth={
                                          active
                                            ? 2.4
                                            : 2
                                        }
                                      />
                                    )
                                }

                                {
                                  active && (
                                    <span
                                      className="
                                        absolute
                                        inset-[-5px]
                                        rounded-full
                                        border
                                        border-[#C8A44D]/25
                                        motion-safe:animate-[stepPulse_2s_ease-in-out_infinite]
                                      "
                                    />
                                  )
                                }

                              </button>


                              <div
                                className="
                                  mt-2
                                  text-center
                                "
                              >

                                <p
                                  className={`
                                    text-[11px]
                                    font-semibold
                                    tracking-wide
                                    transition-colors
                                    duration-300

                                    ${
                                      active
                                        ? "text-neutral-950"
                                        : completed
                                          ? "text-[#9A7A22]"
                                          : "text-neutral-400"
                                    }
                                  `}
                                >
                                  {
                                    item.label
                                  }
                                </p>

                                <p
                                  className={`
                                    mt-0.5
                                    hidden
                                    text-[9px]
                                    sm:block

                                    ${
                                      active
                                        ? "text-neutral-500"
                                        : "text-neutral-400"
                                    }
                                  `}
                                >
                                  {
                                    item.key === "login"
                                      ? "Secure access"
                                      : item.key === "address"
                                        ? "Delivery details"
                                        : "Complete order"
                                  }
                                </p>

                              </div>

                            </div>


                            {
                              index !==
                              STEPS.length - 1 && (

                                <div
                                  className="
                                    relative
                                    mt-5
                                    h-[2px]
                                    flex-1
                                    overflow-hidden
                                    rounded-full
                                    bg-neutral-200
                                  "
                                >

                                  <div
                                    className={`
                                      absolute
                                      inset-y-0
                                      left-0
                                      rounded-full
                                      transition-all
                                      duration-500
                                      ease-out

                                      ${
                                        index <
                                        currentStepIndex
                                          ? "w-full bg-[#C8A44D]"
                                          : "w-0 bg-[#C8A44D]"
                                      }
                                    `}
                                  />

                                </div>

                              )
                            }

                          </div>

                        );

                      }
                    )
                  }

                </div>

              </div>

            )
          }

        </div>


        {/* ===================================================
            CALCULATING CHECKOUT OVERLAY
        ==================================================== */}

        {
          calculatingShipping && (

            <div
              className="
                absolute
                inset-0
                z-[50]
                flex
                items-center
                justify-center
                rounded-none
                bg-white/90
                px-6
                backdrop-blur-[4px]
                motion-safe:animate-[fadeIn_180ms_ease-out]
                md:rounded-3xl
              "
            >

              <div
                className="
                  w-full
                  max-w-[350px]
                  rounded-3xl
                  border
                  border-neutral-200
                  bg-white
                  px-6
                  py-7
                  text-center
                  shadow-[0_24px_70px_rgba(0,0,0,0.14)]
                  motion-safe:animate-[scaleIn_240ms_ease-out]
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-14
                    w-14
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C8A44D]/10
                    text-[#9A7A22]
                  "
                >
                  <Loader2
                    size={25}
                    className="animate-spin"
                  />
                </div>

                <h3
                  className="
                    mt-5
                    text-base
                    font-semibold
                    text-neutral-950
                  "
                >
                  Calculating your final total
                </h3>

                <p
                  className="
                    mt-1.5
                    text-sm
                    leading-5
                    text-neutral-500
                  "
                >
                  Checking delivery charges and securing your best available shipping rate.
                </p>

                <div
                  className="
                    mx-auto
                    mt-5
                    h-1.5
                    w-32
                    overflow-hidden
                    rounded-full
                    bg-neutral-100
                  "
                >
                  <div
                    className="
                      h-full
                      w-1/2
                      rounded-full
                      bg-[#C8A44D]
                      motion-safe:animate-[loadingSlide_1.2s_ease-in-out_infinite]
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-neutral-400
                  "
                >
                  Almost there
                </p>

              </div>

            </div>

          )
        }


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div

          className="
            relative
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            scroll-smooth
            px-5
            pb-8
            pt-6
            [scrollbar-width:thin]

            md:px-6
            md:py-7
          "

        >

          {/* =================================================
              ORDER SUMMARY
          ================================================== */}

          {
            !orderSuccess && (

              <div

                className="
                  mb-6
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-gradient-to-br
                  from-white
                  via-neutral-50
                  to-[#C8A44D]/[0.045]
                  p-4
                  shadow-[0_8px_30px_rgba(0,0,0,0.045)]
                  motion-safe:animate-[fadeUp_350ms_ease-out]
                "

              >

                <h3

                  className="
                    mb-3
                    text-sm
                    font-semibold
                  "

                >

                  Order Summary

                </h3>


                <div

                  className="
                    space-y-2
                    text-sm
                  "

                >

                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-neutral-500
                      "
                    >
                      Items
                    </span>

                    <span>
                      {
                        items.length
                      }
                    </span>

                  </div>


                  <div
                    className="
                      flex
                      justify-between
                    "
                  >

                    <span
                      className="
                        text-neutral-500
                      "
                    >
                      Subtotal
                    </span>

                    <span>
                      ₹
                      {
                        subtotal.toFixed(2)
                      }
                    </span>

                  </div>


                  {
                    discount > 0 && (

                      <div

                        className="
                          flex
                          justify-between
                          text-green-600
                        "

                      >

                        <span>
                          Discount
                        </span>

                        <span>
                          - ₹
                          {
                            discount.toFixed(2)
                          }
                        </span>

                      </div>

                    )
                  }


                  {
                    appliedCoupon && (

                      <div

                        className="
                          rounded-xl
                          bg-green-100
                          px-3
                          py-2
                          text-xs
                          text-green-700
                        "

                      >

                        Coupon Applied:

                        {" "}

                        <strong>
                          {
                            appliedCoupon.code
                          }
                        </strong>

                      </div>

                    )
                  }


                  <div

                    className="
                      flex
                      justify-between
                    "

                  >

                    <span
                      className="
                        text-neutral-500
                      "
                    >

                      Shipping

                    </span>


                    <span>

                      {
                        freeShippingUnlocked

                          ? "FREE"

                          : step === "payment"

                            ? `₹${finalShippingCharge.toFixed(2)}`

                            : "Calculated at next step"
                      }

                    </span>

                  </div>


                  <div

                    className="
                      flex
                      justify-between
                      border-t
                      pt-3
                      font-semibold
                    "

                  >

                    <span>
                      Total
                    </span>


                    <span

                      className="
                        text-[#9A7A22]
                      "

                    >

                      ₹
                      {
                        finalAmount.toFixed(2)
                      }

                    </span>

                  </div>

                </div>

              </div>

            )
          }


          {/* =================================================
              SHIPPING ERROR
          ================================================== */}

          {
            shippingError && (

              <div

                className="
                  mb-5
                  rounded-xl
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "

              >

                {
                  shippingError
                }

              </div>

            )
          }


          {/* =================================================
              SHIPPING LOADING
          ================================================== */}

          {
            calculatingShipping && (

              <div

                className="
                  mb-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-neutral-50
                  px-4
                  py-3
                  text-sm
                  text-neutral-600
                "

              >

                <Loader2

                  size={17}

                  className="
                    animate-spin
                  "

                />

                Calculating shipping charges...

              </div>

            )
          }


          {/* =================================================
              ORDER SUCCESS
          ================================================== */}

          {
            orderSuccess && (

              <OrderSuccess

                orderNumber={
                  orderNumber
                }

                onClose={
                  onClose
                }

              />

            )
          }


          {/* =================================================
              LOGIN
          ================================================== */}

          {
            !orderSuccess &&
            step === "login" && (

              <>

                <div

                  className="
                    flex
                    justify-center
                  "

                >

                  <div

                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      bg-gradient-to-br
                      from-neutral-50
                      to-neutral-100
                      shadow-[0_14px_40px_rgba(0,0,0,0.08)]
                      ring-8
                      ring-neutral-50
                      motion-safe:animate-[softFloat_3s_ease-in-out_infinite]
                    "

                  >

                    <UserRound
                      size={38}
                      className="
                        text-neutral-800
                      "
                    />

                  </div>

                </div>


                <h3

                  className="
                    mt-6
                    text-center
                    text-2xl
                    font-semibold
                  "

                >

                  Login to continue

                </h3>


                <LoginStep

                  onSuccess={
                    handleLoginSuccess
                  }

                />

              </>

            )
          }


          {/* =================================================
              ADDRESS
          ================================================== */}

          {
            !orderSuccess &&
            step === "address" && (

              <AddressStep

                customer={
                  customer
                }

                onContinue={
                  handleAddressContinue
                }

              />

            )
          }


          {/* =================================================
              PAYMENT
          ================================================== */}

          {
            !orderSuccess &&
            step === "payment" && (

              <>

                {/* =============================================
                    PAYMENT PAGE OFFER PROGRESS
                ============================================== */}

                <div
                  className="
                    mb-6
                    space-y-5
                    motion-safe:animate-[fadeUp_350ms_ease-out]
                  "
                >

                  {/* =========================================
                      FREE GIFT
                  ========================================== */}

                  <div>

                    <div

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                      "

                    >

                      <span>
                        🎁
                      </span>


                      {
                        giftUnlocked ? (

                          <>

                            <span>
                              Free Gift Unlocked
                            </span>


                            <span

                              className="
                                ml-1

                                flex
                                h-5
                                w-5

                                items-center
                                justify-center

                                rounded-full

                                bg-green-100

                                text-green-600

                                font-bold

                                text-xs
                              "

                            >

                              ✓

                            </span>

                          </>

                        ) : (

                          <span>

                            Add ₹
                            {
                              giftRemaining
                            }
                            {" "}
                            more to unlock Free Gift

                          </span>

                        )
                      }

                    </div>


                    {
                      !giftUnlocked && (

                        <div

                          className="
                            mt-2

                            h-2

                            overflow-hidden

                            rounded-full

                            bg-neutral-200
                          "

                        >

                          <div

                            className="
                              h-full

                              rounded-full

                              bg-black

                              transition-all
                              duration-700
                              ease-out
                            "

                            style={{
                              width:
                                `${giftProgress}%`,
                            }}

                          />

                        </div>

                      )
                    }

                  </div>


                  {/* =========================================
                      FREE SHIPPING
                  ========================================== */}

                  <div>

                    <div

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                      "

                    >

                      <span>
                        🚚
                      </span>


                      {
                        freeShippingUnlocked ? (

                          <>

                            <span>
                              Free Shipping Unlocked
                            </span>


                            <span

                              className="
                                ml-1

                                flex
                                h-5
                                w-5

                                items-center
                                justify-center

                                rounded-full

                                bg-green-100

                                text-green-600

                                font-bold

                                text-xs
                              "

                            >

                              ✓

                            </span>

                          </>

                        ) : (

                          <span>

                            Add ₹
                            {
                              shippingRemaining
                            }
                            {" "}
                            more to unlock Free Shipping

                          </span>

                        )
                      }

                    </div>


                    {
                      !freeShippingUnlocked && (

                        <div

                          className="
                            mt-2

                            h-2

                            overflow-hidden

                            rounded-full

                            bg-neutral-200
                          "

                        >

                          <div

                            className="
                              h-full

                              rounded-full

                              bg-black

                              transition-all
                              duration-700
                              ease-out
                            "

                            style={{
                              width:
                                `${shippingProgress}%`,
                            }}

                          />

                        </div>

                      )
                    }

                  </div>

                </div>


                {/* =============================================
                    PAYMENT COMPONENT
                ============================================== */}

                <PaymentStep

                  totalAmount={
                    finalAmount
                  }

                  onSuccess={
                    handlePaymentSuccess
                  }

                />

              </>

            )
          }

        </div>


        {/* ===================================================
            SECURITY FOOTER
        ==================================================== */}

        {
          !orderSuccess && (

            <div

              className="
                shrink-0
                border-t
                border-neutral-100
                bg-white/95
                px-5
                pb-[calc(0.9rem+env(safe-area-inset-bottom))]
                pt-3
                shadow-[0_-8px_24px_rgba(0,0,0,0.045)]
                backdrop-blur-md

                md:px-6
                md:py-4
              "

            >

              <div

                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[13px]
                  font-medium
                  text-neutral-600
                "

              >

                <ShieldCheck
                  size={18}
                />

                Your data is safe and secure with us

              </div>

            </div>

          )
        }

      </div>

      {/* Component-local motion used by the mobile-first checkout shell. */}
      <style>
        {`
          @keyframes checkoutIn {
            from {
              opacity: 0;
              transform: translateY(18px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes softFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @keyframes stepPulse {
            0%, 100% {
              opacity: 0.35;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.06);
            }
          }

          @keyframes stepCheck {
            from {
              opacity: 0;
              transform: scale(0.6) rotate(-12deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.96) translateY(6px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes loadingSlide {
            0% {
              transform: translateX(-130%);
            }
            50% {
              transform: translateX(70%);
            }
            100% {
              transform: translateX(260%);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>

    </>

  );
}