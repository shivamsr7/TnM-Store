import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  X,
} from "lucide-react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useProductReviews,
} from "../hooks/useProductReviews";

import {
  useHasReviewedProduct,
} from "../hooks/useHasReviewedProduct";

import {
  useProductReviewMedia,
} from "../hooks/useProductReviewMedia";

import type {
  ReviewMedia,
} from "../types/reviewMedia.types";

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
 * REVIEW MEDIA GALLERY
 * =========================================================
 */

function ReviewMediaGallery({
  media,
}: {
  media: ReviewMedia[];
}) {

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);


  const [
    isOpen,
    setIsOpen,
  ] = useState(false);


  const [
    popupPosition,
    setPopupPosition,
  ] = useState<{
    top: number;
    left: number;
  } | null>(null);


  const anchorRef =
    useRef<HTMLButtonElement | null>(null);


  const popupRef =
    useRef<HTMLDivElement | null>(null);


  const activeMedia =
    media.length > 0
      ? media[
          Math.min(
            selectedIndex,
            media.length - 1
          )
        ]
      : null;


  const hasPrevious =
    selectedIndex > 0;


  const hasNext =
    selectedIndex <
    media.length - 1;


  const updatePopupPosition = () => {

    const anchor =
      anchorRef.current;

    const popup =
      popupRef.current;


    if (!anchor || !popup) {
      return;
    }


    const anchorRect =
      anchor.getBoundingClientRect();

    const popupRect =
      popup.getBoundingClientRect();


    const viewportWidth =
      window.innerWidth;

    const viewportHeight =
      window.innerHeight;


    const margin = 12;

    /*
     * Keep the popup visually attached to the clicked
     * thumbnail. Prefer opening below it, but open above it
     * when there isn't enough room below.
     */

    const spaceBelow =
      viewportHeight -
      anchorRect.bottom;

    const spaceAbove =
      anchorRect.top;


    const shouldOpenAbove =
      spaceBelow <
        popupRect.height + margin &&
      spaceAbove >=
        popupRect.height + margin;


    let top = shouldOpenAbove
      ? anchorRect.top -
        popupRect.height -
        margin
      : anchorRect.bottom +
        margin;


    /*
     * Center the popup around the clicked thumbnail,
     * then clamp it inside the viewport.
     */

    let left =
      anchorRect.left +
      anchorRect.width / 2 -
      popupRect.width / 2;


    const maxLeft =
      Math.max(
        margin,
        viewportWidth -
          popupRect.width -
          margin
      );


    const maxTop =
      Math.max(
        margin,
        viewportHeight -
          popupRect.height -
          margin
      );


    left = Math.min(
      Math.max(
        left,
        margin
      ),
      maxLeft
    );


    top = Math.min(
      Math.max(
        top,
        margin
      ),
      maxTop
    );


    setPopupPosition({
      top,
      left,
    });
  };


  useEffect(() => {

    if (!isOpen) {
      setPopupPosition(null);
      return;
    }


    const update = () => {
      window.requestAnimationFrame(
        updatePopupPosition
      );
    };


    update();


    window.addEventListener(
      "resize",
      update
    );

    window.addEventListener(
      "scroll",
      update,
      true
    );


    return () => {

      window.removeEventListener(
        "resize",
        update
      );

      window.removeEventListener(
        "scroll",
        update,
        true
      );

    };

  }, [
    isOpen,
    selectedIndex,
  ]);


  if (
    media.length === 0 ||
    !activeMedia
  ) {
    return null;
  }


  const selectMedia = (
    index: number,
    button?: HTMLButtonElement | null
  ) => {

    if (button) {
      anchorRef.current = button;
    }

    setSelectedIndex(index);
    setIsOpen(true);
  };


  const showPrevious = () => {

    if (!hasPrevious) {
      return;
    }

    setSelectedIndex(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    );
  };


  const showNext = () => {

    if (!hasNext) {
      return;
    }

    setSelectedIndex(
      (current) =>
        Math.min(
          media.length - 1,
          current + 1
        )
    );
  };


  const isActiveVideo =
    activeMedia.media_type ===
    "video";


  const closePopup = () => {
    setIsOpen(false);
    setPopupPosition(null);
  };


  const popup =
    isOpen &&
    createPortal(
      <div
        ref={popupRef}
        className="
          fixed
          z-[9999]
          w-[min(560px,calc(100vw-24px))]
          overflow-hidden
          rounded-2xl
          border
          border-white/[0.12]
          bg-[#080808]
          shadow-[0_20px_60px_rgba(0,0,0,0.65)]
        "
        style={{
          top:
            popupPosition?.top ??
            12,
          left:
            popupPosition?.left ??
            12,
          visibility:
            popupPosition
              ? "visible"
              : "hidden",
        }}
        role="dialog"
        aria-label="Review media preview"
      >

        {/* =================================================
            POPUP HEADER
        ================================================== */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-white/[0.08]
            bg-white/[0.02]
            px-3
            py-2.5
          "
        >

          <span
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.18em]
              text-neutral-500
            "
          >
            {isActiveVideo
              ? "Customer Video"
              : "Customer Photo"}

            {media.length > 1 && (
              <span className="ml-2 text-[#C8A44D]">
                {selectedIndex + 1} / {media.length}
              </span>
            )}
          </span>


          <button
            type="button"
            onClick={closePopup}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border
              border-white/[0.1]
              bg-white/[0.04]
              text-neutral-300
              transition
              hover:bg-white/[0.08]
              hover:text-white
            "
            aria-label="Close media preview"
          >

            <X
              className="
                h-4
                w-4
              "
            />

          </button>

        </div>


        {/* =================================================
            POPUP MEDIA
        ================================================== */}

        <div
          className="
            relative
            flex
            max-h-[70vh]
            min-h-[260px]
            items-center
            justify-center
            bg-black
            p-3
            sm:min-h-[340px]
            sm:p-4
          "
        >

          {isActiveVideo ? (

            <video
              key={
                activeMedia.id
              }
              src={
                activeMedia.media_url
              }
              poster={
                activeMedia.thumbnail_url ||
                undefined
              }
              controls
              autoPlay
              playsInline
              className="
                max-h-[64vh]
                max-w-full
                rounded-xl
                object-contain
              "
            />

          ) : (

            <img
              key={
                activeMedia.id
              }
              src={
                activeMedia.media_url
              }
              alt="Customer review"
              className="
                max-h-[64vh]
                max-w-full
                rounded-xl
                object-contain
              "
            />

          )}


          {/* =================================================
              PREVIOUS
          ================================================== */}

          {hasPrevious && (
            <button
              type="button"
              onClick={showPrevious}
              className="
                absolute
                left-4
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.12]
                bg-black/70
                text-white
                shadow-lg
                transition
                hover:bg-black/90
              "
              aria-label="Previous review media"
            >

              <ChevronLeft
                className="
                  h-5
                  w-5
                "
              />

            </button>
          )}


          {/* =================================================
              NEXT
          ================================================== */}

          {hasNext && (
            <button
              type="button"
              onClick={showNext}
              className="
                absolute
                right-4
                top-1/2
                flex
                h-10
                w-10
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                border
                border-white/[0.12]
                bg-black/70
                text-white
                shadow-lg
                transition
                hover:bg-black/90
              "
              aria-label="Next review media"
            >

              <ChevronRight
                className="
                  h-5
                  w-5
                "
              />

            </button>
          )}

        </div>


        {/* =================================================
            POPUP THUMBNAILS
        ================================================== */}

        {media.length > 1 && (
          <div
            className="
              flex
              gap-2
              overflow-x-auto
              border-t
              border-white/[0.08]
              bg-white/[0.02]
              p-3
              scrollbar-thin
              scrollbar-track-transparent
              scrollbar-thumb-white/10
            "
          >

            {media.map(
              (
                item,
                index
              ) => {

                const isVideo =
                  item.media_type ===
                  "video";

                const isSelected =
                  selectedIndex ===
                  index;


                return (
                  <button
                    key={
                      `popup-${item.id}`
                    }
                    type="button"
                    onClick={() =>
                      setSelectedIndex(
                        index
                      )
                    }
                    className={`
                      relative
                      h-14
                      w-14
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      bg-neutral-950
                      transition
                      ${
                        isSelected
                          ? "border-[#C8A44D] ring-1 ring-[#C8A44D]/40"
                          : "border-white/[0.08]"
                      }
                    `}
                    aria-label={
                      isVideo
                        ? `Select video ${index + 1}`
                        : `Select photo ${index + 1}`
                    }
                  >

                    {isVideo ? (

                      <>
                        <video
                          src={
                            item.media_url
                          }
                          poster={
                            item.thumbnail_url ||
                            undefined
                          }
                          muted
                          playsInline
                          preload="metadata"
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                        />

                        <span
                          className="
                            absolute
                            inset-0
                            flex
                            items-center
                            justify-center
                            bg-black/25
                          "
                        >
                          <Play
                            className="
                              h-4
                              w-4
                              fill-current
                              text-white
                            "
                          />
                        </span>

                      </>

                    ) : (

                      <img
                        src={
                          item.media_url
                        }
                        alt="Customer review thumbnail"
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                        loading="lazy"
                      />

                    )}

                  </button>
                );

              }
            )}

          </div>
        )}

      </div>,
      document.body
    );


  return (
    <div
      className="
        mt-5
      "
    >

      {/* =================================================
          THUMBNAILS
      ================================================== */}

      <div
        className="
          flex
          gap-2.5
          overflow-x-auto
          pb-1
          scrollbar-thin
          scrollbar-track-transparent
          scrollbar-thumb-white/10
        "
      >

        {media.map(
          (
            item,
            index
          ) => {

            const isVideo =
              item.media_type ===
              "video";

            const isSelected =
              selectedIndex ===
              index &&
              isOpen;


            return (
              <button
                key={
                  item.id
                }
                ref={(element) => {
                  if (
                    isSelected
                  ) {
                    anchorRef.current =
                      element;
                  }
                }}
                type="button"
                onClick={(event) =>
                  selectMedia(
                    index,
                    event.currentTarget
                  )
                }
                className={`
                  group
                  relative
                  h-24
                  w-24
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border
                  bg-neutral-950
                  transition
                  focus:outline-none
                  focus:ring-2
                  focus:ring-[#C8A44D]/40
                  sm:h-28
                  sm:w-28
                  ${
                    isSelected
                      ? "border-[#C8A44D] ring-1 ring-[#C8A44D]/40"
                      : "border-white/[0.08] hover:border-[#C8A44D]/50"
                  }
                `}
                aria-label={
                  isVideo
                    ? "View review video"
                    : "View review photo"
                }
              >

                {isVideo ? (

                  <>
                    <video
                      src={
                        item.media_url
                      }
                      poster={
                        item.thumbnail_url ||
                        undefined
                      }
                      muted
                      playsInline
                      preload="metadata"
                      className="
                        h-full
                        w-full
                        object-cover
                        transition
                        duration-300
                        group-hover:scale-105
                      "
                    />

                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-black/25
                        transition
                        group-hover:bg-black/35
                      "
                    >

                      <span
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          bg-black/65
                          text-white
                          shadow-lg
                        "
                      >

                        <Play
                          className="
                            ml-0.5
                            h-4
                            w-4
                            fill-current
                          "
                        />

                      </span>

                    </div>

                  </>

                ) : (

                  <img
                    src={
                      item.media_url
                    }
                    alt="Customer review"
                    className="
                      h-full
                      w-full
                      object-cover
                      transition
                      duration-300
                      group-hover:scale-105
                    "
                    loading="lazy"
                  />

                )}

              </button>
            );

          }
        )}

      </div>


      {popup}

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

  const {
    customer,
  } = useAuth();


  const [
    isReviewDialogOpen,
    setIsReviewDialogOpen,
  ] = useState(false);


  /*
   * =========================================================
   * MEDIA LIGHTBOX STATE
   * =========================================================
   */



  /*
   * =========================================================
   * FETCH APPROVED REVIEWS
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
   * CHECK CUSTOMER REVIEW STATUS
   * =========================================================
   */

  const {
    data: hasReviewed = false,
  } = useHasReviewedProduct(
    productId,
    customer?.id
  );


  /*
   * =========================================================
   * REVIEW IDS
   * =========================================================
   */

  const reviewIds =
    useMemo(
      () =>
        reviews.map(
          (review) =>
            review.id
        ),
      [reviews]
    );


  /*
   * =========================================================
   * FETCH REVIEW MEDIA
   * =========================================================
   *
   * useProductReviews() returns only approved reviews.
   *
   * Therefore this query only requests media belonging
   * to reviews currently visible in the public section.
   *
   * =========================================================
   */

  const {
    data: reviewMedia = [],
  } = useProductReviewMedia(
    reviewIds
  );


  /*
   * =========================================================
   * GROUP MEDIA BY REVIEW
   * =========================================================
   */

  const mediaByReviewId =
    useMemo(() => {

      const grouped =
        new Map<
          string,
          ReviewMedia[]
        >();


      reviewMedia.forEach(
        (media) => {

          const existing =
            grouped.get(
              media.review_id
            ) || [];


          existing.push(
            media
          );


          grouped.set(
            media.review_id,
            existing
          );

        }
      );


      return grouped;

    }, [reviewMedia]);


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
   * REVIEW BUTTON
   * =========================================================
   */

  const ReviewButton = () => {

    /*
     * -------------------------------------------------------
     * ALREADY REVIEWED
     * -------------------------------------------------------
     */

    if (hasReviewed) {

      return (
        <div
          className="
            inline-flex
            h-11
            cursor-default
            items-center
            justify-center
            gap-2
            rounded-full
            border
            border-emerald-500/30
            bg-emerald-500/[0.06]
            px-5
            text-sm
            font-medium
            text-emerald-400
          "
        >

          <CheckCircle2
            className="
              h-4
              w-4
            "
          />

          Already Reviewed

        </div>
      );

    }


    /*
     * -------------------------------------------------------
     * WRITE REVIEW
     * -------------------------------------------------------
     */

    return (
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
    );

  };


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
            NO APPROVED REVIEWS
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


            <h3
              className="
                mt-4
                text-base
                font-medium
                text-white
              "
            >
              {hasReviewed
                ? "Thank you for your review"
                : "Be the first to review"}
            </h3>


            <p
              className="
                mt-1
                max-w-md
                text-sm
                text-neutral-500
              "
            >
              {hasReviewed
                ? "Your review has been submitted and is waiting for approval."
                : "Your experience can help other customers choose this piece."}
            </p>


            <div
              className="
                mt-6
              "
            >
              <ReviewButton />
            </div>

          </div>

        ) : (

          <>

            {/* =================================================
                HEADER WITH REVIEW BUTTON
            ================================================== */}

            <div
              className="
                mt-6
                flex
                justify-end
              "
            >

              <ReviewButton />

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
                (review) => {

                  const media =
                    mediaByReviewId.get(
                      review.id
                    ) || [];


                  return (
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

                      {/* =================================================
                          RATING + VERIFICATION
                      ================================================== */}

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


                      {/* =================================================
                          REVIEW TITLE
                      ================================================== */}

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


                      {/* =================================================
                          REVIEW TEXT
                      ================================================== */}

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


                      {/* =================================================
                          REVIEW MEDIA
                      ================================================== */}

                      <ReviewMediaGallery
                        media={
                          media
                        }
                      />


                      {/* =================================================
                          BOTTOM
                      ================================================== */}

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
                  );

                }
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