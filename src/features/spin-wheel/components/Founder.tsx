import { motion } from "framer-motion";

interface FounderProps {
  image: string;
  isPushing: boolean;
}

export default function Founder({
  image,
  isPushing,
}: FounderProps) {
  return (
    <motion.div
     animate={
  isPushing
    ? {
        x: -10,
        rotate: -2,
        scale: 1.02,
      }
    : {
        x: 0,
        rotate: -2,
        scale: 1,
      }
}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="
        absolute
        right-[20px]
        top-1/2
        -translate-y-1/2
        z-10
        pointer-events-none
        select-none
      "
    >
      {/* Gold Glow */}
      <div
        className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          -z-10
        "
      >
        <div
          className="
            h-[300px]
            w-[300px]
            rounded-full
            bg-[#D4AF37]/15
            blur-3xl
          "
        />
      </div>

      <img
        src={image}
        alt="Founder"
        draggable={false}
        className="
          h-[150px]
          w-auto
          object-contain
          drop-shadow-[0_25px_40px_rgba(0,0,0,.25)]
        "
      />
    </motion.div>
  );
}