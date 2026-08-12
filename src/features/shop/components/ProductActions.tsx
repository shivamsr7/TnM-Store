import {
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import DeliveryChecker from "./DeliveryChecker";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import WishlistButton from "@/features/wishlist/components/WishlistButton";


interface ProductActionsProps {

  product: any;

}


export default function ProductActions({

  product,

}: ProductActionsProps) {


  /*
   * =========================================================
   * CART
   * =========================================================
   */

  const {
    addToCart,
  } = useCartActions();


  /*
   * =========================================================
   * STOCK
   * =========================================================
   */

  const isOutOfStock =
    product.stock <= 0;


  /*
   * =========================================================
   * ADD TO CART
   * =========================================================
   */

  const handleAddToCart = () => {

    if (
      isOutOfStock
    ) {

      return;

    }


    addToCart(
      product
    );

  };


  /*
   * =========================================================
   * BUY NOW
   * =========================================================
   */

  const handleBuyNow = () => {

    if (
      isOutOfStock
    ) {

      return;

    }


    /*
     * Keep existing Buy Now behaviour
     * until the checkout flow is connected.
     */

    addToCart(
      product
    );

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div

      className="
        mt-6
        w-full
      "

    >

      {/* =====================================================
          STOCK STATUS
      ====================================================== */}

      {!isOutOfStock && (

        <div

          className="

            flex
            items-center
            gap-2

            text-sm

            text-green-400

          "

        >

          <CheckCircle2
            size={18}
          />

          <span>
            Ready to ship
          </span>

        </div>

      )}


      {isOutOfStock && (

        <div

          className="

            text-sm

            text-red-400

          "

        >

          ✕ Out of stock

        </div>

      )}


      {/* =====================================================
          VARIANTS
      ====================================================== */}

      {
        product.variants &&
        product.variants.length > 0 && (

          <div
            className="
              mt-6
            "
          >

            <p

              className="

                mb-3

                text-sm

                font-medium

                text-white

              "

            >

              Color

            </p>


            <div

              className="

                flex

                gap-3

              "

            >

              {
                product.variants.map(
                  (
                    variant: any
                  ) => (

                    <button

                      key={
                        variant.id
                      }

                      type="button"

                      className="

                        h-10

                        w-10

                        rounded-full

                        border

                        border-[#D4AF37]/50

                        transition-transform

                        duration-200

                        hover:scale-105

                      "

                      style={{
                        backgroundColor:
                          variant.color,
                      }}

                    />

                  )
                )
              }

            </div>

          </div>

        )
      }


      {/* =====================================================
          MAIN ACTIONS
      ====================================================== */}

      <div

        className="

          mt-6

          flex

          gap-3

        "

      >

        {/* ===================================================
            ADD TO CART
        ==================================================== */}

        <button

          type="button"

          onClick={
            handleAddToCart
          }

          disabled={
            isOutOfStock
          }

          className="

            flex

            min-h-14

            flex-1

            items-center
            justify-center

            gap-2

            rounded-xl

            bg-[#D4AF37]

            py-4

            text-sm

            font-semibold

            text-black

            transition-colors

            duration-200

            hover:bg-[#e5c45a]

            disabled:cursor-not-allowed

            disabled:opacity-50

          "

        >

          <ShoppingBag
            size={18}
          />

          {
            isOutOfStock
              ? "OUT OF STOCK"
              : "ADD TO CART"
          }

        </button>


        {/* ===================================================
            WISHLIST
        ==================================================== */}

        <WishlistButton

          productId={
            product.id
          }

          iconSize={
            22
          }

          className="

            flex

            h-14

            w-14

            shrink-0

            items-center
            justify-center

            rounded-xl

            border

            border-neutral-700

            bg-transparent

            text-white

            transition-all

            duration-200

            hover:border-[#D4AF37]

            hover:bg-[#D4AF37]/10

            hover:text-[#D4AF37]

            active:scale-95

          "

        />

      </div>


      {/* =====================================================
          BUY NOW
      ====================================================== */}

      <button

        type="button"

        disabled={
          isOutOfStock
        }

        onClick={
          handleBuyNow
        }

        className="

          mt-3

          w-full

          rounded-xl

          bg-white

          py-4

          text-sm

          font-semibold

          text-black

          transition-colors

          duration-200

          hover:bg-[#D4AF37]

          disabled:cursor-not-allowed

          disabled:opacity-50

        "

      >

        BUY IT NOW

      </button>


      {/* =====================================================
          DELIVERY CHECKER
      ====================================================== */}

      <DeliveryChecker

        product={
          product
        }

      />

    </div>

  );

}