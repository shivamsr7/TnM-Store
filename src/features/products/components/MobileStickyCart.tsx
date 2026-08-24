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

  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);

  const {
    addToCart,
  } = useCartActions();


  /* =====================================================
     SHOW STICKY CART ONLY WHEN ORIGINAL ADD BUTTON
     IS NO LONGER VISIBLE
  ===================================================== */

  useEffect(() => {

    const originalAddButton =
      document.querySelector(
        "[data-product-add-to-cart]"
      );

    if (!originalAddButton) {
      return;
    }


    const observer =
      new IntersectionObserver(
        ([entry]) => {

          /*
           * Original Add button visible
           * → hide sticky cart
           */
          if (entry.isIntersecting) {

            setVisible(false);

          }

          /*
           * Original Add button has left viewport
           * → show sticky cart
           */
          else {

            setVisible(true);

          }

        },
        {
          threshold: 0.1,
        }
      );


    observer.observe(originalAddButton);


    return () => {

      observer.disconnect();

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
            CTA
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
            : "ADD"}

        </button>

      </div>

    </div>

  );
}