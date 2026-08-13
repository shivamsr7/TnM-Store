import {
  useState,
} from "react";

import {
  CheckCircle2,
  Star,
} from "lucide-react";

import {
  useProductReviews,
} from "../hooks/useProductReviews";

import WriteReviewDialog from "./WriteReviewDialog";


interface ProductReviewsProps {
  productId: string;
}


/*
 * =========================================================
 * STARS
 * =========================================================
 */

function Stars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {

  const sizeClass =
    size === "md"
      ? "h-5 w-5"
      : "h-4 w-4";


  return (
    <div
      className="
        flex
        items-center
        gap-0.5
      "
    >
      {Array.from({
        length: 5,
      }).map((_, index) => {

        const filled =
          index + 1 <=
          Math.round(rating);

        return (
          <Star
            key={index}
            className={`
              ${sizeClass}
              ${
                filled
                  ? "fill-[#C8A44D] text-[#C8A44D]"
                  : "text-neutral-700"
              }
            `}
          />
        );

      })}
    </div>
  );
}


/*
 * =========================================================
 * PRODUCT REVIEWS
 * =========================================================
 */

export default function ProductReviews({
  productId,
}: ProductReviewsProps) {

  const [
    isReviewDialogOpen,
    setIsReviewDialogOpen,
  ] = useState(false);


  /*
   * =========================================================
   * FETCH REVIEWS
   * =========================================================
   */

  const {
    data: reviews = [],
    isLoading,
    isError,
  } = useProductReviews(
    productId
  );


  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {

    return (
      <section
        className="
          mt-12
          border-t
          border-white/[0.08]
          pt-10
          sm:mt-16
          sm:pt-12
        "
      >

        <div
          className="
            h-7
            w-48
            animate-pulse
            rounded
            bg-neutral-900
          "
        />

        <div
          className="
            mt-6
            h-32
            animate-pulse
            rounded-2xl
            bg-neutral-900
          "
        />

      </section>
    );

  }


  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (isError) {
    return null;
  }


  /*
   * =========================================================
   * REVIEW SUMMARY
   * =========================================================
   */

  const totalReviews =
    reviews.length;


  const totalRating =
    reviews.reduce(
      (total, review) =>
        total + review.rating,
      0
    );


  const averageRating =
    totalReviews > 0
      ? totalRating / totalReviews
      : 0;


  /*
   * =========================================================
   * RATING COUNTS
   * =========================================================
   */

  const ratingCounts = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };


  reviews.forEach(
    (review) => {

      if (
        review.rating >= 1 &&
        review.rating <= 5
      ) {

        ratingCounts[
          review.rating as
            | 1
            | 2
            | 3
            | 4
            | 5
        ]++;

      }

    }
  );


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section
      className="
        mt-12
        border-t
        border-white/[0.08]
        pt-10
        sm:mt-16
        sm:pt-12
      "
    >

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            flex-col
            gap-2
          "
        >

          <span
            className="
              text-[11px]
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
              text-2xl
              font-semibold
              text-white
              sm:text-3xl
            "
          >
            Customer Reviews
          </h2>

        </div>


        {/* =================================================
            NO REVIEWS
        ================================================== */}

        {totalReviews === 0 ? (

          <div
            className="
              mt-6
              flex
              flex-col
              items-center
              justify-center
              rounded-2xl
              border
              border-white/[0.08]
              bg-white/[0.02]
              px-5
              py-10
              text-center
            "
          >

            {/* Star Icon */}

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-full
                bg-[#C8A44D]/10
              "
            >

              <Star
                className="
                  h-5
                  w-5
                  text-[#C8A44D]
                "
              />

            </div>


            {/* Heading */}

            <h3
              className="
                mt-4
                text-base
                font-medium
                text-white
              "
            >
              Be the first to review
            </h3>


            {/* Description */}

            <p
              className="
                mt-1
                max-w-md
                text-sm
                text-neutral-500
              "
            >
              Your experience can help
              other customers choose
              this piece.
            </p>


            {/* Write Review Button */}

            <button
              type="button"
              onClick={() =>
                setIsReviewDialogOpen(
                  true
                )
              }
              className="
                mt-6
                inline-flex
                h-11
                items-center
                justify-center
                rounded-full
                border
                border-[#C8A44D]/50
                px-6
                text-sm
                font-medium
                text-[#C8A44D]
                transition

                hover:bg-[#C8A44D]
                hover:text-black

                active:scale-[0.98]
              "
            >
              Write a Review
            </button>

          </div>

        ) : (

          <>

            {/* =================================================
                HEADER WITH WRITE REVIEW BUTTON
            ================================================== */}

            <div
              className="
                mt-6
                flex
                justify-end
              "
            >

              <button
                type="button"
                onClick={() =>
                  setIsReviewDialogOpen(
                    true
                  )
                }
                className="
                  inline-flex
                  h-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#C8A44D]/50
                  px-5
                  text-sm
                  font-medium
                  text-[#C8A44D]
                  transition

                  hover:bg-[#C8A44D]
                  hover:text-black

                  active:scale-[0.98]
                "
              >
                Write a Review
              </button>

            </div>


            {/* =================================================
                RATING SUMMARY
            ================================================== */}

            <div
              className="
                mt-4
                grid
                grid-cols-1
                gap-6
                rounded-2xl
                border
                border-white/[0.08]
                bg-white/[0.02]
                p-5

                sm:grid-cols-[180px_1fr]
                sm:p-6
              "
            >

              {/* Overall Rating */}

              <div
                className="
                  flex
                  flex-col
                  items-center
                  justify-center
                  border-b
                  border-white/[0.08]
                  pb-5

                  sm:border-b-0
                  sm:border-r
                  sm:pb-0
                  sm:pr-6
                "
              >

                <span
                  className="
                    text-4xl
                    font-semibold
                    text-white
                  "
                >
                  {averageRating.toFixed(
                    1
                  )}
                </span>


                <Stars
                  rating={
                    averageRating
                  }
                  size="md"
                />


                <span
                  className="
                    mt-2
                    text-xs
                    text-neutral-500
                  "
                >
                  Based on{" "}
                  {totalReviews}{" "}
                  {totalReviews === 1
                    ? "review"
                    : "reviews"}
                </span>

              </div>


              {/* Rating Breakdown */}

              <div
                className="
                  flex
                  flex-col
                  justify-center
                  gap-2
                "
              >

                {[5, 4, 3, 2, 1].map(
                  (rating) => {

                    const count =
                      ratingCounts[
                        rating as
                          | 1
                          | 2
                          | 3
                          | 4
                          | 5
                      ];


                    const percentage =
                      totalReviews > 0
                        ? (
                            count /
                            totalReviews
                          ) *
                          100
                        : 0;


                    return (
                      <div
                        key={rating}
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <span
                          className="
                            w-3
                            text-xs
                            text-neutral-400
                          "
                        >
                          {rating}
                        </span>


                        <Star
                          className="
                            h-3
                            w-3
                            shrink-0
                            fill-[#C8A44D]
                            text-[#C8A44D]
                          "
                        />


                        <div
                          className="
                            h-1.5
                            flex-1
                            overflow-hidden
                            rounded-full
                            bg-neutral-800
                          "
                        >

                          <div
                            className="
                              h-full
                              rounded-full
                              bg-[#C8A44D]
                              transition-all
                              duration-500
                            "
                            style={{
                              width:
                                `${percentage}%`,
                            }}
                          />

                        </div>


                        <span
                          className="
                            w-5
                            text-right
                            text-xs
                            text-neutral-500
                          "
                        >
                          {count}
                        </span>

                      </div>
                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                REVIEW CARDS
            ================================================== */}

            <div
              className="
                mt-8
                grid
                grid-cols-1
                gap-4
                lg:grid-cols-2
              "
            >

              {reviews.map(
                (review) => (

                  <article
                    key={
                      review.id
                    }
                    className="
                      rounded-2xl
                      border
                      border-white/[0.08]
                      bg-white/[0.02]
                      p-5
                      transition-colors
                      duration-300

                      hover:border-[#C8A44D]/30
                    "
                  >

                    {/* Rating + Verification */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >

                      <Stars
                        rating={
                          review.rating
                        }
                      />


                      {review.is_verified && (
                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            text-[11px]
                            font-medium
                            text-emerald-400
                          "
                        >

                          <CheckCircle2
                            className="
                              h-3.5
                              w-3.5
                            "
                          />

                          Verified Purchase

                        </span>
                      )}

                    </div>


                    {/* Review Title */}

                    {review.title && (
                      <h3
                        className="
                          mt-4
                          text-sm
                          font-semibold
                          text-white
                        "
                      >
                        {review.title}
                      </h3>
                    )}


                    {/* Review Text */}

                    <p
                      className="
                        mt-2
                        whitespace-pre-line
                        text-sm
                        leading-6
                        text-neutral-300
                      "
                    >
                      {review.review}
                    </p>


                    {/* Bottom */}

                    <div
                      className="
                        mt-5
                        flex
                        items-center
                        justify-between
                        border-t
                        border-white/[0.06]
                        pt-4
                      "
                    >

                      <span
                        className="
                          text-xs
                          font-medium
                          text-neutral-400
                        "
                      >
                        Verified Customer
                      </span>


                      <span
                        className="
                          text-[11px]
                          text-neutral-600
                        "
                      >
                        {new Date(
                          review.created_at
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day:
                              "numeric",
                            month:
                              "short",
                            year:
                              "numeric",
                          }
                        )}
                      </span>

                    </div>

                  </article>

                )
              )}

            </div>

          </>

        )}


        {/* =================================================
            WRITE REVIEW DIALOG
        ================================================== */}

        <WriteReviewDialog
          productId={
            productId
          }
          open={
            isReviewDialogOpen
          }
          onClose={() =>
            setIsReviewDialogOpen(
              false
            )
          }
        />

      </div>

    </section>
  );
}