import {
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  Loader2,
  Star,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  reviewService,
} from "../services/review.service";


interface WriteReviewDialogProps {
  productId: string;
  open: boolean;
  onClose: () => void;
}


export default function WriteReviewDialog({
  productId,
  open,
  onClose,
}: WriteReviewDialogProps) {

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
   * FORM STATE
   * =========================================================
   */

  const [rating, setRating] = useState(0);

  const [title, setTitle] = useState("");

  const [review, setReview] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [isDuplicate, setIsDuplicate] =
    useState(false);

  const [success, setSuccess] =
    useState(false);


  /*
   * =========================================================
   * RESET FORM
   * =========================================================
   */

  const resetForm = () => {
    setRating(0);
    setTitle("");
    setReview("");
    setError(null);
    setIsDuplicate(false);
    setSuccess(false);
  };


  /*
   * =========================================================
   * CLOSE
   * =========================================================
   */

  const handleClose = () => {

    if (isSubmitting) {
      return;
    }

    resetForm();
    onClose();
  };


  /*
   * =========================================================
   * SUBMIT REVIEW
   * =========================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError(null);
    setIsDuplicate(false);


    /*
     * =======================================================
     * CUSTOMER CHECK
     * =======================================================
     */

    if (!customer) {

      setError(
        "Please log in to write a review."
      );

      return;
    }


    /*
     * =======================================================
     * CUSTOMER ID CHECK
     * =======================================================
     */

    if (!customer.id) {

      setError(
        "We couldn't identify your customer account."
      );

      return;
    }


    /*
     * =======================================================
     * RATING VALIDATION
     * =======================================================
     */

    if (
      rating < 1 ||
      rating > 5
    ) {

      setError(
        "Please select a rating."
      );

      return;
    }


    /*
     * =======================================================
     * REVIEW VALIDATION
     * =======================================================
     */

    const trimmedReview =
      review.trim();


    if (
      trimmedReview.length < 10
    ) {

      setError(
        "Please write at least 10 characters."
      );

      return;
    }


    if (
      trimmedReview.length > 2000
    ) {

      setError(
        "Review cannot exceed 2000 characters."
      );

      return;
    }


    /*
     * =======================================================
     * TITLE VALIDATION
     * =======================================================
     */

    const trimmedTitle =
      title.trim();


    if (
      trimmedTitle.length > 100
    ) {

      setError(
        "Title cannot exceed 100 characters."
      );

      return;
    }


    /*
     * =======================================================
     * SUBMIT
     * =======================================================
     */

    try {

      setIsSubmitting(true);


      await reviewService.createReview({

        product_id:
          productId,

        customer_id:
          customer.id,

        rating:
          rating,

        title:
          trimmedTitle ||
          null,

        review:
          trimmedReview,

      });


      /*
       * =====================================================
       * SUCCESS
       * =====================================================
       */

      setSuccess(true);

    } catch (
      submitError
    ) {

      console.error(
        "Review submission error:",
        submitError
      );


      /*
       * =====================================================
       * SUPABASE ERROR HANDLING
       * =====================================================
       */

      const errorMessage =
        typeof submitError === "object" &&
        submitError !== null &&
        "message" in submitError

          ? String(
              (
                submitError as {
                  message?: unknown;
                }
              ).message ?? ""
            )

          : submitError instanceof Error

            ? submitError.message

            : String(
                submitError ?? ""
              );


      const normalizedError =
        errorMessage.toLowerCase();


      /*
       * =====================================================
       * DUPLICATE REVIEW
       * =====================================================
       */

      if (
        normalizedError.includes(
          "already reviewed"
        )
      ) {

        setIsDuplicate(true);

        setError(
          "You've already shared your love for this piece. ♡"
        );

        return;
      }


      /*
       * =====================================================
       * CUSTOMER ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "customer account"
        )
      ) {

        setError(
          "We couldn't find your customer account."
        );

        return;
      }


      /*
       * =====================================================
       * PRODUCT ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "product"
        )
      ) {

        setError(
          "This product could not be found."
        );

        return;
      }


      /*
       * =====================================================
       * RATING ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "rating"
        )
      ) {

        setError(
          "Please select a valid rating."
        );

        return;
      }


      /*
       * =====================================================
       * REVIEW LENGTH ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "10 characters"
        )
      ) {

        setError(
          "Please write at least 10 characters."
        );

        return;
      }


      if (
        normalizedError.includes(
          "2000 characters"
        )
      ) {

        setError(
          "Review cannot exceed 2000 characters."
        );

        return;
      }


      /*
       * =====================================================
       * TITLE ERROR
       * =====================================================
       */

      if (
        normalizedError.includes(
          "100 characters"
        )
      ) {

        setError(
          "Review title cannot exceed 100 characters."
        );

        return;
      }


      /*
       * =====================================================
       * GENERIC ERROR
       * =====================================================
       */

      setError(
        "We're having a little trouble submitting your review right now. Please try again in a moment. ♡"
      );

    } finally {

      setIsSubmitting(false);

    }

  };


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
   * DIALOG CONTENT
   *
   * IMPORTANT:
   *
   * Render directly into document.body.
   *
   * This prevents ProductDetails/ProductReviews parent
   * stacking contexts from affecting the modal.
   * =========================================================
   */

  const dialog = (

    <div
      className="
        fixed
        inset-0
        z-[99999]
        flex
        items-center
        justify-center
        overflow-y-auto
        bg-black/80
        px-4
        py-6
        backdrop-blur-sm

        sm:px-6
        sm:py-8
      "
      role="presentation"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          handleClose();

        }

      }}
    >

      {/* =====================================================
          DIALOG
      ====================================================== */}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="write-review-title"
        className="
          relative
          my-auto
          max-h-[90vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-3xl
          border
          border-neutral-200
          bg-white
          shadow-[0_25px_100px_rgba(0,0,0,.65)]
        "
        onMouseDown={(event) => {
          event.stopPropagation();
        }}
      >

        {/* ===================================================
            CLOSE BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={
            handleClose
          }
          disabled={
            isSubmitting
          }
          aria-label="Close review dialog"
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            border
            border-neutral-200
            bg-neutral-100
            text-neutral-700
            transition

            hover:bg-neutral-200
            hover:text-black

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-[#C8A44D]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <X
            className="
              h-4
              w-4
            "
          />

        </button>


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div
          className="
            p-5
            sm:p-7
          "
        >

          {!success ? (

            <>

              {/* =============================================
                  HEADER
              ============================================== */}

              <div
                className="
                  pr-12
                "
              >

                <span
                  className="
                    text-[10px]
                    font-medium
                    uppercase
                    tracking-[0.3em]
                    text-[#C8A44D]
                  "
                >
                  Customer Love
                </span>


                <h2
                  id="write-review-title"
                  className="
                    mt-2
                    text-2xl
                    font-semibold
                    text-neutral-900
                  "
                >
                  Write a Review
                </h2>


                <p
                  className="
                    mt-1
                    text-sm
                    leading-6
                    text-neutral-500
                  "
                >
                  We'd love to hear about
                  your experience.
                </p>

              </div>


              {/* =============================================
                  FORM
              ============================================== */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="
                  mt-6
                  space-y-5
                "
              >

                {/* ===========================================
                    RATING
                ============================================ */}

                <div>

                  <label
                    className="
                      text-sm
                      font-medium
                      text-neutral-900
                    "
                  >
                    Your rating
                  </label>


                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-1
                    "
                  >

                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => {

                        const star =
                          index + 1;


                        return (

                          <button
                            key={
                              star
                            }
                            type="button"
                            onClick={() =>
                              setRating(
                                star
                              )
                            }
                            aria-label={`Rate ${star} out of 5`}
                            className="
                              rounded-md
                              p-1
                              transition
                              hover:scale-110
                              focus:outline-none
                              focus-visible:ring-2
                              focus-visible:ring-[#C8A44D]
                            "
                          >

                            <Star
                              className={`
                                h-7
                                w-7
                                transition-colors

                                ${
                                  star <=
                                  rating
                                    ? "fill-[#C8A44D] text-[#C8A44D]"
                                    : "text-neutral-300"
                                }
                              `}
                            />

                          </button>

                        );

                      }
                    )}

                  </div>

                </div>


                {/* ===========================================
                    TITLE
                ============================================ */}

                <div>

                  <label
                    htmlFor="review-title"
                    className="
                      text-sm
                      font-medium
                      text-neutral-900
                    "
                  >

                    Review title

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
                    id="review-title"
                    type="text"
                    value={
                      title
                    }
                    onChange={(event) =>
                      setTitle(
                        event.target.value
                      )
                    }
                    maxLength={100}
                    placeholder="e.g. Absolutely beautiful!"
                    className="
                      mt-2
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-neutral-200
                      bg-neutral-50
                      px-4
                      text-sm
                      text-neutral-900
                      outline-none

                      placeholder:text-neutral-400

                      focus:border-[#C8A44D]
                      focus:ring-1
                      focus:ring-[#C8A44D]/20
                    "
                  />

                </div>


                {/* ===========================================
                    REVIEW
                ============================================ */}

                <div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <label
                      htmlFor="review-text"
                      className="
                        text-sm
                        font-medium
                        text-neutral-900
                      "
                    >
                      Your review
                    </label>


                    <span
                      className="
                        text-[11px]
                        text-neutral-400
                      "
                    >
                      {review.length}/2000
                    </span>

                  </div>


                  <textarea
                    id="review-text"
                    value={
                      review
                    }
                    onChange={(event) =>
                      setReview(
                        event.target.value
                      )
                    }
                    maxLength={2000}
                    rows={5}
                    placeholder="Tell us what you loved about this piece..."
                    className="
                      mt-2
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-neutral-200
                      bg-neutral-50
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-neutral-900
                      outline-none

                      placeholder:text-neutral-400

                      focus:border-[#C8A44D]
                      focus:ring-1
                      focus:ring-[#C8A44D]/20
                    "
                  />

                </div>


                {/* ===========================================
                    MESSAGE
                ============================================ */}

                {error && (

                  <div
                    className={`
                      rounded-xl
                      px-4
                      py-3
                      text-sm
                      leading-5

                      ${
                        isDuplicate
                          ? `
                            border
                            border-[#C8A44D]/25
                            bg-[#C8A44D]/[0.06]
                            text-neutral-700
                          `
                          : `
                            border
                            border-red-200
                            bg-red-50
                            text-red-600
                          `
                      }
                    `}
                  >

                    {error}


                    {isDuplicate && (

                      <p
                        className="
                          mt-1
                          text-xs
                          text-neutral-500
                        "
                      >
                        Each product can be reviewed
                        only once.
                      </p>

                    )}

                  </div>

                )}


                {/* ===========================================
                    INFO
                ============================================ */}

                {!isDuplicate && (

                  <div
                    className="
                      rounded-xl
                      border
                      border-[#C8A44D]/20
                      bg-[#C8A44D]/5
                      px-4
                      py-3
                      text-xs
                      leading-5
                      text-neutral-600
                    "
                  >
                    Your review will be published
                    after our team reviews it.
                  </div>

                )}


                {/* ===========================================
                    SUBMIT BUTTON
                ============================================ */}

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    isDuplicate
                  }
                  className="
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#C8A44D]
                    px-5
                    text-sm
                    font-semibold
                    text-black
                    transition

                    hover:bg-[#D6B65C]

                    active:scale-[0.99]

                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-[#C8A44D]
                    focus-visible:ring-offset-2

                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {isSubmitting ? (

                    <>

                      <Loader2
                        className="
                          h-4
                          w-4
                          animate-spin
                        "
                      />

                      Submitting...

                    </>

                  ) : isDuplicate ? (

                    "Already Reviewed"

                  ) : (

                    "Submit Review"

                  )}

                </button>

              </form>

            </>

          ) : (

            /* =================================================
               SUCCESS
            ================================================== */

            <div
              className="
                flex
                min-h-[360px]
                flex-col
                items-center
                justify-center
                text-center
              "
            >

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-[#C8A44D]/10
                "
              >

                <Star
                  className="
                    h-7
                    w-7
                    fill-[#C8A44D]
                    text-[#C8A44D]
                  "
                />

              </div>


              <h2
                className="
                  mt-5
                  text-2xl
                  font-semibold
                  text-neutral-900
                "
              >
                Thank you! ♡
              </h2>


              <p
                className="
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-neutral-500
                "
              >
                Your review has been
                submitted and is waiting
                for approval.
              </p>


              <button
                type="button"
                onClick={
                  handleClose
                }
                className="
                  mt-6
                  rounded-full
                  border
                  border-[#C8A44D]/50
                  px-6
                  py-3
                  text-sm
                  font-medium
                  text-[#A78632]
                  transition

                  hover:bg-[#C8A44D]
                  hover:text-black

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-[#C8A44D]
                "
              >
                Done
              </button>

            </div>

          )}

        </div>

      </div>

    </div>
  );


  /*
   * =========================================================
   * PORTAL
   *
   * IMPORTANT:
   * The modal is mounted directly under document.body.
   * =========================================================
   */

  return createPortal(
    dialog,
    document.body
  );
}