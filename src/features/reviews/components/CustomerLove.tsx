import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import review1 from "../assets/IMG_0338.jpeg";
import review2 from "../assets/IMG_0339.jpeg";
import review3 from "../assets/IMG_0341.jpeg";
import review4 from "../assets/IMG_0342.jpeg";

type ReviewStory = {
  image: string;
  label: string;
};

const stories: ReviewStory[] = [
  { image: review1, label: "Happy customer feedback" },
  { image: review2, label: "Packaging and repeat-order feedback" },
  { image: review3, label: "Product quality and packing feedback" },
  { image: review4, label: "First-order and recommendation feedback" },
];

export default function CustomerLove() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const close = () => {
    setIsClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setIsClosing(false);
    }, 180);
  };

  const next = () =>
    setActive((current) => Math.min(current + 1, stories.length - 1));

  const previous = () =>
    setActive((current) => Math.max(current - 1, 0));

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
    touchStartY.current = event.changedTouches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const endY = event.changedTouches[0]?.clientY ?? touchStartY.current;
    const dx = endX - touchStartX.current;
    const dy = endY - touchStartY.current;

    // Only treat predominantly horizontal gestures as Story navigation.
    if (Math.abs(dx) >= 50 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx < 0 ? next() : previous();
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const openReviews = () => {
    setActive(0);
    setIsClosing(false);
    setOpen(true);
  };

  return (
    <>
      <section className="relative overflow-hidden bg-black px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c9962d]/[0.035] blur-3xl" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-center text-center">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.34em] text-[#d6ad4d] sm:text-xs">
            Customer Love
          </p>

          <h2 className="font-serif text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-white/55 sm:text-base">
            Real feedback from our beautiful customers on Instagram.
          </p>

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
            <span className="absolute inset-[6px] rounded-full border border-[#e4c56b]/15" />
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_38%_24%,#272311_0%,#11110d_42%,#050505_78%,#000_100%)] px-8">
              <span>
                <span className="block font-serif text-[32px] leading-none text-[#f1d276] sm:text-[36px]">
                  Customer
                </span>
                <span className="mt-2 block font-serif text-[32px] leading-none text-white sm:text-[36px]">
                  Love
                </span>
                <span className="mt-4 block text-base text-[#d6ad4d]">♥</span>
                <span className="mt-3 block text-[9px] font-medium uppercase tracking-[0.28em] text-white/45">
                  Tap to view
                </span>
              </span>
            </span>
          </button>

          <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.25em] text-white/30 sm:text-[10px]">
            Reviews shared via Instagram DM
          </p>
        </div>
      </section>

      {open &&
        createPortal(
          <div
            className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/75 p-3 backdrop-blur-md sm:p-6 ${
              isClosing ? "animate-[fadeOut_.18s_ease-in_forwards]" : "animate-[fadeIn_.22s_ease-out]"
            }`}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) close();
            }}
            style={{
              animation: isClosing
                ? "fadeOut .18s ease-in forwards"
                : "fadeIn .22s ease-out",
            }}
          >
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; }
                  to { opacity: 1; }
                }
                @keyframes fadeOut {
                  from { opacity: 1; }
                  to { opacity: 0; }
                }
                @keyframes storyIn {
                  from { opacity: .45; transform: scale(.985); }
                  to { opacity: 1; transform: scale(1); }
                }
                @media (prefers-reduced-motion: reduce) {
                  .tnm-story-motion { animation: none !important; }
                }
              `}
            </style>

            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="customer-love-dialog-title"
              className="relative flex h-[min(92vh,820px)] w-[min(94vw,520px)] flex-col overflow-hidden rounded-[24px] border border-[#d6ad4d]/35 bg-[#070707] shadow-[0_30px_120px_rgba(0,0,0,.82)]"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {/* Progress */}
              <div className="absolute left-4 right-4 top-3 z-30 flex gap-1.5">
                {stories.map((story, index) => (
                  <div
                    key={story.image}
                    className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25"
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        index <= active ? "bg-white" : "bg-transparent"
                      }`}
                      style={{ width: index <= active ? "100%" : "0%" }}
                    />
                  </div>
                ))}
              </div>

              {/* Header */}
              <div className="absolute left-4 right-4 top-6 z-30 flex items-center justify-between pt-1">
                <div className="flex min-w-0 items-center gap-3">
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

                <button
                  type="button"
                  aria-label="Close customer reviews"
                  onClick={close}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/60 text-2xl leading-none text-white backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c56b]"
                >
                  ×
                </button>
              </div>

              {/* Story */}
              <div
                className="relative min-h-0 flex-1 bg-[#101010]"
                style={{ touchAction: "pan-y" }}
              >
                <img
                  key={stories[active].image}
                  src={stories[active].image}
                  alt={stories[active].label}
                  draggable={false}
                  className="tnm-story-motion h-full w-full select-none object-contain"
                  style={{ animation: "storyIn .22s ease-out" }}
                />

                {/* Left/right tap zones */}
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={previous}
                  className="absolute inset-y-0 left-0 w-[22%] cursor-pointer bg-transparent"
                />
                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  className="absolute inset-y-0 right-0 w-[22%] cursor-pointer bg-transparent"
                />

                {/* Visible navigation */}
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={previous}
                  disabled={active === 0}
                  className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-3xl leading-none text-white/90 backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] disabled:pointer-events-none disabled:opacity-0"
                >
                  ‹
                </button>

                <button
                  type="button"
                  aria-label="Next review"
                  onClick={next}
                  disabled={active === stories.length - 1}
                  className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-3xl leading-none text-white/90 backdrop-blur-md transition hover:border-[#d6ad4d]/50 hover:text-[#e4c56b] disabled:pointer-events-none disabled:opacity-0"
                >
                  ›
                </button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/10 bg-[#070707] px-5 py-3.5">
                <div className="text-left">
                  <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/35">
                    Real customer feedback
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/55">
                    Shared with T&M Jewels on Instagram
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
