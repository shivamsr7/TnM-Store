import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAnnouncements } from "@/features/home/components/AnnouncementBar/hooks/useAnnouncements";

const DISPLAY_TIME = 2000;
const ANIMATION_DURATION = 0.4;

export default function AnnouncementBar() {
  const { data = [], isLoading } = useAnnouncements();

  const announcements = useMemo(() => data, [data]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const currentId = announcements[index]?.id;

  // Auto rotate
  useEffect(() => {
    if (paused || announcements.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % announcements.length);
    }, DISPLAY_TIME + ANIMATION_DURATION * 1000);

    return () => clearInterval(timer);
  }, [paused, announcements.length]);

  // Keep index valid
  useEffect(() => {
    if (announcements.length === 0) return;

    if (index >= announcements.length) {
      setIndex(0);
    }
  }, [announcements.length, index]);

  // Preserve current announcement
  useEffect(() => {
    if (!currentId) return;

    const newIndex = announcements.findIndex(
      (item) => item.id === currentId
    );

    if (newIndex !== -1 && newIndex !== index) {
      setIndex(newIndex);
    }
  }, [announcements, currentId, index]);

  // Loading State
  if (isLoading) {
    return (
      <div
        className="relative h-10 overflow-hidden border-b"
        style={{
          background:
            "linear-gradient(90deg, #B8862E 0%, #D4AF37 30%, #E8C768 55%, #F7E3A3 80%, #FFF8E7 100%)",
          borderColor: "#C79A2F",
        }}
      >
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent)",
          }}
        />
      </div>
    );
  }

  // No active announcements
  if (announcements.length === 0) {
    return null;
  }

  return (
    <div
      className="relative flex h-10 items-center justify-center overflow-hidden border-b shadow-sm"
      style={{
        background:
          "linear-gradient(90deg, #B8862E 0%, #D4AF37 30%, #E8C768 55%, #F7E3A3 80%, #FFF8E7 100%)",
        borderColor: "#C79A2F",
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.p
          key={announcements[index].id}
          initial={{ x: "120vw" }}
          animate={{ x: 0 }}
          exit={{ x: "-120vw" }}
          transition={{
            duration: ANIMATION_DURATION,
            ease: "easeInOut",
          }}
          className="absolute whitespace-nowrap px-4 text-center text-[12px] font-semibold uppercase tracking-[0.16em] text-[#1A1A1A] drop-shadow-[0_1px_0_rgba(255,255,255,0.45)] will-change-transform sm:text-[13px] md:text-sm md:tracking-[0.18em]"
        >
          {announcements[index].message}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}