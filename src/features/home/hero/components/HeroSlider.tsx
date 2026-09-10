import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroProgress from "./HeroProgress";
import HeroSlide from "./HeroSlide";
import HeroDots from "./HeroDots";
import HeroControls from "./HeroControls";

import { useHeroSettings } from "../hooks/useHeroSettings";
import { useHeroBanners } from "../hooks/useHeroBanner";

import {
  HERO_AUTOPLAY_DELAY,
} from "../constants/constants";

export default function HeroSlider() {
  const {
    data: banners = [],
    isLoading,
  } = useHeroBanners();

  const [current, setCurrent] =
    useState(0);

  const [paused, setPaused] =
    useState(false);

  const [progress, setProgress] =
    useState(0);

  const {
    data: settings,
  } = useHeroSettings();

  /*
   * =========================================================
   * BANNER ASPECT RATIO
   * =========================================================
   *
   * Desktop + Mobile:
   * 2:1
   *
   * Example:
   * 1200 × 600
   *
   * The height automatically adapts
   * to the available width.
   *
   * =========================================================
   */

  const bannerAspect =
    "aspect-[2/1]";

  /*
   * =========================================================
   * RESET INDEX IF BANNERS CHANGE
   * =========================================================
   */

  useEffect(() => {
    if (
      current >=
      banners.length
    ) {
      setCurrent(0);
    }
  }, [
    banners,
    current,
  ]);

  /*
   * =========================================================
   * NEXT SLIDE
   * =========================================================
   */

  const next = () => {
    setProgress(0);

    setCurrent(
      (prev) =>
        (prev + 1) %
        banners.length
    );
  };

  /*
   * =========================================================
   * PREVIOUS SLIDE
   * =========================================================
   */

  const prev = () => {
    setProgress(0);

    setCurrent(
      (prev) =>
        (
          prev - 1 +
          banners.length
        ) %
        banners.length
    );
  };

  /*
   * =========================================================
   * AUTO SLIDE
   * =========================================================
   */

  useEffect(() => {
    if (paused) return;

    if (banners.length <= 1) {
      return;
    }

    const timer =
      window.setInterval(
        next,
        settings?.autoplay_speed ??
          5000
      );

    return () =>
      clearInterval(timer);
  }, [
    banners.length,
    paused,
    settings?.autoplay_speed,
  ]);

  /*
   * =========================================================
   * PROGRESS BAR
   * =========================================================
   */

  useEffect(() => {
    if (paused) return;

    if (banners.length <= 1) {
      return;
    }

    setProgress(0);

    const start =
      Date.now();

    const interval =
      window.setInterval(() => {
        const elapsed =
          Date.now() -
          start;

        const percent =
          Math.min(
            (
              elapsed /
              HERO_AUTOPLAY_DELAY
            ) * 100,
            100
          );

        setProgress(percent);
      }, 50);

    return () =>
      clearInterval(interval);
  }, [
    current,
    paused,
    banners.length,
  ]);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <div
        className={`
          relative
          w-full
          ${bannerAspect}
          animate-pulse
          overflow-hidden
          rounded-lg
          bg-neutral-200
        `}
      />
    );
  }

  /*
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  if (!banners.length) {
    return (
      <div
        className={`
          flex
          w-full
          ${bannerAspect}
          items-center
          justify-center
          rounded-lg
          bg-neutral-100
        `}
      >
        <p className="text-neutral-500">
          No active homepage banners found.
        </p>
      </div>
    );
  }

  const currentBanner =
    banners[current];

  /*
   * =========================================================
   * MAIN SLIDER
   * =========================================================
   */

  return (
    <div
      className={`
        relative
        w-full
        ${bannerAspect}
        overflow-hidden
        shadow-[0_30px_80px_rgba(0,0,0,0.18)]
      `}
      onMouseEnter={() =>
        setPaused(true)
      }
      onMouseLeave={() =>
        setPaused(false)
      }
    >
      {/* =====================================================
          SLIDE
      ====================================================== */}

      <AnimatePresence mode="wait">
        <motion.div
          key={
            currentBanner.id
          }
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration:
              (
                settings?.transition_duration ??
                800
              ) / 1000,

            ease: "easeInOut",
          }}
          className="
            absolute
            inset-0
            h-full
            w-full
          "
          drag="x"
          dragConstraints={{
            left: 0,
            right: 0,
          }}
          dragElastic={0.15}
          onDragEnd={(
            _,
            info
          ) => {
            if (
              !settings?.enable_swipe
            ) {
              return;
            }

            const threshold =
              80;

            if (
              info.offset.x <
              -threshold
            ) {
              next();
            }

            if (
              info.offset.x >
              threshold
            ) {
              prev();
            }
          }}
        >
          <HeroSlide
            banner={
              currentBanner
            }
          />
        </motion.div>
      </AnimatePresence>

      {/* =====================================================
          ARROWS
      ====================================================== */}

      {settings?.show_arrows !==
        false && (
        <HeroControls
          onPrev={prev}
          onNext={next}
        />
      )}

      {/* =====================================================
          DOTS
      ====================================================== */}

      {settings?.show_dots !==
        false && (
        <HeroDots
          total={
            banners.length
          }
          current={
            current
          }
          onSelect={
            setCurrent
          }
        />
      )}

      {/* =====================================================
          PROGRESS
      ====================================================== */}

      {settings?.show_progress !==
        false && (
        <HeroProgress
          progress={
            progress
          }
        />
      )}
    </div>
  );
}