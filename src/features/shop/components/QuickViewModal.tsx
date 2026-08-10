import {
  useEffect,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Coins,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

import type {
  Product,
} from "@/features/products/types/product.types";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";


interface QuickViewModalProps {

  product: Product & {

    product_images?: {

      image_url: string;

      sort_order: number;

    }[];

  };

  open: boolean;

  onClose: () => void;

}


export default function QuickViewModal({

  product,

  open,

  onClose,

}: QuickViewModalProps) {


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
   * State
   * =========================================================
   */

  const [
    show,
    setShow,
  ] = useState(false);


  const [
    activeImage,
    setActiveImage,
  ] = useState(0);


  const [
    imageChanging,
    setImageChanging,
  ] = useState(false);


  /*
   * Mobile swipe close
   */

  const [
    dragStart,
    setDragStart,
  ] = useState<number | null>(null);


  const [
    dragY,
    setDragY,
  ] = useState(0);


  /*
   * =========================================================
   * Modal lifecycle
   * =========================================================
   */

  useEffect(() => {

    if (open) {

      const previousOverflow =
        document.body.style.overflow;


      document.body.style.overflow =
        "hidden";


      setActiveImage(0);

      setDragY(0);


      requestAnimationFrame(() => {

        setShow(true);

      });


      return () => {

        document.body.style.overflow =
          previousOverflow;

      };

    }


    setShow(false);

    setDragY(0);

    document.body.style.overflow = "";


    return undefined;

  }, [open]);


  /*
   * =========================================================
   * Images
   * =========================================================
   */

  const images = [
    ...(product.product_images ?? []),
  ]
    .sort(
      (a, b) =>
        a.sort_order -
        b.sort_order
    )
    .map(
      (item) =>
        item.image_url
    );


  /*
   * =========================================================
   * Discount
   * =========================================================
   */

  const discount =

    product.compare_price &&
    product.compare_price >
      product.price

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
   * Stock
   * =========================================================
   */

  const isOutOfStock =

    Boolean(
      product.track_inventory &&
      product.stock <= 0 &&
      !product.allow_backorders
    );


  /*
   * =========================================================
   * Add To Cart
   * =========================================================
   */

  const handleAddToCart = () => {

    if (isOutOfStock) {
      return;
    }


    addToCart(product);

  };


  /*
   * =========================================================
   * Image change
   * =========================================================
   */

  const changeImage = (
    index: number
  ) => {

    if (
      index === activeImage ||
      index < 0 ||
      index >= images.length
    ) {
      return;
    }


    setImageChanging(true);


    window.setTimeout(() => {

      setActiveImage(index);

      setImageChanging(false);

    }, 130);

  };


  const nextImage = () => {

    if (images.length <= 1) {
      return;
    }


    changeImage(
      activeImage ===
        images.length - 1
        ? 0
        : activeImage + 1
    );

  };


  const previousImage = () => {

    if (images.length <= 1) {
      return;
    }


    changeImage(
      activeImage === 0
        ? images.length - 1
        : activeImage - 1
    );

  };


  /*
   * =========================================================
   * Mobile swipe
   * =========================================================
   */

  const handleSheetTouchStart = (
    e: React.TouchEvent
  ) => {

    if (
      window.innerWidth >= 640
    ) {
      return;
    }


    setDragStart(
      e.touches[0].clientY
    );

  };


  const handleSheetTouchMove = (
    e: React.TouchEvent
  ) => {

    if (
      dragStart === null
    ) {
      return;
    }


    const currentY =
      e.touches[0].clientY;


    const distance =
      currentY - dragStart;


    if (distance <= 0) {
      return;
    }


    const resistance =
      distance < 120

        ? distance

        : 120 +
          (
            (distance - 120) *
            0.35
          );


    setDragY(
      Math.min(
        resistance,
        220
      )
    );

  };


  const handleSheetTouchEnd = () => {

    if (
      dragStart === null
    ) {
      return;
    }


    if (
      dragY > 90
    ) {

      onClose();

    } else {

      setDragY(0);

    }


    setDragStart(null);

  };


  /*
   * =========================================================
   * Don't render
   * =========================================================
   */

  if (!open) {
    return null;
  }


  /*
   * =========================================================
   * Modal
   * =========================================================
   */

  const content = (

    <div
      className="
        fixed
        inset-0
        z-[999]
        flex
        items-end
        justify-center
        bg-black/75
        p-0
        backdrop-blur-md
        sm:items-center
        sm:p-5
      "
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view of ${product.name}`}
    >

      {/* =====================================================
          MODAL SHEET
      ====================================================== */}

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        onTouchStart={
          handleSheetTouchStart
        }

        onTouchMove={
          handleSheetTouchMove
        }

        onTouchEnd={
          handleSheetTouchEnd
        }

        style={{
          transform:
            dragY > 0
              ? `translate3d(0, ${dragY}px, 0)`
              : undefined,

          transition:
            dragY === 0
              ? "transform 300ms ease-out"
              : "none",
        }}

        className={`
          relative
          flex
          w-full
          max-h-[94vh]
          flex-col
          overflow-hidden
          rounded-t-[28px]
          border
          border-white/[0.07]
          bg-[#090909]
          shadow-[0_-20px_80px_rgba(0,0,0,0.55)]
          transition-transform
          duration-300
          ease-out

          ${
            show
              ? "translate-y-0"
              : "translate-y-full"
          }

          sm:h-[650px]
          sm:max-w-5xl
          sm:flex-row
          sm:items-stretch
          sm:rounded-[28px]
          sm:translate-y-0
        `}
      >

        {/* ===================================================
            Mobile Handle
        ==================================================== */}

        <div
          className="
            absolute
            left-1/2
            top-2.5
            z-30
            h-1
            w-11
            -translate-x-1/2
            rounded-full
            bg-white/20
            sm:hidden
          "
        />


        {/* ===================================================
            Close Button
        ==================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close quick view"
          className="
            absolute
            right-3
            top-3
            z-40
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-white/10
            bg-black/60
            text-white
            shadow-lg
            backdrop-blur-md
            transition-all
            hover:border-[#D4AF37]/40
            hover:bg-[#D4AF37]
            hover:text-black
            active:scale-95
            sm:right-5
            sm:top-5
          "
        >

          <X
            size={17}
          />

        </button>


        {/* ===================================================
            IMAGE SIDE
        ==================================================== */}

        <div
          className="
            shrink-0
            px-4
            pb-4
            pt-8
            sm:flex
            sm:w-[52%]
            sm:flex-col
            sm:px-6
            sm:py-6
          "
        >

          {/* Main Image */}

          <div
            className="
              relative
              aspect-[4/5]
              overflow-hidden
              rounded-2xl
              bg-[#111111]
              ring-1
              ring-white/[0.06]
              sm:flex-1
              sm:aspect-auto
            "
          >

            {images.length > 0 ? (

              <img
                src={
                  images[activeImage]
                }
                alt={
                  product.name
                }
                className={`
                  h-full
                  w-full
                  object-cover
                  transition-all
                  duration-300

                  ${
                    imageChanging
                      ? "scale-[0.985] opacity-0"
                      : "scale-100 opacity-100"
                  }
                `}
              />

            ) : (

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-neutral-700
                "
              >

                <ShoppingBag
                  size={34}
                  strokeWidth={1.3}
                />

              </div>

            )}


            {/* Image gradient */}

            <div
              className="
                pointer-events-none
                absolute
                inset-x-0
                bottom-0
                h-28
                bg-gradient-to-t
                from-black/45
                to-transparent
              "
            />


            {/* Discount */}

            {discount > 0 && (

              <div
                className="
                  absolute
                  left-3
                  top-3
                  rounded-full
                  bg-[#D4AF37]
                  px-3
                  py-1.5
                  text-[10px]
                  font-bold
                  tracking-wide
                  text-black
                  shadow-lg
                  sm:left-4
                  sm:top-4
                "
              >
                {discount}% OFF
              </div>

            )}


            {/* Stock */}

            <div
              className={`
                absolute
                bottom-3
                left-3
                inline-flex
                items-center
                gap-1.5
                rounded-full
                border
                px-2.5
                py-1.5
                text-[9px]
                font-medium
                backdrop-blur-md
                sm:bottom-4
                sm:left-4

                ${
                  isOutOfStock
                    ? `
                      border-red-400/20
                      bg-red-950/60
                      text-red-300
                    `
                    : `
                      border-emerald-400/20
                      bg-black/55
                      text-emerald-300
                    `
                }
              `}
            >

              <span
                className={`
                  h-1.5
                  w-1.5
                  rounded-full

                  ${
                    isOutOfStock
                      ? "bg-red-400"
                      : "bg-emerald-400"
                  }
                `}
              />

              {isOutOfStock
                ? "Out of Stock"
                : "In Stock"}

            </div>


            {/* Image counter */}

            {images.length > 1 && (

              <div
                className="
                  absolute
                  bottom-3
                  right-3
                  rounded-full
                  border
                  border-white/10
                  bg-black/55
                  px-2.5
                  py-1.5
                  text-[9px]
                  font-medium
                  text-white/80
                  backdrop-blur-md
                  sm:bottom-4
                  sm:right-4
                "
              >

                {activeImage + 1}

                {" / "}

                {images.length}

              </div>

            )}


            {/* Previous */}

            {images.length > 1 && (

              <button
                type="button"
                onClick={
                  previousImage
                }
                aria-label="Previous image"
                className="
                  absolute
                  left-3
                  top-1/2
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/45
                  text-white
                  backdrop-blur-md
                  transition-all
                  hover:border-[#D4AF37]/40
                  hover:bg-[#D4AF37]
                  hover:text-black
                  sm:left-4
                "
              >

                <ChevronLeft
                  size={17}
                />

              </button>

            )}


            {/* Next */}

            {images.length > 1 && (

              <button
                type="button"
                onClick={
                  nextImage
                }
                aria-label="Next image"
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  h-9
                  w-9
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-black/45
                  text-white
                  backdrop-blur-md
                  transition-all
                  hover:border-[#D4AF37]/40
                  hover:bg-[#D4AF37]
                  hover:text-black
                  sm:right-4
                "
              >

                <ChevronRight
                  size={17}
                />

              </button>

            )}

          </div>


          {/* =================================================
              Thumbnail Strip
          ================================================== */}

          {images.length > 1 && (

            <div
              className="
                mt-3
                flex
                gap-2
                overflow-x-auto
                pb-0.5
                scrollbar-none
                sm:mt-4
              "
            >

              {images.map(
                (
                  image,
                  index
                ) => (

                  <button
                    key={
                      image + index
                    }
                    type="button"
                    onClick={() =>
                      changeImage(index)
                    }
                    aria-label={
                      `View image ${index + 1}`
                    }
                    className={`
                      relative
                      h-14
                      w-11
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      transition-all

                      ${
                        activeImage === index
                          ? `
                            border-[#D4AF37]
                            ring-1
                            ring-[#D4AF37]/30
                          `
                          : `
                            border-white/10
                            opacity-60
                            hover:opacity-100
                          `
                      }
                    `}
                  >

                    <img
                      src={image}
                      alt=""
                      className="
                        h-full
                        w-full
                        object-cover
                      "
                    />

                  </button>

                )
              )}

            </div>

          )}

        </div>


        {/* ===================================================
            DETAILS SIDE
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            border-t
            border-white/[0.06]
            px-5
            pb-32
            pt-5
            scrollbar-thin
            scrollbar-track-transparent
            scrollbar-thumb-white/10
            sm:border-l
            sm:border-t-0
            sm:px-7
            sm:py-8
            sm:pb-8
          "
        >

          {/* Brand */}

          <div
            className="
              flex
              items-center
              gap-2
              text-[9px]
              font-medium
              uppercase
              tracking-[0.28em]
              text-[#C8A44D]
            "
          >

            <Sparkles
              size={12}
            />

            T&M Jewels

          </div>


          {/* Product Name */}

          <h2
            className="
              mt-2
              max-w-lg
              text-xl
              font-semibold
              leading-tight
              tracking-tight
              text-[#F7E3A3]
              sm:text-3xl
            "
          >
            {product.name}
          </h2>


          {/* Rating */}

          {product.rating > 0 && (

            <div
              className="
                mt-3
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#D4AF37]/15
                  bg-[#D4AF37]/[0.04]
                  px-2.5
                  py-1.5
                "
              >

                <Star
                  size={13}
                  fill="currentColor"
                  className="
                    text-[#D4AF37]
                  "
                />

                <span
                  className="
                    text-xs
                    font-medium
                    text-[#E6C96A]
                  "
                >
                  {product.rating}
                </span>

              </div>


              {product.review_count > 0 && (

                <span
                  className="
                    text-xs
                    text-neutral-500
                  "
                >
                  {product.review_count}
                  {" "}
                  {product.review_count === 1
                    ? "review"
                    : "reviews"}
                </span>

              )}

            </div>

          )}


          {/* Divider */}

          <div
            className="
              my-5
              h-px
              bg-white/[0.06]
            "
          />


          {/* Price */}

          <div
            className="
              flex
              flex-wrap
              items-end
              gap-x-3
              gap-y-1
            "
          >

            <span
              className="
                text-3xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              ₹{product.price}
            </span>


            {product.compare_price && (

              <span
                className="
                  pb-1
                  text-sm
                  text-neutral-600
                  line-through
                "
              >
                ₹{product.compare_price}
              </span>

            )}


            {discount > 0 && (

              <span
                className="
                  mb-1
                  rounded-full
                  bg-[#D4AF37]/10
                  px-2
                  py-1
                  text-[10px]
                  font-semibold
                  text-[#D4AF37]
                "
              >
                Save {discount}%
              </span>

            )}

          </div>


          {/* Reward Card */}

          <div
            className="
              mt-5
              rounded-2xl
              border
              border-[#D4AF37]/15
              bg-gradient-to-br
              from-[#D4AF37]/[0.09]
              via-[#D4AF37]/[0.035]
              to-transparent
              p-4
            "
          >

            <div
              className="
                flex
                items-start
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                "
              >

                <Coins
                  size={17}
                />

              </div>


              <div>

                <p
                  className="
                    text-xs
                    font-semibold
                    text-[#F7E3A3]
                  "
                >
                  Earn reward points
                </p>


                <p
                  className="
                    mt-1
                    text-[11px]
                    leading-5
                    text-neutral-500
                  "
                >
                  Earn{" "}
                  <span
                    className="
                      font-medium
                      text-[#D4AF37]
                    "
                  >
                    +{product.price}
                  </span>
                  {" "}
                  reward points on this purchase.
                </p>

              </div>

            </div>

          </div>


          {/* Short Description */}

          {product.short_description && (

            <div
              className="
                mt-5
              "
            >

              <p
                className="
                  text-sm
                  leading-6
                  text-neutral-400
                "
              >
                {product.short_description}
              </p>

            </div>

          )}


          {/* Trust Features */}

          <div
            className="
              mt-5
              grid
              grid-cols-2
              gap-2
            "
          >

            <div
              className="
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-3
                py-3
              "
            >

              <ShieldCheck
                size={16}
                className="
                  shrink-0
                  text-[#D4AF37]
                "
              />

              <span
                className="
                  text-[10px]
                  font-medium
                  text-neutral-400
                  sm:text-xs
                "
              >
                Premium Quality
              </span>

            </div>


            <div
              className="
                flex
                items-center
                gap-2.5
                rounded-xl
                border
                border-white/[0.06]
                bg-white/[0.025]
                px-3
                py-3
              "
            >

              <Sparkles
                size={16}
                className="
                  shrink-0
                  text-[#D4AF37]
                "
              />

              <span
                className="
                  text-[10px]
                  font-medium
                  text-neutral-400
                  sm:text-xs
                "
              >
                Crafted to Impress
              </span>

            </div>

          </div>


          {/* Care Instructions */}

          {product.care_instructions && (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-white/[0.06]
                bg-white/[0.02]
                p-4
              "
            >

              <h4
                className="
                  text-xs
                  font-semibold
                  text-[#D4AF37]
                "
              >
                Care Instructions
              </h4>


              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                {product.care_instructions}
              </p>

            </div>

          )}


          {/* =================================================
              Desktop Actions
          ================================================== */}

          <div
            className="
              mt-6
              hidden
              sm:block
            "
          >

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
                w-full
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#D4AF37]
                py-3.5
                text-sm
                font-semibold
                text-black
                shadow-[0_8px_25px_rgba(212,175,55,0.10)]
                transition-all
                hover:bg-[#E3C45F]
                hover:shadow-[0_10px_30px_rgba(212,175,55,0.16)]
                active:scale-[0.99]
                disabled:cursor-not-allowed
                disabled:bg-neutral-800
                disabled:text-neutral-500
                disabled:shadow-none
              "
            >

              <ShoppingBag
                size={16}
              />

              {isOutOfStock
                ? "Out of Stock"
                : "Add To Cart"}

            </button>


            <a
              href={`/product/${product.slug}`}
              onClick={(e) =>
                e.stopPropagation()
              }
              className="
                mt-3
                block
                text-center
                text-xs
                font-medium
                text-[#D4AF37]
                transition
                hover:text-[#F7E3A3]
              "
            >
              View Full Details →
            </a>

          </div>

        </div>


        {/* ===================================================
            MOBILE STICKY CTA
        ==================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-30
            border-t
            border-white/[0.07]
            bg-[#090909]/95
            px-4
            pb-[calc(12px+env(safe-area-inset-bottom))]
            pt-3
            backdrop-blur-xl
            sm:hidden
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                min-w-0
                flex-1
              "
            >

              <p
                className="
                  truncate
                  text-[10px]
                  text-neutral-500
                "
              >
                {product.name}
              </p>


              <p
                className="
                  mt-0.5
                  text-lg
                  font-semibold
                  text-white
                "
              >
                ₹{product.price}
              </p>

            </div>


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
                min-h-11
                min-w-[150px]
                items-center
                justify-center
                gap-2
                rounded-full
                bg-[#D4AF37]
                px-5
                text-xs
                font-semibold
                text-black
                transition
                active:scale-[0.98]
                disabled:cursor-not-allowed
                disabled:bg-neutral-800
                disabled:text-neutral-500
              "
            >

              <ShoppingBag
                size={15}
              />

              {isOutOfStock
                ? "Out of Stock"
                : "Add To Cart"}

            </button>

          </div>


          <a
            href={`/product/${product.slug}`}
            onClick={(e) =>
              e.stopPropagation()
            }
            className="
              mt-2
              block
              text-center
              text-[10px]
              font-medium
              text-[#D4AF37]
            "
          >
            View Full Details →
          </a>

        </div>

      </div>

    </div>

  );


  return createPortal(
    content,
    document.body
  );

}