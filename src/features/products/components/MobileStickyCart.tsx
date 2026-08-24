import {
  ShoppingBag,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";


interface Props {
  product: any;
}


export default function MobileStickyCart({
  product,
}: Props) {

  const [visible, setVisible] =
    useState(false);

  const [added, setAdded] =
    useState(false);

  const {
    addToCart,
  } = useCartActions();


  /* =====================================================
     STICKY CART VISIBILITY
  ===================================================== */

  useEffect(() => {

    let ticking = false;


    const checkVisibility = () => {

      const addButton =
        document.querySelector(
          "[data-product-add-to-cart]"
        ) as HTMLElement | null;


      if (!addButton) {

        setVisible(false);

        ticking = false;

        return;

      }


      const rect =
        addButton.getBoundingClientRect();


      /*
       * IMPORTANT
       *
       * The sticky cart must NOT appear simply because
       * the original ADD button is below the viewport.
       *
       * It appears ONLY after the user has scrolled
       * past the original ADD button.
       *
       * Therefore:
       *
       * rect.bottom < 0
       */

      const passedAddButton =
        rect.bottom < 0;


      /* =================================================
         FOOTER
      ================================================= */

      const footer =
        document.querySelector(
          "footer"
        );


      let footerStarted = false;


      if (footer) {

        const footerRect =
          footer.getBoundingClientRect();


        /*
         * As soon as the footer enters the viewport,
         * hide the sticky cart.
         */

        footerStarted =
          footerRect.top < window.innerHeight;

      }


      /*
       * SHOW ONLY WHEN:
       *
       * 1. User has passed original ADD button
       * 2. Footer has not started
       */

      setVisible(
        passedAddButton &&
        !footerStarted
      );


      ticking = false;

    };


    const handleScroll = () => {

      if (!ticking) {

        window.requestAnimationFrame(
          checkVisibility
        );

        ticking = true;

      }

    };


    const handleResize = () => {

      checkVisibility();

    };


    /*
     * Initial check
     */

    checkVisibility();


    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );


    window.addEventListener(
      "resize",
      handleResize
    );


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

    };

  }, []);


  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAdd = () => {

    addToCart(product);

    setAdded(true);


    window.setTimeout(() => {

      setAdded(false);

    }, 1200);

  };


  /* =====================================================
     PRODUCT IMAGE
  ===================================================== */

  const image =
    product.product_images?.find(
      (item: any) =>
        item.is_primary
    )?.image_url
    ||
    product.product_images?.[0]
      ?.image_url;


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className={`
        fixed

        left-0
        right-0

        /*
         * MobileBottomNav:
         * min-h-16 = 64px
         *
         * Plus iPhone safe-area.
         *
         * This makes the sticky cart sit directly
         * ABOVE the bottom navigation with NO GAP.
         */
        bottom-[calc(4rem+env(safe-area-inset-bottom))]

        z-[60]

        border-t
        border-[#D4AF37]/20

        bg-[#080808]

        px-4
        pt-3
        pb-3

        shadow-[0_-8px_25px_rgba(0,0,0,0.35)]

        backdrop-blur-xl

        transition-all
        duration-300
        ease-out

        md:hidden

        ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }
      `}
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        {image && (

          <img
            src={image}
            alt={product.name}
            className="
              h-14
              w-14
              shrink-0

              rounded-xl

              border
              border-[#D4AF37]/20

              object-cover
            "
          />

        )}


        {/* =================================================
            PRODUCT INFO
        ================================================= */}

        <div
          className="
            min-w-0
            flex-1
          "
        >

          <p
            className="
              truncate

              text-xs
              text-neutral-400
            "
          >
            {product.name}
          </p>


          <div
            className="
              mt-1

              flex
              items-center
              gap-2
            "
          >

            <p
              className="
                font-semibold
                text-white
              "
            >
              ₹{product.price}
            </p>


            {product.compare_price && (

              <p
                className="
                  text-xs
                  text-neutral-500
                  line-through
                "
              >
                ₹{product.compare_price}
              </p>

            )}

          </div>

        </div>


        {/* =================================================
            ADD BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleAdd}

          className={`
            flex
            shrink-0

            items-center
            justify-center

            gap-2

            rounded-xl

            px-5
            py-3.5

            text-sm
            font-semibold

            transition-all
            duration-200

            active:scale-95

            ${
              added
                ? "bg-green-500 text-white"
                : "bg-[#D4AF37] text-black"
            }
          `}
        >

          <ShoppingBag
            size={17}
          />

          {added
            ? "ADDED"
            : "ADD"
          }

        </button>

      </div>

    </div>

  );
}