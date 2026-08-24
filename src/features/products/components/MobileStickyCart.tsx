import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";

import { useCartActions } from "@/features/cart/hooks/useCartActions";

interface Props {
  product: any;
}

export default function MobileStickyCart({
  product,
}: Props) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  const { addToCart } = useCartActions();

  useEffect(() => {
    const checkStickyVisibility = () => {
      const addButton = document.querySelector(
        "[data-product-add-to-cart]"
      ) as HTMLElement | null;

      if (!addButton) {
        setVisible(false);
        return;
      }

      const rect = addButton.getBoundingClientRect();

      /*
       * IMPORTANT:
       *
       * If the original Add to Cart button is still
       * somewhere above the viewport OR currently visible,
       * sticky cart should NOT appear.
       *
       * Only show after the user has actually scrolled
       * BELOW the original Add to Cart button.
       */

      const hasScrolledBelowAddButton =
        rect.bottom < 0;

      /*
       * Footer should stop the sticky cart.
       */

      const footer =
        document.querySelector("footer");

      let footerVisible = false;

      if (footer) {
        const footerRect =
          footer.getBoundingClientRect();

        footerVisible =
          footerRect.top < window.innerHeight;
      }

      setVisible(
        hasScrolledBelowAddButton &&
        !footerVisible
      );
    };

    /*
     * Check immediately.
     */
    checkStickyVisibility();

    /*
     * Check while scrolling.
     */
    window.addEventListener(
      "scroll",
      checkStickyVisibility,
      { passive: true }
    );

    /*
     * Check after resize/orientation change.
     */
    window.addEventListener(
      "resize",
      checkStickyVisibility
    );

    return () => {
      window.removeEventListener(
        "scroll",
        checkStickyVisibility
      );

      window.removeEventListener(
        "resize",
        checkStickyVisibility
      );
    };
  }, []);

  const handleAdd = () => {
    addToCart(product);

    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1200);
  };

  const image =
    product.product_images?.find(
      (item: any) => item.is_primary
    )?.image_url ||
    product.product_images?.[0]?.image_url;

  return (
    <div
      className={`
        fixed
        left-0
        right-0

        /*
         * IMPORTANT:
         * This places the sticky cart directly
         * above the mobile bottom navigation.
         */
        bottom-[76px]

        z-[200]

        border-t
        border-[#D4AF37]/20

        bg-[#080808]

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
        {/* PRODUCT IMAGE */}

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

        {/* PRODUCT INFORMATION */}

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

        {/* ADD BUTTON */}

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
          <ShoppingBag size={17} />

          {added ? "ADDED" : "ADD"}
        </button>
      </div>
    </div>
  );
}