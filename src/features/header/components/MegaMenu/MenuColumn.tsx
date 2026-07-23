import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
interface Props {
  categories: any[];
  loading: boolean;
}

export default function MenuColumn({
  categories,
  loading,
}: Props) {
  return (
    <div>
      <h3 className="mb-5 text-lg font-semibold text-black">
        Shop by Category
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-5 w-36 animate-pulse rounded bg-neutral-200"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {categories.map((category) => (
            <Link
  key={category.id}
  to={`/shop?category=${category.slug}`}
  className="group flex items-center justify-between rounded-xl px-3 py-2 transition duration-300 hover:bg-[#F8F6F1]"
>
  <span className="text-neutral-700 transition-colors duration-300 group-hover:text-[#C8A44D]">
    {category.name}
  </span>

  <ChevronRight className="h-4 w-4 translate-x-0 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-[#C8A44D]" />
</Link>
          ))}
        </div>
      )}
    </div>
  );
}