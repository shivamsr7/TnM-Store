import {
  Star,
  Zap,
} from "lucide-react";


interface ProductInfoProps {

  product: any;

}


export default function ProductInfo({

  product,

}: ProductInfoProps) {


  const discount =

    product.compare_price

      ?

        Math.round(

          (

            (
              product.compare_price -
              product.price
            )

            /

            product.compare_price

          ) * 100

        )

      :

        0;


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

      {
        product.rating > 0 && (

          <button

            type="button"

            onClick={() => {

              const reviewSection =
                document.getElementById(
                  "customer-reviews"
                );

              if (
                reviewSection
              ) {

                reviewSection.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });

              }

            }}

            className="

              mt-4

              flex
              items-center
              gap-2

              text-sm

              text-left

              transition-opacity

              duration-200

              hover:opacity-80

              focus:outline-none

              focus-visible:ring-2

              focus-visible:ring-[#D4AF37]

              focus-visible:ring-offset-2

              focus-visible:ring-offset-black

            "

            aria-label="View customer reviews"

          >

            <span

              className="

                flex
                items-center
                gap-0.5

                text-[#D4AF37]

              "

              aria-hidden="true"

            >

              {Array.from(
                {
                  length: 5,
                }
              ).map(
                (
                  _,
                  index
                ) => (

                  <Star

                    key={
                      index
                    }

                    size={14}

                    fill="currentColor"

                    strokeWidth={1.5}

                  />

                )
              )}

            </span>


            <span

              className="

                font-medium

                text-white

              "

            >

              {
                Number(
                  product.rating
                ).toFixed(1)
              }

            </span>


            {
              product.review_count > 0 && (

                <span

                  className="
                    text-neutral-400
                  "

                >

                  (
                  {
                    product.review_count
                  }
                  {" "}
                  {
                    product.review_count === 1
                      ? "Review"
                      : "Reviews"
                  }
                  )

                </span>

              )
            }

          </button>

        )
      }


      {/* =====================================================
          PRICE
      ====================================================== */}

      <div

        className="
          mt-6
        "

      >

        <div

          className="

            flex
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

            ₹
            {
              product.price
            }

          </span>


          {
            product.compare_price && (

              <span

                className="

                  text-base

                  text-neutral-500

                  line-through

                "

              >

                ₹
                {
                  product.compare_price
                }

              </span>

            )
          }


          {
            discount > 0 && (

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

                {
                  discount
                }% OFF

              </span>

            )
          }

        </div>


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