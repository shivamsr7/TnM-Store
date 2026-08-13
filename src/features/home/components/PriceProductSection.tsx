import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProductCard from "@/features/shop/components/ProductCard";
import { useShopProducts } from "@/features/shop/hooks/useShopProducts";

import type { Product } from "@/features/products/types/product.types";

interface PriceProductSectionProps {
  title: string;
  subtitle: string;
  maxPrice: number;
}

export default function PriceProductSection({
  title,
  subtitle,
  maxPrice,
}: PriceProductSectionProps) {
  const navigate = useNavigate();

  /*
   * =========================================================
   * PRODUCTS
   * =========================================================
   */

  const {
    data: products = [],
    isLoading,
    isError,
  } = useShopProducts();

  /*
   * =========================================================
   * FILTER BY PRICE
   * =========================================================
   *
   * Includes the exact price.
   *
   * Under ₹299 → price <= 299
   * Under ₹499 → price <= 499
   *
   * =========================================================
   */

  const filteredProducts = products
    .filter(
      (product: Product) =>
        Number(product.price) <= maxPrice
    )
    .slice(0, 8);

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (isError) {
    return null;
  }

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (isLoading) {
    return (
      <section
        className="
          bg-black
          px-4
          py-12
          sm:px-6
          sm:py-16
          lg:px-8
          lg:py-20
        "
      >
        <div className="mx-auto max-w-7xl">

          {/* Header */}

          <div
            className="
              mb-8
              text-center
              sm:mb-10
            "
          >
            <div
              className="
                mx-auto
                h-3
                w-28
                animate-pulse
                rounded-full
                bg-neutral-800
              "
            />

            <div
              className="
                mx-auto
                mt-3
                h-8
                w-52
                animate-pulse
                rounded-lg
                bg-neutral-800
              "
            />

            <div
              className="
                mx-auto
                mt-3
                h-4
                w-72
                max-w-full
                animate-pulse
                rounded
                bg-neutral-900
              "
            />
          </div>

          {/* Desktop skeleton */}

          <div
            className="
              hidden
              grid-cols-4
              gap-5
              lg:grid
            "
          >
            {Array.from({ length: 4 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    overflow-hidden
                    rounded-3xl
                    bg-[#0b0b0b]
                  "
                >
                  <div
                    className="
                      aspect-[4/5]
                      animate-pulse
                      bg-neutral-900
                    "
                  />

                  <div className="space-y-3 p-5">
                    <div
                      className="
                        h-4
                        w-3/4
                        animate-pulse
                        rounded
                        bg-neutral-800
                      "
                    />

                    <div
                      className="
                        h-5
                        w-1/3
                        animate-pulse
                        rounded
                        bg-neutral-800
                      "
                    />
                  </div>
                </div>
              )
            )}
          </div>

          {/* Mobile skeleton */}

          <div
            className="
              flex
              gap-3
              overflow-hidden
              lg:hidden
            "
          >
            {Array.from({ length: 2 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="
                    w-[72vw]
                    shrink-0
                    overflow-hidden
                    rounded-2xl
                    bg-[#0b0b0b]
                    sm:w-[45vw]
                  "
                >
                  <div
                    className="
                      aspect-[4/5]
                      animate-pulse
                      bg-neutral-900
                    "
                  />

                  <div className="space-y-3 p-3">
                    <div
                      className="
                        h-4
                        w-3/4
                        animate-pulse
                        rounded
                        bg-neutral-800
                      "
                    />

                    <div
                      className="
                        h-5
                        w-1/3
                        animate-pulse
                        rounded
                        bg-neutral-800
                      "
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * DON'T SHOW EMPTY SECTION
   * =========================================================
   */

  if (filteredProducts.length === 0) {
    return null;
  }

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <section
      className="
        bg-black
        px-4
        py-12
        sm:px-6
        sm:py-16
        lg:px-8
        lg:py-20
      "
    >
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            SECTION HEADER
        ================================================== */}

        <div
          className="
            mb-8
            flex
            flex-col
            items-center
            text-center
            sm:mb-10
          "
        >
          <span
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.35em]
              text-[#D4AF37]
              sm:text-xs
            "
          >
            Shop Your Budget
          </span>

          <h2
            className="
              mt-2
              text-3xl
              font-semibold
              tracking-wide
              text-[#F7E3A3]
              sm:text-4xl
              lg:text-5xl
            "
          >
            {title}
          </h2>

          <p
            className="
              mt-2
              max-w-md
              text-sm
              leading-6
              text-neutral-500
              sm:text-base
            "
          >
            {subtitle}
          </p>
        </div>

        {/* =================================================
            MOBILE PRODUCT CAROUSEL
        ================================================== */}

        <div
          className="
            -mx-4
            flex
            gap-3
            overflow-x-auto
            px-4
            pb-2

            [scrollbar-width:none]
            [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden

            sm:-mx-6
            sm:gap-4
            sm:px-6

            lg:hidden
          "
        >
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="
                w-[72vw]
                shrink-0
                sm:w-[45vw]
              "
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* =================================================
            DESKTOP PRODUCT GRID
        ================================================== */}

        <div
          className="
            hidden
            grid-cols-4
            gap-5
            lg:grid
          "
        >
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>

        {/* =================================================
            VIEW ALL
        ================================================== */}

        <div
          className="
            mt-8
            flex
            justify-center
            sm:mt-10
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                `/shop?maxPrice=${maxPrice}`
              )
            }
            className="
              group
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#D4AF37]/50
              px-6
              py-3
              text-sm
              font-medium
              text-[#D4AF37]
              transition-all
              duration-300
              hover:border-[#D4AF37]
              hover:bg-[#D4AF37]
              hover:text-black
              active:scale-[0.98]
            "
          >
            <span>
              View All
            </span>

            <ChevronRight
              className="
                h-4
                w-4
                transition-transform
                duration-300
                group-hover:translate-x-1
              "
            />
          </button>
        </div>

      </div>
    </section>
  );
}