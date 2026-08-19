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

import {
  recordCouponUsage,
} from "@/features/coupons/services/coupon-usage.service";


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
     * FREE SHIPPING
     * =======================================================
     *
     * ₹2,000+ = FREE
     *
     * Free shipping coupon = FREE
     *
     * No Shiprocket calculation needed.
     * =======================================================
     */

    if (
      freeShippingByAmount ||
      freeShippingByCoupon
    ) {

      setShippingCharge(
        0
      );

      setCalculatingShipping(
        false
      );

      setStep(
        "payment"
      );

      return;

    }


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
     * START SHIPPING CALCULATION
     * =======================================================
     */

    setCalculatingShipping(
      true
    );


    setShippingCharge(
      0
    );


    /*
     * =======================================================
     * SHIPROCKET
     * =======================================================
     *
     * Same hook used by DeliveryChecker.
     *
     * Current cart does not carry product weight,
     * so 0.500kg fallback is used.
     * =======================================================
     */

    checkDelivery(

      {
        pincode,

        weight:
          0.500,
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

            setShippingError(
              "Sorry, delivery is not available for this pincode."
            );

            return;

          }


          /*
           * =================================================
           * ACTUAL SHIPROCKET RATE
           * =================================================
           */

          const shiprocketRate =
            Number(
              courier?.rate || 0
            );


          /*
           * =================================================
           * CUSTOMER SHIPPING RULE
           * =================================================
           *
           * Shiprocket <= ₹100 → ₹59
           *
           * Shiprocket > ₹100 → ₹79
           * =================================================
           */

          const customerShipping =
            shiprocketRate <= 100
              ? 59
              : 79;


          setShippingCharge(
            customerShipping
          );


          /*
           * Save delivery information.
           */

          const deliveryInfo = {

            pincode,

            shippingCharge:
              shiprocketRate,

            customerShippingCharge:
              customerShipping,

            courier:
              courier?.courier_name ||
              "",

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
           * Only after successful calculation
           * move to Payment.
           */

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


          setShippingError(
            "Sorry, delivery is not available for this pincode."
          );

        },

      }

    );

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

      const result =
        await createOrder({

          customerId:
            customer?.id ??
            null,


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


      /*
       * =======================================================
       * RECORD COUPON USAGE
       * =======================================================
       *
       * Coupon usage is recorded only after the order has
       * been successfully created.
       *
       * This is what makes "One Use Per Customer" work
       * on the customer's next order.
       *
       * We intentionally do not pass orderId here because
       * createOrder currently exposes orderNumber in this
       * checkout flow, while coupon_usage.order_id expects
       * the order UUID.
       * =======================================================
       */

      if (
        appliedCoupon &&
        customer?.id
      ) {

        try {

          await recordCouponUsage(
            appliedCoupon.id,
            customer.id
          );

        } catch (couponUsageError) {

          /*
           * The order has already been created successfully.
           * Do not turn a successful order into a failed
           * checkout just because the coupon usage record
           * could not be written.
           *
           * The error is logged so it can be investigated.
           */

          console.error(
            "Coupon usage recording failed:",
            couponUsageError
          );

        }

      }


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
                  flex
                  items-center
                  justify-between

                  md:mt-6
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


                      const active =
                        index <=
                        currentStepIndex;


                      return (

                        <div

                          key={
                            item.key
                          }

                          className="
                            flex
                            flex-1
                            items-center
                          "

                        >

                          <div

                            className="
                              flex
                              flex-col
                              items-center
                            "

                          >

                            <button

                              type="button"

                              disabled={
                                index >
                                currentStepIndex
                              }

                              onClick={() => {

                                if (
                                  index <
                                  currentStepIndex
                                ) {

                                  if (
                                    item.key ===
                                    "address"
                                  ) {

                                    setShippingError(
                                      ""
                                    );

                                    setStep(
                                      "address"
                                    );

                                  }


                                  if (
                                    item.key ===
                                      "login" &&
                                    !authCustomer
                                  ) {

                                    setStep(
                                      "login"
                                    );

                                  }

                                }

                              }}

                              className={`

                                flex
                                h-11
                                w-11
                                items-center
                                justify-center

                                rounded-full

                                border
                                border-transparent

                                shadow-sm

                                transition-all
                                duration-300

                                motion-safe:hover:scale-105

                                ${
                                  active
                                    ? "bg-[#C8A44D] text-black shadow-[0_6px_18px_rgba(200,164,77,0.28)] ring-4 ring-[#C8A44D]/10"
                                    : "bg-neutral-100 text-neutral-400 border-neutral-200"
                                }

                                ${
                                  index <
                                  currentStepIndex
                                    ? "cursor-pointer hover:scale-105"
                                    : "cursor-default"
                                }

                              `}

                            >

                              <Icon
                                size={17}
                              />

                            </button>


                            <p

                              className={`

                                mt-2
                                text-xs

                                ${
                                  active
                                    ? "font-medium text-black"
                                    : "text-neutral-400"
                                }

                              `}

                            >

                              {
                                item.label
                              }

                            </p>

                          </div>


                          {
                            index !==
                            STEPS.length - 1 && (

                              <div

                                className={`

                                  mx-2
                                  h-px
                                  flex-1

                                  ${
                                    index <
                                    currentStepIndex
                                      ? "bg-[#C8A44D]"
                                      : "bg-neutral-200"
                                  }

                                `}

                              />

                            )
                          }

                        </div>

                      );

                    }
                  )
                }

              </div>

            )
          }

        </div>


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div

          className="
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