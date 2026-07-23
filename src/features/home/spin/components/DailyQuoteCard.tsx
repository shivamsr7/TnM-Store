const quotes = [
  "Jewellery is the most beautiful way to express yourself.",
  "Luxury is in every little detail.",
  "Elegance never goes out of style.",
  "Every piece tells a story.",
  "Wear confidence. Wear sparkle.",
];

const quote =
  quotes[new Date().getDate() % quotes.length];

export default function DailyQuoteCard() {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#faf8f5] px-8 text-center">

      <span className="mb-4 text-4xl">✨</span>

      <h3 className="mb-6 text-xl font-semibold">
        Jewellery Quote
      </h3>

      <p className="text-lg leading-8 text-neutral-600 italic">
        "{quote}"
      </p>

    </div>
  );
}