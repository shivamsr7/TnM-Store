import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="Scroll to top"
      className="
        fixed

        right-4

        /* =================================================
           DESKTOP
        ================================================== */

        bottom-6

        z-[300]

        flex
        h-11
        w-11

        items-center
        justify-center

        rounded-full

        border
        border-[#D4AF37]/50

        bg-black/70

        backdrop-blur-md

        text-[#D4AF37]

        shadow-[0_0_25px_rgba(212,175,55,0.25)]

        transition-all
        duration-300

        hover:-translate-y-1
        hover:bg-[#D4AF37]
        hover:text-black

        /* =================================================
           MOBILE
           
           Bottom navigation:
           4rem + safe-area

           Sticky cart:
           approximately 5.5rem

           Scroll button:
           positioned ABOVE both
        ================================================== */

        sm:right-5

        max-sm:bottom-[calc(4rem+env(safe-area-inset-bottom)+5.5rem)]

        max-sm:right-4
      "
    >
      <ChevronUp
        size={22}
        strokeWidth={2}
      />
    </button>
  );
}