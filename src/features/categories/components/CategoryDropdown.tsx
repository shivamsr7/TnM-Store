import { ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useCategories } from "@/features/categories";

export default function CategoryDropdown() {
  const [open, setOpen] = useState(false);

  const { data: categories = [], isLoading } = useCategories();

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`group flex h-14 items-center gap-1 text-[15px] font-medium transition-colors duration-300 ${
          open ? "text-[#C8A44D]" : "text-white hover:text-[#C8A44D]"
        }`}
      >
        Shop By Category

        <ChevronDown
          size={18}
          className={`transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`absolute left-0 top-full z-50 mt-0 w-72 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-2xl transition-all duration-200 ${
          open
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2 opacity-0"
        }`}
      >
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-5 animate-pulse rounded bg-neutral-200"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="p-5 text-sm text-neutral-500">
            No categories found.
          </div>
        ) : (
          <div className="py-2">
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.slug}`}
                className="block px-5 py-3 text-sm font-medium text-neutral-700 transition-colors duration-200 hover:bg-[#F8F6F1] hover:text-[#C8A44D]"
              >
                {category.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
