import {
  MapPin,
  Loader2,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

import {
  useDeliveryCheck,
} from "@/features/shipping/hooks/useDeliveryCheck";


interface DeliveryCheckerProps {
  product: any;
}


export default function DeliveryChecker({
  product,
}: DeliveryCheckerProps) {


  const [
    pincode,
    setPincode,
  ] = useState("");


  const [
    savedDelivery,
    setSavedDelivery,
  ] = useState<any>(null);


  const [
    showInput,
    setShowInput,
  ] = useState(false);


  const [
    deliveryError,
    setDeliveryError,
  ] = useState("");


  const {
    mutate,
    isPending,
  } = useDeliveryCheck();


  /*
   * =========================================================
   * DELIVERY DATE
   * =========================================================
   */

  const getDeliveryDate = (
    days: number = 3
  ) => {

    const startDate =
      new Date();

    startDate.setDate(
      startDate.getDate() +
      days +
      2
    );


    const endDate =
      new Date();

    endDate.setDate(
      endDate.getDate() +
      days +
      3
    );


    return {

      start:
        startDate.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        ),

      end:
        endDate.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        ),

    };

  };


  /*
   * =========================================================
   * LOAD SAVED DELIVERY
   * =========================================================
   */

  useEffect(() => {

    const saved =
      localStorage.getItem(
        "tnm_delivery_info"
      );


    if (!saved) {
      return;
    }


    try {

      const parsed =
        JSON.parse(saved);


      /*
       * -----------------------------------------------------
       * Validate saved delivery data
       * -----------------------------------------------------
       *
       * Older checkout data may not contain deliveryDate.
       * Don't allow that invalid data to break the component.
       */

      if (
        parsed?.pincode &&
        parsed?.deliveryDate?.start
      ) {

        setSavedDelivery(
          parsed
        );

        setPincode(
          parsed.pincode
        );

        return;

      }


      /*
       * -----------------------------------------------------
       * Old / incomplete data
       * -----------------------------------------------------
       */

      localStorage.removeItem(
        "tnm_delivery_info"
      );

      setSavedDelivery(
        null
      );

    } catch (
      error
    ) {

      console.error(
        "Failed to parse saved delivery information:",
        error
      );


      localStorage.removeItem(
        "tnm_delivery_info"
      );


      setSavedDelivery(
        null
      );

    }

  }, []);


  /*
   * =========================================================
   * CHECK DELIVERY
   * =========================================================
   */

  const handleCheck = () => {

    if (
      pincode.length !== 6
    ) {

      setDeliveryError(
        "Please enter a valid 6-digit pincode."
      );

      return;

    }


    setDeliveryError(
      ""
    );


    mutate(

      {
        pincode,

        weight:
          product?.weight ||
          0.500,
      },

      {

        onSuccess: (
          data
        ) => {

          /*
           * -------------------------------------------------
           * GET FIRST AVAILABLE COURIER
           * -------------------------------------------------
           */

          const courier =
            data
              ?.data
              ?.available_courier_companies
              ?.[0];


          /*
           * -------------------------------------------------
           * NO COURIER
           * -------------------------------------------------
           */

          if (!courier) {

            setDeliveryError(
              "Sorry, delivery is not available for this pincode."
            );


            setSavedDelivery(
              null
            );


            localStorage.removeItem(
              "tnm_delivery_info"
            );


            return;

          }


          /*
           * -------------------------------------------------
           * DELIVERY DATE
           * -------------------------------------------------
           */

          const deliveryDate =
            getDeliveryDate(

              Number(
                courier?.estimated_delivery_days ||
                courier?.etd ||
                3
              )

            );


          /*
           * -------------------------------------------------
           * SHIPPING INFORMATION
           * -------------------------------------------------
           *
           * Keep the original Shiprocket rate here.
           *
           * CheckoutDialog can separately convert it:
           *
           * <= ₹100 → ₹59
           * > ₹100  → ₹79
           * ₹2000+  → FREE
           * -------------------------------------------------
           */

          const shiprocketRate =
            Number(
              courier?.rate ||
              0
            );


          const deliveryInfo = {

            pincode,

            deliveryDate,

            shippingCharge:
              shiprocketRate,

            customerShippingCharge:
              shiprocketRate <= 100
                ? 59
                : 79,

            courier:
              courier?.courier_name ||
              "",

          };


          /*
           * -------------------------------------------------
           * SAVE DELIVERY INFORMATION
           * -------------------------------------------------
           */

          localStorage.setItem(
            "tnm_delivery_info",
            JSON.stringify(
              deliveryInfo
            )
          );


          /*
           * -------------------------------------------------
           * UPDATE UI
           * -------------------------------------------------
           */

          setSavedDelivery(
            deliveryInfo
          );


          setShowInput(
            false
          );


          setDeliveryError(
            ""
          );

        },


        onError: (
          error
        ) => {

          console.error(
            "Delivery check failed:",
            error
          );


          setDeliveryError(
            "Sorry, delivery is not available for this pincode."
          );

        },

      }

    );

  };


  /*
   * =========================================================
   * CHANGE PINCODE
   * =========================================================
   */

  const changePincode = () => {

    setSavedDelivery(
      null
    );


    setDeliveryError(
      ""
    );


    localStorage.removeItem(
      "tnm_delivery_info"
    );


    setShowInput(
      true
    );

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div

      className="
        mt-10
        border-t
        border-neutral-800
        pt-8
      "

    >

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div

        className="
          flex
          items-center
          justify-between
        "

      >

        <h3

          className="
            text-lg
            font-medium
            text-white
          "

        >

          Deliver To


          {
            savedDelivery && (

              <span

                className="
                  ml-2
                  text-[#D4AF37]
                "

              >

                {
                  savedDelivery.pincode
                }

              </span>

            )
          }

        </h3>


        <button

          onClick={
            changePincode
          }

          className="
            text-sm
            font-medium
            text-[#D4AF37]
          "

        >

          Change

        </button>

      </div>


      {/* =====================================================
          SAVED DELIVERY
      ====================================================== */}

      {
        savedDelivery &&
        !showInput && (

          <div

            className="
              mt-4
              rounded-xl
              border
              border-neutral-700
              px-5
              py-4
              text-sm
              text-neutral-300
            "

          >

            Delivery by{" "}

            <span

              className="
                font-medium
                text-white
              "

            >

              {
                savedDelivery
                  ?.deliveryDate
                  ?.start ||
                "Calculating..."
              }

            </span>

          </div>

        )
      }


      {/* =====================================================
          INPUT
      ====================================================== */}

      {
        (
          !savedDelivery ||
          showInput
        ) && (

          <div

            className="
              mt-5
              flex
              overflow-hidden
              rounded-xl
              border
              border-neutral-700
              bg-neutral-900
            "

          >

            <div

              className="
                flex
                flex-1
                items-center
                gap-3
                px-4
              "

            >

              <MapPin

                size={18}

                className="
                  text-[#D4AF37]
                "

              />


              <input

                value={
                  pincode
                }

                onChange={(
                  e
                ) => {

                  setPincode(

                    e.target.value.replace(
                      /\D/g,
                      ""
                    )

                  );

                }}

                placeholder="
                  Enter pincode
                "

                maxLength={
                  6
                }

                inputMode="
                  numeric
                "

                className="
                  w-full
                  bg-transparent
                  py-4
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-neutral-500
                "

              />

            </div>


            <button

              onClick={
                handleCheck
              }

              disabled={
                isPending ||
                pincode.length !== 6
              }

              className="
                flex
                items-center
                gap-2
                bg-[#D4AF37]
                px-6
                text-sm
                font-medium
                text-black
                disabled:cursor-not-allowed
                disabled:opacity-60
              "

            >

              {
                isPending ? (

                  <Loader2

                    size={16}

                    className="
                      animate-spin
                    "

                  />

                ) : (

                  "Check"

                )
              }

            </button>

          </div>

        )
      }


      {/* =====================================================
          ERROR
      ====================================================== */}

      {
        deliveryError && (

          <div

            className="
              mt-4
              text-sm
              text-red-400
            "

          >

            {
              deliveryError
            }

          </div>

        )
      }

    </div>

  );

}