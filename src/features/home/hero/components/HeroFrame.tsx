export default function HeroFrame() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hero-shimmer absolute -left-1/2 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}