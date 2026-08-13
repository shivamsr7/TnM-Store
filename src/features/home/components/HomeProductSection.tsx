import {
  ChevronRight,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import ProductCard from "@/features/shop/components/ProductCard";

import {
  useShopProducts,
} from "@/features/shop/hooks/useShopProducts";

import type {
  Product,
} from "@/features/products/types/product.types";


interface HomeProductSectionProps {
  title: string;
  subtitle: string;
  type:
    | "best_sellers"
    | "new_arrivals";
}


export default function HomeProductSection({
  title,
  subtitle,
  type,
}: HomeProductSectionProps) {

  const navigate =
    useNavigate();


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
   * FILTER PRODUCTS FOR HOMEPAGE
   * =========================================================
   */

  const filteredProducts =
    products
      .filter(
        (product: Product) => {

          if (
            type ===
            "best_sellers"
          ) {

            return (
              product.best_seller ===
              true
            );

          }

          return (
            product.new_arrival ===
            true
          );

        }
      )
      .slice(
        0,
        8
      );


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

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          {/* HEADER */}

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

          </div>


          {/* DESKTOP SKELETON */}

          <div
            className="
              hidden
              grid-cols-4
              gap-5
              lg:grid
            "
          >

            {Array.from({
              length: 4,
            }).map(
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

                  <div
                    className="
                      space-y-3
                      p-5
                    "
                  >

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


          {/* MOBILE SKELETON */}

          <div
            className="
              flex
              gap-3
              overflow-hidden
              lg:hidden
            "
          >

            {Array.from({
              length: 2,
            }).map(
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

                  <div
                    className="
                      space-y-3
                      p-3
                    "
                  >

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
   * EMPTY STATE
   * =========================================================
   */

  if (
    filteredProducts.length ===
    0
  ) {

    return null;

  }


  /*
   * =========================================================
   * VIEW ALL URL
   * =========================================================
   *
   * IMPORTANT:
   *
   * This uses the existing Shop URL
   * filtering system.
   *
   * Best Sellers:
   * /shop?bestSeller=true
   *
   * New Arrivals:
   * /shop?newArrival=true
   *
   * =========================================================
   */

  const viewAllUrl =
    type ===
    "best_sellers"
      ? "/shop?bestSeller=true"
      : "/shop?newArrival=true";


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

      <div
        className="
          mx-auto
          max-w-7xl
        "
      >

        {/* =================================================
            HEADER
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
            {type ===
            "best_sellers"
              ? "Most Loved"
              : "Just In"}
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

          {filteredProducts.map(
            (product) => (

              <div
                key={
                  product.id
                }
                className="
                  w-[72vw]
                  shrink-0
                  sm:w-[45vw]
                "
              >

                <ProductCard
                  product={
                    product
                  }
                />

              </div>

            )
          )}

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

          {filteredProducts.map(
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
                viewAllUrl
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