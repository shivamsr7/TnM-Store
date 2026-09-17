import { useEffect, useMemo, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

import { usePublishedInstagramCustomerReviews } from "@/features/reviews/hooks/usePublishedInstagramCustomerReviews";

import review1 from "@/features/reviews/assets/IMG_0338.jpeg";
import review2 from "@/features/reviews/assets/IMG_0339.jpeg";
import review3 from "@/features/reviews/assets/IMG_0341.jpeg";
import review4 from "@/features/reviews/assets/IMG_0342.jpeg";

const InstagramIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

type Testimonial = {
  id: string;
  image: string;
  customerName: string;
  reviewText?: string;
  source: "instagram";
};

const existingInstagramTestimonials: Testimonial[] = [
  {
    id: "instagram-1",
    image: review1,
    customerName: "T&M Customer",
    source: "instagram",
  },
  {
    id: "instagram-2",
    image: review2,
    customerName: "T&M Customer",
    source: "instagram",
  },
  {
    id: "instagram-3",
    image: review3,
    customerName: "T&M Customer",
    source: "instagram",
  },
  {
    id: "instagram-4",
    image: review4,
    customerName: "T&M Customer",
    source: "instagram",
  },
];

export default function TestimonialsPage() {
  const { data: adminReviews = [], isLoading } =
    usePublishedInstagramCustomerReviews();

  const testimonials = useMemo<Testimonial[]>(() => {
    const publishedReviews: Testimonial[] = [...adminReviews]
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
        source: "instagram",
      }));

    return [
      ...existingInstagramTestimonials,
      ...publishedReviews,
    ];
  }, [adminReviews]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activeTestimonial =
    activeIndex !== null
      ? testimonials[activeIndex]
      : null;

  const closeViewer = () => {
    setActiveIndex(null);
  };

  const next = () => {
    if (activeIndex === null || testimonials.length === 0) {
      return;
    }

    setActiveIndex(
      (activeIndex + 1) % testimonials.length
    );
  };

  const previous = () => {
    if (activeIndex === null || testimonials.length === 0) {
      return;
    }

    setActiveIndex(
      (activeIndex - 1 + testimonials.length) %
        testimonials.length
    );
  };

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeViewer();
      }

      if (event.key === "ArrowRight") {
        next();
      }

      if (event.key === "ArrowLeft") {
        previous();
      }
    };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [activeIndex, testimonials.length]);

  return (
    <main className="min-h-screen bg-[#f7f3eb] text-[#151515]">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden bg-black px-5 pb-20 pt-28 text-white sm:px-8 sm:pb-24 sm:pt-32 lg:px-12">

        {/* Ambient gold glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(214,173,77,.11) 0%, rgba(214,173,77,.035) 42%, transparent 72%)",
          }}
        />

        <div className="relative mx-auto max-w-5xl text-center">

          <p className="mb-5 text-[10px] font-semibold uppercase tracking-[0.38em] text-[#d6ad4d] sm:text-xs">
            Customer Love
          </p>

          <h1 className="font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl">
            100+ Orders.
            <br />
            <span className="text-[#e2c46e]">
              Countless Compliments.
            </span>{" "}
            ✨
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
            Real words, real moments, real love from
            the T&M family.
          </p>

          <div className="mx-auto mt-9 flex items-center justify-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/35">
            <span className="h-px w-8 bg-[#d6ad4d]/35" />
            <span>Shared on Instagram</span>
            <span className="h-px w-8 bg-[#d6ad4d]/35" />
          </div>

        </div>
      </section>


      {/* =====================================================
          TRUST STRIP
      ====================================================== */}

      <section className="border-b border-black/[0.07] bg-[#fbf8f1]">
        <div className="mx-auto grid max-w-5xl grid-cols-3 divide-x divide-black/[0.08]">

          <div className="px-3 py-7 text-center sm:py-9">
            <p className="font-serif text-2xl sm:text-3xl">
              100+
            </p>

            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-black/40 sm:text-[9px]">
              Orders Delivered
            </p>
          </div>

          <div className="px-3 py-7 text-center sm:py-9">


            <p className="mt-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-black/40 sm:text-[9px]">
              Instagram Love
            </p>
          </div>

          <div className="px-3 py-7 text-center sm:py-9">
            <p className="font-serif text-2xl sm:text-3xl">
              ∞
            </p>

            <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.2em] text-black/40 sm:text-[9px]">
              Beautiful Moments
            </p>
          </div>

        </div>
      </section>


      {/* =====================================================
          TESTIMONIAL GALLERY
      ====================================================== */}

      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex flex-col justify-between gap-4 sm:mb-14 sm:flex-row sm:items-end">

            <div>
              <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#a17a28]">
                From Instagram
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl">
                Words That Made Us Smile
              </h2>
            </div>

            <p className="max-w-sm text-xs leading-6 text-black/45 sm:text-right">
              Every message here comes from our real
              Instagram customer conversations.
            </p>

          </div>


          {/* =================================================
              MASONRY GRID
          ================================================= */}

          {isLoading && testimonials.length === 0 ? (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[4/5] animate-pulse rounded-2xl bg-black/[0.05]"
                />
              ))}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 xl:columns-4">

              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className="group mb-5 block w-full break-inside-avoid text-left outline-none"
                >

                  <div className="relative overflow-hidden rounded-2xl bg-white shadow-[0_10px_35px_rgba(0,0,0,.07)] transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(0,0,0,.12)]">

                    <img
                      src={testimonial.image}
                      alt={
                        testimonial.reviewText ||
                        `Instagram testimonial from ${testimonial.customerName}`
                      }
                      loading={
                        index < 4
                          ? "eager"
                          : "lazy"
                      }
                      className="block h-auto w-full transition duration-700 group-hover:scale-[1.015]"
                    />

                    {/* Hover overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/80 via-black/45 to-transparent px-5 pb-5 pt-16 transition duration-500 group-hover:translate-y-0">

                      <div className="flex items-center gap-2 text-white">

                        <InstagramIcon className="h-4 w-4" />

                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
                          Instagram
                        </span>

                      </div>

                      <p className="mt-2 truncate text-xs text-white/70">
                        {testimonial.customerName}
                      </p>

                    </div>

                  </div>

                </button>
              ))}

            </div>
          ) : (
            <div className="rounded-2xl border border-black/[0.08] bg-white px-6 py-16 text-center">
              <p className="font-serif text-2xl">
                Customer love is coming soon. ✨
              </p>
            </div>
          )}

        </div>
      </section>


      {/* =====================================================
          SPOTTED ON YOU
      ====================================================== */}

      <section className="bg-black px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">

        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.34em] text-[#d6ad4d]">
            Spotted on You
          </p>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl">
            Your T&M Moments 🤍
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/50">
            We love seeing how you style your T&M
            pieces. Tag us and your moment could be
            featured here next.
          </p>

          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#d6ad4d]/40 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#e2c46e] transition hover:border-[#d6ad4d] hover:bg-[#d6ad4d]/10"
          >
            <InstagramIcon className="h-4 w-4" />
            Follow T&M on Instagram
          </a>

        </div>

      </section>


      {/* =====================================================
          SHOP CTA
      ====================================================== */}

      <section className="bg-[#f7f3eb] px-5 py-20 sm:px-8 lg:px-12">

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-[9px] font-semibold uppercase tracking-[0.34em] text-[#a17a28]">
            Your Turn
          </p>

          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl">
            Ready to find your next favourite?
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-black/45">
            Discover pieces made to be worn,
            loved and remembered.
          </p>

          <a
            href="/shop"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-black px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-[#191919]"
          >
            Shop Jewellery
            <ArrowRight className="h-4 w-4" />
          </a>

        </div>

      </section>


      {/* =====================================================
          FULL SCREEN VIEWER
      ====================================================== */}

      {activeTestimonial && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 p-3 backdrop-blur-md sm:p-6"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget
            ) {
              closeViewer();
            }
          }}
        >

          {/* Close */}
          <button
            type="button"
            onClick={closeViewer}
            aria-label="Close testimonial"
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-[#d6ad4d]/60 hover:text-[#e2c46e]"
          >
            <X className="h-5 w-5" />
          </button>


          {/* Previous */}
          <button
            type="button"
            onClick={previous}
            aria-label="Previous testimonial"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-[#d6ad4d]/60 hover:text-[#e2c46e] sm:left-6"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>


          {/* Image */}
          <div className="relative flex max-h-[92vh] max-w-[92vw] items-center justify-center">

            <img
              key={activeTestimonial.id}
              src={activeTestimonial.image}
              alt={
                activeTestimonial.reviewText ||
                `Instagram testimonial from ${activeTestimonial.customerName}`
              }
              className="max-h-[88vh] max-w-[88vw] rounded-xl object-contain shadow-2xl"
            />

          </div>


          {/* Next */}
          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white transition hover:border-[#d6ad4d]/60 hover:text-[#e2c46e] sm:right-6"
          >
            <ChevronRight className="h-5 w-5" />
          </button>


          {/* Bottom information */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-center">

            <div className="flex items-center justify-center gap-2 text-[#e2c46e]">
              <InstagramIcon className="h-4 w-4" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.22em]">
                Instagram Customer
              </span>
            </div>

            <p className="mt-2 text-xs text-white/55">
              {activeTestimonial.customerName}
            </p>

            <p className="mt-1 text-[9px] text-white/25">
              {activeIndex !== null
                ? `${activeIndex + 1} / ${testimonials.length}`
                : ""}
            </p>

          </div>

        </div>
      )}

    </main>
  );
}