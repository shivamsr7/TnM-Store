import { ChevronLeft, ChevronRight } from "lucide-react";

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
      <button
        onClick={onPrev}
        className="absolute left-6 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <button
        onClick={onNext}
        className="absolute right-6 top-1/2 z-30 -translate-y-1/2 rounded-full bg-white/10 p-3 backdrop-blur transition hover:bg-white/20"
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>
    </>
  );
}