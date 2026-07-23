interface HeroProgressProps {
  progress: number;
}

export default function HeroProgress({
  progress,
}: HeroProgressProps) {
  return (
    <div className="absolute bottom-0 left-0 z-40 h-1 w-full bg-white/15">
      <div
        className="h-full bg-[#C8A44D] transition-[width] duration-100 ease-linear"
        style={{
          width: `${progress}%`,
        }}
      />
    </div>
  );
}