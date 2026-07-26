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
interface HeroSliderProps {
  variant?: "default" | "expanded";
}

export default function HeroSlider({
  variant = "default",
}: HeroSliderProps) {
  const { data: banners = [], isLoading } = useHeroBanners();

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
const [progress, setProgress] = useState(0);
const { data: settings } = useHeroSettings();
const sliderHeight =
  variant === "expanded"
    ? "h-[620px]"
    : "h-[405px]";
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

const timer = window.setInterval(
  next,
  settings?.autoplay_speed ?? 5000
);

    return () => clearInterval(timer);
  }, [banners.length, paused]);

  useEffect(() => {
  if (paused) return;

  if (banners.length <= 1) return;

  setProgress(0);

  const start = Date.now();

  const interval = window.setInterval(() => {
    const elapsed = Date.now() - start;

    const percent = Math.min(
      (elapsed / HERO_AUTOPLAY_DELAY) * 100,
      100
    );

    setProgress(percent);
  }, 50);

  return () => clearInterval(interval);
}, [current, paused, banners.length]);
const next = () => {
  setProgress(0);

  setCurrent((prev) => (prev + 1) % banners.length);
};

const prev = () => {
  setProgress(0);

  setCurrent((prev) => (prev - 1 + banners.length) % banners.length);
};

  if (isLoading) {
    return (
      <div
  className={`relative ${sliderHeight} animate-pulse rounded-lg bg-neutral-200`}
/>
    );
  }

  if (!banners.length) {
    return (
      <div
  className={`flex ${sliderHeight} items-center justify-center rounded-lg bg-neutral-100`}
>
        <p className="text-neutral-500">
          No active homepage banners found.
        </p>
      </div>
    );
  }
const currentBanner = banners[current];

  return (
    <div
className={`relative ${sliderHeight} overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.18)]`}
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
      duration:
(settings?.transition_duration ?? 800) / 1000,
      ease: "easeInOut",
    }}
    className="absolute inset-0"

    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    dragElastic={0.15}

    onDragEnd={(_, info) => {
     if (!settings?.enable_swipe) return;

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

      {settings?.show_arrows !== false && (
  <HeroControls
    onPrev={prev}
    onNext={next}
  />
)}

      {settings?.show_dots !== false && (
  <HeroDots
    total={banners.length}
    current={current}
    onSelect={setCurrent}
  />
)}
      {settings?.show_progress !== false && (
  <HeroProgress progress={progress} />
)}
    </div>
  );
}