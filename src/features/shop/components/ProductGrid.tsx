import {
  useEffect,
  useState,
} from "react";

import {
  SearchX,
  SlidersHorizontal,
  Sparkles,
  ChevronDown,
} from "lucide-react";

import ProductCard from "./ProductCard";

import type {
  ShopProduct,
} from "../types/shop.types";


interface ProductGridProps {
  products: ShopProduct[];

  hasSearch?: boolean;

  hasFilters?: boolean;

  onClearFilters?: () => void;
}


const INITIAL_VISIBLE = 8;
const LOAD_MORE_COUNT = 8;


export default function ProductGrid({
  products,
  hasSearch = false,
  hasFilters = false,
  onClearFilters,
}: ProductGridProps) {

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(
    INITIAL_VISIBLE
  );


  /*
   * Reset pagination whenever
   * search/filter result changes.
   */

  useEffect(() => {

    setVisibleCount(
      INITIAL_VISIBLE
    );

  }, [products]);


  /*
   * =========================================================
   * EMPTY STATE
   * =========================================================
   */

  if (!products.length) {

    return (

      <section
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-white/[0.06]
          bg-white/[0.015]
          px-5
          py-14
          sm:px-8
          sm:py-18
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            h-48
            w-48
            -translate-x-1/2
            -translate-y-1/2
            rounded-full
            bg-[#D4AF37]/[0.035]
            blur-3xl
          "
        />


        <div
          className="
            relative
            mx-auto
            flex
            max-w-md
            flex-col
            items-center
            text-center
          "
        >

          <div
            className="
              flex
              h-[72px]
              w-[72px]
              items-center
              justify-center
              rounded-full
              border
              border-[#D4AF37]/20
              bg-[#D4AF37]/[0.055]
              text-[#D4AF37]
            "
          >

            {hasSearch ? (

              <SearchX
                size={28}
                strokeWidth={1.4}
              />

            ) : hasFilters ? (

              <SlidersHorizontal
                size={27}
                strokeWidth={1.4}
              />

            ) : (

              <Sparkles
                size={27}
                strokeWidth={1.4}
              />

            )}

          </div>


          <p
            className="
              mt-5
              text-[9px]
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#D4AF37]
            "
          >
            T&M Jewels
          </p>


          <h2
            className="
              mt-2
              text-xl
              font-semibold
              tracking-tight
              text-white
              sm:text-2xl
            "
          >

            {hasSearch
              ? "No jewellery found"
              : hasFilters
                ? "No products match your filters"
                : "No products available"}

          </h2>


          <p
            className="
              mt-3
              max-w-sm
              text-xs
              leading-6
              text-neutral-500
            "
          >

            {hasSearch
              ? "Try a different search term or explore our full collection."

              : hasFilters
                ? "Try removing some filters to discover more pieces from T&M Jewels."

                : "We're preparing something beautiful for this collection."}

          </p>


          {hasFilters &&
            onClearFilters && (

              <button
                type="button"
                onClick={
                  onClearFilters
                }

                className="
                  mt-6
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#D4AF37]
                  px-6
                  text-xs
                  font-semibold
                  text-black
                  transition
                  hover:bg-[#E3C45F]
                  active:scale-[0.98]
                "
              >
                Clear Filters
              </button>

            )}

        </div>

      </section>

    );

  }


  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   */

  const visibleProducts =
    products.slice(
      0,
      visibleCount
    );


  const hasMore =
    visibleCount <
    products.length;


  const remainingCount =
    Math.max(
      products.length -
        visibleCount,
      0
    );


  function handleLoadMore() {

    setVisibleCount(
      (current) =>
        Math.min(
          current +
            LOAD_MORE_COUNT,
          products.length
        )
    );

  }


  return (

    <section>

      {/* =====================================================
          PRODUCT GRID
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          gap-x-3
          gap-y-7

          sm:gap-x-5
          sm:gap-y-9

          md:grid-cols-3
          md:gap-x-6
          md:gap-y-10

          lg:grid-cols-4
          lg:gap-x-7
          lg:gap-y-12
        "
      >

        {visibleProducts.map(
          (product) => (

            <ProductCard
              key={
                product.id
              }
              product={
                product
              }
            />

          )
        )}

      </div>


      {/* =====================================================
          LOAD MORE
      ====================================================== */}

      {hasMore && (

        <div
          className="
            mt-9
            flex
            flex-col
            items-center
            sm:mt-12
          "
        >

          <p
            className="
              mb-3
              text-[10px]
              text-neutral-600
              sm:text-xs
            "
          >

            {remainingCount}{" "}
            {remainingCount === 1
              ? "piece"
              : "pieces"}{" "}
            more to explore

          </p>


          <button
            type="button"
            onClick={
              handleLoadMore
            }

            className="
              group
              inline-flex
              min-h-11
              items-center
              gap-2.5
              rounded-full
              border
              border-[#D4AF37]/30
              bg-[#D4AF37]/[0.035]
              px-6
              text-xs
              font-medium
              text-[#D4AF37]
              transition-all
              duration-200
              hover:border-[#D4AF37]/60
              hover:bg-[#D4AF37]/[0.08]
              hover:text-[#F5E6B8]
              active:scale-[0.98]
              sm:min-h-12
              sm:px-7
              sm:text-sm
            "
          >

            <span>
              Load More
            </span>


            <span
              className="
                flex
                h-5
                w-5
                items-center
                justify-center
                rounded-full
                border
                border-[#D4AF37]/20
              "
            >

              <ChevronDown
                size={13}
                className="
                  transition-transform
                  duration-200
                  group-hover:translate-y-0.5
                "
              />

            </span>

          </button>

        </div>

      )}


      {/* =====================================================
          END
      ====================================================== */}

      {!hasMore &&
        products.length >
          INITIAL_VISIBLE && (

          <div
            className="
              mt-10
              flex
              items-center
              justify-center
              gap-3
              sm:mt-12
            "
          >

            <span
              className="
                h-px
                w-10
                bg-white/[0.08]
                sm:w-16
              "
            />

            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.2em]
                text-neutral-600
                sm:text-[10px]
              "
            >
              You've reached the end
            </p>

            <span
              className="
                h-px
                w-10
                bg-white/[0.08]
                sm:w-16
              "
            />

          </div>

        )}

    </section>

  );
}