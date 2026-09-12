import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import logo from "@/assets/logo/mainLogo.png";

export default function PageTransitionLoader() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only show the transition when moving between actual pages.
    // Query-string changes (filters/sorting) do not trigger it.
    setVisible(true);

    const timer = window.setTimeout(() => {
      setVisible(false);
    }, 650);

    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  if (!visible) return null;

  return (
    <div
      aria-live="polite"
      aria-label="Loading page"
      className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center bg-[#050505]"
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Soft ambient glow */}
        <div className="absolute h-44 w-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />

        {/* Elegant gold orbit */}
        <div className="relative flex h-28 w-28 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#D4AF37]/20" />

          <span className="absolute inset-1 rounded-full border border-[#D4AF37]/40 border-t-[#F7E3A3] animate-[spin_1.1s_linear_infinite]" />

          <span className="absolute inset-4 rounded-full border border-white/5" />

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#0b0b0b] shadow-[0_0_40px_rgba(212,175,55,0.14)]">
            <img
              src={logo}
              alt="T&M Jewels"
              className="w-12 object-contain opacity-95"
            />
          </div>
        </div>

        {/* Brand loading text */}
        <div className="mt-6 text-center">
          <p className="text-[10px] font-medium tracking-[0.38em] text-[#D4AF37]">
            T&amp;M JEWELS
          </p>

          <p className="mt-2 text-xs tracking-[0.16em] text-neutral-500">
            Curating your sparkle...
          </p>
        </div>

        {/* Tiny progress line */}
        <div className="mt-5 h-px w-24 overflow-hidden bg-white/10">
          <div className="h-full w-1/2 animate-[loaderSlide_0.65s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
        </div>
      </div>

      <style>{`
        @keyframes loaderSlide {
          0% { transform: translateX(-120%); }
          100% { transform: translateX(220%); }
        }
      `}</style>
    </div>
  );
}
