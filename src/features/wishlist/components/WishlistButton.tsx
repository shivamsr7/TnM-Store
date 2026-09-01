import {
  Heart,
  Check,
  X,
  Trash2,
} from "lucide-react";

import {
  createPortal,
} from "react-dom";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";

import {
  useWishlist,
} from "../hooks/useWishlist";

import {
  useWishlistActions,
} from "../hooks/useWishlistActions";


interface WishlistButtonProps {

  productId: string;

  className?: string;

  iconSize?: number;

  showLabel?: boolean;

}


export default function WishlistButton({

  productId,

  className = "",

  iconSize = 18,

  showLabel = false,

}: WishlistButtonProps) {


  const {
    customer,
  } = useAuth();


  const {
    openAuth,
  } = useAuthDialog();


  const {
    data: wishlist = [],
    isLoading,
  } = useWishlist();


  const {
    addToWishlist,
    removeFromWishlist,
    isAdding,
    isRemoving,
  } = useWishlistActions();


  /*
   * =========================================================
   * WISHLIST STATE
   * =========================================================
   */

  const [
    localWishlisted,
    setLocalWishlisted,
  ] = useState(false);


  /*
   * =========================================================
   * ADD NOTIFICATION
   * =========================================================
   */

  const [
    showNotification,
    setShowNotification,
  ] = useState(false);


  const [
    notificationClosing,
    setNotificationClosing,
  ] = useState(false);


  /*
   * =========================================================
   * REMOVE CONFIRMATION
   * =========================================================
   */

  const [
    showRemoveDialog,
    setShowRemoveDialog,
  ] = useState(false);


  const [
    removeDialogClosing,
    setRemoveDialogClosing,
  ] = useState(false);


  /*
   * =========================================================
   * CHECK CURRENT WISHLIST STATE
   * =========================================================
   */

  useEffect(() => {

    if (!customer) {

      setLocalWishlisted(false);

      return;

    }


    const exists =
      wishlist.some(
        (item) =>
          item.product_id ===
          productId
      );


    setLocalWishlisted(
      exists
    );

  }, [
    wishlist,
    productId,
    customer,
  ]);


  /*
   * =========================================================
   * ADD NOTIFICATION AUTO HIDE
   * =========================================================
   */

  useEffect(() => {

    if (!showNotification) {

      return;

    }


    const closeTimer =
      window.setTimeout(() => {

        setNotificationClosing(
          true
        );

      }, 2800);


    const removeTimer =
      window.setTimeout(() => {

        setShowNotification(
          false
        );

        setNotificationClosing(
          false
        );

      }, 3250);


    return () => {

      window.clearTimeout(
        closeTimer
      );

      window.clearTimeout(
        removeTimer
      );

    };

  }, [
    showNotification,
  ]);


  /*
   * =========================================================
   * SHOW ADD NOTIFICATION
   * =========================================================
   */

  const showWishlistNotification = () => {

    setNotificationClosing(
      false
    );

    setShowNotification(
      true
    );

  };


  /*
   * =========================================================
   * CLOSE ADD NOTIFICATION
   * =========================================================
   */

  const closeNotification = () => {

    setNotificationClosing(
      true
    );


    window.setTimeout(() => {

      setShowNotification(
        false
      );

      setNotificationClosing(
        false
      );

    }, 350);

  };


  /*
   * =========================================================
   * OPEN REMOVE CONFIRMATION
   * =========================================================
   */

  const openRemoveConfirmation = () => {

    setRemoveDialogClosing(
      false
    );

    setShowRemoveDialog(
      true
    );

  };


  /*
   * =========================================================
   * CLOSE REMOVE CONFIRMATION
   * =========================================================
   */

  const closeRemoveConfirmation = () => {

    if (isRemoving) {

      return;

    }


    setRemoveDialogClosing(
      true
    );


    window.setTimeout(() => {

      setShowRemoveDialog(
        false
      );

      setRemoveDialogClosing(
        false
      );

    }, 280);

  };


  /*
   * =========================================================
   * CONFIRM REMOVE
   * =========================================================
   */

  const confirmRemove = async () => {

    if (isRemoving) {

      return;

    }


    try {

      /*
       * Do NOT change wishlist state before
       * the database operation succeeds.
       */

      await removeFromWishlist(
        productId
      );


      /*
       * Database removal succeeded.
       */

      setLocalWishlisted(
        false
      );


      setRemoveDialogClosing(
        true
      );


      window.setTimeout(() => {

        setShowRemoveDialog(
          false
        );

        setRemoveDialogClosing(
          false
        );

      }, 280);

    } catch (error) {

      console.error(
        "Wishlist removal failed:",
        error
      );

    }

  };


  /*
   * =========================================================
   * TOGGLE WISHLIST
   * =========================================================
   */

  async function handleToggle(
    event: React.MouseEvent
  ) {

    event.preventDefault();

    event.stopPropagation();


    /*
     * =======================================================
     * LOGGED OUT
     * =======================================================
     */

    if (!customer) {

      openAuth();

      return;

    }


    /*
     * =======================================================
     * PREVENT DUPLICATE REQUESTS
     * =======================================================
     */

    if (
      isAdding ||
      isRemoving ||
      isLoading
    ) {

      return;

    }


    /*
     * =======================================================
     * ALREADY WISHLISTED
     *
     * IMPORTANT:
     *
     * DO NOT REMOVE DIRECTLY.
     * OPEN CONFIRMATION DIALOG.
     * =======================================================
     */

    if (
      localWishlisted
    ) {

      openRemoveConfirmation();

      return;

    }


    /*
     * =======================================================
     * ADD TO WISHLIST
     * =======================================================
     */

    try {

      /*
       * Optimistic heart state.
       */

      setLocalWishlisted(
        true
      );


      /*
       * Wait for database success.
       */

      await addToWishlist(
        productId
      );


      /*
       * Only show success notification
       * after successful database operation.
       */

      showWishlistNotification();

    } catch (error) {

      /*
       * Roll back optimistic state.
       */

      setLocalWishlisted(
        false
      );


      console.error(
        "Wishlist action failed:",
        error
      );

    }

  }


  /*
   * =========================================================
   * KEYBOARD CONTROLS FOR REMOVE DIALOG
   * =========================================================
   */

  useEffect(() => {

    if (!showRemoveDialog) {

      return;

    }


    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key ===
        "Escape"
      ) {

        closeRemoveConfirmation();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    showRemoveDialog,
    isRemoving,
  ]);


  const isBusy =
    isAdding ||
    isRemoving ||
    isLoading;


  /*
   * =========================================================
   * ADD SUCCESS NOTIFICATION
   * =========================================================
   */

  const notification =
    showNotification && (

      <>

        <style>
          {`

            @keyframes tnmWishlistToastIn {

              0% {
                opacity: 0;
                transform:
                  translateY(18px)
                  scale(.96);
              }

              100% {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }

            }


            @keyframes tnmWishlistToastOut {

              0% {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }

              100% {
                opacity: 0;
                transform:
                  translateY(14px)
                  scale(.97);
              }

            }


            @keyframes tnmWishlistCheck {

              0% {
                opacity: 0;
                transform: scale(.65);
              }

              65% {
                opacity: 1;
                transform: scale(1.08);
              }

              100% {
                opacity: 1;
                transform: scale(1);
              }

            }


            .tnm-wishlist-toast-in {

              animation:
                tnmWishlistToastIn
                .45s
                cubic-bezier(.16,1,.3,1)
                both;

            }


            .tnm-wishlist-toast-out {

              animation:
                tnmWishlistToastOut
                .35s
                cubic-bezier(.4,0,.2,1)
                both;

            }


            .tnm-wishlist-check {

              animation:
                tnmWishlistCheck
                .45s
                cubic-bezier(.16,1,.3,1)
                both;

            }


            @media (prefers-reduced-motion: reduce) {

              .tnm-wishlist-toast-in,
              .tnm-wishlist-toast-out,
              .tnm-wishlist-check {

                animation: none !important;

              }

            }

          `}
        </style>


        <div
          className={`
            pointer-events-auto
            fixed
            bottom-[calc(20px+env(safe-area-inset-bottom))]
            left-1/2
            z-[2147483647]
            w-[calc(100%-32px)]
            max-w-[390px]
            -translate-x-1/2
            sm:bottom-6

            ${
              notificationClosing
                ? "tnm-wishlist-toast-out"
                : "tnm-wishlist-toast-in"
            }
          `}
        >

          <div
            className="
              relative
              flex
              items-center
              gap-3
              overflow-hidden
              rounded-2xl
              border
              border-[#D4AF37]/30
              bg-[#0b0b0b]/95
              px-4
              py-3.5
              shadow-[0_18px_60px_rgba(0,0,0,.55)]
              backdrop-blur-xl
            "
          >

            {/* GOLD ACCENT */}

            <div
              className="
                absolute
                bottom-0
                left-0
                top-0
                w-[3px]
                bg-[#D4AF37]
              "
            />


            {/* CHECK */}

            <div
              className="
                tnm-wishlist-check
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                border
                border-[#D4AF37]/35
                bg-[#D4AF37]/10
              "
            >

              <Check
                size={19}
                strokeWidth={2.5}
                className="
                  text-[#D4AF37]
                "
              />

            </div>


            {/* TEXT */}

            <div
              className="
                min-w-0
                flex-1
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  tracking-wide
                  text-white
                "
              >
                Added to Wishlist
              </p>


              <p
                className="
                  mt-0.5
                  text-xs
                  leading-5
                  text-white/50
                "
              >
                This piece has been saved
                to your wishlist.
              </p>

            </div>


            {/* CLOSE */}

            <button
              type="button"
              onClick={
                closeNotification
              }
              aria-label="Close notification"
              className="
                flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                text-white/35
                transition
                hover:bg-white/10
                hover:text-white
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#D4AF37]
              "
            >

              <X
                size={15}
              />

            </button>

          </div>

        </div>

      </>

    );


  /*
   * =========================================================
   * REMOVE CONFIRMATION DIALOG
   * =========================================================
   */

  const removeDialog =
    showRemoveDialog && (

      <>

        <style>
          {`

            @keyframes tnmRemoveOverlayIn {

              0% {
                opacity: 0;
              }

              100% {
                opacity: 1;
              }

            }


            @keyframes tnmRemoveOverlayOut {

              0% {
                opacity: 1;
              }

              100% {
                opacity: 0;
              }

            }


            @keyframes tnmRemoveDialogIn {

              0% {
                opacity: 0;
                transform:
                  translateY(12px)
                  scale(.94);
              }

              100% {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }

            }


            @keyframes tnmRemoveDialogOut {

              0% {
                opacity: 1;
                transform:
                  translateY(0)
                  scale(1);
              }

              100% {
                opacity: 0;
                transform:
                  translateY(8px)
                  scale(.96);
              }

            }


            .tnm-remove-overlay-in {

              animation:
                tnmRemoveOverlayIn
                .28s
                ease-out
                both;

            }


            .tnm-remove-overlay-out {

              animation:
                tnmRemoveOverlayOut
                .28s
                ease-in
                both;

            }


            .tnm-remove-dialog-in {

              animation:
                tnmRemoveDialogIn
                .4s
                cubic-bezier(.16,1,.3,1)
                both;

            }


            .tnm-remove-dialog-out {

              animation:
                tnmRemoveDialogOut
                .28s
                cubic-bezier(.4,0,.2,1)
                both;

            }


            @media (prefers-reduced-motion: reduce) {

              .tnm-remove-overlay-in,
              .tnm-remove-overlay-out,
              .tnm-remove-dialog-in,
              .tnm-remove-dialog-out {

                animation: none !important;

              }

            }

          `}
        </style>


        <div
          className={`
            fixed
            inset-0
            z-[2147483646]
            flex
            items-center
            justify-center
            bg-black/75
            px-4
            py-6
            backdrop-blur-md

            ${
              removeDialogClosing
                ? "tnm-remove-overlay-out"
                : "tnm-remove-overlay-in"
            }
          `}
          role="presentation"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              closeRemoveConfirmation();

            }

          }}
        >

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-wishlist-title"
            className={`
              relative
              w-full
              max-w-[390px]
              overflow-hidden
              rounded-[26px]
              border
              border-[#D4AF37]/25
              bg-[#0b0b0b]
              shadow-[0_30px_100px_rgba(0,0,0,.7)]

              ${
                removeDialogClosing
                  ? "tnm-remove-dialog-out"
                  : "tnm-remove-dialog-in"
              }
            `}
            onMouseDown={(
              event
            ) => {

              event.stopPropagation();

            }}
          >

            {/* =============================================
                TOP GOLD DETAIL
            ============================================== */}

            <div
              className="
                h-[2px]
                w-full
                bg-gradient-to-r
                from-transparent
                via-[#D4AF37]
                to-transparent
              "
            />


            {/* =============================================
                CLOSE
            ============================================== */}

            <button
              type="button"
              onClick={
                closeRemoveConfirmation
              }
              disabled={
                isRemoving
              }
              aria-label="Close confirmation"
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white/35
                transition
                hover:bg-white/10
                hover:text-white
                focus:outline-none
                focus-visible:ring-2
                focus-visible:ring-[#D4AF37]
                disabled:opacity-40
              "
            >

              <X
                size={17}
              />

            </button>


            {/* =============================================
                CONTENT
            ============================================== */}

            <div
              className="
                px-6
                pb-6
                pt-8
                text-center
                sm:px-8
                sm:pb-8
              "
            >

              {/* ===========================================
                  HEART ICON
              ============================================ */}

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
                  border-[#D4AF37]/25
                  bg-[#D4AF37]/10
                "
              >

                <Heart
                  size={27}
                  strokeWidth={1.7}
                  className="
                    fill-[#D4AF37]
                    text-[#D4AF37]
                  "
                />

              </div>


              {/* ===========================================
                  TITLE
              ============================================ */}

              <h2
                id="remove-wishlist-title"
                className="
                  mt-5
                  font-serif
                  text-2xl
                  font-medium
                  tracking-tight
                  text-white
                "
              >
                Remove from Wishlist?
              </h2>


              {/* ===========================================
                  DESCRIPTION
              ============================================ */}

              <p
                className="
                  mx-auto
                  mt-3
                  max-w-[300px]
                  text-sm
                  leading-6
                  text-white/50
                "
              >
                Are you sure you want to remove
                this beautiful piece from your
                wishlist?
              </p>


              {/* ===========================================
                  BUTTONS
              ============================================ */}

              <div
                className="
                  mt-7
                  flex
                  flex-col-reverse
                  gap-2.5
                  sm:flex-row
                "
              >

                {/* KEEP */}

                <button
                  type="button"
                  onClick={
                    closeRemoveConfirmation
                  }
                  disabled={
                    isRemoving
                  }
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#D4AF37]/40
                    bg-transparent
                    px-5
                    text-sm
                    font-medium
                    text-[#E4C56B]
                    transition-all

                    hover:bg-[#D4AF37]/10
                    hover:border-[#D4AF37]/70

                    active:scale-[.98]

                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D4AF37]

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Keep in Wishlist
                </button>


                {/* REMOVE */}

                <button
                  type="button"
                  onClick={
                    confirmRemove
                  }
                  disabled={
                    isRemoving
                  }
                  className="
                    flex
                    h-12
                    flex-1
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#D4AF37]
                    px-5
                    text-sm
                    font-semibold
                    text-black
                    transition-all

                    hover:bg-[#E2C15E]

                    active:scale-[.98]

                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#D4AF37]
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[#0b0b0b]

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {isRemoving ? (

                    <>
                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-black/30
                          border-t-black
                        "
                      />

                      Removing...

                    </>

                  ) : (

                    <>
                      <Trash2
                        size={15}
                      />

                      Remove

                    </>

                  )}

                </button>

              </div>


              {/* ===========================================
                  SMALL NOTE
              ============================================ */}

              <p
                className="
                  mt-4
                  text-[10px]
                  uppercase
                  tracking-[0.18em]
                  text-white/20
                "
              >
                You can always add it again later
              </p>

            </div>

          </div>

        </div>

      </>

    );


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      <button

        type="button"

        onClick={
          handleToggle
        }

        disabled={
          isBusy
        }

        aria-label={
          localWishlisted
            ? "Remove from wishlist"
            : "Add to wishlist"
        }

        aria-pressed={
          localWishlisted
        }

        className={`
          inline-flex
          items-center
          justify-center
          gap-2
          transition-all
          duration-200

          disabled:cursor-not-allowed
          disabled:opacity-60

          ${className}
        `}

      >

        <Heart

          size={
            iconSize
          }

          strokeWidth={
            localWishlisted
              ? 2.4
              : 1.8
          }

          className={`
            transition-all
            duration-200

            ${
              localWishlisted
                ? `
                  fill-[#D4AF37]
                  text-[#D4AF37]
                `
                : `
                  text-current
                `
            }
          `}

        />


        {showLabel && (

          <span>

            {localWishlisted
              ? "Saved"
              : "Wishlist"}

          </span>

        )}

      </button>


      {/* =====================================================
          PORTALS
      ====================================================== */}

      {typeof document !== "undefined" &&
        notification &&
        createPortal(
          notification,
          document.body
        )}


      {typeof document !== "undefined" &&
        removeDialog &&
        createPortal(
          removeDialog,
          document.body
        )}

    </>

  );

}