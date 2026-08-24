import {
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";

import DeliveryChecker from "./DeliveryChecker";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import WishlistButton from "@/features/wishlist/components/WishlistButton";

import {
  supabase,
} from "@/shared/lib/supabase";


interface ProductActionsProps {
  product: any;
}


/* =========================================================
   SHIPROCKET CHECKOUT TYPE
========================================================= */

declare global {
  interface Window {
    HeadlessCheckout?: {
      addToCart: (
        event: Event,
        token: string,
        options?: {
          fallbackUrl?: string;
        }
      ) => void;
    };
  }
}


/* =========================================================
   SHIPROCKET CHECKOUT ASSETS
========================================================= */

const SHIPROCKET_CHECKOUT_SCRIPT =
  "https://checkout-ui.shiprocket.com/assets/js/channels/shopify.js";

const SHIPROCKET_CHECKOUT_STYLES =
  "https://checkout-ui.shiprocket.com/assets/styles/shopify.css";

const SHIPROCKET_SELLER_DOMAIN =
  "https://tnmonline.in";


/* =========================================================
   LOAD SHIPROCKET CHECKOUT UI
========================================================= */

const loadShiprocketCheckout = async (): Promise<void> => {

  /* -----------------------------------------------------
     LOAD CSS
  ----------------------------------------------------- */

  if (
    !document.querySelector(
      `link[href="${SHIPROCKET_CHECKOUT_STYLES}"]`
    )
  ) {

    const style = document.createElement("link");

    style.rel = "stylesheet";

    style.href =
      SHIPROCKET_CHECKOUT_STYLES;

    document.head.appendChild(style);
  }


  /* -----------------------------------------------------
     ADD SELLER DOMAIN
  ----------------------------------------------------- */

  let sellerDomain =
    document.getElementById(
      "sellerDomain"
    ) as HTMLInputElement | null;


  if (!sellerDomain) {

    sellerDomain =
      document.createElement("input");

    sellerDomain.type = "hidden";

    sellerDomain.id =
      "sellerDomain";

    sellerDomain.value =
      SHIPROCKET_SELLER_DOMAIN;

    document.body.appendChild(
      sellerDomain
    );

  } else {

    sellerDomain.value =
      SHIPROCKET_SELLER_DOMAIN;

  }


  /* -----------------------------------------------------
     CHECK IF JS IS ALREADY LOADED
  ----------------------------------------------------- */

  if (window.HeadlessCheckout) {
    return;
  }


  /* -----------------------------------------------------
     LOAD JS
  ----------------------------------------------------- */

  await new Promise<void>(
    (resolve, reject) => {

      const existingScript =
        document.querySelector(
          `script[src="${SHIPROCKET_CHECKOUT_SCRIPT}"]`
        );


      if (existingScript) {

        if (window.HeadlessCheckout) {
          resolve();
          return;
        }


        existingScript.addEventListener(
          "load",
          () => resolve()
        );


        existingScript.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "Unable to load Shiprocket Checkout."
              )
            )
        );

        return;
      }


      const script =
        document.createElement("script");


      script.src =
        SHIPROCKET_CHECKOUT_SCRIPT;

      script.async = true;


      script.onload = () => {

        if (window.HeadlessCheckout) {

          resolve();

        } else {

          reject(
            new Error(
              "Shiprocket Checkout loaded but HeadlessCheckout is unavailable."
            )
          );

        }

      };


      script.onerror = () => {

        reject(
          new Error(
            "Unable to load Shiprocket Checkout."
          )
        );

      };


      document.body.appendChild(
        script
      );

    }
  );
};


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


  /* =======================================================
     STOCK
  ======================================================= */

  const isOutOfStock =
    product.stock <= 0;


  /* =======================================================
     ADD TO CART
  ======================================================= */

  const handleAddToCart = () => {

    if (isOutOfStock) {
      return;
    }

    addToCart(product);

  };


  /* =======================================================
     BUY NOW
  ======================================================= */

  const handleBuyNow = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {

    if (isOutOfStock) {
      return;
    }


    try {

      /* =================================================
         GET SHIPROCKET VARIANT ID
      ================================================= */

      const {
        data: mapping,
        error: mappingError,
      } = await supabase
        .from(
          "shiprocket_product_mappings"
        )
        .select(
          "shiprocket_variant_id"
        )
        .eq(
          "product_id",
          product.id
        )
        .maybeSingle();


      if (mappingError) {

        console.error(
          "Shiprocket mapping error:",
          mappingError
        );

        throw new Error(
          "Unable to find Shiprocket product mapping."
        );

      }


      const variantId =
        String(
          mapping?.shiprocket_variant_id ?? ""
        ).trim();


      if (!variantId) {

        console.error(
          "Shiprocket variant ID is missing.",
          {
            productId: product.id,
            mapping,
          }
        );

        throw new Error(
          "This product is not synced with Shiprocket Checkout yet."
        );

      }


      console.log(
        "Shiprocket variant ID:",
        variantId
      );


      /* =================================================
         LOAD SHIPROCKET CHECKOUT UI
      ================================================= */

      await loadShiprocketCheckout();


      /* =================================================
         GENERATE CHECKOUT ACCESS TOKEN
      ================================================= */

      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "shiprocket-checkout-token",
        {
          body: {
            items: [
              {
                variant_id: variantId,
                quantity: 1,
              },
            ],

            redirect_url:
              `${window.location.origin}/`,
          },
        }
      );


      /* =================================================
         TOKEN API ERROR
      ================================================= */

      if (error) {

        console.error(
          "Shiprocket Checkout token error:",
          error
        );

        throw new Error(
          error.message ||
          "Unable to generate checkout token."
        );

      }


      /* =================================================
         GET TOKEN
      ================================================= */

      const token =
        data?.result?.token ??
        data?.token ??
        "";


      if (!token) {

        console.error(
          "Shiprocket Checkout token missing:",
          data
        );

        throw new Error(
          "Checkout token was not returned."
        );

      }


      console.log(
        "Shiprocket Checkout token generated successfully."
      );


      /* =================================================
         VERIFY SHIPROCKET CHECKOUT
      ================================================= */

      if (!window.HeadlessCheckout) {

        throw new Error(
          "Shiprocket Checkout is not available."
        );

      }


      /* =================================================
         OPEN SHIPROCKET CHECKOUT
      ================================================= */

      window.HeadlessCheckout.addToCart(
        event.nativeEvent,
        token,
        {
          fallbackUrl:
            `${window.location.origin}/`,
        }
      );


    } catch (error) {

      console.error(
        "Buy Now / Shiprocket Checkout error:",
        error
      );


      alert(
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again."
      );

    }

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

    </div>

  );
}