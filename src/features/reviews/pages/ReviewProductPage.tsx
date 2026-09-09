import {
  useState,
} from "react";

import {
  Link,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Star,
} from "lucide-react";

import {
  useReviewRequest,
  useSubmitReviewFromToken,
} from "../hooks/useReviewRequest";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function getErrorMessage(
  error: unknown
): string {

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {

    return String(
      (
        error as {
          message?: unknown;
        }
      ).message ?? ""
    );

  }

  if (error instanceof Error) {
    return error.message;
  }

  return String(error ?? "");
}


/*
 * =========================================================
 * STARS
 * =========================================================
 */

function RatingStars({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-center
        gap-2
      "
      role="radiogroup"
      aria-label="Product rating"
    >

      {Array.from({
        length: 5,
      }).map((_, index) => {

        const value =
          index + 1;

        const active =
          value <= rating;

        return (

          <button
            key={value}
            type="button"
            onClick={() =>
              onChange(value)
            }
            className="
              rounded-full
              p-1
              transition
              duration-200
              hover:scale-110
              focus:outline-none
              focus:ring-2
              focus:ring-[#C8A44D]/50
            "
            aria-label={`${value} star${
              value > 1 ? "s" : ""
            }`}
            aria-pressed={
              active
            }
          >

            <Star
              className={`
                h-8
                w-8
                transition
                duration-200

                ${
                  active
                    ? "fill-[#C8A44D] text-[#C8A44D]"
                    : "text-neutral-600"
                }
              `}
            />

          </button>

        );

      })}

    </div>

  );

}


/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function ReviewProductPage() {

  const {
    productSlug,
  } = useParams();


  const [
    searchParams,
  ] = useSearchParams();


  const token =
    searchParams.get(
      "token"
    ) || "";


  /*
   * =======================================================
   * REVIEW REQUEST
   * =======================================================
   */

  const {
    data,
    isLoading,
    isError,
  } = useReviewRequest(
    token,
    productSlug || ""
  );


  /*
   * =======================================================
   * FORM
   * =======================================================
   */

  const [
    rating,
    setRating,
  ] = useState(0);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    review,
    setReview,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  const [
    success,
    setSuccess,
  ] = useState(false);


  const submitMutation =
    useSubmitReviewFromToken();


  /*
   * =======================================================
   * LOADING
   * =======================================================
   */

  if (isLoading) {

    return (

      <PageShell>

        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            py-24
          "
        >

          <Loader2
            className="
              h-8
              w-8
              animate-spin
              text-[#C8A44D]
            "
          />

          <p
            className="
              mt-5
              text-sm
              text-neutral-400
            "
          >
            Preparing your review...
          </p>

        </div>

      </PageShell>

    );

  }


  /*
   * =======================================================
   * INVALID / ERROR
   * =======================================================
   */

  if (
    isError ||
    !data
  ) {

    return (

      <PageShell>

        <StatusState
          title="This review link isn't available"
          message="We couldn't verify this review link. It may be invalid or no longer available."
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * ALREADY REVIEWED
   * =======================================================
   */

  if (
    data.alreadyReviewed ||
    data.reason ===
      "already_reviewed"
  ) {

    return (

      <PageShell>

        <StatusState
          icon={
            <CheckCircle2
              className="
                h-7
                w-7
                text-[#C8A44D]
              "
            />
          }
          title="You've already reviewed this piece"
          message="Thank you for sharing your love for this jewellery. ♡"
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * INVALID STATES
   * =======================================================
   */

  if (!data.valid) {

    let title =
      "This review link is no longer valid";

    let message =
      "We couldn't verify this review link.";

    if (
      data.reason ===
      "expired"
    ) {

      title =
        "This review link has expired";

      message =
        "This review link is no longer active. If you still want to share your experience, please contact us.";

    }

    if (
      data.reason ===
      "too_early"
    ) {

      title =
        "Your review will be available soon";

      message =
        data.availableAt
          ? `Your review link will become available after ${new Date(
              data.availableAt
            ).toLocaleString(
              "en-IN",
              {
                dateStyle:
                  "medium",
                timeStyle:
                  "short",
              }
            )}.`
          : "Your review will become available 24 hours after delivery.";

    }

    if (
      data.reason ===
      "order_not_delivered"
    ) {

      title =
        "Your order isn't eligible yet";

      message =
        "This review can only be submitted after your order has been delivered.";

    }

    return (

      <PageShell>

        <StatusState
          title={title}
          message={message}
        />

      </PageShell>

    );

  }


  const product =
    data.product;


  /*
   * =======================================================
   * MISSING PRODUCT
   * =======================================================
   */

  if (!product) {

    return (

      <PageShell>

        <StatusState
          title="Product unavailable"
          message="We couldn't load the product associated with this review."
        />

      </PageShell>

    );

  }


  /*
   * =======================================================
   * SUCCESS
   * =======================================================
   */

  if (success) {

    return (

      <PageShell>

        <div
          className="
            mx-auto
            max-w-xl
            px-5
            py-16
            text-center
            sm:py-24
          "
        >

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              bg-[#C8A44D]/10
              ring-1
              ring-[#C8A44D]/20
            "
          >

            <CheckCircle2
              className="
                h-9
                w-9
                text-[#C8A44D]
              "
            />

          </div>


          <p
            className="
              mt-7
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-[#C8A44D]
            "
          >
            Thank You
          </p>


          <h1
            className="
              mt-3
              font-serif
              text-3xl
              font-medium
              text-white
              sm:text-4xl
            "
          >
            Your review means a lot. ♡
          </h1>


          <p
            className="
              mx-auto
              mt-4
              max-w-md
              text-sm
              leading-6
              text-neutral-400
            "
          >
            Thank you for taking a moment to
            share your experience with T&amp;M
            Jewels. Your review has been submitted
            for approval.
          </p>


          <Link
            to={`/product/${product.slug}`}
            className="
              mt-8
              inline-flex
              items-center
              justify-center
              rounded-full
              bg-[#C8A44D]
              px-6
              py-3
              text-sm
              font-semibold
              text-black
              transition
              hover:bg-[#D6B65C]
            "
          >
            View Product
          </Link>

        </div>

      </PageShell>

    );

  }


  /*
   * =======================================================
   * SUBMIT
   * =======================================================
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    setError(null);


    if (
      rating < 1 ||
      rating > 5
    ) {

      setError(
        "Please select a rating."
      );

      return;

    }


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


    try {

      await submitMutation.mutateAsync({

        token,

        productSlug:
          product.slug,

        rating,

        title:
          trimmedTitle ||
          null,

        review:
          trimmedReview,

      });


      setSuccess(true);

    } catch (
      submitError
    ) {

      console.error(
        "Review submission error:",
        submitError
      );


      const message =
        getErrorMessage(
          submitError
        ).toLowerCase();


      if (
        message.includes(
          "already reviewed"
        )
      ) {

        setError(
          "You've already shared your love for this piece. ♡"
        );

        return;

      }


      if (
        message.includes(
          "expired"
        )
      ) {

        setError(
          "This review link has expired."
        );

        return;

      }


      if (
        message.includes(
          "invalid review token"
        )
      ) {

        setError(
          "This review link is no longer valid."
        );

        return;

      }


      if (
        message.includes(
          "10 characters"
        )
      ) {

        setError(
          "Please write at least 10 characters."
        );

        return;

      }


      if (
        message.includes(
          "2000 characters"
        )
      ) {

        setError(
          "Review cannot exceed 2000 characters."
        );

        return;

      }


      setError(
        "We're having a little trouble submitting your review. Please try again."
      );

    }

  };


  /*
   * =======================================================
   * FORM UI
   * =======================================================
   */

  return (

    <PageShell>

      <div
        className="
          mx-auto
          max-w-2xl
          px-5
          py-10
          sm:py-16
        "
      >

        {/* Back */}

        <Link
          to={`/product/${product.slug}`}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-medium
            text-neutral-500
            transition
            hover:text-white
          "
        >

          <ArrowLeft
            className="
              h-4
              w-4
            "
          />

          Back to product

        </Link>


        {/* Header */}

        <div
          className="
            mt-10
            text-center
          "
        >

          <p
            className="
              text-xs
              font-semibold
              uppercase
              tracking-[0.25em]
              text-[#C8A44D]
            "
          >
            Customer Love
          </p>


          <h1
            className="
              mt-3
              font-serif
              text-3xl
              font-medium
              text-white
              sm:text-4xl
            "
          >
            Share your experience
          </h1>


          <p
            className="
              mx-auto
              mt-3
              max-w-md
              text-sm
              leading-6
              text-neutral-400
            "
          >
            Your honest review helps us and
            other jewellery lovers.
          </p>

        </div>


        {/* Product */}

        <div
          className="
            mt-10
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-5
            sm:p-6
          "
        >

          <div
            className="
              flex
              items-center
              gap-4
            "
          >

            <div
              className="
                h-20
                w-20
                shrink-0
                overflow-hidden
                rounded-2xl
                bg-neutral-900
              "
            >

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-[10px]
                  text-neutral-600
                "
              >
                T&amp;M
              </div>

            </div>


            <div
              className="
                min-w-0
              "
            >

              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-neutral-500
                "
              >
                Your purchase
              </p>


              <h2
                className="
                  mt-1
                  truncate
                  text-base
                  font-semibold
                  text-white
                "
              >
                {product.name}
              </h2>


              {product.price !== null && (
                <p
                  className="
                    mt-1
                    text-sm
                    text-[#C8A44D]
                  "
                >
                  ₹
                  {Number(
                    product.price
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              )}

            </div>

          </div>

        </div>


        {/* Form */}

        <form
          onSubmit={
            handleSubmit
          }
          className="
            mt-5
            rounded-3xl
            border
            border-white/[0.08]
            bg-white/[0.025]
            p-5
            sm:p-7
          "
        >

          {/* Rating */}

          <div
            className="
              text-center
            "
          >

            <label
              className="
                text-sm
                font-semibold
                text-white
              "
            >
              How would you rate it?
            </label>


            <RatingStars
              rating={rating}
              onChange={
                setRating
              }
            />


            <p
              className="
                mt-2
                min-h-5
                text-xs
                text-neutral-500
              "
            >
              {rating === 1 &&
                "Not quite what you expected"}

              {rating === 2 &&
                "Could be better"}

              {rating === 3 &&
                "It's nice"}

              {rating === 4 &&
                "Really lovely"}

              {rating === 5 &&
                "Absolutely love it ♡"}
            </p>

          </div>


          {/* Title */}

          <div
            className="
              mt-8
            "
          >

            <label
              htmlFor="review-title"
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Review title
              <span
                className="
                  ml-1
                  text-neutral-600
                "
              >
                (optional)
              </span>
            </label>


            <input
              id="review-title"
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value
                )
              }
              maxLength={100}
              placeholder="Give your review a title"
              className="
                mt-2
                w-full
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/30
                px-4
                py-3
                text-sm
                text-white
                outline-none
                placeholder:text-neutral-600
                focus:border-[#C8A44D]/50
              "
            />

          </div>


          {/* Review */}

          <div
            className="
              mt-5
            "
          >

            <label
              htmlFor="review-body"
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Your review
            </label>


            <textarea
              id="review-body"
              value={review}
              onChange={(event) =>
                setReview(
                  event.target.value
                )
              }
              minLength={10}
              maxLength={2000}
              rows={6}
              placeholder="Tell us what you loved about your jewellery..."
              className="
                mt-2
                w-full
                resize-none
                rounded-2xl
                border
                border-white/[0.08]
                bg-black/30
                px-4
                py-3
                text-sm
                leading-6
                text-white
                outline-none
                placeholder:text-neutral-600
                focus:border-[#C8A44D]/50
              "
            />


            <div
              className="
                mt-2
                flex
                justify-end
                text-[11px]
                text-neutral-600
              "
            >
              {review.length}/2000
            </div>

          </div>


          {/* Error */}

          {error && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                py-3
                text-sm
                leading-5
                text-red-300
              "
            >
              {error}
            </div>

          )}


          {/* Submit */}

          <button
            type="submit"
            disabled={
              submitMutation.isPending
            }
            className="
              mt-6
              flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-full
              bg-[#C8A44D]
              px-5
              py-3.5
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

            {submitMutation.isPending ? (

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


          <p
            className="
              mt-4
              text-center
              text-[11px]
              leading-5
              text-neutral-600
            "
          >
            Your review will be checked before
            appearing publicly.
          </p>

        </form>

      </div>

    </PageShell>

  );

}


/*
 * =========================================================
 * PAGE SHELL
 * =========================================================
 */

function PageShell({
  children,
}: {
  children: React.ReactNode;
}) {

  return (

    <main
      className="
        min-h-screen
        bg-black
        text-white
      "
    >

      {/* Header */}

      <header
        className="
          border-b
          border-white/[0.06]
          bg-black
        "
      >

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-6xl
            items-center
            justify-center
            px-5
          "
        >

          <div
            className="
              text-center
            "
          >

            <div
              className="
                font-serif
                text-xl
                font-semibold
                tracking-[0.08em]
                text-[#C8A44D]
              "
            >
              T&amp;M JEWELS
            </div>


            <div
              className="
                mt-1
                text-[9px]
                tracking-[0.3em]
                text-neutral-600
              "
            >
              JEWELLERY MADE TO BE LOVED
            </div>

          </div>

        </div>

      </header>


      {children}


      {/* Footer */}

      <footer
        className="
          border-t
          border-white/[0.06]
          px-5
          py-8
          text-center
        "
      >

        <p
          className="
            text-[11px]
            text-neutral-600
          "
        >
          © T&amp;M Jewels
        </p>

      </footer>

    </main>

  );

}


/*
 * =========================================================
 * STATUS STATE
 * =========================================================
 */

function StatusState({
  icon,
  title,
  message,
}: {
  icon?: React.ReactNode;
  title: string;
  message: string;
}) {

  return (

    <div
      className="
        mx-auto
        flex
        min-h-[70vh]
        max-w-xl
        flex-col
        items-center
        justify-center
        px-5
        py-16
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
          border
          border-[#C8A44D]/20
          bg-[#C8A44D]/5
        "
      >

        {icon || (

          <Star
            className="
              h-6
              w-6
              text-[#C8A44D]
            "
          />

        )}

      </div>


      <h1
        className="
          mt-6
          font-serif
          text-2xl
          font-medium
          text-white
          sm:text-3xl
        "
      >
        {title}
      </h1>


      <p
        className="
          mt-3
          max-w-md
          text-sm
          leading-6
          text-neutral-400
        "
      >
        {message}
      </p>


      <Link
        to="/"
        className="
          mt-7
          inline-flex
          items-center
          justify-center
          rounded-full
          border
          border-white/[0.1]
          px-6
          py-3
          text-sm
          font-medium
          text-white
          transition
          hover:border-[#C8A44D]/40
          hover:text-[#C8A44D]
        "
      >
        Continue Shopping
      </Link>

    </div>

  );

}