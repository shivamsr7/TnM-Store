import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import HeroSlide from "./HeroSlide";
import HeroDots from "./HeroDots";
import HeroControls from "./HeroControls";

import { useHeroBanners } from "../hooks/useHeroBanner";

import {
    HERO_AUTOPLAY_DELAY,
    HERO_FADE_DURATION,
} from "../constants/constants";
export default function HeroSlider() {
  const { data: banners = [], isLoading } = useHeroBanners();

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  // Reset index if banners change
  useEffect(() => {
    if (current >= banners.length) {
      setCurrent(0);
    }
  }, [banners, current]);

  // Auto slide
  useEffect(() => {
    if (paused) return;

    if (banners.length <= 1) return;

const timer = window.setInterval(() => {
  setCurrent((prev) => (prev + 1) % banners.length);
}, HERO_AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [banners.length, paused]);

  const next = () => {
    setCurrent((prev) => (prev + 1) % banners.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (isLoading) {
    return (
      <div className="relative h-[405px] animate-pulse rounded-lg bg-neutral-200" />
    );
  }

  if (!banners.length) {
    return (
      <div className="flex h-[405px] items-center justify-center rounded-lg bg-neutral-100">
        <p className="text-neutral-500">
          No active homepage banners found.
        </p>
      </div>
    );
  }
const currentBanner = banners[current];
  return (
    <div
      className="relative h-[405px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
  <motion.div
    key={currentBanner.id}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{
      duration: HERO_FADE_DURATION,
      ease: "easeInOut",
    }}
    className="absolute inset-0"

    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.15}

    onDragEnd={(_, info) => {
      const threshold = 80;

      if (info.offset.x < -threshold) {
        next();
      }

      if (info.offset.x > threshold) {
        prev();
      }
    }}
  >
    <HeroSlide banner={currentBanner} />
  </motion.div>
</AnimatePresence>

      <HeroControls
        onPrev={prev}
        onNext={next}
      />

      <HeroDots
        total={banners.length}
        current={current}
        onSelect={setCurrent}
      />
    </div>
  );
}