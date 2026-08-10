import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  X,
  Bell,
  Check,
  Loader2,
} from "lucide-react";

import {
  useCreateNotify,
  useHasPendingNotify,
  useHasPendingGuestNotify,
} from "../hooks/useNotify";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


interface NotifyDialogProps {

  open: boolean;

  onClose: () => void;

  product: {

    id: string;

    name: string;

    image?: string | null;

  };

}


/*
 * =========================================================
 * SESSION STORAGE
 * =========================================================
 *
 * We remember Notify Me requests made during the current
 * browser session.
 *
 * This prevents the customer from having to enter their
 * details every time they reopen the dialog.
 *
 * =========================================================
 */

const getNotifyStorageKey = (
  productId: string
) =>
  `tnm_notify_requested_${productId}`;


export default function NotifyDialog({

  open,

  onClose,

  product,

}: NotifyDialogProps) {


  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer,
  } = useAuth();


  /*
   * =========================================================
   * CREATE MUTATION
   * =========================================================
   */

  const {
    mutateAsync:
      createNotify,

    isPending:
      isCreating,

  } = useCreateNotify();


  /*
   * =========================================================
   * FORM STATE
   * =========================================================
   */

  const [
    name,
    setName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  /*
   * =========================================================
   * SUCCESS STATE
   * =========================================================
   */

  const [
    submitted,
    setSubmitted,
  ] = useState(false);


  /*
   * =========================================================
   * LOGGED-IN CUSTOMER CHECK
   * =========================================================
   */

  const {
    data:
      hasPendingRequest,

    isLoading:
      isCheckingPending,

  } = useHasPendingNotify(

    product.id,

    customer?.id ?? null

  );


  /*
   * =========================================================
   * GUEST CHECK
   * =========================================================
   */

  const {
    data:
      hasPendingGuestRequest,

    isLoading:
      isCheckingGuestPending,

  } = useHasPendingGuestNotify(

    product.id,

    phone

  );


  /*
   * =========================================================
   * SESSION REQUEST CHECK
   * =========================================================
   */

  const [
    hasSessionRequest,
    setHasSessionRequest,
  ] = useState(false);


  /*
   * =========================================================
   * PREFILL / RESTORE
   * =========================================================
   */

  useEffect(() => {

    if (!open) {

      return;

    }


    setError("");


    /*
     * -------------------------------------------------------
     * Check browser session
     * -------------------------------------------------------
     */

    let sessionRequested =
      false;


    try {

      sessionRequested =
        sessionStorage.getItem(
          getNotifyStorageKey(
            product.id
          )
        ) === "true";

    } catch {

      sessionRequested =
        false;

    }


    setHasSessionRequest(
      sessionRequested
    );


    /*
     * -------------------------------------------------------
     * Logged-in customer
     * -------------------------------------------------------
     */

    if (
      customer
    ) {

      setName(

        [
          customer.first_name,
          customer.last_name,
        ]
          .filter(Boolean)
          .join(" ")

      );


      setEmail(
        customer.email ??
        ""
      );


      setPhone(
        customer.phone ??
        ""
      );

    }

  }, [
    open,
    product.id,
    customer,
  ]);


  /*
   * =========================================================
   * EXISTING REQUEST
   * =========================================================
   */

  const alreadyRequested =

    hasSessionRequest

    ||

    (
      customer?.id
        ? Boolean(
            hasPendingRequest
          )
        : Boolean(
            hasPendingGuestRequest
          )
    );


  /*
   * =========================================================
   * CHECKING
   * =========================================================
   */

  const isCheckingExistingRequest =

    customer?.id

      ? isCheckingPending

      : isCheckingGuestPending;


  /*
   * =========================================================
   * DON'T RENDER
   * =========================================================
   */

  if (!open) {

    return null;

  }


  /*
   * =========================================================
   * SAVE SESSION REQUEST
   * =========================================================
   */

  const rememberNotifyRequest =
    () => {

      try {

        sessionStorage.setItem(

          getNotifyStorageKey(
            product.id
          ),

          "true"

        );

      } catch {

        /*
         * Ignore storage errors.
         */

      }


      setHasSessionRequest(
        true
      );

    };


  /*
   * =========================================================
   * SUBMIT
   * =========================================================
   */

  async function handleSubmit(
    event: FormEvent
  ) {

    event.preventDefault();


    setError("");


    /*
     * -------------------------------------------------------
     * Already requested
     * -------------------------------------------------------
     */

    if (
      alreadyRequested
    ) {

      rememberNotifyRequest();

      setSubmitted(
        true
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Name
     * -------------------------------------------------------
     */

    const trimmedName =
      name.trim();


    /*
     * -------------------------------------------------------
     * Email
     * -------------------------------------------------------

     */

    const trimmedEmail =
      email.trim();


    /*
     * -------------------------------------------------------
     * Phone
     * -------------------------------------------------------

     */

    const trimmedPhone =
      phone.trim();


    /*
     * -------------------------------------------------------
     * Name validation
     * -------------------------------------------------------

     */

    if (
      !trimmedName
    ) {

      setError(
        "Please enter your name."
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Phone validation
     * -------------------------------------------------------

     */

    if (
      !trimmedPhone
    ) {

      setError(
        "Please enter your phone number."
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Phone format
     * -------------------------------------------------------

     */

    const phoneDigits =
      trimmedPhone.replace(
        /\D/g,
        ""
      );


    if (
      phoneDigits.length <
      10
    ) {

      setError(
        "Please enter a valid phone number."
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Email validation
     * -------------------------------------------------------

     */

    if (
      trimmedEmail &&

      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        trimmedEmail
      )
    ) {

      setError(
        "Please enter a valid email address."
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Guest duplicate check
     * -------------------------------------------------------

     */

    if (
      !customer?.id &&
      hasPendingGuestRequest
    ) {

      rememberNotifyRequest();

      setSubmitted(
        true
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * Logged-in duplicate check
     * -------------------------------------------------------

     */

    if (
      customer?.id &&
      hasPendingRequest
    ) {

      rememberNotifyRequest();

      setSubmitted(
        true
      );

      return;

    }


    /*
     * -------------------------------------------------------
     * CREATE
     * -------------------------------------------------------

     */

    try {

      await createNotify({

        product_id:
          product.id,

        customer_id:
          customer?.id ??
          null,

        name:
          trimmedName,

        phone:
          trimmedPhone,

        email:
          trimmedEmail ||
          null,

      });


      /*
       * Remember successful request.
       */

      rememberNotifyRequest();


      setSubmitted(
        true
      );


    } catch (
      submissionError
    ) {

      console.error(
        "Notify request failed:",
        submissionError
      );


      /*
       * -----------------------------------------------------
       * Duplicate race condition
       * -----------------------------------------------------
       *
       * Database unique constraint:
       *
       * product_id + customer_id + pending
       *
       * If another request already exists, treat it as
       * successfully registered instead of showing an error.
       *
       * -----------------------------------------------------
       */

      const errorCode =

        (
          submissionError as {
            code?: string;
          }
        )?.code;


      if (
        errorCode ===
        "23505"
      ) {

        rememberNotifyRequest();

        setSubmitted(
          true
        );

        return;

      }


      setError(
        "Something went wrong. Please try again."
      );

    }

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div

      className="
        fixed
        inset-0
        z-[10000]

        flex
        items-end
        justify-center

        bg-black/65

        p-0

        backdrop-blur-sm

        sm:items-center
        sm:p-5
      "

      onClick={
        onClose
      }

    >

      <div

        role="dialog"

        aria-modal="true"

        aria-labelledby="
          notify-dialog-title
        "

        className="
          relative

          w-full
          max-w-md

          overflow-hidden

          rounded-t-[28px]

          border
          border-neutral-200

          bg-white

          shadow-[0_-20px_70px_rgba(0,0,0,0.30)]

          sm:rounded-[26px]

          sm:shadow-[0_25px_80px_rgba(0,0,0,0.35)]
        "

        onClick={(
          event
        ) =>
          event.stopPropagation()
        }

      >

        {/* =================================================
            CLOSE
        ================================================== */}

        <button

          type="button"

          onClick={
            onClose
          }

          aria-label="
            Close
          "

          className="
            absolute

            right-4
            top-4

            z-10

            flex

            h-9
            w-9

            items-center
            justify-center

            rounded-full

            bg-neutral-100

            text-neutral-500

            transition

            hover:bg-neutral-200

            hover:text-neutral-900

            active:scale-95
          "

        >

          <X
            size={17}
          />

        </button>


        {/* =================================================
            HEADER
        ================================================== */}

        <div

          className="
            border-b
            border-neutral-100

            px-5
            pb-5
            pt-7

            sm:px-6
            sm:pt-8
          "

        >

          <div

            className="
              flex
              items-center
              gap-3
            "

          >

            <div

              className="
                flex

                h-11
                w-11

                shrink-0

                items-center
                justify-center

                rounded-full

                bg-[#D4AF37]/10

                text-[#A77C1F]
              "

            >

              <Bell
                size={20}
              />

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p

                className="
                  text-[9px]

                  font-semibold

                  uppercase

                  tracking-[0.22em]

                  text-[#A77C1F]
                "

              >

                Restock Alert

              </p>


              <h2

                id="
                  notify-dialog-title
                "

                className="
                  mt-1

                  pr-8

                  text-lg

                  font-semibold

                  tracking-tight

                  text-neutral-900
                "

              >

                Get notified

              </h2>

            </div>

          </div>


          <p

            className="
              mt-4

              text-xs

              leading-5

              text-neutral-500
            "

          >

            Enter your details and we'll
            let you know when this piece
            is back in stock.

          </p>


          <div

            className="
              mt-3

              rounded-xl

              bg-neutral-50

              px-3
              py-2.5
            "

          >

            <p

              className="
                line-clamp-2

                text-xs

                font-medium

                text-neutral-800
              "

            >

              {product.name}

            </p>

          </div>

        </div>


        {/* =================================================
            SUCCESS / ALREADY REQUESTED
        ================================================== */}

        {(submitted ||
          alreadyRequested) ? (

          <div

            className="
              px-5

              py-10

              text-center

              sm:px-6
              sm:py-12
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

                bg-green-50

                text-green-600
              "

            >

              <Check
                size={26}
              />

            </div>


            <h3

              className="
                mt-5

                text-lg

                font-semibold

                text-neutral-900
              "

            >

              You're already on the list

            </h3>


            <p

              className="
                mx-auto

                mt-2

                max-w-xs

                text-xs

                leading-5

                text-neutral-500
              "

            >

              We'll notify you when this
              product is back in stock.

            </p>


            <button

              type="button"

              onClick={
                onClose
              }

              className="
                mt-7

                min-h-11

                rounded-full

                bg-[#D4AF37]

                px-7

                text-xs

                font-semibold

                text-black

                transition

                hover:bg-[#E3C45F]

                active:scale-[0.98]
              "

            >

              Done

            </button>

          </div>

        ) : (

          /* =================================================
             FORM
          ================================================== */

          <form

            onSubmit={
              handleSubmit
            }

            className="
              px-5

              py-5

              sm:px-6
              sm:py-6
            "

          >

            {/* =================================================
                NAME
            ================================================== */}

            <div>

              <label

                htmlFor="
                  notify-name
                "

                className="
                  mb-1.5

                  block

                  text-[11px]

                  font-medium

                  text-neutral-700
                "

              >

                Name

              </label>


              <input

                id="
                  notify-name
                "

                type="text"

                value={
                  name
                }

                onChange={(
                  event
                ) =>
                  setName(
                    event.target.value
                  )
                }

                placeholder="
                  Your name
                "

                autoComplete="
                  name
                "

                className="
                  h-11

                  w-full

                  rounded-xl

                  border

                  border-neutral-200

                  bg-white

                  px-3.5

                  text-xs

                  text-neutral-900

                  outline-none

                  transition

                  placeholder:text-neutral-400

                  focus:border-[#D4AF37]

                  focus:ring-2

                  focus:ring-[#D4AF37]/10
                "

              />

            </div>


            {/* =================================================
                EMAIL
            ================================================== */}

            <div
              className="
                mt-4
              "
            >

              <label

                htmlFor="
                  notify-email
                "

                className="
                  mb-1.5

                  block

                  text-[11px]

                  font-medium

                  text-neutral-700
                "

              >

                Email

                <span

                  className="
                    ml-1

                    font-normal

                    text-neutral-400
                  "

                >

                  (optional)

                </span>

              </label>


              <input

                id="
                  notify-email
                "

                type="email"

                value={
                  email
                }

                onChange={(
                  event
                ) =>
                  setEmail(
                    event.target.value
                  )
                }

                placeholder="
                  you@example.com
                "

                autoComplete="
                  email
                "

                className="
                  h-11

                  w-full

                  rounded-xl

                  border
                  border-neutral-200

                  bg-white

                  px-3.5

                  text-xs

                  text-neutral-900

                  outline-none

                  transition

                  placeholder:text-neutral-400

                  focus:border-[#D4AF37]

                  focus:ring-2

                  focus:ring-[#D4AF37]/10
                "

              />

            </div>


            {/* =================================================
                PHONE
            ================================================== */}

            <div
              className="
                mt-4
              "
            >

              <label

                htmlFor="
                  notify-phone
                "

                className="
                  mb-1.5

                  block

                  text-[11px]

                  font-medium

                  text-neutral-700
                "

              >

                Phone

                <span

                  className="
                    ml-1

                    font-medium

                    text-red-500
                  "

                >

                  *

                </span>

              </label>


              <input

                id="
                  notify-phone
                "

                type="tel"

                value={
                  phone
                }

                onChange={(
                  event
                ) =>
                  setPhone(
                    event.target.value
                  )
                }

                placeholder="
                  +91 XXXXX XXXXX
                "

                autoComplete="
                  tel
                "

                required

                className="
                  h-11

                  w-full

                  rounded-xl

                  border

                  border-neutral-200

                  bg-white

                  px-3.5

                  text-xs

                  text-neutral-900

                  outline-none

                  transition

                  placeholder:text-neutral-400

                  focus:border-[#D4AF37]

                  focus:ring-2

                  focus:ring-[#D4AF37]/10
                "

              />

            </div>


            {/* =================================================
                ERROR
            ================================================== */}

            {error && (

              <p

                role="alert"

                className="
                  mt-3

                  rounded-xl

                  bg-red-50

                  px-3
                  py-2.5

                  text-[11px]

                  leading-4

                  text-red-600
                "

              >

                {error}

              </p>

            )}


            {/* =================================================
                SUBMIT
            ================================================== */}

            <button

              type="submit"

              disabled={

                isCreating ||

                isCheckingExistingRequest

              }

              className="
                mt-5

                flex

                min-h-12

                w-full

                items-center
                justify-center

                gap-2

                rounded-full

                bg-[#D4AF37]

                text-xs

                font-semibold

                text-black

                shadow-[0_7px_22px_rgba(212,175,55,0.12)]

                transition

                hover:bg-[#E3C45F]

                active:scale-[0.98]

                disabled:cursor-wait

                disabled:opacity-60
              "

            >

              {isCheckingExistingRequest ? (

                <>

                  <Loader2

                    size={15}

                    className="
                      animate-spin
                    "

                  />

                  Checking...

                </>

              ) : isCreating ? (

                <>

                  <Loader2

                    size={15}

                    className="
                      animate-spin
                    "

                  />

                  Saving...

                </>

              ) : (

                <>

                  <Bell
                    size={15}
                  />

                  Notify Me

                </>

              )}

            </button>


            <p

              className="
                mt-3

                text-center

                text-[9px]

                leading-4

                text-neutral-400
              "

            >

              We'll only use your details for
              this restock notification.

            </p>

          </form>

        )}

      </div>

    </div>

  );

}