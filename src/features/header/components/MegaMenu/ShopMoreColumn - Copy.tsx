import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";

const items = [
  "Under ₹299",
  "Under ₹499",
  "Anti Tarnish",
  "Premium Collection",
  "Festive Collection",
];

export default function ShopMoreColumn() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-[#C8A44D]" />

        <h3 className="text-lg font-semibold">
          Shop More
        </h3>
      </div>

      <div className="space-y-1">
        {items.map((item) => (
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