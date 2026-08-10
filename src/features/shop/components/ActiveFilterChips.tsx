import {
  X,
  SlidersHorizontal,
} from "lucide-react";


interface ActiveFilterChipsProps {

  minPrice: number;

  maxPrice: number | null;

  inStock: boolean;

  onSale: boolean;

  minDiscount: number;

  minRating: number;

  bestSeller: boolean;

  newArrival: boolean;

  trending: boolean;

  editorsPick: boolean;

  featured: boolean;

  onRemove: (
    key: string
  ) => void;

  onClear: () => void;
}


export default function ActiveFilterChips({

  minPrice,
  maxPrice,

  inStock,
  onSale,

  minDiscount,
  minRating,

  bestSeller,
  newArrival,
  trending,
  editorsPick,
  featured,

  onRemove,
  onClear,

}: ActiveFilterChipsProps) {


  const chips: {
    key: string;
    label: string;
  }[] = [];


  /* =========================================================
     Price
  ========================================================= */

  if (
    minPrice > 0 ||
    maxPrice !== null
  ) {

    let label = "";


    if (
      minPrice > 0 &&
      maxPrice !== null
    ) {

      label =
        `₹${minPrice.toLocaleString()} – ₹${maxPrice.toLocaleString()}`;

    } else if (
      minPrice > 0
    ) {

      label =
        `₹${minPrice.toLocaleString()}+`;

    } else {

      label =
        `Under ₹${maxPrice?.toLocaleString()}`;

    }


    chips.push({
      key: "price",
      label,
    });

  }


  /* =========================================================
     Availability
  ========================================================= */

  if (inStock) {

    chips.push({
      key: "inStock",
      label: "In Stock",
    });

  }


  /* =========================================================
     Sale
  ========================================================= */

  if (onSale) {

    chips.push({
      key: "onSale",
      label: "On Sale",
    });

  }


  /* =========================================================
     Discount
  ========================================================= */

  if (minDiscount > 0) {

    chips.push({
      key: "discount",
      label: `${minDiscount}%+ Off`,
    });

  }


  /* =========================================================
     Rating
  ========================================================= */

  if (minRating > 0) {

    chips.push({
      key: "rating",
      label: `${minRating}★ & above`,
    });

  }


  /* =========================================================
     Collection Flags
  ========================================================= */

  if (bestSeller) {

    chips.push({
      key: "bestSeller",
      label: "Best Seller",
    });

  }


  if (newArrival) {

    chips.push({
      key: "newArrival",
      label: "New Arrival",
    });

  }


  if (trending) {

    chips.push({
      key: "trending",
      label: "Trending",
    });

  }


  if (editorsPick) {

    chips.push({
      key: "editorsPick",
      label: "Editor's Pick",
    });

  }


  if (featured) {

    chips.push({
      key: "featured",
      label: "Featured",
    });

  }


  /* =========================================================
     Nothing Active
  ========================================================= */

  if (!chips.length) {
    return null;
  }


  /* =========================================================
     Render
  ========================================================= */

  return (

    <div
      className="
        mb-5
        overflow-hidden
        rounded-2xl
        border
        border-neutral-200
        bg-white
        shadow-[0_4px_18px_rgba(0,0,0,0.05)]
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
          px-3
          py-3
          sm:px-4
          sm:py-3.5
        "
      >

        {/* ===================================================
            Filter Label
        ==================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-1.5
            border-r
            border-neutral-200
            pr-3
            sm:pr-4
          "
        >

          <SlidersHorizontal
            size={14}
            className="
              text-[#B58A25]
            "
          />

          <span
            className="
              hidden
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-neutral-500
              sm:block
            "
          >
            Filters
          </span>

        </div>


        {/* ===================================================
            Chips
        ==================================================== */}

        <div
          className="
            flex
            min-w-0
            flex-1
            items-center
            gap-2
            overflow-x-auto
            pb-0.5
            scrollbar-hide
          "
        >

          {chips.map(
            (chip) => (

              <button
                key={chip.key}
                type="button"
                onClick={() =>
                  onRemove(
                    chip.key
                  )
                }
                className="
                  group
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#D4AF37]/30
                  bg-[#FFF9E8]
                  px-3
                  py-1.5
                  text-[10px]
                  font-medium
                  text-[#8B6817]
                  shadow-[0_1px_4px_rgba(180,138,37,0.06)]
                  transition-all
                  duration-200
                  hover:border-[#D4AF37]
                  hover:bg-[#FFF4D0]
                  hover:text-[#6F5110]
                  active:scale-[0.97]
                  sm:px-3.5
                  sm:py-2
                  sm:text-[11px]
                "
              >

                <span>
                  {chip.label}
                </span>


                <span
                  className="
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-[#D4AF37]/10
                    transition
                    group-hover:bg-[#D4AF37]/20
                  "
                >

                  <X
                    size={10}
                    strokeWidth={2.5}
                  />

                </span>

              </button>

            )
          )}

        </div>


        {/* ===================================================
            Clear All
        ==================================================== */}

        <button
          type="button"
          onClick={onClear}
          className="
            shrink-0
            rounded-full
            border
            border-neutral-200
            bg-neutral-50
            px-3
            py-1.5
            text-[10px]
            font-medium
            text-neutral-500
            transition-all
            duration-200
            hover:border-red-200
            hover:bg-red-50
            hover:text-red-500
            active:scale-[0.97]
            sm:px-3.5
            sm:py-2
            sm:text-[11px]
          "
        >
          Clear all
        </button>

      </div>

    </div>

  );
}