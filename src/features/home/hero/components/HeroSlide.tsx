import HeroFrame from "./HeroFrame";
import type { HeroBanner } from "../types/hero.types";

interface HeroSlideProps {
  banner: HeroBanner;
}

export default function HeroSlide({
  banner,
}: HeroSlideProps) {
  return (
    <div className="absolute inset-0 h-full w-full overflow-hidden">

      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}

      <picture>
        {banner.mobile_image_url && (
          <source
            media="(max-width:768px)"
            srcSet={banner.mobile_image_url}
          />
        )}

        <img
          src={banner.image_url}
          alt={banner.title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
          "
          draggable={false}
        />
      </picture>


      {/* =====================================================
          DESKTOP OVERLAY
          -----------------------------------------------------
          Keep the existing dark gradient for desktop banners.
          Mobile banners remain completely clear/light.
      ====================================================== */}

      <div
        className="
          absolute
          inset-0
          hidden
          lg:block
          bg-gradient-to-r
          from-black/70
          via-black/35
          to-transparent
        "
      />


      {/* =====================================================
          SHIMMER
      ====================================================== */}

      <HeroFrame />


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div
        className="
          relative
          z-10
          flex
          h-full
          items-center
        "
      >

        <div
          className="
            max-w-2xl
            px-12
            lg:px-20
          "
        >

          {/* SUBTITLE */}

          {banner.subtitle && (
            <p
              className="
                mb-3
                text-sm
                font-medium
                uppercase
                tracking-[4px]
                text-[#D4AF37]
              "
            >
              {banner.subtitle}
            </p>
          )}


          {/* TITLE */}

          <h1
            className="
              text-4xl
              font-bold
              text-white
              lg:text-5xl
            "
          >
            {banner.title}
          </h1>


          {/* BUTTON */}

          {banner.button_text &&
            banner.button_link && (
              <div className="mt-10">

                <a
                  href={
                    banner.button_link
                  }
                  className="
                    inline-flex
                    rounded-full
                    bg-[#C8A44D]
                    px-8
                    py-4
                    font-semibold
                    text-black
                    transition-all
                    duration-300
                    hover:scale-105
                    hover:bg-[#D4AF37]
                  "
                >
                  {banner.button_text}
                </a>

              </div>
            )}

        </div>

      </div>

    </div>
  );
}