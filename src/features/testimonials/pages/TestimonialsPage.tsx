import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { usePublishedInstagramCustomerReviews } from "@/features/reviews/hooks/usePublishedInstagramCustomerReviews";

import review1 from "@/features/reviews/assets/IMG_0338.jpeg";
import review2 from "@/features/reviews/assets/IMG_0339.jpeg";
import review3 from "@/features/reviews/assets/IMG_0341.jpeg";
import review4 from "@/features/reviews/assets/IMG_0342.jpeg";

const InstagramIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

type ReviewItem = {
  id: string;
  image?: string;
  image_url?: string;
  customer_name?: string;
  username?: string;
  caption?: string;
  created_at?: string;
};

const localReviews: ReviewItem[] = [
  { id: "local-1", image: review1 },
  { id: "local-2", image: review2 },
  { id: "local-3", image: review3 },
  { id: "local-4", image: review4 },
];

export default function TestimonialsPage() {
  const { data: publishedReviews = [] } =
    usePublishedInstagramCustomerReviews();

  const reviews = useMemo<ReviewItem[]>(() => {
    const remote = (publishedReviews as ReviewItem[]).map((item, index) => ({
      ...item,
      id: item.id || `published-${index}`,
      image: item.image || item.image_url,
    }));

    return [...localReviews, ...remote].filter(
      (item) => item.image || item.image_url
    );
  }, [publishedReviews]);

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const next = () => {
    if (!reviews.length) return;
    setSelectedIndex((current) =>
      current === null ? 0 : (current + 1) % reviews.length
    );
  };

  const previous = () => {
    if (!reviews.length) return;
    setSelectedIndex((current) =>
      current === null
        ? reviews.length - 1
        : (current - 1 + reviews.length) % reviews.length
    );
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") previous();
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [selectedIndex, reviews.length]);

  const selected = selectedIndex !== null ? reviews[selectedIndex] : null;

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f1e9] text-[#171512]">
      {/* ───────────────── HERO ───────────────── */}
      <section className="relative overflow-hidden bg-[#151310] text-[#f5f0e7]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -left-40 top-[-220px] h-[520px] w-[520px] rounded-full bg-[#9e7b3f]/10 blur-3xl" />
          <div className="absolute right-[-180px] bottom-[-260px] h-[600px] w-[600px] rounded-full bg-[#b99554]/10 blur-3xl" />
          <div className="absolute inset-y-0 right-[31%] hidden w-px bg-white/[0.06] lg:block" />
        </div>

        <div className="relative mx-auto max-w-[1500px] px-5 pb-16 pt-12 sm:px-8 sm:pb-24 sm:pt-16 lg:px-12 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            {/* Editorial copy */}
            <div className="relative z-10 max-w-2xl">
              <div className="mb-8 flex items-center gap-3">
                <span className="h-px w-10 bg-[#c7a25d]" />
                <span className="text-[9px] font-medium uppercase tracking-[0.34em] text-[#c7a25d]">
                  The T&M Journal
                </span>
              </div>

              <h1 className="font-serif text-[3.65rem] font-normal leading-[0.88] tracking-[-0.055em] sm:text-[5.2rem] lg:text-[6.4rem]">
                Loved.
                <span className="block pl-8 italic text-[#c9a461] sm:pl-14">
                  Worn.
                </span>
                <span className="block">Shared.</span>
              </h1>

              <p className="mt-8 max-w-lg text-sm leading-7 text-[#aaa49a] sm:text-[15px]">
                The best part of creating jewellery is seeing where it ends
                up. Here are real moments, messages and reactions shared by
                the T&M family.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-3xl text-[#d0ad69]">100+</span>
                  <span className="max-w-[80px] text-[8px] uppercase leading-4 tracking-[0.18em] text-[#8e897f]">
                    orders delivered
                  </span>
                </div>

                <span className="h-8 w-px bg-white/10" />

                <div className="flex items-center gap-3">
                  <InstagramIcon className="h-5 w-5 text-[#c9a461]" />
                  <span className="text-[8px] uppercase tracking-[0.2em] text-[#8e897f]">
                    Real Instagram love
                  </span>
                </div>
              </div>
            </div>

            {/* Visual review composition */}
            <div className="relative mx-auto h-[480px] w-full max-w-[650px] sm:h-[560px]">
              <div className="absolute left-[2%] top-[9%] w-[43%] rotate-[-6deg] shadow-[0_35px_70px_rgba(0,0,0,0.55)] transition-transform duration-700 hover:rotate-[-3deg]">
                <div className="border-[7px] border-[#f0ebe1] bg-[#f0ebe1]">
                  <img
                    src={review1}
                    alt="T&M customer review"
                    className="aspect-[0.82/1] w-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute right-[4%] top-[1%] w-[40%] rotate-[5deg] shadow-[0_35px_70px_rgba(0,0,0,0.55)] transition-transform duration-700 hover:rotate-[2deg]">
                <div className="border-[7px] border-[#f0ebe1] bg-[#f0ebe1]">
                  <img
                    src={review2}
                    alt="T&M customer review"
                    className="aspect-[0.82/1] w-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute bottom-[4%] left-[27%] z-10 w-[46%] rotate-[2deg] shadow-[0_35px_80px_rgba(0,0,0,0.6)] transition-transform duration-700 hover:rotate-0">
                <div className="border-[8px] border-[#f0ebe1] bg-[#f0ebe1]">
                  <img
                    src={review3}
                    alt="T&M customer review"
                    className="aspect-[0.82/1] w-full object-cover"
                  />
                </div>
              </div>

              <div className="absolute bottom-[10%] left-[4%] z-20 flex h-20 w-20 items-center justify-center rounded-full border border-[#c9a461]/60 bg-[#1b1814] shadow-xl sm:h-24 sm:w-24">
                <div className="text-center">
                  <span className="block font-serif text-xl text-[#d1ad67]">
                    T&M
                  </span>
                  <span className="text-[6px] uppercase tracking-[0.24em] text-[#8d877e]">
                    customer love
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Gold rule */}
          <div className="mt-10 flex items-center gap-5">
            <span className="h-px flex-1 bg-gradient-to-r from-[#c6a15d]/60 to-transparent" />
            <span className="text-[#c6a15d]">✦</span>
            <span className="h-px flex-1 bg-gradient-to-l from-[#c6a15d]/60 to-transparent" />
          </div>
        </div>
      </section>

      {/* ───────────────── INTRO / NUMBERS ───────────────── */}
      <section className="relative overflow-hidden bg-[#f5f1e9] px-5 py-14 sm:px-8 sm:py-20 lg:px-12 lg:py-28">
        {/* subtle editorial ornament */}
        <div className="pointer-events-none absolute -right-28 -top-24 h-64 w-64 rounded-full border border-[#b99a64]/15 sm:-right-24 sm:-top-28 sm:h-80 sm:w-80" />
        <div className="pointer-events-none absolute -right-20 -top-16 h-52 w-52 rounded-full border border-[#b99a64]/10 sm:-right-16 sm:-top-20 sm:h-64 sm:w-64" />

        <div className="relative mx-auto max-w-[1300px]">
          {/* Intro */}
          <div className="grid items-start gap-9 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-20">
            <div className="min-w-0">
              <div className="mb-5 flex items-center gap-3 sm:mb-6">
                <span className="h-px w-8 bg-[#ad8a52] sm:w-10" />
                <span className="text-[7px] font-medium uppercase tracking-[0.3em] text-[#94764a] sm:text-[8px] sm:tracking-[0.34em]">
                  More than a review
                </span>
              </div>

              <h2 className="max-w-[850px] font-serif text-[2.65rem] font-normal leading-[0.94] tracking-[-0.05em] text-[#1b1916] sm:text-[4.3rem] lg:text-[5.4rem]">
                Every order leaves
                <span className="block pl-5 italic text-[#a0814e] sm:pl-16">
                  a little story.
                </span>
              </h2>

              <div className="mt-7 flex max-w-2xl items-start gap-3 sm:mt-8 sm:gap-5">
                <span className="mt-0.5 shrink-0 font-serif text-2xl leading-none text-[#b18d55] sm:text-3xl">
                  “
                </span>
                <p className="text-[13px] leading-6 text-[#686259] sm:text-sm sm:leading-7 lg:text-[15px]">
                  From an excited “just received it” message to a customer
                  planning their next order, these little moments are what
                  make T&M feel like more than a jewellery brand.
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="relative border-l border-[#c8b38c] pl-5 sm:pl-7 lg:border-l lg:pl-7">
              <p className="text-[7px] uppercase tracking-[0.3em] text-[#94764a] sm:text-[8px] sm:tracking-[0.32em]">
                A little note from us
              </p>

              <p className="mt-3 max-w-md font-serif text-[1.45rem] leading-[1.18] tracking-[-0.025em] text-[#302c27] sm:mt-4 sm:text-2xl lg:text-3xl">
                Thank you for trusting T&M with your everyday sparkle and
                special moments.
              </p>

              <div className="mt-5 flex items-center gap-3 sm:mt-7">
                <span className="h-px w-6 bg-[#b18d55] sm:w-7" />
                <span className="font-serif text-xs italic text-[#94764a] sm:text-sm">
                  With love, T&M
                </span>
              </div>
            </div>
          </div>

          {/* Premium metrics */}
          <div className="relative mt-12 overflow-hidden border-y border-[#d4c9b8] sm:mt-16">
            <div className="grid sm:grid-cols-3">
              {[
                {
                  value: "100+",
                  label: "Orders delivered",
                  detail: "and still growing",
                },
                {
                  value: "Real",
                  label: "Customer messages",
                  detail: "shared with us",
                },
                {
                  value: "∞",
                  label: "Moments to remember",
                  detail: "one piece at a time",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`group relative min-h-0 px-0 py-6 sm:min-h-[150px] sm:px-8 sm:py-9 ${
                    index > 0
                      ? "border-t border-[#d4c9b8] sm:border-l sm:border-t-0"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 sm:h-full sm:items-start">
                    <div>
                      <span className="block font-serif text-[2.45rem] leading-none tracking-[-0.04em] text-[#a17e49] transition-transform duration-500 group-hover:-translate-y-1 sm:text-[3.15rem]">
                        {item.value}
                      </span>

                      <span className="mt-3 block text-[7px] font-medium uppercase tracking-[0.22em] text-[#514c45] sm:mt-4 sm:text-[8px] sm:tracking-[0.25em]">
                        {item.label}
                      </span>

                      <span className="mt-1.5 block text-[8px] text-[#948c81] sm:mt-2 sm:text-[9px]">
                        {item.detail}
                      </span>
                    </div>

                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#c8b28a] text-[9px] text-[#9d7d4c] transition duration-500 group-hover:rotate-45 sm:mt-1 sm:h-7 sm:w-7">
                      ✦
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Editorial footer */}
          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-[#c5a56f] sm:w-16" />
            <span className="whitespace-nowrap text-[7px] uppercase tracking-[0.25em] text-[#9a7d50] sm:text-[9px] sm:tracking-[0.3em]">
              Real customers · Real love
            </span>
            <span className="h-px w-8 bg-gradient-to-l from-transparent to-[#c5a56f] sm:w-16" />
          </div>
        </div>
      </section>

      {/* ───────────────── GALLERY ───────────────── */}
      <section className="bg-[#e9e2d6] px-5 pb-20 pt-8 sm:px-8 sm:pb-28 lg:px-12">
        <div className="mx-auto max-w-[1300px]">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <div className="mb-4 flex items-center gap-3">
                <span className="h-px w-7 bg-[#a38450]" />
                <span className="text-[9px] uppercase tracking-[0.3em] text-[#8e7449]">
                  From Instagram
                </span>
              </div>
              <h2 className="font-serif text-4xl tracking-[-0.035em] sm:text-5xl">
                You said it best.
              </h2>
            </div>

            <span className="hidden text-[9px] uppercase tracking-[0.22em] text-[#8a8175] sm:block">
              Tap a story to open
            </span>
          </div>

          {reviews.length > 0 ? (
            <div className="grid grid-cols-12 gap-3 sm:gap-5">
              {reviews.map((review, index) => {
                const image = review.image || review.image_url;
                if (!image) return null;

                const layouts = [
                  "col-span-12 sm:col-span-7",
                  "col-span-6 sm:col-span-5",
                  "col-span-6 sm:col-span-4",
                  "col-span-12 sm:col-span-8",
                  "col-span-6 sm:col-span-4",
                ];

                return (
                  <button
                    key={review.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`group relative z-10 block cursor-pointer overflow-hidden bg-[#d8d0c2] text-left ${layouts[index % layouts.length]}`}
                  >
                    <div
                      className={`pointer-events-none relative overflow-hidden ${
                        index % 3 === 0
                          ? "aspect-[1.45/1]"
                          : "aspect-[0.88/1]"
                      }`}
                    >
                      <img
                        src={image}
                        alt="T&M customer review"
                        loading={index < 4 ? "eager" : "lazy"}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035]"
                      />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 items-end justify-between p-4 opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 sm:p-5">
                        <span className="flex items-center gap-2 text-[8px] uppercase tracking-[0.2em] text-white">
                          <InstagramIcon className="h-3.5 w-3.5" />
                          Customer story
                        </span>

                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black">
                          <ArrowRight className="h-4 w-4 -rotate-45" />
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="border border-[#cfc5b6] px-6 py-20 text-center">
              <p className="font-serif text-2xl text-[#4c463e]">
                More customer moments are coming soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ───────────────── INSTAGRAM CTA ───────────────── */}
      <section className="relative overflow-hidden bg-[#171512] px-5 py-20 text-[#f4efe7] sm:px-8 sm:py-28 lg:px-12">
        <div className="absolute left-1/2 top-0 h-px w-32 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#c7a25d] to-transparent" />

        <div className="relative mx-auto max-w-4xl text-center">
          <InstagramIcon className="mx-auto h-7 w-7 text-[#c8a35e]" />

          <p className="mt-6 text-[9px] uppercase tracking-[0.35em] text-[#a99d8a]">
            Spotted on you
          </p>

          <h2 className="mt-5 font-serif text-4xl leading-tight tracking-[-0.04em] sm:text-6xl">
            Your T&M moment
            <span className="block italic text-[#c8a35e]">could be next.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#a49d93]">
            Tag T&M in your jewellery moments. We genuinely love seeing how
            you style your pieces.
          </p>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-9 inline-flex items-center gap-4 border border-[#c8a35e]/70 px-7 py-4 text-[9px] uppercase tracking-[0.25em] text-[#e8d5ad] transition hover:bg-[#c8a35e] hover:text-[#171512]"
          >
            Follow T&M on Instagram
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ───────────────── SHOP CTA ───────────────── */}
      <section className="bg-[#f5f1e9] px-5 py-20 text-center sm:px-8 sm:py-28">
        <p className="text-[9px] uppercase tracking-[0.32em] text-[#987b4b]">
          Make your own story
        </p>

        <h2 className="mx-auto mt-5 max-w-3xl font-serif text-5xl leading-[0.96] tracking-[-0.045em] sm:text-7xl">
          Find the piece
          <span className="block italic text-[#98784a]">you’ll love.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-lg text-sm leading-7 text-[#716b62]">
          Explore the collection and discover your next everyday favourite.
        </p>

        <Link
          to="/shop"
          className="mt-9 inline-flex items-center gap-5 bg-[#171512] px-8 py-4 text-[9px] uppercase tracking-[0.25em] text-white transition hover:bg-[#302c27]"
        >
          Explore Collection
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* ───────────────── VIEWER ───────────────── */}
      {selected &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex h-[100svh] w-screen items-center justify-center overflow-hidden bg-[#080706]/95 p-0 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Customer review viewer"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              aria-label="Close review"
              onClick={(event) => {
                event.stopPropagation();
                setSelectedIndex(null);
              }}
              className="absolute right-4 top-4 z-[100001] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:right-7 sm:top-7"
            >
              <X className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Previous review"
              onClick={(event) => {
                event.stopPropagation();
                previous();
              }}
              className="absolute left-3 top-1/2 z-[100001] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:left-7"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              aria-label="Next review"
              onClick={(event) => {
                event.stopPropagation();
                next();
              }}
              className="absolute right-3 top-1/2 z-[100001] flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition hover:bg-white hover:text-black sm:right-7"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div
              className="relative z-[100000] flex max-h-full max-w-full items-center justify-center px-14 py-5 sm:px-24 sm:py-8"
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={selected.image || selected.image_url}
                alt="T&M customer review"
                className="block max-h-[calc(100svh-40px)] max-w-[calc(100vw-112px)] object-contain shadow-2xl sm:max-h-[calc(100svh-64px)] sm:max-w-[calc(100vw-176px)]"
                draggable={false}
              />

              <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/65 px-4 py-2 text-[8px] uppercase tracking-[0.22em] text-white/80 backdrop-blur-md sm:bottom-8">
                {(selectedIndex ?? 0) + 1} / {reviews.length}
              </div>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}
