interface HeroDotsProps {
  total: number;
  current: number;
  onSelect: (index: number) => void;
}

export default function HeroDots({
  total,
  current,
  onSelect,
}: HeroDotsProps) {
  if (total <= 1) return null;

  return (
    <div className="absolute bottom-6 left-1/2 z-30 flex -translate-x-1/2 gap-3">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          className={`h-2.5 rounded-full transition-all duration-300 ${
            current === index
              ? "w-8 bg-[#C8A44D]"
              : "w-2.5 bg-white/60 hover:bg-white"
          }`}
        />
      ))}
    </div>
  );
}