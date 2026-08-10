import {
  useEffect,
  useMemo,
  useRef,
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


  /*
   * =========================================================
   * Mobile drag refs
   * =========================================================
   */

  const dragStartRef =
    useRef<number | null>(
      null
    );


  const dragYRef =
    useRef(0);


  const sheetRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const closeTimerRef =
    useRef<number | null>(
      null
    );


  /*
   * =========================================================
   * Images
   * =========================================================
   */

  const images =
    useMemo(() => {

      return [
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

    }, [
      product.product_images,
    ]);


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
   * Modal lifecycle
   * =========================================================
   */

  useEffect(() => {

    if (
      closeTimerRef.current !==
      null
    ) {

      window.clearTimeout(
        closeTimerRef.current
      );

      closeTimerRef.current =
        null;

    }


    if (open) {

      const previousOverflow =
        document.body.style.overflow;


      document.body.style.overflow =
        "hidden";


      setActiveImage(0);


      dragStartRef.current =
        null;


      dragYRef.current =
        0;


      if (
        sheetRef.current
      ) {

        sheetRef.current.style.transform =
          "";

        sheetRef.current.style.transition =
          "";

      }


      requestAnimationFrame(() => {

        setShow(true);

      });


      return () => {

        document.body.style.overflow =
          previousOverflow;

      };

    }


    setShow(false);


    dragStartRef.current =
      null;


    dragYRef.current =
      0;


    document.body.style.overflow =
      "";


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    open,
  ]);


  /*
   * =========================================================
   * Cleanup
   * =========================================================
   */

  useEffect(() => {

    return () => {

      if (
        closeTimerRef.current !==
        null
      ) {

        window.clearTimeout(
          closeTimerRef.current
        );

      }


      document.body.style.overflow =
        "";

    };

  }, []);


  /*
   * =========================================================
   * Add To Cart
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


    setActiveImage(
      index
    );

  };


  /*
   * =========================================================
   * Next image
   * =========================================================
   */

  const nextImage = () => {

    if (
      images.length <= 1
    ) {

      return;

    }


    setActiveImage(
      (current) =>
        current ===
          images.length - 1

          ? 0

          : current + 1
    );

  };


  /*
   * =========================================================
   * Previous image
   * =========================================================
   */

  const previousImage = () => {

    if (
      images.length <= 1
    ) {

      return;

    }


    setActiveImage(
      (current) =>
        current === 0

          ? images.length - 1

          : current - 1
    );

  };


  /*
   * =========================================================
   * Mobile drag transform
   * =========================================================
   */

  const applyDragTransform = (
    value: number
  ) => {

    const sheet =
      sheetRef.current;


    if (!sheet) {

      return;

    }


    sheet.style.transform =
      value > 0
        ? `translate3d(0, ${value}px, 0)`
        : "";

  };


  /*
   * =========================================================
   * Mobile swipe start
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


    const target =
      e.target as HTMLElement;


    if (
      target.closest("button") ||
      target.closest("a") ||
      target.closest("input")
    ) {

      return;

    }


    const touch =
      e.touches[0];


    if (!touch) {

      return;

    }


    dragStartRef.current =
      touch.clientY;


    dragYRef.current =
      0;


    const sheet =
      sheetRef.current;


    if (sheet) {

      sheet.style.transition =
        "none";

    }

  };


  /*
   * =========================================================
   * Mobile swipe move
   * =========================================================
   */

  const handleSheetTouchMove = (
    e: React.TouchEvent
  ) => {

    if (
      dragStartRef.current ===
      null
    ) {

      return;

    }


    const touch =
      e.touches[0];


    if (!touch) {

      return;

    }


    const distance =
      touch.clientY -
      dragStartRef.current;


    if (
      distance <= 0
    ) {

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


    const nextY =
      Math.min(
        resistance,
        220
      );


    dragYRef.current =
      nextY;


    applyDragTransform(
      nextY
    );

  };


  /*
   * =========================================================
   * Mobile swipe end
   * =========================================================
   */

  const handleSheetTouchEnd = () => {

    if (
      dragStartRef.current ===
      null
    ) {

      return;

    }


    const finalDrag =
      dragYRef.current;


    dragStartRef.current =
      null;


    if (
      finalDrag > 90
    ) {

      const sheet =
        sheetRef.current;


      if (sheet) {

        sheet.style.transition =
          "transform 180ms ease-out";

        sheet.style.transform =
          "translate3d(0, 100%, 0)";

      }


      closeTimerRef.current =
        window.setTimeout(() => {

          onClose();

        }, 180);


      return;

    }


    const sheet =
      sheetRef.current;


    if (sheet) {

      sheet.style.transition =
        "transform 220ms ease-out";

      sheet.style.transform =
        "translate3d(0, 0, 0)";

    }


    dragYRef.current =
      0;

  };


  /*
   * =========================================================
   * Sheet click
   * =========================================================
   */

  const handleSheetClick = (
    e: React.MouseEvent
  ) => {

    e.stopPropagation();

  };


  /*
   * =========================================================
   * Don't render when closed
   * =========================================================
   */

  if (
    !open
  ) {

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
        sm:items-center
        sm:p-5
      "

      onClick={
        onClose
      }

      role="dialog"

      aria-modal="true"

      aria-label={
        `Quick view of ${product.name}`
      }
    >

      {/* ===================================================
          MODAL SHEET
      ==================================================== */}

      <div
        ref={
          sheetRef
        }

        onClick={
          handleSheetClick
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
          willChange:
            "transform",

          transform:
            undefined,

          transition:
            "transform 300ms ease-out",
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

        {/* =================================================
            MOBILE HANDLE
        ================================================== */}

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


        {/* =================================================
            CLOSE
        ================================================== */}

        <button
          type="button"

          onClick={
            onClose
          }

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


        {/* =================================================
            IMAGE SIDE
        ================================================== */}

        <div
          className="
            relative
            shrink-0

            sm:flex
            sm:w-1/2
            sm:flex-col
            sm:p-5
          "
        >

          {/* Main Image */}

          <div
            className="
              relative
              aspect-[4/5]
              w-full
              overflow-hidden
              bg-neutral-900

              sm:aspect-auto
              sm:h-full
              sm:rounded-2xl
            "
          >

            {images.length > 0 ? (

              <img
                key={
                  images[activeImage]
                }

                src={
                  images[activeImage]
                }

                alt={
                  product.name
                }

                loading="eager"

                decoding="async"

                fetchPriority="high"

                draggable={false}

                className="
                  h-full
                  w-full
                  select-none
                  object-cover
                  transition-opacity
                  duration-150
                "
              />

            ) : (

              <div
                className="
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  text-xs
                  text-neutral-600
                "
              >
                No image available
              </div>

            )}


            {/* Desktop arrows */}

            {images.length > 1 && (

              <>

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
                    hidden
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    transition
                    hover:bg-[#D4AF37]
                    hover:text-black
                    sm:flex
                  "
                >

                  <ChevronLeft
                    size={19}
                  />

                </button>


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
                    hidden
                    h-10
                    w-10
                    -translate-y-1/2
                    items-center
                    justify-center
                    rounded-full
                    bg-black/50
                    text-white
                    transition
                    hover:bg-[#D4AF37]
                    hover:text-black
                    sm:flex
                  "
                >

                  <ChevronRight
                    size={19}
                  />

                </button>

              </>

            )}


            {/* Mobile counter */}

            {images.length > 1 && (

              <div
                className="
                  absolute
                  bottom-3
                  left-1/2
                  -translate-x-1/2
                  rounded-full
                  bg-black/55
                  px-2.5
                  py-1
                  text-[9px]
                  font-medium
                  text-white
                  sm:hidden
                "
              >

                {activeImage + 1}
                {" / "}
                {images.length}

              </div>

            )}

          </div>


          {/* =================================================
              MOBILE THUMBNAILS
          ================================================== */}

          {images.length > 1 && (

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                px-3
                py-3
                scrollbar-hide
                sm:hidden
              "
            >

              {images.map(
                (
                  image,
                  index
                ) => (

                  <button
                    key={
                      `${image}-${index}`
                    }

                    type="button"

                    onClick={() =>
                      changeImage(
                        index
                      )
                    }

                    aria-label={
                      `View image ${index + 1}`
                    }

                    aria-pressed={
                      activeImage ===
                      index
                    }

                    className={`
                      h-14
                      w-14
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border
                      bg-neutral-900
                      transition

                      ${
                        activeImage ===
                        index

                          ? `
                            border-[#D4AF37]
                            opacity-100
                          `

                          : `
                            border-white/[0.08]
                            opacity-60
                          `
                      }
                    `}
                  >

                    <img
                      src={
                        image
                      }

                      alt={
                        `${product.name} thumbnail ${index + 1}`
                      }

                      loading={
                        index < 3
                          ? "eager"
                          : "lazy"
                      }

                      decoding="async"

                      draggable={false}

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


          {/* =================================================
              DESKTOP THUMBNAILS
          ================================================== */}

          {images.length > 1 && (

            <div
              className="
                mt-3
                hidden
                gap-2
                overflow-x-auto
                scrollbar-hide
                sm:flex
              "
            >

              {images.map(
                (
                  image,
                  index
                ) => (

                  <button
                    key={
                      `${image}-desktop-${index}`
                    }

                    type="button"

                    onClick={() =>
                      changeImage(
                        index
                      )
                    }

                    aria-label={
                      `View image ${index + 1}`
                    }

                    className={`
                      h-16
                      w-16
                      shrink-0
                      overflow-hidden
                      rounded-lg
                      border-2
                      transition

                      ${
                        activeImage ===
                        index

                          ? `
                            border-[#D4AF37]
                            opacity-100
                          `

                          : `
                            border-transparent
                            opacity-60
                            hover:opacity-100
                          `
                      }
                    `}
                  >

                    <img
                      src={
                        image
                      }

                      alt={
                        `${product.name} thumbnail ${index + 1}`
                      }

                      loading="lazy"

                      decoding="async"

                      draggable={false}

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


        {/* =================================================
            DETAILS
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            px-5
            pb-28
            pt-1
            sm:px-7
            sm:py-7
            sm:pb-7
          "
        >

          <h2
            className="
              pr-10
              text-2xl
              font-semibold
              leading-tight
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
                text-sm
                text-[#D4AF37]
              "
            >

              <Star
                size={15}
                fill="currentColor"
              />

              <span>
                {product.rating}
              </span>

              {product.review_count >
                0 && (

                <span
                  className="
                    text-neutral-400
                  "
                >
                  (
                  {
                    product.review_count
                  }
                  )
                </span>

              )}

            </div>

          )}


          {/* Price */}

          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-3
            "
          >

            <span
              className="
                text-2xl
                font-bold
                text-white
              "
            >

              ₹{product.price}

            </span>


            {product.compare_price && (

              <span
                className="
                  text-sm
                  text-neutral-500
                  line-through
                "
              >

                ₹{
                  product.compare_price
                }

              </span>

            )}


            {discount > 0 && (

              <span
                className="
                  rounded-full
                  bg-[#D4AF37]/10
                  px-2.5
                  py-1
                  text-xs
                  font-medium
                  text-[#D4AF37]
                "
              >

                {discount}% OFF

              </span>

            )}

          </div>


          {/* Rewards */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              rounded-xl
              border
              border-[#D4AF37]/15
              bg-[#D4AF37]/[0.035]
              px-3
              py-3
              text-sm
              text-yellow-400
            "
          >

            <Coins
              size={17}
              className="shrink-0"
            />

            <div>

              <p
                className="
                  font-medium
                  text-yellow-400
                "
              >

                +{product.price} Reward Points

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
                </span>{" "}
                reward points on this purchase.

              </p>

            </div>

          </div>


          {/* Description */}

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

                {
                  product.short_description
                }

              </p>

            </div>

          )}


          {/* Trust features */}

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

                {
                  product.care_instructions
                }

              </p>

            </div>

          )}


          {/* Desktop actions */}

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

              {
                isOutOfStock
                  ? "Out of Stock"
                  : "Add To Cart"
              }

            </button>


            <a
              href={
                `/product/${product.slug}`
              }

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


        {/* =================================================
            MOBILE STICKY CTA
        ================================================== */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            z-30
            border-t
            border-white/[0.07]
            bg-[#090909]
            px-4
            pb-[calc(12px+env(safe-area-inset-bottom))]
            pt-3
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

              {
                isOutOfStock
                  ? "Out of Stock"
                  : "Add To Cart"
              }

            </button>

          </div>

        </div>

      </div>

    </div>

  );


  return createPortal(
    content,
    document.body
  );

}