import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const featured = [
  "New Arrivals",
  "Best Sellers",
  "Trending",
  "Gift Collection",
];

export default function FeaturedColumn() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-[#C8A44D]" />
        <h3 className="text-lg font-semibold">
          Featured
        </h3>
      </div>

      <div className="space-y-1">
        {featured.map((item) => (
          <Link
            key={item}
            to="/shop"
            className="block rounded-xl px-3 py-2 text-neutral-700 transition hover:bg-[#F8F6F1] hover:text-[#C8A44D]"
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}