import {
  ShoppingBag,
  CheckCircle2,
  Minus,
  Plus,
} from "lucide-react";

import DeliveryChecker from "./DeliveryChecker";
import CheckoutDialog from "@/features/checkout/components/CheckoutDialog";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import WishlistButton from "@/features/wishlist/components/WishlistButton";

import { useState } from "react";
import { createPortal } from "react-dom";

import {
  getEffectiveProductPrice,
} from "@/features/products/utils/specialDiscount";


interface ProductActionsProps {
  product: any;
}


/* =========================================================
   COMPONENT
========================================================= */

export default function ProductActions({
  product,
}: ProductActionsProps) {


  /* =======================================================
     CART
  ======================================================= */

  const {
    addToCart,
  } = useCartActions();


  const [
    checkoutOpen,
    setCheckoutOpen,
  ] = useState(false);

  const [
    buyNowItem,
    setBuyNowItem,
  ] = useState<any>(null);

  const [
    buyNowQuantity,
    setBuyNowQuantity,
  ] = useState(1);

  const [
    buyNowPopupOpen,
    setBuyNowPopupOpen,
  ] = useState(false);


  /* =======================================================
     STOCK
  ======================================================= */

  const isOutOfStock =
    product.stock <= 0;

  /* =======================================================
     RING SIZE
  ======================================================= */

  const [
    selectedRingSize,
    setSelectedRingSize,
  ] = useState<string>("");

  const availableRingSizes: string[] =
    Array.isArray(
      product?.specifications?.ring_sizes
    )
      ? product.specifications.ring_sizes
          .map((size: any) => String(size))
      : [];

  const isRingProduct =
    availableRingSizes.length > 0;
  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = () => {

    if (isOutOfStock) {
      return;
    }

    if (isRingProduct && !selectedRingSize) {
      alert("Please select a ring size.");
      return;
    }

    addToCart({
      ...product,
      ringSize: selectedRingSize,
    });

  };


  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = () => {

    if (isOutOfStock) {
      return;
    }

    if (isRingProduct && !selectedRingSize) {
      alert("Please select a ring size.");
      return;
    }

    setBuyNowQuantity(1);
    setBuyNowPopupOpen(true);
  };


  const handleConfirmBuyNow = () => {

    /*
     * IMPORTANT:
     * Buy Now intentionally does NOT call addToCart().
     * It creates a temporary checkout item so the existing
     * persistent cart remains completely untouched.
     */
    const effectivePrice =
      getEffectiveProductPrice(product);

    setBuyNowItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: effectivePrice,
      image: product.product_images?.[0]?.image_url,
      quantity: buyNowQuantity,
      ringSize: selectedRingSize || null,
      stock: Number(product.stock ?? 0),
    });

    setBuyNowPopupOpen(false);
    setCheckoutOpen(true);
  };


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div className="mt-6 w-full">

      {/* =================================================
          STOCK STATUS
      ================================================= */}

      {!isOutOfStock &&
        Number(product.stock) > 0 &&
        Number(product.stock) < 5 && (

          <div
            className="
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-[#D4AF37]
            "
          >

            <CheckCircle2 size={18} />

            <span>
              {Number(product.stock) === 1
                ? "Hurry! Only 1 left — Order now!"
                : `Hurry! Only ${product.stock} left — Order soon!`
              }
            </span>

          </div>

        )}


      {/* OUT OF STOCK */}

      {isOutOfStock && (

        <div className="text-sm text-red-400">
          ✕ Out of stock
        </div>

      )}


      {/* =================================================
          VARIANTS
      ================================================= */}

      {product.variants &&
        product.variants.length > 0 && (

          <div className="mt-6">

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


            <div className="flex gap-3">

              {product.variants.map(
                (variant: any) => (

                  <button
                    key={variant.id}
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
              )}

            </div>

          </div>

        )}


      {/* =================================================
          RING SIZE
      ================================================= */}

      {isRingProduct && (

        <div className="mt-6">

          <div className="mb-3 flex items-center justify-between">

            <p
              className="
                text-sm
                font-medium
                text-white
              "
            >
              Select Ring Size
            </p>

            {selectedRingSize && (
              <span className="text-xs text-[#D4AF37]">
                Size {selectedRingSize} selected
              </span>
            )}

          </div>

          <div className="flex flex-wrap gap-2">

            {availableRingSizes.map((size) => {

              const selected =
                selectedRingSize === size;

              return (

                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedRingSize(size)}
                  className={`
                    flex
                    h-11
                    min-w-11
                    items-center
                    justify-center
                    rounded-lg
                    border
                    px-3
                    text-sm
                    font-medium
                    transition-all
                    duration-200
                    ${
                      selected
                        ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                        : "border-neutral-700 bg-transparent text-white hover:border-[#D4AF37] hover:text-[#D4AF37]"
                    }
                  `}
                >
                  {size}
                </button>

              );

            })}

          </div>

        </div>

      )}


      {/* =================================================
          MAIN ACTIONS
      ================================================= */}

      <div
        className="
          mt-6
          flex
          gap-3
        "
      >

        {/* =================================================
            ADD TO CART
        ================================================= */}

        <button
          type="button"

          /*
           * IMPORTANT:
           * MobileStickyCart uses this attribute to detect
           * when the original Add to Cart button is visible.
           */
          data-product-add-to-cart

          onClick={handleAddToCart}

          disabled={isOutOfStock}

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

          <ShoppingBag size={18} />

          {isOutOfStock
            ? "OUT OF STOCK"
            : "ADD TO CART"
          }

        </button>


        {/* =================================================
            WISHLIST
        ================================================= */}

        <WishlistButton
          productId={product.id}
          iconSize={22}
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


      {/* =================================================
          BUY NOW
      ================================================= */}

      <button
        type="button"
        disabled={isOutOfStock}
        onClick={handleBuyNow}

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


      {/* =================================================
          DELIVERY CHECKER
      ================================================= */}

      <DeliveryChecker
        product={product}
      />

      {buyNowPopupOpen &&
        createPortal(

          <div
            className="
              fixed
              inset-0
              z-[9999]
            flex
            items-center
            justify-center
            bg-black/75
            px-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="buy-now-title"
          onClick={() => setBuyNowPopupOpen(false)}
        >

          <div
            className="
              w-full
              max-w-sm
              overflow-hidden
              rounded-2xl
              border
              border-[#D4AF37]/25
              bg-[#0b0b0b]
              shadow-[0_24px_80px_rgba(0,0,0,0.55)]
            "
            onClick={(event) => event.stopPropagation()}
          >

            <div className="p-5">

              <div className="flex items-start gap-3">

                <div className="min-w-0 flex-1">

                  <p
                    id="buy-now-title"
                    className="
                      text-lg
                      font-semibold
                      text-white
                    "
                  >
                    Buy It Now
                  </p>

                  <p className="mt-1 text-xs leading-relaxed text-neutral-400">
                    Choose your quantity before continuing to checkout.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() => setBuyNowPopupOpen(false)}
                  aria-label="Close Buy It Now popup"
                  className="
                    flex
                    h-8
                    w-8
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    text-xl
                    text-neutral-400
                    transition
                    hover:bg-white/5
                    hover:text-white
                  "
                >
                  ×
                </button>

              </div>


              <div
                className="
                  mt-5
                  flex
                  items-center
                  gap-3
                  rounded-xl
                  border
                  border-neutral-800
                  bg-neutral-950
                  p-3
                "
              >

                <div
                  className="
                    h-16
                    w-16
                    shrink-0
                    overflow-hidden
                    rounded-lg
                    bg-neutral-900
                  "
                >

                  {product.product_images?.[0]?.image_url ? (
                    <img
                      src={product.product_images[0].image_url}
                      alt={product.name}
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />
                  ) : (
                    <div className="h-full w-full" />
                  )}

                </div>

                <div className="min-w-0">

                  <p
                    className="
                      line-clamp-2
                      text-sm
                      font-medium
                      text-white
                    "
                  >
                    {product.name}
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#D4AF37]">
                    ₹{Number(getEffectiveProductPrice(product)).toFixed(2)}
                  </p>

                  {selectedRingSize && (
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      Ring size: {selectedRingSize}
                    </p>
                  )}

                </div>

              </div>


              <div className="mt-5 flex items-center justify-between">

                <span className="text-sm font-medium text-white">
                  Quantity
                </span>

                <div
                  className="
                    flex
                    items-center
                    overflow-hidden
                    rounded-xl
                    border
                    border-neutral-700
                    bg-black
                  "
                >

                  <button
                    type="button"
                    onClick={() =>
                      setBuyNowQuantity((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    disabled={buyNowQuantity <= 1}
                    aria-label="Decrease quantity"
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      text-white
                      transition
                      hover:bg-neutral-800
                      hover:text-[#D4AF37]
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    "
                  >
                    <Minus size={16} />
                  </button>

                  <span
                    className="
                      flex
                      h-11
                      min-w-12
                      items-center
                      justify-center
                      border-x
                      border-neutral-700
                      px-3
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    {buyNowQuantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setBuyNowQuantity((current) =>
                        Math.min(
                          Number(product.stock ?? 0),
                          current + 1
                        )
                      )
                    }
                    disabled={
                      buyNowQuantity >=
                      Number(product.stock ?? 0)
                    }
                    aria-label="Increase quantity"
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      text-white
                      transition
                      hover:bg-neutral-800
                      hover:text-[#D4AF37]
                      disabled:cursor-not-allowed
                      disabled:opacity-35
                    "
                  >
                    <Plus size={16} />
                  </button>

                </div>

              </div>


              <div
                className="
                  mt-5
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  border
                  border-[#D4AF37]/15
                  bg-[#D4AF37]/5
                  px-3
                  py-2.5
                "
              >

                <span className="text-xs text-neutral-400">
                  Total
                </span>

                <span className="text-base font-semibold text-white">
                  ₹{(
                    Number(getEffectiveProductPrice(product)) *
                    buyNowQuantity
                  ).toFixed(2)}
                </span>

              </div>


              <button
                type="button"
                onClick={handleConfirmBuyNow}
                className="
                  mt-5
                  w-full
                  rounded-xl
                  bg-[#D4AF37]
                  py-3.5
                  text-sm
                  font-semibold
                  text-black
                  transition-all
                  duration-200
                  hover:bg-[#e5c45a]
                  hover:shadow-[0_8px_25px_rgba(212,175,55,0.18)]
                  active:scale-[0.99]
                "
              >
                CONTINUE TO CHECKOUT
              </button>

              <button
                type="button"
                onClick={() => setBuyNowPopupOpen(false)}
                className="
                  mt-2
                  w-full
                  rounded-xl
                  py-3
                  text-xs
                  font-medium
                  text-neutral-400
                  transition
                  hover:bg-white/5
                  hover:text-white
                "
              >
                Cancel
              </button>

            </div>

          </div>

          </div>,

          document.body

        )}


      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => {
          setCheckoutOpen(false);
          setBuyNowItem(null);
          setBuyNowQuantity(1);
        }}
        buyNowItem={buyNowItem}
      />

    </div>

  );
}