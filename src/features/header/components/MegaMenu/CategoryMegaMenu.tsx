import { AnimatePresence, motion } from "framer-motion";
import { useCategories } from "@/features/categories";
import MenuColumn from "./MenuColumn";
import FeaturedColumn from "./FeaturedColumn";
import ShopMoreColumn from "./ShopMoreColumn";

interface CategoryMegaMenuProps {
  open: boolean;
  onClose: () => void;
}

export default function CategoryMegaMenu({
  open,
  onClose,
}: CategoryMegaMenuProps) {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{
            duration: 0.22,
            ease: "easeOut",
          }}
          onMouseLeave={onClose}
          className="absolute left-1/2 top-full z-50 mt-3 -translate-x-1/2"
        >
          <div className="w-[980px] rounded-3xl border border-neutral-200 bg-white shadow-[0_25px_60px_rgba(0,0,0,0.12)]">

            <div className="grid grid-cols-3 gap-10 p-10">

              <MenuColumn
                categories={categories}
                loading={isLoading}
              />

              <FeaturedColumn />

              <ShopMoreColumn />

            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}