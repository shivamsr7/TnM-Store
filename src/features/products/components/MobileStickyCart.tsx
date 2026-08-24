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
     * If the original button cannot be found,
     * don't show the sticky cart.
     */
    if (!originalAddButton) {
      setVisible(false);
      return;
    }


    let originalButtonVisible = true;
    let footerVisible = false;


    const updateVisibility = () => {

      /*
       * Sticky cart should ONLY appear when:
       *
       * 1. Original ADD button is not visible
       * 2. Footer is not visible
       */

      const shouldShow =
        !originalButtonVisible &&
        !footerVisible;


      setVisible(shouldShow);
    };


    /* =================================================
       ORIGINAL ADD BUTTON OBSERVER
    ================================================= */

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


    /* =================================================
       FOOTER OBSERVER
    ================================================= */

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
     * Initial state
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
        bottom-0
        left-0
        right-0

        z-[90]

        border-t
        border-[#D4AF37]/20

        bg-[#080808]/95

        px-4
        pt-3

        pb-[calc(env(safe-area-inset-bottom)+12px)]

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