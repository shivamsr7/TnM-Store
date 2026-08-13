import { useState } from "react";
import {
  Loader2,
  Star,
  X,
} from "lucide-react";

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
   * SUBMIT
   * =========================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);

    /*
     * Rating validation
     */

    if (rating < 1 || rating > 5) {
      setError(
        "Please select a rating."
      );

      return;
    }


    /*
     * Review validation
     */

    const trimmedReview =
      review.trim();

    if (trimmedReview.length < 10) {
      setError(
        "Please write at least 10 characters."
      );

      return;
    }

    if (trimmedReview.length > 2000) {
      setError(
        "Review cannot exceed 2000 characters."
      );

      return;
    }


    /*
     * Title validation
     */

    const trimmedTitle =
      title.trim();

    if (trimmedTitle.length > 100) {
      setError(
        "Title cannot exceed 100 characters."
      );

      return;
    }


    try {
      setIsSubmitting(true);

      await reviewService.createReview({
        product_id: productId,

        customer_id: null,

        order_id: null,

        rating,

        title:
          trimmedTitle || null,

        review:
          trimmedReview,

        /*
         * Customer-submitted reviews
         * always start as pending.
         */

        status: "pending",

        /*
         * Verification will be handled
         * separately through order verification.
         */

        is_verified: false,
      });

      setSuccess(true);

    } catch (submitError) {
      console.error(
        "Review submission error:",
        submitError
      );

      setError(
        "We couldn't submit your review. Please try again."
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
   * RENDER
   * =========================================================
   */

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/75
        px-4
        py-6
        backdrop-blur-sm
      "
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
        className="
          relative
          max-h-[90vh]
          w-full
          max-w-lg
          overflow-y-auto
          rounded-3xl
          border
          border-neutral-200
          bg-white
          shadow-2xl
        "
      >

        {/* ===================================================
            CLOSE BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={handleClose}
          disabled={isSubmitting}
          aria-label="Close"
          className="
            absolute
            right-4
            top-4
            z-20
            flex
            h-9
            w-9
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
                onSubmit={handleSubmit}
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
                            key={star}
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
                    value={title}
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
                    value={review}
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
                    ERROR
                ============================================ */}

                {error && (
                  <div
                    className="
                      rounded-xl
                      border
                      border-red-200
                      bg-red-50
                      px-4
                      py-3
                      text-sm
                      text-red-600
                    "
                  >
                    {error}
                  </div>
                )}


                {/* ===========================================
                    INFO
                ============================================ */}

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


                {/* ===========================================
                    SUBMIT
                ============================================ */}

                <button
                  type="submit"
                  disabled={isSubmitting}
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

              {/* Success Icon */}

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


              {/* Success Heading */}

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


              {/* Success Message */}

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


              {/* Done */}

              <button
                type="button"
                onClick={handleClose}
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
}