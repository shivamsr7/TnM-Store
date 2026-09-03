import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";


type SortOption =
  | "featured"
  | "newest"
  | "best-selling"
  | "trending"
  | "price-low"
  | "price-high"
  | "discount"
  | "rating";


interface Props {
  search: string;
  setSearch: (value: string) => void;

  productCount: number;

  visibleProductCount: number;

  categories: string[];
  activeCategory: string;
  setCategory: (value: string) => void;

  subcategories?: string[];

  activeSubcategory?: string | null;

  setSubcategory?: (
    value: string | null
  ) => void;

  sort: SortOption;

  setSort: (
    value: SortOption
  ) => void;

  onFilterOpen: () => void;

  filterCount?: number;
}


export default function ShopHeader({
  search,
  setSearch,
  visibleProductCount,
  categories,
  activeCategory,
  setCategory,

  subcategories = [],

  activeSubcategory = null,

  setSubcategory,

  sort,
  setSort,

  onFilterOpen,

  filterCount = 0,

}: Props) {

  return (

    <section
      className="
        mb-3
        sm:mb-4
        md:mb-5
      "
    >

      {/* =====================================================
          HERO
      ====================================================== */}

      <div
        className="
          relative
          mx-auto
          max-w-3xl
          text-center
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-28
            w-56
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#D4AF37]/[0.025]
            blur-3xl
          "
        />

        <div
          className="
            relative
          "
        >

          {/* Brand */}

          <div
            className="
              mx-auto
              mb-2
              flex
              w-fit
              items-center
              gap-2
              rounded-full
              border
              border-[#D4AF37]/15
              bg-[#D4AF37]/[0.035]
              px-3
              py-1.5
            "
          >

            <span
              className="
                h-1.5
                w-1.5
                rounded-full
                bg-[#D4AF37]
                shadow-[0_0_8px_rgba(212,175,55,0.45)]
              "
            />

            <span
              className="
                text-[8px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-[#C8A44D]
                sm:text-[9px]
              "
            >
              T&M Jewels
            </span>

          </div>


          {/* Heading */}

          <h1
            className="
              bg-gradient-to-r
              from-[#B8862E]
              via-[#F7E3A3]
              to-[#B8862E]
              bg-clip-text
              text-3xl
              font-semibold
              tracking-[-0.03em]
              text-transparent
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
            "
          >
            Shop Collection
          </h1>


          {/* Description */}

          <p
            className="
              mx-auto
              mt-2
              max-w-lg
              text-[11px]
              leading-5
              text-neutral-500
              sm:mt-2.5
              sm:text-sm
              sm:leading-6
              md:text-base
            "
          >
            Luxury inspired jewellery you'll love to wear.
            Crafted for every occasion.
          </p>

        </div>

      </div>


      {/* =====================================================
          CATEGORY NAVIGATION
      ====================================================== */}

      <div
        className="
          mt-4
          sm:mt-5
        "
      >

        <div
          className="
            flex
            gap-2
            overflow-x-auto
            px-0.5
            pb-1
            scrollbar-hide
            sm:justify-center
            sm:overflow-visible
            sm:pb-0
          "
        >

          {categories.map(
            (item) => {

              const isActive =
                activeCategory ===
                item;

              return (

                <button
                  key={item}
                  type="button"
                  onClick={() =>
                    setCategory(item)
                  }
                  aria-pressed={isActive}
                  className={`
                    shrink-0
                    rounded-full
                    border
                    px-4
                    py-2
                    text-[10px]
                    font-medium
                    transition-all
                    duration-200
                    active:scale-[0.97]

                    sm:px-5
                    sm:py-2.5
                    sm:text-xs

                    ${
                      isActive
                        ? `
                          border-[#D4AF37]
                          bg-[#D4AF37]
                          text-black
                          shadow-[0_5px_18px_rgba(212,175,55,0.12)]
                        `
                        : `
                          border-white/[0.08]
                          bg-white/[0.025]
                          text-neutral-500
                          hover:border-[#D4AF37]/35
                          hover:bg-[#D4AF37]/[0.045]
                          hover:text-[#F5E6B8]
                        `
                    }
                  `}
                >
                  {item}
                </button>

              );

            }
          )}

        </div>


        {/* ===================================================
            DYNAMIC SUBCATEGORY NAVIGATION
        ==================================================== */}

        {subcategories.length > 0 &&
          setSubcategory && (

          <div
            className="
              mt-3
              flex
              justify-center
            "
          >

            <div
              className="
                flex
                max-w-full
                gap-2
                overflow-x-auto
                px-1
                pb-1
                scrollbar-hide
              "
            >

              {/* ALL */}

              <button
                type="button"
                onClick={() =>
                  setSubcategory(null)
                }
                aria-pressed={
                  activeSubcategory === null
                }
                className={`
                  shrink-0
                  rounded-full
                  border
                  px-4
                  py-1.5
                  text-[10px]
                  font-medium
                  transition-all
                  duration-200

                  ${
                    activeSubcategory === null
                      ? `
                        border-[#D4AF37]/70
                        bg-[#D4AF37]/10
                        text-[#F7E3A3]
                      `
                      : `
                        border-white/[0.07]
                        bg-white/[0.02]
                        text-neutral-500
                        hover:border-[#D4AF37]/30
                        hover:text-[#F5E6B8]
                      `
                  }
                `}
              >
                All
              </button>


              {/* DATABASE SUBCATEGORIES */}

              {subcategories.map(
                (subcategory) => {

                  const isActive =
                    activeSubcategory ===
                    subcategory;

                  return (

                    <button
                      key={subcategory}
                      type="button"
                      onClick={() =>
                        setSubcategory(
                          subcategory
                        )
                      }
                      aria-pressed={isActive}
                      className={`
                        shrink-0
                        rounded-full
                        border
                        px-4
                        py-1.5
                        text-[10px]
                        font-medium
                        transition-all
                        duration-200

                        ${
                          isActive
                            ? `
                              border-[#D4AF37]
                              bg-[#D4AF37]
                              text-black
                              shadow-[0_4px_14px_rgba(212,175,55,0.12)]
                            `
                            : `
                              border-white/[0.07]
                              bg-white/[0.02]
                              text-neutral-500
                              hover:border-[#D4AF37]/30
                              hover:bg-[#D4AF37]/[0.04]
                              hover:text-[#F5E6B8]
                            `
                        }
                      `}
                    >
                      {subcategory}
                    </button>

                  );

                }
              )}

            </div>

          </div>

        )}

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div
        className="
          mx-auto
          mt-3
          max-w-2xl
          sm:mt-4
        "
      >

        <div
          className="
            group
            flex
            h-11
            items-center
            gap-3
            rounded-full
            border
            border-white/[0.08]
            bg-white/[0.025]
            px-4
            transition-all
            duration-200
            focus-within:border-[#D4AF37]/40
            focus-within:bg-white/[0.04]
            focus-within:shadow-[0_8px_30px_rgba(212,175,55,0.05)]
            sm:h-12
            sm:px-5
          "
        >

          <Search
            size={17}
            className="
              shrink-0
              text-[#D4AF37]
              transition-transform
              duration-200
              group-focus-within:scale-105
              sm:h-5
              sm:w-5
            "
          />


          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search jewellery..."
            aria-label="Search jewellery"
            className="
              min-w-0
              flex-1
              bg-transparent
              text-xs
              text-white
              outline-none
              placeholder:text-neutral-600
              sm:text-sm
            "
          />


          {search && (

            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
              className="
                flex
                h-7
                w-7
                shrink-0
                items-center
                justify-center
                rounded-full
                text-neutral-500
                transition
                hover:bg-white/[0.06]
                hover:text-white
                active:scale-95
              "
            >

              <X
                size={14}
              />

            </button>

          )}

        </div>

      </div>


      {/* =====================================================
          RESULT CONTROLS
      ====================================================== */}

      <div
        className="
          mt-3
          border-b
          border-white/[0.06]
          pb-3
          sm:mt-4
          sm:pb-4
        "
      >

        {/* ===================================================
            RESULT ROW
            EVERYTHING STAYS ON ONE ROW
        ==================================================== */}

        <div
          className="
            flex
            flex-nowrap
            items-center
            gap-2
            sm:justify-between
            sm:gap-3
          "
        >

          {/* =================================================
              PREMIUM RESULT COUNT
          ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              gap-2
              sm:w-auto
              sm:flex-none
              sm:gap-3
            "
          >

            {/* Count badge */}

            <div
              className="
                relative
                flex
                h-9
                min-w-9
                shrink-0
                sm:h-11
                sm:min-w-11
                items-center
                justify-center
                rounded-full
                border
                border-[#D4AF37]/30
                bg-[#D4AF37]/[0.045]
                shadow-[0_0_20px_rgba(212,175,55,0.06)]
              "
            >

              {/* Inner ring */}

              <span
                className="
                  absolute
                  inset-[3px]
                  rounded-full
                  border
                  border-[#D4AF37]/[0.08]
                "
              />

              {/* Count */}

              <span
                className="
                  relative
                  text-xs
                  font-semibold
                  leading-none
                  tracking-tight
                  text-[#E5C35B]
                  sm:text-base
                "
              >
                {visibleProductCount}
              </span>

            </div>


            {/* Collection Prompt */}

            <div
              className="
                flex
                min-w-0
                flex-1
                items-center
                overflow-hidden
                whitespace-nowrap
                animate-[fadeInUp_0.7s_ease-out]
                sm:flex-none
              "
            >

              <span
                className="
                  font-serif
                  truncate
                  text-[10px]
                  font-medium
                  italic
                  tracking-[0.05em]
                  text-[#D4AF37]
                  sm:text-[14px]
                  sm:tracking-[0.08em]
                "
              >
                Find Your Next Favourite
              </span>

            </div>

          </div>


          {/* =================================================
              CONTROLS
              SAME ROW ON ALL SCREEN SIZES
          ================================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-end
              gap-1.5
              sm:gap-2
            "
          >

            {/* Filter */}

            <button
              type="button"
              onClick={
                onFilterOpen
              }
              className="
                inline-flex
                h-9
                shrink-0
                items-center
                gap-1
                rounded-full
                border
                border-white/10
                bg-white/[0.025]
                px-2
                text-[9px]
                font-medium
                text-neutral-300
                transition
                hover:border-[#D4AF37]/40
                hover:bg-[#D4AF37]/[0.05]
                hover:text-[#F5E6B8]
                active:scale-[0.98]

                sm:h-10
                sm:gap-2
                sm:px-4
                sm:text-sm
              "
            >

              <SlidersHorizontal
                size={13}
                className="text-[#D4AF37] sm:h-[14px] sm:w-[14px]"
              />

              <span>
                Filter
              </span>


              {filterCount > 0 && (

                <span
                  className="
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#D4AF37]
                    px-1.5
                    text-[9px]
                    font-bold
                    text-black
                  "
                >
                  {filterCount}
                </span>

              )}

            </button>


            {/* Sort */}

            <div
              className="
                relative
                shrink-0
              "
            >

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption
                  )
                }
                aria-label="Sort products"
                className="
                  h-9
                  max-w-[90px]
                  appearance-none
                  rounded-full
                  border
                  border-white/10
                  bg-white/[0.025]
                  py-0
                  pl-2
                  pr-6
                  text-[9px]
                  font-medium
                  text-neutral-300
                  outline-none
                  transition
                  hover:border-[#D4AF37]/30
                  focus:border-[#D4AF37]/40
                  focus:bg-[#D4AF37]/[0.05]

                  sm:h-10
                  sm:max-w-none
                  sm:pl-4
                  sm:pr-9
                  sm:text-sm
                "
              >

                <option
                  value="featured"
                  className="bg-black"
                >
                  Featured
                </option>

                <option
                  value="newest"
                  className="bg-black"
                >
                  Newest
                </option>

                <option
                  value="best-selling"
                  className="bg-black"
                >
                  Best Selling
                </option>

                <option
                  value="trending"
                  className="bg-black"
                >
                  Trending
                </option>

                <option
                  value="price-low"
                  className="bg-black"
                >
                  Price: Low → High
                </option>

                <option
                  value="price-high"
                  className="bg-black"
                >
                  Price: High → Low
                </option>

                <option
                  value="discount"
                  className="bg-black"
                >
                  Biggest Discount
                </option>

                <option
                  value="rating"
                  className="bg-black"
                >
                  Top Rated
                </option>

              </select>


              <ChevronDown
                size={13}
                className="
                  pointer-events-none
                  absolute
                  right-2
                  top-1/2
                  -translate-y-1/2
                  text-neutral-500
                  sm:right-3
                "
              />

            </div>

          </div>

        </div>


        {/* =================================================
            ACTIVE CONTEXT
        ================================================== */}

        {(activeCategory !== "All" ||
          activeSubcategory ||
          search.trim() ||
          filterCount > 0) && (

          <div
            className="
              mt-2.5
              flex
              items-center
              gap-2
              overflow-x-auto
              scrollbar-hide
            "
          >

            <span
              className="
                shrink-0
                text-[8px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-neutral-700
              "
            >
              Showing
            </span>


            {activeCategory !==
              "All" && (

              <button
                type="button"
                onClick={() =>
                  setCategory(
                    "All"
                  )
                }
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#D4AF37]/15
                  bg-[#D4AF37]/[0.05]
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-[#E6C96A]
                "
              >

                {activeCategory}

                <X
                  size={11}
                />

              </button>

            )}


            {activeSubcategory && (

              <button
                type="button"
                onClick={() =>
                  setSubcategory?.(
                    null
                  )
                }
                className="
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#D4AF37]/20
                  bg-[#D4AF37]/[0.07]
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-[#F7E3A3]
                "
              >

                {activeSubcategory}

                <X
                  size={11}
                />

              </button>

            )}


            {search.trim() && (

              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  inline-flex
                  max-w-[190px]
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-neutral-300
                "
              >

                <span
                  className="truncate"
                >
                  "{search.trim()}"
                </span>

                <X
                  size={11}
                  className="shrink-0"
                />

              </button>

            )}


            {filterCount > 0 && (

              <span
                className="
                  inline-flex
                  shrink-0
                  items-center
                  rounded-full
                  border
                  border-[#D4AF37]/15
                  bg-[#D4AF37]/[0.05]
                  px-2.5
                  py-1.5
                  text-[10px]
                  font-medium
                  text-[#D4AF37]
                "
              >

                {filterCount}{" "}
                filter
                {filterCount === 1
                  ? ""
                  : "s"}{" "}
                applied

              </span>

            )}

          </div>

        )}

      </div>

    </section>

  );

}