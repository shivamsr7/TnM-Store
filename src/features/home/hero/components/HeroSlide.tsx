import { useRef } from "react";

import HeroFrame from "./HeroFrame";
import type { HeroBanner } from "../types/hero.types";

interface HeroSlideProps {
  banner: HeroBanner;
  onBannerClick?: () => void;
}

export default function HeroSlide({
  banner,
  onBannerClick,
}: HeroSlideProps) {
  const pointerStartX = useRef<number | null>(null);
  const pointerStartY = useRef<number | null>(null);

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    pointerStartX.current =
      event.clientX;

    pointerStartY.current =
      event.clientY;
  };

  const handlePointerUp = (
    event: React.PointerEvent<HTMLDivElement>
  ) => {
    if (
      pointerStartX.current === null ||
      pointerStartY.current === null
    ) {
      return;
    }

    const deltaX =
      Math.abs(
        event.clientX -
          pointerStartX.current
      );

    const deltaY =
      Math.abs(
        event.clientY -
          pointerStartY.current
      );

    pointerStartX.current = null;
    pointerStartY.current = null;

    /*
     * If the user moved their finger/mouse,
     * treat it as a swipe/drag and DON'T navigate.
     *
     * A small movement is considered a click.
     */
    if (
      deltaX > 10 ||
      deltaY > 10
    ) {
      return;
    }

    if (
      banner.button_link &&
      onBannerClick
    ) {
      onBannerClick();
    }
  };

  return (
    <div
      className="
        absolute
        inset-0
        h-full
        w-full
        overflow-hidden
        cursor-pointer
      "
      onPointerDown={
        handlePointerDown
      }
      onPointerUp={
        handlePointerUp
      }
    >
      {/* =====================================================
          BACKGROUND IMAGE
      ====================================================== */}

      <picture>
        {banner.mobile_image_url && (
          <source
            media="(max-width:768px)"
            srcSet={
              banner.mobile_image_url
            }
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
          Only shown when overlay content is enabled.
          
          Mobile remains clear/light.
      ====================================================== */}

      {banner.show_overlay_content && (
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
      )}

      {/* =====================================================
          SHIMMER
      ====================================================== */}

      <HeroFrame />

      {/* =====================================================
          OVERLAY CONTENT
          -----------------------------------------------------
          When OFF, the banner is displayed as pure artwork.
      ====================================================== */}

      {banner.show_overlay_content && (
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
            {/* =================================================
                SUBTITLE
            ================================================== */}

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

            {/* =================================================
                TITLE
            ================================================== */}

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

            {/* =================================================
                BUTTON
            ================================================== */}

            {banner.button_text &&
              banner.button_link && (
                <div className="mt-10">
                  <a
                    href={
                      banner.button_link
                    }
                    onPointerDown={(
                      event
                    ) => {
                      event.stopPropagation();
                    }}
                    onPointerUp={(
                      event
                    ) => {
                      event.stopPropagation();
                    }}
                    onClick={(
                      event
                    ) => {
                      event.stopPropagation();
                    }}
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
                    {
                      banner.button_text
                    }
                  </a>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}