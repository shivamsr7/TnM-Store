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

// =========================================================
// MAIN COMPONENT
// =========================================================

export default function CustomerLove() {
  // =========================================================
  // ADMIN / SUPABASE REVIEWS
  // =========================================================

  const { data: adminReviews = [] } =
    usePublishedInstagramCustomerReviews();

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

  // =========================================================
  // STATE
  // =========================================================

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const [pageDirection, setPageDirection] = useState<
    "next" | "previous"
  >("next");

  const [isPageTurning, setIsPageTurning] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const pageTurnTimer = useRef<number | null>(null);

  // =========================================================
  // KEEP ACTIVE REVIEW VALID
  // =========================================================

  useEffect(() => {
    if (active >= stories.length && stories.length > 0) {
      setActive(stories.length - 1);
    }
  }, [active, stories.length]);

  // =========================================================
  // CLEANUP PAGE TIMER
  // =========================================================

  useEffect(() => {
    return () => {
      if (pageTurnTimer.current !== null) {
        window.clearTimeout(pageTurnTimer.current);
      }
    };
  }, []);

  // =========================================================
  // CLOSE
  // =========================================================

  const close = () => {
    if (isClosing) return;

    setIsClosing(true);

    window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
      setIsPageTurning(false);
    }, 420);
  };

  // =========================================================
  // PAGE TURN
  // =========================================================

  const turnPage = (direction: "next" | "previous") => {
    if (
      isPageTurning ||
      stories.length <= 1
    ) {
      return;
    }

    const nextIndex =
      direction === "next"
        ? Math.min(active + 1, stories.length - 1)
        : Math.max(active - 1, 0);

    if (nextIndex === active) return;

    setPageDirection(direction);
    setIsPageTurning(true);

    if (pageTurnTimer.current !== null) {
      window.clearTimeout(pageTurnTimer.current);
    }

    pageTurnTimer.current = window.setTimeout(() => {
      setActive(nextIndex);

      pageTurnTimer.current = window.setTimeout(() => {
        setIsPageTurning(false);
      }, 70);
    }, 280);
  };

  const next = () => {
    turnPage("next");
  };

  const previous = () => {
    turnPage("previous");
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
  }, [open, active, stories.length, isPageTurning]);

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

    if (
      Math.abs(dx) >= 45 &&
      Math.abs(dx) > Math.abs(dy) * 1.15
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
  // OPEN BOOK
  // =========================================================

  const openReviews = () => {
    if (stories.length === 0) return;

    setActive(0);
    setIsClosing(false);
    setIsPageTurning(false);
    setOpen(true);
  };

  const activeStory = stories[active];

  // =========================================================
  // HOMEPAGE SECTION
  // =========================================================

  return (
    <>
      <section className="relative overflow-hidden bg-black px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        {/* Subtle ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(201,150,45,.07) 0%, rgba(201,150,45,.025) 42%, transparent 72%)",
          }}
        />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
          {/* =================================================
              LABEL
          ================================================= */}

          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.36em] text-[#d6ad4d] sm:text-xs">
            Customer Love
          </p>

          {/* =================================================
              HEADING
          ================================================= */}

          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            A Note From Our Customers
          </h2>

          {/* =================================================
              SUBTITLE
          ================================================= */}

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Real experiences, beautifully shared.
          </p>

          {/* =================================================
              BOOK
          ================================================= */}

          <button
            type="button"
            onClick={openReviews}
            aria-label="Open customer reviews book"
            className="group relative mt-10 block outline-none"
          >
            {/* Book shadow */}
            <span
              className="absolute -bottom-5 left-1/2 h-8 w-[82%] -translate-x-1/2 rounded-[50%] blur-xl transition duration-700 group-hover:w-[88%]"
              style={{
                background:
                  "rgba(0,0,0,.85)",
              }}
            />

            {/* Outer book */}
            <span
              className="relative block h-[270px] w-[205px] rounded-r-[13px] rounded-l-[7px] border border-[#d6ad4d]/35 transition duration-700 ease-out group-hover:-translate-y-2 group-hover:rotate-[1deg] sm:h-[300px] sm:w-[230px]"
              style={{
                background:
                  "linear-gradient(135deg, #080808 0%, #17130b 48%, #050505 100%)",
                boxShadow:
                  "inset -10px 0 0 rgba(255,255,255,.025), inset 2px 0 0 rgba(214,173,77,.16), 0 22px 45px rgba(0,0,0,.6)",
              }}
            >
              {/* Spine */}
              <span
                className="absolute bottom-3 left-3 top-3 w-[3px] rounded-full"
                style={{
                  background:
                    "linear-gradient(to bottom, transparent, rgba(214,173,77,.65), transparent)",
                }}
              />

              {/* Gold frame */}
              <span className="absolute inset-4 rounded-[5px] border border-[#d6ad4d]/35" />

              {/* Inner frame */}
              <span className="absolute inset-6 rounded-[4px] border border-[#d6ad4d]/10" />

              {/* Cover content */}
              <span className="absolute inset-0 flex flex-col items-center justify-center px-7">
                <span className="text-[9px] font-medium uppercase tracking-[0.38em] text-[#d6ad4d]">
                  T&M JEWELS
                </span>

                <span className="my-7 h-px w-16 bg-[#d6ad4d]/45" />

                <span className="font-serif text-[29px] leading-tight text-[#f2d889] sm:text-[32px]">
                  Customer
                </span>

                <span className="font-serif text-[29px] leading-tight text-white sm:text-[32px]">
                  Love
                </span>

                <span className="mt-6 text-[8px] uppercase tracking-[0.28em] text-white/35">
                  Real words · Real moments
                </span>
              </span>

              {/* Cover corner detail */}
              <span className="absolute bottom-5 right-5 h-4 w-4 border-b border-r border-[#d6ad4d]/40" />
            </span>
          </button>

          {/* =================================================
              CTA
          ================================================= */}

          <div className="mt-7 flex flex-col items-center">
            <span className="text-[10px] font-semibold uppercase tracking-[0.34em] text-[#e4c56b]">
              Tap to Read
            </span>

            <span className="mt-2 text-xs text-white/30">
              Flip through our customer stories
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          BOOK DIALOG
      ===================================================== */}

      {open &&
        activeStory &&
        createPortal(
          <div
            className={`tnm-book-overlay fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md sm:p-6 ${
              isClosing
                ? "tnm-overlay-closing"
                : "tnm-overlay-opening"
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
                @keyframes tnmOverlayOpening {
                  from {
                    opacity: 0;
                    backdrop-filter: blur(0);
                  }
                  to {
                    opacity: 1;
                    backdrop-filter: blur(14px);
                  }
                }

                @keyframes tnmOverlayClosing {
                  from {
                    opacity: 1;
                    backdrop-filter: blur(14px);
                  }
                  to {
                    opacity: 0;
                    backdrop-filter: blur(0);
                  }
                }

                @keyframes tnmBookOpening {
                  0% {
                    opacity: 0;
                    transform:
                      perspective(1800px)
                      rotateX(8deg)
                      rotateY(-9deg)
                      scale(.92);
                  }

                  55% {
                    opacity: 1;
                    transform:
                      perspective(1800px)
                      rotateX(1deg)
                      rotateY(2deg)
                      scale(1.01);
                  }

                  100% {
                    opacity: 1;
                    transform:
                      perspective(1800px)
                      rotateX(0)
                      rotateY(0)
                      scale(1);
                  }
                }

                @keyframes tnmBookClosing {
                  0% {
                    opacity: 1;
                    transform:
                      perspective(1800px)
                      rotateX(0)
                      rotateY(0)
                      scale(1);
                  }

                  100% {
                    opacity: 0;
                    transform:
                      perspective(1800px)
                      rotateX(7deg)
                      rotateY(-8deg)
                      scale(.93);
                  }
                }

                @keyframes tnmPageNext {
                  0% {
                    opacity: 1;
                    transform:
                      perspective(1500px)
                      rotateY(0deg)
                      translateX(0);
                  }

                  45% {
                    opacity: .55;
                    transform:
                      perspective(1500px)
                      rotateY(-70deg)
                      translateX(-3%);
                  }

                  100% {
                    opacity: 1;
                    transform:
                      perspective(1500px)
                      rotateY(0deg)
                      translateX(0);
                  }
                }

                @keyframes tnmPagePrevious {
                  0% {
                    opacity: 1;
                    transform:
                      perspective(1500px)
                      rotateY(0deg)
                      translateX(0);
                  }

                  45% {
                    opacity: .55;
                    transform:
                      perspective(1500px)
                      rotateY(70deg)
                      translateX(3%);
                  }

                  100% {
                    opacity: 1;
                    transform:
                      perspective(1500px)
                      rotateY(0deg)
                      translateX(0);
                  }
                }

                .tnm-overlay-opening {
                  animation:
                    tnmOverlayOpening
                    .45s
                    cubic-bezier(.22,1,.36,1)
                    both;
                }

                .tnm-overlay-closing {
                  animation:
                    tnmOverlayClosing
                    .42s
                    cubic-bezier(.4,0,.2,1)
                    both;
                }

                .tnm-book-opening {
                  animation:
                    tnmBookOpening
                    .78s
                    cubic-bezier(.16,1,.3,1)
                    both;
                }

                .tnm-book-closing {
                  animation:
                    tnmBookClosing
                    .42s
                    cubic-bezier(.4,0,.2,1)
                    both;
                }

                .tnm-page-next {
                  animation:
                    tnmPageNext
                    .58s
                    cubic-bezier(.22,.61,.36,1)
                    both;
                  transform-origin: left center;
                }

                .tnm-page-previous {
                  animation:
                    tnmPagePrevious
                    .58s
                    cubic-bezier(.22,.61,.36,1)
                    both;
                  transform-origin: right center;
                }

                @media (prefers-reduced-motion: reduce) {
                  .tnm-overlay-opening,
                  .tnm-overlay-closing,
                  .tnm-book-opening,
                  .tnm-book-closing,
                  .tnm-page-next,
                  .tnm-page-previous {
                    animation: none !important;
                  }
                }
              `}
            </style>

            {/* =================================================
                BOOK
            ================================================= */}

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-love-dialog-title"
              className={`tnm-book-shell relative flex h-[min(92vh,820px)] w-[min(96vw,1080px)] flex-col overflow-hidden ${
                isClosing
                  ? "tnm-book-closing"
                  : "tnm-book-opening"
              }`}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* =================================================
                  TOP CONTROLS
              ================================================= */}

              <div className="absolute left-0 right-0 top-0 z-40 flex items-center justify-between px-2 py-2 sm:px-3">
                <div className="rounded-full border border-[#d6ad4d]/20 bg-black/55 px-3 py-1.5 text-[9px] uppercase tracking-[0.2em] text-[#e4c56b] backdrop-blur-md">
                  T&M Jewels · Customer Love
                </div>

                <button
                  type="button"
                  aria-label="Close customer reviews"
                  onClick={close}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-2xl leading-none text-white backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c56b]"
                >
                  ×
                </button>
              </div>

              {/* =================================================
                  OPEN BOOK
              ================================================= */}

              <div
                className="relative min-h-0 flex-1 px-0 pb-0 pt-12 sm:px-5 sm:pt-14"
                style={{
                  perspective: "1800px",
                  touchAction: "pan-y",
                }}
              >
                <div className="relative mx-auto flex h-full w-full max-w-[960px] items-stretch justify-center">
                  {/* LEFT PAGE */}
                  <div
                    className="relative hidden w-1/2 overflow-hidden rounded-l-[5px] border-y border-l border-[#b99954]/35 sm:block"
                    style={{
                      background:
                        "linear-gradient(105deg, #d8c59a 0%, #f2e9d0 8%, #fffdf5 52%, #e9dec2 100%)",
                      boxShadow:
                        "inset -18px 0 28px rgba(70,48,20,.09), -8px 0 30px rgba(0,0,0,.35)",
                    }}
                  >
                    {/* Paper texture */}
                    <div className="pointer-events-none absolute inset-0 opacity-[.16]">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            "radial-gradient(rgba(70,45,15,.18) .55px, transparent .55px)",
                          backgroundSize:
                            "7px 7px",
                        }}
                      />
                    </div>

                    <div className="relative flex h-full flex-col items-center justify-center px-8 text-center">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#7e6330]">
                        T&M JEWELS
                      </p>

                      <div className="my-7 h-px w-20 bg-[#9b7b3f]/40" />

                      <p className="font-serif text-4xl leading-tight text-[#2a2419]">
                        Customer
                      </p>

                      <p className="font-serif text-4xl leading-tight text-[#8a6b2f]">
                        Love
                      </p>

                      <p className="mt-8 max-w-[250px] text-xs leading-6 text-[#655b49]">
                        A collection of genuine words,
                        messages and moments shared by
                        our beautiful customers.
                      </p>

                      <div className="mt-10 text-[10px] uppercase tracking-[0.2em] text-[#8a6b2f]">
                        {String(active + 1).padStart(2, "0")} /{" "}
                        {String(stories.length).padStart(
                          2,
                          "0"
                        )}
                      </div>
                    </div>

                    {/* Center binding shadow */}
                    <div
                      className="pointer-events-none absolute right-0 top-0 h-full w-8"
                      style={{
                        background:
                          "linear-gradient(to left, rgba(0,0,0,.13), transparent)",
                      }}
                    />
                  </div>

                  {/* RIGHT PAGE */}
                  <div
                    className="relative h-full w-full overflow-hidden rounded-[5px] border border-[#b99954]/35 sm:w-1/2 sm:rounded-l-none"
                    style={{
                      background:
                        "linear-gradient(105deg, #e4d6b8 0%, #fffdf6 10%, #fffefa 62%, #eadfc5 100%)",
                      boxShadow:
                        "inset 18px 0 28px rgba(70,48,20,.07), 8px 0 30px rgba(0,0,0,.35)",
                    }}
                  >
                    {/* Paper texture */}
                    <div className="pointer-events-none absolute inset-0 opacity-[.15]">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            "radial-gradient(rgba(70,45,15,.18) .55px, transparent .55px)",
                          backgroundSize:
                            "7px 7px",
                        }}
                      />
                    </div>

                    {/* Top page heading */}
                    <div className="absolute left-5 right-5 top-5 z-10 flex items-center justify-between sm:left-7 sm:right-7 sm:top-7">
                      <span className="text-[8px] font-semibold uppercase tracking-[0.3em] text-[#8a6b2f]">
                        A Note From Our Customers
                      </span>

                      <span className="text-[9px] text-[#8a6b2f]/70">
                        {String(active + 1).padStart(
                          2,
                          "0"
                        )}{" "}
                        /{" "}
                        {String(stories.length).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    {/* Screenshot page */}
                    <div
                      className={`relative flex h-full items-center justify-center px-5 pb-14 pt-14 sm:px-8 sm:pb-16 sm:pt-16 ${
                        isPageTurning
                          ? pageDirection === "next"
                            ? "tnm-page-next"
                            : "tnm-page-previous"
                          : ""
                      }`}
                    >
                      <div
                        className="relative flex h-full max-h-[calc(100%-8px)] w-full items-center justify-center overflow-hidden rounded-[3px] border border-[#9e8758]/20 bg-white/45 p-2 sm:p-3"
                        style={{
                          boxShadow:
                            "0 8px 22px rgba(74,55,23,.13)",
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
                          className="max-h-full max-w-full select-none object-contain"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between sm:left-7 sm:right-7">
                      <div className="min-w-0">
                        <p className="truncate text-[8px] font-semibold uppercase tracking-[0.18em] text-[#80652f]">
                          {activeStory.customerName}
                        </p>

                        <p className="mt-0.5 text-[8px] text-[#7b705c]">
                          Shared via Instagram
                        </p>
                      </div>

                      <span className="ml-3 text-[9px] italic text-[#80652f]/65">
                        With love, T&M
                      </span>
                    </div>

                    {/* Binding shadow */}
                    <div
                      className="pointer-events-none absolute left-0 top-0 h-full w-8"
                      style={{
                        background:
                          "linear-gradient(to right, rgba(0,0,0,.10), transparent)",
                      }}
                    />
                  </div>
                </div>

                {/* =================================================
                    NAVIGATION
                ================================================= */}

                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={previous}
                  disabled={
                    active === 0 ||
                    isPageTurning
                  }
                  className="absolute left-1 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d6ad4d]/30 bg-black/65 text-3xl leading-none text-[#f0d77f] shadow-lg backdrop-blur-md transition hover:border-[#d6ad4d]/60 hover:bg-black/80 disabled:pointer-events-none disabled:opacity-20 sm:left-1"
                >
                  ‹
                </button>

                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  disabled={
                    active ===
                      stories.length - 1 ||
                    isPageTurning
                  }
                  className="absolute right-1 top-1/2 z-30 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#d6ad4d]/30 bg-black/65 text-3xl leading-none text-[#f0d77f] shadow-lg backdrop-blur-md transition hover:border-[#d6ad4d]/60 hover:bg-black/80 disabled:pointer-events-none disabled:opacity-20 sm:right-1"
                >
                  ›
                </button>
              </div>

              {/* =================================================
                  BOTTOM INSTRUCTION
              ================================================= */}

              <div className="flex shrink-0 items-center justify-center pb-2 pt-1 sm:pb-3">
                <p className="text-[8px] uppercase tracking-[0.25em] text-white/30">
                  Swipe to turn the page · Use ← →
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}