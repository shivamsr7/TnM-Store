import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import WishlistButton from "@/features/wishlist/components/WishlistButton";

import {
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import type {
  Product,
} from "@/features/products/types/product.types";

import QuickViewModal from "./QuickViewModal";

import NotifyDialog from "@/features/notify/components/NotifyDialog";


/*
 * =========================================================
 * Collection Types
 * =========================================================
 */

interface ProductCollection {
  id: string;
  name: string;
  slug?: string | null;
}

interface ProductCollectionRelation {
  collections?:
    | ProductCollection
    | ProductCollection[]
    | null;
}


/*
 * =========================================================
 * Product Card Product Type
 * =========================================================
 */

type ProductCardProduct =
  Product & {

    product_images?: {

      image_url: string;

      is_primary: boolean;

      sort_order: number;

    }[];

    /*
     * Direct collection relationship.
     *
     * Example:
     *
     * collections: [
     *   {
     *     id,
     *     name: "Best Sellers",
     *     slug: "best-sellers"
     *   },
     *   {
     *     id,
     *     name: "New Arrivals",
     *     slug: "new-arrivals"
     *   }
     * ]
     */
    collections?: ProductCollection[];

    /*
     * Junction-table relationship.
     *
     * Example:
     *
     * product_collections: [
     *   {
     *     collections: {
     *       id,
     *       name,
     *       slug
     *     }
     *   }
     * ]
     */
    product_collections?:
      ProductCollectionRelation[];

  };


interface ProductCardProps {

  product: ProductCardProduct;

}


/*
 * =========================================================
 * Component
 * =========================================================
 */

export default function ProductCard({
  product,
}: ProductCardProps) {


  /*
   * =========================================================
   * Navigation
   * =========================================================
   */

  const navigate =
    useNavigate();


  /*
   * =========================================================
   * Product Images
   * =========================================================
   */

  const images =

    product.product_images

      ?.slice()

      .sort(
        (a, b) =>
          a.sort_order -
          b.sort_order
      )

      .map(
        (item) =>
          item.image_url
      )

    || [];


  /*
   * =========================================================
   * State
   * =========================================================
   */

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);


  const [
    hoverPreview,
    setHoverPreview,
  ] = useState(false);


  const [
    imageChanging,
    setImageChanging,
  ] = useState(false);


  const [
    imageLoaded,
    setImageLoaded,
  ] = useState(false);


  const [
    touchStart,
    setTouchStart,
  ] = useState<number | null>(
    null
  );


  const [
    showQuickView,
    setShowQuickView,
  ] = useState(false);


  const [
    showNotifyDialog,
    setShowNotifyDialog,
  ] = useState(false);


  /*
   * =========================================================
   * Cart
   * =========================================================
   */

  const {
    addToCart,
  } = useCartActions();


  /*
   * =========================================================
   * Availability
   * =========================================================
   */

  const isOutOfStock =
    product.stock <= 0 ||
    product.status ===
      "out_of_stock";


  /*
   * =========================================================
   * Display Image
   * =========================================================
   */

  const displayImage =

    hoverPreview &&
    activeImage === 0 &&
    images[1]

      ? images[1]

      : images[activeImage];


  /*
   * =========================================================
   * Discount
   * =========================================================
   */

  const discount =

    product.compare_price

      ? Math.round(
          (
            (
              product.compare_price -
              product.price
            ) /
            product.compare_price
          ) *
            100
        )

      : 0;


  /*
   * =========================================================
   * PRODUCT COLLECTIONS
   *
   * IMPORTANT:
   * Collections now come from the database relationship.
   *
   * We support both:
   *
   * 1. product.collections
   *
   * 2. product.product_collections[].collections
   *
   * No hardcoded collection names are used here.
   * =========================================================
   */



  /*
   * =========================================================
   * Open Product Details
   * =========================================================
   */

  const openProductDetails = () => {

    if (
      !product.slug
    ) {

      return;

    }


    navigate(
      `/product/${product.slug}`
    );

  };


  /*
   * =========================================================
   * Image Navigation
   * =========================================================
   */

  const changeImage = (
    index: number
  ) => {

    if (
      index === activeImage
    ) {

      return;

    }


    setImageChanging(
      true
    );

    setImageLoaded(
      false
    );


    setTimeout(
      () => {

        setActiveImage(
          index
        );

        setImageChanging(
          false
        );

      },
      180
    );

  };


  const previousImage = () => {

    if (
      !images.length
    ) {

      return;

    }


    setHoverPreview(
      false
    );


    changeImage(

      activeImage === 0

        ? images.length - 1

        : activeImage - 1

    );

  };


  const nextImage = () => {

    if (
      !images.length
    ) {

      return;

    }


    setHoverPreview(
      false
    );


    changeImage(

      activeImage ===
      images.length - 1

        ? 0

        : activeImage + 1

    );

  };


  /*
   * =========================================================
   * Touch Navigation
   * =========================================================
   */

  const handleTouchStart = (
    e: React.TouchEvent
  ) => {

    setTouchStart(
      e.touches[0].clientX
    );

  };


  const handleTouchEnd = (
    e: React.TouchEvent
  ) => {

    if (
      touchStart === null
    ) {

      return;

    }


    const touchEnd =
      e.changedTouches[0]
        .clientX;


    const distance =
      touchStart -
      touchEnd;


    if (
      Math.abs(distance) <
      50
    ) {

      setTouchStart(
        null
      );

      return;

    }


    if (
      distance > 0
    ) {

      nextImage();

    } else {

      previousImage();

    }


    setTouchStart(
      null
    );

  };


  /*
   * =========================================================
   * Add To Cart
   * =========================================================
   */

  const handleAddToCart = (
    e?: React.MouseEvent
  ) => {

    e?.preventDefault();

    e?.stopPropagation();


    if (
      isOutOfStock
    ) {

      setShowNotifyDialog(
        true
      );

      return;

    }


    addToCart(
      product
    );

  };


  /*
   * =========================================================
   * Open Notify Dialog
   * =========================================================
   */

  const handleNotifyMe = (
    e?: React.MouseEvent
  ) => {

    e?.preventDefault();

    e?.stopPropagation();


    if (
      !isOutOfStock
    ) {

      return;

    }


    setShowNotifyDialog(
      true
    );

  };


  /*
   * =========================================================
   * Render
   * =========================================================
   */

  return (

    <>

      <div

        onClick={
          openProductDetails
        }

        onKeyDown={(
          event
        ) => {

          if (
            event.key ===
              "Enter" ||

            event.key ===
              " "
          ) {

            event.preventDefault();

            openProductDetails();

          }

        }}

        role="link"

        tabIndex={0}

        className="
          group
          cursor-pointer
          overflow-hidden
          rounded-2xl
          bg-[#0b0b0b]
          border-0
          sm:border
          sm:border-[#D4AF37]/20
          transition-all
          duration-500
          sm:hover:-translate-y-1
          sm:hover:border-[#D4AF37]/70
        "

      >

        {/* =================================================
            IMAGE SECTION
        ================================================== */}

        <div

          onTouchStart={
            handleTouchStart
          }

          onTouchEnd={
            handleTouchEnd
          }

          onMouseEnter={() => {

            if (
              activeImage === 0
            ) {

              setHoverPreview(
                true
              );

            }

          }}

          onMouseLeave={() => {

            setHoverPreview(
              false
            );

          }}

          className="
            relative
            aspect-[4/5]
            overflow-hidden
            rounded-2xl
            bg-neutral-900
            sm:rounded-3xl
          "

        >

          {/* Product Image */}

          {displayImage && (

            <img

              src={
                displayImage
              }

              alt={
                product.name
              }

              onLoad={() =>
                setImageLoaded(
                  true
                )
              }

              className={`

                h-full
                w-full
                object-cover

                transition-all
                duration-500
                ease-out

                ${
                  imageChanging

                    ? "scale-95 opacity-0"

                    : imageLoaded

                      ? "scale-100 opacity-100"

                      : "scale-105 opacity-0"
                }

                group-hover:scale-105

              `}

            />

          )}


          {/* Bottom Gradient */}

          <div
            className="
              pointer-events-none
              absolute
              inset-x-0
              bottom-0
              h-24
              bg-gradient-to-t
              from-black/40
              via-black/10
              to-transparent
            "
          />


          {/* Discount Badge */}

          {discount > 0 && (

            <div
              className="
                absolute
                left-3
                top-3
                z-20
                rounded-full
                bg-[#D4AF37]
                px-3
                py-1
                text-xs
                font-semibold
                text-black
              "
            >

              {discount}% OFF

            </div>

          )}


          {/* Quick View */}

          <div
            className="
              absolute
              right-3
              top-3
              z-30
              opacity-100
              transition-opacity
              duration-300
              sm:opacity-0
              sm:group-hover:opacity-100
            "
          >

            <button

              type="button"

              onClick={(
                e
              ) => {

                e.preventDefault();

                e.stopPropagation();

                setShowQuickView(
                  true
                );

              }}

              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                bg-black/50
                text-white
                backdrop-blur-md
                transition
                hover:bg-[#D4AF37]
                hover:text-black
              "

            >

              <Eye
                size={16}
              />

            </button>

          </div>


          {/* =================================================
              COLLECTION BADGES
              Compact single-line DB collection strip.
              All assigned collections remain available and can
              be horizontally scrolled on smaller screens.
          ================================================== */}


          {/* Desktop Arrows */}

          {images.length > 1 && (

            <>

              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.preventDefault();

                  e.stopPropagation();

                  previousImage();

                }}

                className="
                  absolute
                  left-3
                  top-1/2
                  z-20
                  hidden
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-black/50
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                  sm:flex
                "

              >

                <ChevronLeft
                  size={16}
                />

              </button>


              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.preventDefault();

                  e.stopPropagation();

                  nextImage();

                }}

                className="
                  absolute
                  right-3
                  top-1/2
                  z-20
                  hidden
                  h-8
                  w-8
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  bg-black/50
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                  sm:flex
                "

              >

                <ChevronRight
                  size={16}
                />

              </button>

            </>

          )}

        </div>


        {/* =================================================
            DETAILS
        ================================================== */}

        <div
          className="
            flex
            flex-col
            p-3
            sm:p-5
          "
        >

          {/* Product Name */}

          <h3
            className="
              h-[42px]
              line-clamp-2
              text-sm
              font-medium
              leading-5
              text-[#F7E3A3]
              transition
              group-hover:text-[#D4AF37]
              sm:h-auto
              sm:text-lg
            "
          >

            {product.name}

          </h3>


          {/* Rating */}

          {product.rating > 0 && (

            <button
              type="button"
              onClick={(
                e
              ) => {

                e.preventDefault();

                e.stopPropagation();

                openProductDetails();

              }}
              aria-label="View product reviews"
              className="
                mt-2
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
                sm:mt-3
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

                {Array.from(
                  {
                    length: 5,
                  }
                ).map(
                  (
                    _,
                    index
                  ) => (

                    <span
                      key={
                        index
                      }
                      className="
                        leading-none
                      "
                    >
                      ★
                    </span>

                  )
                )}

              </span>


              <span
                className="
                  shrink-0
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


              {product.review_count >
                0 && (

                <span
                  className="
                    shrink-0
                    text-neutral-500
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

              )}

            </button>

          )}


          {/* Price */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-2
              sm:mt-4
              sm:gap-3
            "
          >

            <span
              className="
                text-lg
                font-semibold
                text-white
                sm:text-xl
              "
            >

              ₹
              {product.price}

            </span>


            {product.compare_price && (

              <span
                className="
                  text-xs
                  text-neutral-500
                  line-through
                  sm:text-sm
                "
              >

                ₹
                {
                  product.compare_price
                }

              </span>

            )}


            {discount > 0 && (

              <span
                className="
                  text-xs
                  font-medium
                  text-[#D4AF37]
                "
              >

                {discount}% OFF

              </span>

            )}

          </div>


          {/* =================================================
              CART / NOTIFY + WISHLIST
          ================================================== */}

          <div
            className="
              mt-auto
              flex
              gap-2
              pt-4
            "
            onClick={(
              e
            ) => {

              e.stopPropagation();

            }}
          >

            {isOutOfStock ? (

              <button

                type="button"

                onClick={
                  handleNotifyMe
                }

                className="
                  flex
                  min-h-10
                  flex-1
                  items-center
                  justify-center
                  rounded-full
                  bg-[#D4AF37]
                  px-4
                  text-xs
                  font-medium
                  text-black
                  transition-all
                  duration-300
                  hover:bg-[#E3C45F]
                  active:scale-[0.98]
                  sm:min-h-12
                  sm:text-sm
                "

              >

                Notify Me

              </button>

            ) : (

              <button

                type="button"

                onClick={
                  handleAddToCart
                }

                className="
                  flex
                  min-h-10
                  flex-1
                  items-center
                  justify-center
                  rounded-full
                  bg-white
                  px-4
                  text-xs
                  font-medium
                  text-black
                  transition-all
                  duration-300
                  hover:bg-[#D4AF37]
                  active:scale-[0.98]
                  sm:min-h-12
                  sm:text-sm
                "

              >

                Add To Cart

              </button>

            )}


            {/* Wishlist */}

            <div
              onClick={(
                e
              ) => {

                e.stopPropagation();

              }}
            >

              <WishlistButton

                productId={
                  product.id
                }

                iconSize={
                  18
                }

                className="
                  h-10
                  w-10
                  shrink-0
                  rounded-full
                  border
                  border-white/20
                  text-white
                  hover:border-[#D4AF37]
                  hover:text-[#D4AF37]
                  active:scale-95
                  sm:h-12
                  sm:w-12
                "

              />

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          QUICK VIEW
      ====================================================== */}

      <QuickViewModal

        product={
          product
        }

        open={
          showQuickView
        }

        onClose={() =>
          setShowQuickView(
            false
          )
        }

      />


      {/* =====================================================
          NOTIFY ME
      ====================================================== */}

      <NotifyDialog

        open={
          showNotifyDialog
        }

        onClose={() =>
          setShowNotifyDialog(
            false
          )
        }

        product={{

          id:
            product.id,

          name:
            product.name,

          image:
            product.product_images?.find(
              (
                image
              ) =>
                image.is_primary
            )?.image_url ??

            product.product_images?.[0]
              ?.image_url ??

            null,

        }}

      />

    </>

  );

}