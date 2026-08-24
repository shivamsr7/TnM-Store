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
  const touchStartX = useRef<number | null>(null);

  const next = () => setActive((v) => Math.min(v + 1, stories.length - 1));
  const previous = () => setActive((v) => Math.max(v - 1, 0));

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
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

  const storyDialog = open
    ? createPortal(
        <div
          aria-hidden={false}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2147483647,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="T&M Jewels customer reviews"
            onMouseDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => {
              touchStartX.current = event.changedTouches[0]?.clientX ?? null;
            }}
            onTouchEnd={(event) => {
              if (touchStartX.current === null) return;
              const endX =
                event.changedTouches[0]?.clientX ?? touchStartX.current;
              const delta = endX - touchStartX.current;
              if (Math.abs(delta) >= 50) delta < 0 ? next() : previous();
              touchStartX.current = null;
            }}
            style={{
              position: "relative",
              width: "min(92vw, 520px)",
              height: "min(88vh, 760px)",
              minHeight: "520px",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid rgba(214,173,77,0.45)",
              borderRadius: "18px",
              background: "#080808",
              boxShadow: "0 30px 100px rgba(0,0,0,0.85)",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 12,
                zIndex: 3,
                display: "flex",
                gap: 6,
              }}
            >
              {stories.map((story, index) => (
                <div
                  key={story.image}
                  style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.28)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: index <= active ? "100%" : "0%",
                      background: "#fff",
                      borderRadius: 99,
                    }}
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                position: "absolute",
                left: 20,
                right: 16,
                top: 28,
                zIndex: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div
                  style={{
                    color: "#fff",
                    fontFamily: "Georgia, serif",
                    fontSize: 22,
                    lineHeight: 1.1,
                  }}
                >
                  Customer Love
                </div>
                <div
                  style={{
                    marginTop: 5,
                    color: "#e4c56b",
                    fontSize: 9,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                  }}
                >
                  T&M Jewels · Instagram Reviews
                </div>
              </div>

              <button
                type="button"
                aria-label="Close customer reviews"
                onClick={() => setOpen(false)}
                style={{
                  width: 40,
                  height: 40,
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.65)",
                  color: "#fff",
                  fontSize: 28,
                  lineHeight: 1,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                position: "relative",
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#111",
              }}
            >
              <img
                src={stories[active].image}
                alt={stories[active].label}
                draggable={false}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  userSelect: "none",
                }}
              />

              <button
                type="button"
                aria-label="Previous review"
                disabled={active === 0}
                onClick={previous}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  border: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.62)",
                  color: "#fff",
                  fontSize: 32,
                  cursor: active === 0 ? "default" : "pointer",
                  opacity: active === 0 ? 0.2 : 1,
                }}
              >
                ‹
              </button>

              <button
                type="button"
                aria-label="Next review"
                disabled={active === stories.length - 1}
                onClick={next}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 44,
                  height: 44,
                  border: 0,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.62)",
                  color: "#fff",
                  fontSize: 32,
                  cursor:
                    active === stories.length - 1 ? "default" : "pointer",
                  opacity: active === stories.length - 1 ? 0.2 : 1,
                }}
              >
                ›
              </button>
            </div>

            <div
              style={{
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0 18px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                background: "#080808",
                color: "rgba(255,255,255,0.45)",
                fontSize: 10,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              <span>Swipe or use arrows</span>
              <span style={{ color: "#d6ad4d" }}>
                {active + 1} / {stories.length}
              </span>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <section className="bg-black px-5 py-16 text-white sm:px-8 lg:px-12 lg:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.28em] text-[#d6ad4d]">
            Customer Love
          </p>
          <h2 className="font-serif text-3xl font-medium sm:text-4xl lg:text-5xl">
            What Our Customers Say
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-white/60 sm:text-base">
            Real feedback from our beautiful customers on Instagram.
          </p>

          <button
            type="button"
            aria-label="Open Customer Love reviews"
            onClick={() => {
              setActive(0);
              setOpen(true);
            }}
            className="group relative mt-10 h-56 w-56 rounded-full p-[3px] transition-transform duration-300 hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e4c56b] focus-visible:ring-offset-4 focus-visible:ring-offset-black sm:h-64 sm:w-64"
            style={{
              background:
                "conic-gradient(from 180deg, #8a5b10, #f3d477, #fff1a8, #a8781b, #f3d477, #8a5b10)",
            }}
          >
            <span className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_25%,#25210f_0%,#0b0b0b_55%,#000_100%)] px-8 shadow-[0_0_45px_rgba(214,173,77,0.14)]">
              <span>
                <span className="block font-serif text-3xl text-[#f1d276] sm:text-4xl">
                  Customer
                </span>
                <span className="mt-1 block font-serif text-3xl text-white sm:text-4xl">
                  Love
                </span>
                <span className="mt-3 block text-lg text-[#d6ad4d]">♥</span>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.24em] text-white/55">
                  Tap to view
                </span>
              </span>
            </span>
          </button>

          <p className="mt-5 text-xs uppercase tracking-[0.2em] text-white/40">
            Reviews shared via Instagram DM
          </p>
        </div>
      </section>

      {storyDialog}
    </>
  );
}
