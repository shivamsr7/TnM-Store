export default function TMJewelsDivider() {
  return (
    <section
      className="
        bg-black
        px-5
        py-3
        sm:py-4
        md:py-5
      "
      aria-label="T&M Jewels"
    >
      <div
        className="
          mx-auto
          flex
          max-w-3xl
          items-center
          justify-center
          gap-3
          sm:gap-4
        "
      >
        {/* Left line */}
        <div
          className="
            h-px
            flex-1
            bg-gradient-to-r
            from-transparent
            via-[#8F6B20]
            to-[#D4AF37]
          "
        />

        {/* Center */}
        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            sm:gap-2
          "
        >
          <span className="text-[8px] text-[#D4AF37]">
            ✦
          </span>

          <span
            className="
              text-[9px]
              font-medium
              uppercase
              tracking-[0.32em]
              text-[#D4AF37]
              sm:text-[10px]
              sm:tracking-[0.38em]
            "
          >
            T&M JEWELS
          </span>

          <span className="text-[8px] text-[#D4AF37]">
            ✦
          </span>
        </div>

        {/* Right line */}
        <div
          className="
            h-px
            flex-1
            bg-gradient-to-l
            from-transparent
            via-[#8F6B20]
            to-[#D4AF37]
          "
        />
      </div>
    </section>
  );
}