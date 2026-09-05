import {
  useEffect,
  useState,
} from "react";

import {
  Zap,
} from "lucide-react";

import {
  getEffectiveProductPrice,
  hasSpecialProductDiscount,
} from "@/features/products/utils/specialDiscount";


interface ProductInfoProps {

  product: any;

}


export default function ProductInfo({

  product,

}: ProductInfoProps) {


  const effectivePrice =
    getEffectiveProductPrice(product);

  const hasSpecialDiscount =
    hasSpecialProductDiscount(product);

  const discount =
    product.compare_price
      ? Math.round(
          (
            (
              product.compare_price -
              effectivePrice
            ) /
            product.compare_price
          ) * 100
        )
      :
        0;


  const [countdownSeconds, setCountdownSeconds] =
    useState<number | null>(null);


  useEffect(() => {
    if (
      !hasSpecialDiscount ||
      !product.special_discount_ends_at
    ) {
      setCountdownSeconds(null);
      return;
    }

    const updateCountdown = () => {
      const endsAt = new Date(
        product.special_discount_ends_at
      ).getTime();

      const remaining = Math.max(
        0,
        Math.floor((endsAt - Date.now()) / 1000)
      );

      setCountdownSeconds(remaining);
    };

    updateCountdown();
    const interval = window.setInterval(
      updateCountdown,
      1000
    );

    return () =>
      window.clearInterval(interval);
  }, [
    hasSpecialDiscount,
    product.special_discount_ends_at,
  ]);


  const formatCountdown = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };


  return (

    <div

      className="
        w-full
      "

    >


      {/* =====================================================
          PRODUCT NAME
      ====================================================== */}

      <h1

        className="

          font-serif

          text-2xl

          font-medium

          leading-snug

          tracking-wide

          text-[#F5E6B8]

          sm:text-3xl

          lg:text-4xl

        "

      >

        {
          product.name
        }

      </h1>


      {/* =====================================================
          RATING
      ====================================================== */}

      {product.rating > 0 && (

        <button
          type="button"
          onClick={() => {
            const reviewSection =
              document.getElementById(
                "customer-reviews"
              );

            if (reviewSection) {
              reviewSection.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }
          }}
          aria-label="View customer reviews"
          className="
            mt-4
            flex
            min-w-0
            items-center
            gap-1.5
            text-left
            text-xs
            transition-opacity
            duration-200
            hover:opacity-80
            focus:outline-none
            focus-visible:ring-1
            focus-visible:ring-[#D4AF37]
            sm:text-sm
          "
        >
          <span
            className="
              flex
              shrink-0
              items-center
              gap-0.5
              text-[#D4AF37]
            "
            aria-hidden="true"
          >
            {Array.from({ length: 5 }).map((_, index) => (
              <span
                key={index}
                className="leading-none"
              >
                ★
              </span>
            ))}
          </span>

          <span
            className="
              shrink-0
              font-medium
              text-white
            "
          >
            {Number(product.rating).toFixed(1)}
          </span>

          {product.review_count > 0 && (
            <span
              className="
                shrink-0
                text-neutral-500
              "
            >
              ({product.review_count})
            </span>
          )}
        </button>
      )}


      {/* =====================================================
          PRICE
      ====================================================== */}

      <div
        className="
          mt-6
        "
      >
        {hasSpecialDiscount ? (
          <>
            {/* Product MRP */}
            <div
              className="
                text-xs
                font-medium
                uppercase
                tracking-[0.12em]
                text-neutral-500
              "
            >
              MRP ₹{Number(product.mrp ?? product.compare_price ?? product.price).toFixed(2)}
            </div>

            {/* Regular Price */}
            <div className="mt-2">
              <div
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-neutral-500
                "
              >
                Regular Price
              </div>

              <div className="mt-0.5 flex items-center gap-3">
                <span
                  className="
                    text-2xl
                    font-medium
                    tracking-tight
                    text-neutral-400
                    line-through
                  "
                >
                  ₹{Number(product.price).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Special Price */}
            <div className="mt-2">
              <div
                className="
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-[#D4AF37]
                "
              >
                Special Price
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-3">
                <span
                  className="
                    text-4xl
                    font-semibold
                    tracking-tight
                    text-white
                  "
                >
                  ₹{Number(effectivePrice).toFixed(2)}
                </span>

                <span
                  className="
                    rounded-full
                    bg-[#D4AF37]/15
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-[#D4AF37]
                  "
                >
                  {discount}% OFF
                </span>

                <span
                  className="
                    inline-flex
                    w-auto
                    max-w-max
                    items-center
                    gap-1.5
                    rounded-md
                    border
                    border-[#D8C27A]
                    bg-[#F5E6B8]
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-black
                    sm:text-[11px]
                  "
                >
                  <span aria-hidden="true">✦</span>
                  <span>Special Price</span>
                </span>
              </div>

              {countdownSeconds !== null && countdownSeconds > 0 && (
                <div
                  className="
                    mt-2
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-red-500/80
                    bg-black/80
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    tracking-[0.02em]
                    text-red-400
                    shadow-[0_4px_12px_rgba(0,0,0,0.3)]
                  "
                >
                  ⏱ Offer ends in {formatCountdown(countdownSeconds)}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  text-4xl
                  font-semibold
                  tracking-tight
                  text-white
                "
              >
                ₹{Number(product.price).toFixed(2)}
              </span>

              {product.compare_price && (
                <span
                  className="
                    text-base
                    text-neutral-500
                    line-through
                  "
                >
                  ₹{Number(product.compare_price).toFixed(2)}
                </span>
              )}

              {discount > 0 && (
                <span
                  className="
                    rounded-full
                    bg-[#D4AF37]/15
                    px-3
                    py-1
                    text-xs
                    font-medium
                    text-[#D4AF37]
                  "
                >
                  {discount}% OFF
                </span>
              )}
            </div>
          </>
        )}

        <p
          className="
            mt-2
            text-sm
            text-neutral-400
          "
        >
          Inclusive of all taxes
        </p>
      </div>


      {/* =====================================================
          SALES COUNT      {/* =====================================================
          SALES COUNT
      ====================================================== */}

      {
        product.sales_count > 0 && (

          <div

            className="

              mt-5

              flex
              items-center
              gap-2

              text-sm

              text-neutral-300

            "

          >

            <Zap

              size={16}

              className="
                text-[#D4AF37]
              "

            />


            {
              product.sales_count
            }+ people bought this

          </div>

        )
      }


      {/* =====================================================
          SKU
      ====================================================== */}

      {
        product.sku && (

          <div

            className="

              mt-4

              text-sm

              text-neutral-400

            "

          >

            SKU:

            <span

              className="
                text-white
              "

            >

              {" "}
              {
                product.sku
              }

            </span>

          </div>

        )
      }


      {/* =====================================================
          DEALS
      ====================================================== */}

      <div

        className="

          mt-6

          rounded-xl

          border

          border-[#D4AF37]/20

          bg-[#D4AF37]/5

          p-4

        "

      >

        <h3

          className="

            text-sm

            font-medium

            text-[#D4AF37]

          "

        >

          🏷 Deals

        </h3>


        <p

          className="

            mt-2

            text-sm

            text-neutral-300

          "

        >

          Special offers available at checkout

        </p>

      </div>

    </div>

  );

}