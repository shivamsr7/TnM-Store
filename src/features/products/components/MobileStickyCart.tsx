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
     OBSERVE ORIGINAL ADD BUTTON + FOOTER
  ===================================================== */

  useEffect(() => {

    const originalAddButton =
      document.querySelector(
        "[data-product-add-to-cart]"
      );

    const footer =
      document.querySelector("footer");


    /*
     * If original ADD TO CART cannot be found,
     * keep sticky cart hidden.
     */

    if (!originalAddButton) {

      setVisible(false);

      return;

    }


    let originalButtonVisible = true;

    let footerVisible = false;


    const updateVisibility = () => {

      /*
       * Show sticky cart ONLY when:
       *
       * 1. Original ADD TO CART is outside viewport
       * 2. Footer is outside viewport
       */

      const shouldShow =
        !originalButtonVisible &&
        !footerVisible;


      setVisible(
        shouldShow
      );

    };


    /* ===================================================
       ORIGINAL ADD TO CART OBSERVER
    =================================================== */

    const addButtonObserver =
      new IntersectionObserver(
        ([entry]) => {

          originalButtonVisible =
            entry.isIntersecting;

          updateVisibility();

        },
        {
          threshold: 0.1,
        }
      );


    addButtonObserver.observe(
      originalAddButton
    );


    /* ===================================================
       FOOTER OBSERVER
    =================================================== */

    let footerObserver:
      IntersectionObserver | null = null;


    if (footer) {

      footerObserver =
        new IntersectionObserver(
          ([entry]) => {

            footerVisible =
              entry.isIntersecting;

            updateVisibility();

          },
          {
            threshold: 0,
          }
        );


      footerObserver.observe(
        footer
      );

    }


    /*
     * Set initial state.
     */

    updateVisibility();


    return () => {

      addButtonObserver.disconnect();

      footerObserver?.disconnect();

    };

  }, []);


  /* =====================================================
     ADD TO CART
  ===================================================== */

  const handleAdd = () => {

    addToCart(product);

    setAdded(true);


    setTimeout(() => {

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
         * Keep the sticky cart ABOVE
         * the mobile bottom navigation.
         */
        bottom-[76px]

        /*
         * Higher than mobile bottom nav.
         */
        z-[200]

        border-t
        border-[#D4AF37]/20

        bg-[#080808]/95

        px-4
        pt-3
        pb-3

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

              object-cover

              border
              border-[#D4AF37]/20
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