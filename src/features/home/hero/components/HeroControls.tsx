import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HeroControlsProps {
  onPrev: () => void;
  onNext: () => void;
}

export default function HeroControls({
  onPrev,
  onNext,
}: HeroControlsProps) {
  return (
    <>
      {/* Previous */}
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous banner"
        className="
          absolute
          left-6
          top-1/2
          z-30
          hidden
          -translate-y-1/2
          rounded-full
          bg-white/10
          p-3
          backdrop-blur
          transition
          hover:bg-white/20
          lg:flex
          lg:items-center
          lg:justify-center
        "
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next banner"
        className="
          absolute
          right-6
          top-1/2
          z-30
          hidden
          -translate-y-1/2
          rounded-full
          bg-white/10
          p-3
          backdrop-blur
          transition
          hover:bg-white/20
          lg:flex
          lg:items-center
          lg:justify-center
        "
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>
    </>
  );
}