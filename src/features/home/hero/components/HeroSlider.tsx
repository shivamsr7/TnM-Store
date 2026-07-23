import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useHeroBanners } from "../hooks/useHeroBanner";
import HeroSlide from "./HeroSlide";
import HeroControls from "./HeroControls";
import HeroDots from "./HeroDots";

const AUTO_SLIDE_INTERVAL = 5000;

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
    }, AUTO_SLIDE_INTERVAL);

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

  return (
    <div
      className="relative h-[405px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={banners[current].id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-0"
        >
          <HeroSlide banner={banners[current]} />
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