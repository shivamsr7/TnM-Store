import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { usePublishedInstagramCustomerReviews } from "@/features/reviews/hooks/usePublishedInstagramCustomerReviews";


// =========================================================
// EXISTING HARDCODED REVIEWS — KEEP THESE
// =========================================================

import review1 from "../assets/IMG_0338.jpeg";
import review2 from "../assets/IMG_0339.jpeg";
import review3 from "../assets/IMG_0341.jpeg";
import review4 from "../assets/IMG_0342.jpeg";

type Story = {
  id: string;
  image: string;
  customerName: string;
  reviewText?: string;
  source: "hardcoded" | "supabase";
};

const hardcodedStories: Story[] = [
  {
    id: "hardcoded-review-1",
    image: review1,
    customerName: "T&M Customer",
    source: "hardcoded",
  },
  {
    id: "hardcoded-review-2",
    image: review2,
    customerName: "T&M Customer",
    source: "hardcoded",
  },
  {
    id: "hardcoded-review-3",
    image: review3,
    customerName: "T&M Customer",
    source: "hardcoded",
  },
  {
    id: "hardcoded-review-4",
    image: review4,
    customerName: "T&M Customer",
    source: "hardcoded",
  },
];

export default function CustomerLove() {
  // =========================================================
  // ADMIN / SUPABASE REVIEWS
  // =========================================================

  const {
    data: adminReviews = [],
  } = usePublishedInstagramCustomerReviews();

  // =========================================================
  // COMBINE:
  // 4 HARDCODED + ADMIN REVIEWS
  // =========================================================

  const stories = useMemo<Story[]>(() => {
    const supabaseStories: Story[] = [...adminReviews]
      .sort(
        (a, b) =>
          a.display_order - b.display_order ||
          new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
      )
     .map((review) => ({
  id: review.id,
  image: review.screenshot_url,
  customerName: review.customer_name,
  reviewText: review.review_text ?? "",
  source: "supabase" as const,
}));

    return [...hardcodedStories, ...supabaseStories];
  }, [adminReviews]);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  // =========================================================
  // KEEP ACTIVE STORY VALID
  // =========================================================

  useEffect(() => {
    if (active >= stories.length && stories.length > 0) {
      setActive(stories.length - 1);
    }
  }, [active, stories.length]);

  // =========================================================
  // CLOSE
  // =========================================================

  const close = () => {
    setIsClosing(true);

    window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 180);
  };

  // =========================================================
  // NAVIGATION
  // =========================================================

  const next = () => {
    setActive((current) =>
      Math.min(current + 1, stories.length - 1)
    );
  };

  const previous = () => {
    setActive((current) => Math.max(current - 1, 0));
  };

  // =========================================================
  // KEYBOARD NAVIGATION
  // =========================================================

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }

      if (event.key === "ArrowRight") {
        next();
      }

      if (event.key === "ArrowLeft") {
        previous();
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener(
        "keydown",
        onKeyDown
      );
    };
  }, [open, stories.length]);

  // =========================================================
  // MOBILE SWIPE
  // =========================================================

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    touchStartX.current =
      event.changedTouches[0]?.clientX ?? null;

    touchStartY.current =
      event.changedTouches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    if (
      touchStartX.current === null ||
      touchStartY.current === null
    ) {
      return;
    }

    const endX =
      event.changedTouches[0]?.clientX ??
      touchStartX.current;

    const endY =
      event.changedTouches[0]?.clientY ??
      touchStartY.current;

    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    // Only horizontal swipes
    if (
      Math.abs(dx) >= 50 &&
      Math.abs(dx) > Math.abs(dy) * 1.2
    ) {
      if (dx < 0) {
        next();
      } else {
        previous();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // =========================================================
  // OPEN STORY
  // =========================================================

  const openReviews = () => {
    if (stories.length === 0) return;

    setActive(0);
    setIsClosing(false);
    setOpen(true);
  };

  const activeStory = stories[active];

  // =========================================================
  // HOMEPAGE SECTION
  // =========================================================

  return (
    <>
      <section className="relative overflow-hidden bg-black px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        {/* Subtle gold glow */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9962d]/[0.035] blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">

          {/* Label */}
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#d6ad4d] sm:text-xs">
            Customer Love
          </p>

          {/* Heading */}
          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>

          {/* Subtitle */}
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Real feedback from our beautiful customers on Instagram.
          </p>

          {/* =================================================
              BIG INSTAGRAM-HIGHLIGHT STYLE CIRCLE
          ================================================= */}

          <button
            type="button"
            onClick={openReviews}
            aria-label="Open Customer Love Instagram reviews"
            className="group relative mt-10 h-60 w-60 rounded-full p-[3px] transition duration-500 hover:scale-[1.025] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c56b] focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:h-64 sm:w-64"
            style={{
              background:
                "conic-gradient(from 20deg, #8b5f16, #f4d77c 18%, #b68122 38%, #fff0a2 55%, #a87318 74%, #f4d77c 88%, #8b5f16)",

              boxShadow:
                "0 0 0 1px rgba(214,173,77,.12), 0 0 48px rgba(214,173,77,.12)",
            }}
          >
            {/* Inner ring */}
            <span className="absolute inset-[6px] rounded-full border border-[#e4c56b]/15" />

            {/* Circle content */}
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_38%_24%,#272311_0%,#11110d_42%,#050505_78%,#000_100%)] px-8">

              <span>
                <span className="block font-serif text-[32px] leading-none text-[#f1d276] sm:text-[36px]">
                  Customer
                </span>

                <span className="mt-2 block font-serif text-[32px] leading-none text-white sm:text-[36px]">
                  Love
                </span>

                <span className="mt-4 block text-base text-[#d6ad4d]">
                  ♥
                </span>

                <span className="mt-3 block text-[9px] font-medium uppercase tracking-[0.28em] text-white/45">
                  Tap to view
                </span>
              </span>

            </span>
          </button>

          {/* Bottom label */}
          <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.25em] text-white/30 sm:text-[10px]">
            Reviews shared via Instagram DM
          </p>
        </div>
      </section>

      {/* =====================================================
          STORY DIALOG
      ===================================================== */}

      {open &&
        activeStory &&
        createPortal(
          <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6 ${
              isClosing
                ? "tnm-fade-out"
                : "tnm-fade-in"
            }`}
            role="presentation"
            onMouseDown={(event) => {
              if (
                event.target ===
                event.currentTarget
              ) {
                close();
              }
            }}
          >
            <style>
              {`
                @keyframes tnmFadeIn {
                  from {
                    opacity: 0;
                  }

                  to {
                    opacity: 1;
                  }
                }

                @keyframes tnmFadeOut {
                  from {
                    opacity: 1;
                  }

                  to {
                    opacity: 0;
                  }
                }

                @keyframes tnmStoryIn {
                  from {
                    opacity: .45;
                    transform: scale(.985);
                  }

                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }

                .tnm-fade-in {
                  animation: tnmFadeIn .22s ease-out;
                }

                .tnm-fade-out {
                  animation: tnmFadeOut .18s ease-in forwards;
                }

                .tnm-story-image {
                  animation: tnmStoryIn .22s ease-out;
                }

                @media (prefers-reduced-motion: reduce) {
                  .tnm-fade-in,
                  .tnm-fade-out,
                  .tnm-story-image {
                    animation: none !important;
                  }
                }
              `}
            </style>

            {/* =================================================
                ACTUAL DIALOG
            ================================================= */}

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-love-dialog-title"
              className="relative flex h-[min(92vh,820px)] w-[min(94vw,520px)] flex-col overflow-hidden rounded-[24px] border border-[#d6ad4d]/35 bg-[#070707] shadow-[0_30px_120px_rgba(0,0,0,.82)]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >

              {/* =================================================
                  PROGRESS BARS
              ================================================= */}

              <div className="absolute left-4 right-4 top-3 z-30 flex gap-1.5">
                {stories.map((story, index) => (
                  <div
                    key={story.id}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <div
                      className="h-full rounded-full bg-white transition-all duration-300"
                      style={{
                        width:
                          index <= active
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* =================================================
                  STORY HEADER
              ================================================= */}

              <div className="absolute left-4 right-4 top-6 z-30 flex items-center justify-between pt-1">

                <div className="flex min-w-0 items-center gap-3">

                  {/* T&M Logo Circle */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#d6ad4d]/60 bg-black/70 font-serif text-sm text-[#e4c56b] backdrop-blur-md">
                    T&M
                  </div>

                  <div className="min-w-0 text-left">

                    <p
                      id="customer-love-dialog-title"
                      className="truncate font-serif text-base text-white"
                    >
                      Customer Love
                    </p>

                    <p className="text-[8px] uppercase tracking-[0.18em] text-[#e4c56b]">
                      T&M Jewels · Instagram Reviews
                    </p>

                  </div>
                </div>

                {/* Close */}
                <button
                  type="button"
                  aria-label="Close customer reviews"
                  onClick={close}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/60 text-2xl leading-none text-white backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c56b]"
                >
                  ×
                </button>

              </div>

              {/* =================================================
                  STORY IMAGE
              ================================================= */}

              <div
                className="relative min-h-0 flex-1 bg-[#101010]"
                style={{
                  touchAction: "pan-y",
                }}
              >

                <img
                  key={activeStory.id}
                  src={activeStory.image}
                  alt={
                    activeStory.reviewText ||
                    `Instagram review from ${activeStory.customerName}`
                  }
                  draggable={false}
                  className="tnm-story-image h-full w-full select-none object-contain"
                />

                {/* =================================================
                    LEFT TAP ZONE
                ================================================= */}

                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={previous}
                  className="absolute inset-y-0 left-0 z-10 w-[22%] cursor-pointer bg-transparent"
                />

                {/* =================================================
                    RIGHT TAP ZONE
                ================================================= */}

                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  className="absolute inset-y-0 right-0 z-10 w-[22%] cursor-pointer bg-transparent"
                />

                {/* =================================================
                    VISIBLE PREVIOUS BUTTON
                ================================================= */}

                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={previous}
                  disabled={active === 0}
                  className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-3xl leading-none text-white/90 backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] disabled:pointer-events-none disabled:opacity-0"
                >
                  ‹
                </button>

                {/* =================================================
                    VISIBLE NEXT BUTTON
                ================================================= */}

                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  disabled={
                    active ===
                    stories.length - 1
                  }
                  className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-3xl leading-none text-white/90 backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] disabled:pointer-events-none disabled:opacity-0"
                >
                  ›
                </button>

              </div>

              {/* =================================================
                  STORY FOOTER
              ================================================= */}

              <div className="flex items-center justify-between border-t border-white/10 bg-[#070707] px-5 py-3.5">

                <div className="text-left">

                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
                    {activeStory.customerName}
                  </p>

                  <p className="mt-0.5 text-[10px] text-white/55">
                    Real customer feedback · Instagram
                  </p>

                </div>

                <span className="rounded-full border border-[#d6ad4d]/25 px-2.5 py-1 text-[10px] text-[#e4c56b]">
                  {active + 1} / {stories.length}
                </span>

              </div>

            </div>
          </div>,
          document.body
        )}
    </>
  );
}