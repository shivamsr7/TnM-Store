import { useEffect, useState } from "react";

const cards = [
  {
    icon: "✨",
    title: "Jewellery Quote",
    content: "Jewellery is the most beautiful way to express yourself.",
  },
  {
    icon: "💎",
    title: "Jewellery Care",
    content: "Store your jewellery separately to keep it shining for years.",
  },
  {
    icon: "⭐",
    title: "Customer Love",
    content: "“Absolutely loved the quality. Looks even better in person!”",
  },
  {
    icon: "🔥",
    title: "Today's Pick",
    content: "Anti Tarnish Clover Bracelet is trending this week.",
  },
  {
    icon: "🎁",
    title: "Today's Offer",
    content: "Spin the wheel to unlock exciting discounts & surprise gifts.",
  },
];

export default function InfoCard() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % cards.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const card = cards[index];

 return (
  <div className="h-full w-full bg-[#F8F6F2]">

    <div className="flex h-full w-full flex-col items-center justify-center px-6">

      {/* Gold Accent */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-white/40 text-3xl backdrop-blur-md shadow-md">
        {card.icon}
      </div>

      {/* Title */}
      <h3 className="text-center text-2xl font-semibold text-neutral-900">
        {card.title}
      </h3>

      {/* Divider */}
      <div className="my-4 h-px w-20 bg-gradient-to-r from-transparent via-[#C8A44D] to-transparent" />

      {/* Content */}
      <p className="max-w-xs text-center text-[15px] leading-7 text-neutral-600">
        {card.content}
      </p>

      {/* Indicators */}
      <div className="mt-8 flex gap-2">
        {cards.map((_, i) => (
          <div
            key={i}
            className={`transition-all duration-300 ${
              index === i
                ? "h-2 w-8 rounded-full bg-[#D4AF37]"
                : "h-2 w-2 rounded-full bg-neutral-300"
            }`}
          />
        ))}
      </div>

    </div>

  </div>
);
}