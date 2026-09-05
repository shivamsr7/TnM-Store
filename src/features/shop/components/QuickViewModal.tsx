import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";

import type {
  TouchEvent,
  TouchList,
  WheelEvent,
} from "react";

import type {
  Product,
} from "@/features/products/types/product.types";

import {
  useCartActions,
} from "@/features/cart/hooks/useCartActions";

import {
  getEffectiveProductPrice,
  getSpecialDiscountAmount,
  hasSpecialProductDiscount,
} from "@/features/products/utils/specialDiscount";


interface QuickViewModalProps {
  product: Product & {
    product_images?: {
      image_url: string;
      sort_order: number;
    }[];

    special_discount_enabled?: boolean | null;
    special_discount_type?: "percentage" | "fixed" | null;
    special_discount_value?: number | null;
    special_discount_ends_at?: string | null;
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
   * CART
   * =========================================================
   */

  const {
    addToCart,
  } = useCartActions();


  /*
   * =========================================================
   * STATE
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
   * ZOOM STATE
   * =========================================================
   */

  const [
    zoomOpen,
    setZoomOpen,
  ] = useState(false);


  const [
    zoomLevel,
    setZoomLevel,
  ] = useState(1);


  const [
    zoomX,
    setZoomX,
  ] = useState(0);


  const [
    zoomY,
    setZoomY,
  ] = useState(0);


  /*
   * =========================================================
   * PINCH STATE
   * =========================================================
   */

  const pinchStartDistance =
    useRef<number | null>(null);

  const pinchStartZoom =
    useRef(1);


  /*
   * =========================================================
   * ZOOM SWIPE REFS
   * =========================================================
   */

  const zoomSwipeStartX =
    useRef<number | null>(null);

  const zoomSwipeStartY =
    useRef<number | null>(null);


  const zoomSwipeMoved =
    useRef(false);


  /*
   * =========================================================
   * QUICK VIEW IMAGE SWIPE REFS
   * =========================================================
   */

  const imageSwipeStartX =
    useRef<number | null>(null);

  const imageSwipeStartY =
    useRef<number | null>(null);


  /*
   * =========================================================
   * MOBILE SHEET DRAG REFS
   *
   * IMPORTANT:
   * These are ONLY used by the top drag handle.
   * They are NOT attached to the whole drawer.
   * =========================================================
   */

  const dragStartRef =
    useRef<number | null>(null);

  const dragYRef =
    useRef(0);

  const sheetRef =
    useRef<HTMLDivElement | null>(null);

  const closeTimerRef =
    useRef<number | null>(null);


  /*
   * =========================================================
   * IMAGES
   * =========================================================
   */

  const images = useMemo(() => {

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
   * DISCOUNT / SPECIAL PRICE
   * =========================================================
   */

  const hasSpecialDiscount =
    hasSpecialProductDiscount(product);

  const effectivePrice =
    getEffectiveProductPrice(product);

  const specialDiscountAmount =
    getSpecialDiscountAmount(product);

  const mrp =
    Number(product.compare_price) >
    Number(product.price)
      ? Number(product.compare_price)
      : 0;

  const discount =
    !hasSpecialDiscount &&
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

  const [countdownSeconds, setCountdownSeconds] =
    useState<number | null>(null);

  useEffect(() => {
    if (
      !hasSpecialDiscount ||
      !product.special_discount_ends_at
    ) {
      setCountdownSeconds(null);
      return;
    }

    const endsAt =
      new Date(
        product.special_discount_ends_at
      ).getTime();

    if (!Number.isFinite(endsAt)) {
      setCountdownSeconds(null);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.ceil(
          (endsAt - Date.now()) / 1000
        )
      );

      setCountdownSeconds(remaining);
    };

    updateCountdown();

    const interval =
      window.setInterval(
        updateCountdown,
        1000
      );

    return () =>
      window.clearInterval(interval);
  }, [
    hasSpecialDiscount,
    product.special_discount_ends_at,
  ]);

  const formatCountdown = (
    totalSeconds: number
  ) => {
    const days = Math.floor(
      totalSeconds / 86400
    );
    const hours = Math.floor(
      (totalSeconds % 86400) / 3600
    );
    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );
    const seconds =
      totalSeconds % 60;

    const paddedHours =
      String(hours).padStart(2, "0");
    const paddedMinutes =
      String(minutes).padStart(2, "0");
    const paddedSeconds =
      String(seconds).padStart(2, "0");

    if (days > 0) {
      return `${days}d ${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }

    if (hours > 0) {
      return `${paddedHours}h ${paddedMinutes}m ${paddedSeconds}s`;
    }

    if (minutes > 0) {
      return `${paddedMinutes}m ${paddedSeconds}s`;
    }

    return `${paddedSeconds}s`;
  };


  /*
   * =========================================================
   * STOCK
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
   * MODAL LIFECYCLE
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

      setZoomOpen(false);

      setZoomLevel(1);

      setZoomX(0);

      setZoomY(0);


      zoomSwipeStartX.current =
        null;

      zoomSwipeStartY.current =
        null;

      zoomSwipeMoved.current =
        false;


      pinchStartDistance.current =
        null;


      imageSwipeStartX.current =
        null;

      imageSwipeStartY.current =
        null;


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

    setZoomOpen(false);

    setZoomLevel(1);

    setZoomX(0);

    setZoomY(0);

    zoomSwipeStartX.current =
      null;

    zoomSwipeStartY.current =
      null;

    zoomSwipeMoved.current =
      false;

    pinchStartDistance.current =
      null;

    imageSwipeStartX.current =
      null;

    imageSwipeStartY.current =
      null;

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
   * CLEANUP
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
   * ADD TO CART
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
   * IMAGE CHANGE
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
   * NEXT IMAGE
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
   * PREVIOUS IMAGE
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
   * RESET ZOOM
   * =========================================================
   */

  const resetZoom = () => {

    setZoomLevel(1);

    setZoomX(0);

    setZoomY(0);

  };


  /*
   * =========================================================
   * OPEN ZOOM
   * =========================================================
   */

  const openZoom = () => {

    resetZoom();

    setZoomOpen(true);

  };


  /*
   * =========================================================
   * CLOSE ZOOM
   * =========================================================
   */

  const closeZoom = () => {

    resetZoom();

    setZoomOpen(false);

  };


  /*
   * =========================================================
   * ZOOM IN
   * =========================================================
   */

  const zoomIn = () => {

    setZoomLevel(
      (current) =>
        Math.min(
          current + 0.5,
          3
        )
    );

  };


  /*
   * =========================================================
   * ZOOM OUT
   * =========================================================
   */

  const zoomOut = () => {

    setZoomLevel(
      (current) => {

        const next =
          Math.max(
            current - 0.5,
            1
          );


        if (
          next === 1
        ) {

          setZoomX(0);

          setZoomY(0);

        }


        return next;

      }
    );

  };


  /*
   * =========================================================
   * TOUCH DISTANCE
   * =========================================================
   */

  const getTouchDistance = (
    touches: TouchList
  ) => {

    if (
      touches.length < 2
    ) {

      return 0;

    }


    const first =
      touches[0];

    const second =
      touches[1];


    if (
      !first ||
      !second
    ) {

      return 0;

    }


    const dx =
      first.clientX -
      second.clientX;

    const dy =
      first.clientY -
      second.clientY;


    return Math.sqrt(
      dx * dx +
      dy * dy
    );

  };


  /*
   * =========================================================
   * QUICK VIEW IMAGE TOUCH START
   *
   * Horizontal swipe is handled only on the image.
   * The drawer itself does NOT receive this handler.
   * =========================================================
   */

  const handleImageTouchStart = (
    e: TouchEvent
  ) => {

    if (
      images.length <= 1
    ) {

      return;

    }


    if (
      e.touches.length !== 1
    ) {

      return;

    }


    const touch =
      e.touches[0];

    if (!touch) {

      return;

    }


    imageSwipeStartX.current =
      touch.clientX;

    imageSwipeStartY.current =
      touch.clientY;

  };


  /*
   * =========================================================
   * QUICK VIEW IMAGE TOUCH MOVE
   *
   * Prevent browser horizontal navigation while the
   * customer is clearly swiping horizontally.
   * =========================================================
   */

  const handleImageTouchMove = (
    e: TouchEvent
  ) => {

    if (
      imageSwipeStartX.current ===
        null ||
      imageSwipeStartY.current ===
        null ||
      e.touches.length !== 1
    ) {

      return;

    }


    const touch =
      e.touches[0];

    if (!touch) {

      return;

    }


    const deltaX =
      touch.clientX -
      imageSwipeStartX.current;

    const deltaY =
      touch.clientY -
      imageSwipeStartY.current;


    if (
      Math.abs(deltaX) > 15 &&
      Math.abs(deltaX) >
        Math.abs(deltaY)
    ) {

      if (
        e.cancelable
      ) {

        e.preventDefault();

      }

    }

  };


  /*
   * =========================================================
   * QUICK VIEW IMAGE TOUCH END
   * =========================================================
   */

  const handleImageTouchEnd = (
    e: TouchEvent
  ) => {

    if (
      imageSwipeStartX.current ===
        null ||
      imageSwipeStartY.current ===
        null
    ) {

      return;

    }


    const touch =
      e.changedTouches[0];

    if (!touch) {

      imageSwipeStartX.current =
        null;

      imageSwipeStartY.current =
        null;

      return;

    }


    const deltaX =
      touch.clientX -
      imageSwipeStartX.current;

    const deltaY =
      touch.clientY -
      imageSwipeStartY.current;


    const horizontalDistance =
      Math.abs(deltaX);

    const verticalDistance =
      Math.abs(deltaY);


    if (
      images.length > 1 &&
      horizontalDistance >= 50 &&
      horizontalDistance >
        verticalDistance
    ) {

      if (
        deltaX < 0
      ) {

        nextImage();

      } else {

        previousImage();

      }

    }


    imageSwipeStartX.current =
      null;

    imageSwipeStartY.current =
      null;

  };


  /*
   * =========================================================
   * ZOOM TOUCH START
   * =========================================================
   */

  const handleZoomTouchStart = (
    e: TouchEvent
  ) => {

    /*
     * TWO FINGERS
     *
     * Start pinch zoom and cancel swipe.
     */

    if (
      e.touches.length >= 2
    ) {

      zoomSwipeStartX.current =
        null;

      zoomSwipeStartY.current =
        null;

      zoomSwipeMoved.current =
        false;


      pinchStartDistance.current =
        getTouchDistance(
          e.touches
        );

      pinchStartZoom.current =
        zoomLevel;

      return;

    }


    /*
     * ONE FINGER
     */

    if (
      e.touches.length === 1
    ) {

      const touch =
        e.touches[0];

      if (!touch) {

        return;

      }


      zoomSwipeStartX.current =
        touch.clientX;

      zoomSwipeStartY.current =
        touch.clientY;

      zoomSwipeMoved.current =
        false;

    }

  };


  /*
   * =========================================================
   * ZOOM TOUCH MOVE
   * =========================================================
   */

  const handleZoomTouchMove = (
    e: TouchEvent
  ) => {

    /*
     * PINCH ZOOM
     */

    if (
      e.touches.length >= 2
    ) {

      if (
        pinchStartDistance.current ===
        null
      ) {

        return;

      }


      const currentDistance =
        getTouchDistance(
          e.touches
        );


      if (
        currentDistance <= 0
      ) {

        return;

      }


      const ratio =
        currentDistance /
        pinchStartDistance.current;


      const nextZoom =
        Math.min(
          Math.max(
            pinchStartZoom.current *
              ratio,
            1
          ),
          3
        );


      setZoomLevel(
        nextZoom
      );


      if (
        e.cancelable
      ) {

        e.preventDefault();

      }

      return;

    }


    /*
     * ONE FINGER
     */

    if (
      e.touches.length === 1 &&
      zoomSwipeStartX.current !== null &&
      zoomSwipeStartY.current !== null
    ) {

      const touch =
        e.touches[0];

      if (!touch) {

        return;

      }


      const deltaX =
        touch.clientX -
        zoomSwipeStartX.current;

      const deltaY =
        touch.clientY -
        zoomSwipeStartY.current;


      if (
        Math.abs(deltaX) > 15 &&
        Math.abs(deltaX) >
          Math.abs(deltaY)
      ) {

        zoomSwipeMoved.current =
          true;

      }

    }

  };


  /*
   * =========================================================
   * ZOOM TOUCH END
   * =========================================================
   */

  const handleZoomTouchEnd = (
    e: TouchEvent
  ) => {

    if (
      pinchStartDistance.current !==
      null
    ) {

      pinchStartDistance.current =
        null;

    }


    if (
      zoomSwipeStartX.current === null ||
      zoomSwipeStartY.current === null
    ) {

      return;

    }


    const touch =
      e.changedTouches[0];

    if (!touch) {

      zoomSwipeStartX.current =
        null;

      zoomSwipeStartY.current =
        null;

      zoomSwipeMoved.current =
        false;

      return;

    }


    const deltaX =
      touch.clientX -
      zoomSwipeStartX.current;

    const deltaY =
      touch.clientY -
      zoomSwipeStartY.current;


    const horizontalDistance =
      Math.abs(deltaX);

    const verticalDistance =
      Math.abs(deltaY);


    const isHorizontalSwipe =
      images.length > 1 &&
      zoomLevel <= 1.01 &&
      horizontalDistance >= 50 &&
      horizontalDistance >
        verticalDistance;


    if (
      isHorizontalSwipe
    ) {

      if (
        deltaX < 0
      ) {

        nextImage();

      } else {

        previousImage();

      }


      resetZoom();

    }


    zoomSwipeStartX.current =
      null;

    zoomSwipeStartY.current =
      null;

    zoomSwipeMoved.current =
      false;

  };


  /*
   * =========================================================
   * ZOOM WHEEL
   * =========================================================
   */

  const handleZoomWheel = (
    e: WheelEvent
  ) => {

    e.preventDefault();


    if (
      e.deltaY < 0
    ) {

      zoomIn();

    } else {

      zoomOut();

    }

  };


  /*
   * =========================================================
   * ZOOM KEYBOARD
   * =========================================================
   */

  useEffect(() => {

    if (
      !zoomOpen
    ) {

      return;

    }


    const handleKeyDown = (
      event: KeyboardEvent
    ) => {

      if (
        event.key ===
        "Escape"
      ) {

        closeZoom();

        return;

      }


      if (
        event.key ===
        "ArrowRight"
      ) {

        nextImage();

        resetZoom();

        return;

      }


      if (
        event.key ===
        "ArrowLeft"
      ) {

        previousImage();

        resetZoom();

        return;

      }


      if (
        event.key ===
          "+" ||
        event.key ===
          "="
      ) {

        zoomIn();

        return;

      }


      if (
        event.key ===
        "-"
      ) {

        zoomOut();

      }

    };


    window.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, [
    zoomOpen,
    activeImage,
  ]);


  /*
   * =========================================================
   * MOBILE SHEET DRAG
   *
   * IMPORTANT:
   * These handlers are attached ONLY to the small
   * top drag-handle area.
   *
   * They are NOT attached to the body/details area.
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


  const handleSheetTouchStart = (
    e: React.TouchEvent
  ) => {

    if (
      window.innerWidth >= 640
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


    if (
      e.cancelable
    ) {

      e.preventDefault();

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
   * SHEET CLICK
   * =========================================================
   */

  const handleSheetClick = (
    e: React.MouseEvent
  ) => {

    e.stopPropagation();

  };


  /*
   * =========================================================
   * ZOOM VIEWER
   * =========================================================
   */

  const zoomViewer =
    zoomOpen &&
    images.length > 0
      ? (

        <div
          className="
            fixed
            inset-0
            z-[10000]

            flex
            items-center
            justify-center

            bg-black/95

            backdrop-blur-sm
          "

          style={{
            height: "100dvh",
            touchAction: "none",
          }}

          onClick={
            closeZoom
          }

          onTouchStart={
            handleZoomTouchStart
          }

          onTouchMove={
            handleZoomTouchMove
          }

          onTouchEnd={
            handleZoomTouchEnd
          }

          onWheel={
            handleZoomWheel
          }

          role="dialog"

          aria-modal="true"

          aria-label={
            `Zoomed image of ${product.name}`
          }
        >

          {/* TOP BAR */}

          <div
            className="
              absolute
              left-0
              right-0
              top-0
              z-30

              flex
              items-center
              justify-between

              px-4
              py-4

              sm:px-6
              sm:py-5
            "
          >

            <div
              className="
                rounded-full

                bg-black/50

                px-3
                py-1.5

                text-xs

                text-white
              "
            >

              {activeImage + 1}
              {" / "}
              {images.length}

            </div>


            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                closeZoom();

              }}

              aria-label="Close image viewer"

              className="
                flex
                h-10
                w-10

                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-black/60

                text-white

                transition

                hover:bg-[#D4AF37]
                hover:text-black

                active:scale-95
              "
            >

              <X
                size={19}
              />

            </button>

          </div>


          {/* IMAGE */}

          <div
            className="
              relative

              flex
              h-full
              w-full

              items-center
              justify-center

              overflow-hidden

              px-4
              py-20

              sm:px-20
              sm:py-24
            "
          >

            <img
              key={
                images[activeImage]
              }

              src={
                images[activeImage]
              }

              alt={
                `${product.name} enlarged`
              }

              draggable={false}

              onClick={(e) =>
                e.stopPropagation()
              }

              className="
                max-h-full
                max-w-full

                select-none

                object-contain

                transition-transform
                duration-150
                ease-out
              "

              style={{
                transform:
                  `translate3d(${zoomX}px, ${zoomY}px, 0) scale(${zoomLevel})`,

                transformOrigin:
                  "center center",
              }}
            />

          </div>


          {/* PREVIOUS */}

          {images.length > 1 && (

            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                previousImage();

                resetZoom();

              }}

              aria-label="Previous image"

              className="
                absolute
                left-3
                top-1/2
                z-30

                flex

                h-11
                w-11

                -translate-y-1/2

                items-center
                justify-center

                rounded-full

                bg-black/60

                text-white

                shadow-lg

                backdrop-blur-sm

                transition

                hover:bg-[#D4AF37]
                hover:text-black

                active:scale-90

                sm:left-5
                sm:h-11
                sm:w-11
              "
            >

              <ChevronLeft
                size={22}
              />

            </button>

          )}


          {/* NEXT */}

          {images.length > 1 && (

            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                nextImage();

                resetZoom();

              }}

              aria-label="Next image"

              className="
                absolute
                right-3
                top-1/2
                z-30

                flex

                h-11
                w-11

                -translate-y-1/2

                items-center
                justify-center

                rounded-full

                bg-black/60

                text-white

                shadow-lg

                backdrop-blur-sm

                transition

                hover:bg-[#D4AF37]
                hover:text-black

                active:scale-90

                sm:right-5
                sm:h-11
                sm:w-11
              "
            >

              <ChevronRight
                size={22}
              />

            </button>

          )}


          {/* ZOOM CONTROLS */}

          <div
            className="
              absolute

              bottom-5
              left-1/2

              z-30

              flex

              -translate-x-1/2

              items-center
              gap-1.5

              rounded-full

              border
              border-white/10

              bg-black/70

              p-1.5

              shadow-xl
            "
          >

            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                zoomOut();

              }}

              disabled={
                zoomLevel <= 1
              }

              aria-label="Zoom out"

              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-full

                text-white

                transition

                hover:bg-white/10

                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >

              <ZoomOut
                size={18}
              />

            </button>


            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                resetZoom();

              }}

              aria-label="Reset zoom"

              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-full

                text-white

                transition

                hover:bg-white/10
              "
            >

              <RotateCcw
                size={17}
              />

            </button>


            <span
              className="
                min-w-[42px]

                text-center

                text-xs
                font-medium

                text-white
              "
            >

              {Math.round(
                zoomLevel * 100
              )}%

            </span>


            <button
              type="button"

              onClick={(e) => {

                e.stopPropagation();

                zoomIn();

              }}

              disabled={
                zoomLevel >= 3
              }

              aria-label="Zoom in"

              className="
                flex
                h-9
                w-9

                items-center
                justify-center

                rounded-full

                text-white

                transition

                hover:bg-white/10

                disabled:cursor-not-allowed
                disabled:opacity-30
              "
            >

              <ZoomIn
                size={18}
              />

            </button>

          </div>


          {/* MOBILE IMAGE INDICATORS */}

          {images.length > 1 && (

            <div
              className="
                absolute
                bottom-20
                left-1/2

                z-30

                flex

                -translate-x-1/2

                gap-1.5

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
                      `${image}-zoom-${index}`
                    }

                    type="button"

                    onClick={(e) => {

                      e.stopPropagation();

                      changeImage(
                        index
                      );

                      resetZoom();

                    }}

                    aria-label={
                      `View image ${index + 1}`
                    }

                    className={`
                      h-1.5
                      rounded-full

                      transition-all

                      ${
                        activeImage ===
                        index

                          ? "w-5 bg-[#D4AF37]"

                          : "w-1.5 bg-white/40"
                      }
                    `}
                  />

                )
              )}

            </div>

          )}

        </div>

      )
      : null;


  /*
   * =========================================================
   * DON'T RENDER WHEN CLOSED
   * =========================================================
   */

  if (
    !open
  ) {

    return null;

  }


  /*
   * =========================================================
   * MODAL CONTENT
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

      style={{
        height: "100dvh",
      }}

      onClick={
        onClose
      }

      role="dialog"

      aria-modal="true"

      aria-label={
        `Quick view of ${product.name}`
      }
    >

      {/* =====================================================
          MODAL SHEET
      ====================================================== */}

      <div
        ref={
          sheetRef
        }

        onClick={
          handleSheetClick
        }

        style={{
          willChange:
            "transform",

          transition:
            "transform 300ms ease-out",
        }}

        className={`
          relative

          flex

          w-full

          max-h-[calc(100dvh-8px)]

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
          sm:max-h-none
          sm:max-w-5xl

          sm:flex-row
          sm:items-stretch

          sm:rounded-[28px]

          sm:translate-y-0
        `}
      >

        {/* =================================================
            MOBILE DRAG HANDLE AREA

            ONLY THIS AREA CAN DRAG THE DRAWER.
            The product content below will NOT move the
            drawer when the customer scrolls.
        ================================================== */}

        <div
          className="
            absolute
            left-0
            right-0
            top-0
            z-[45]

            flex
            h-9

            items-start
            justify-center

            sm:hidden

            touch-none
          "

          onTouchStart={
            handleSheetTouchStart
          }

          onTouchMove={
            handleSheetTouchMove
          }

          onTouchEnd={
            handleSheetTouchEnd
          }
        >

          <div
            className="
              mt-2.5

              h-1
              w-11

              rounded-full

              bg-white/20
            "
          />

        </div>


        {/* =================================================
            CLOSE BUTTON
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
            z-50

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
        ================================================= */}

        <div
          className="
            relative
            shrink-0

            sm:flex
            sm:w-1/2
            sm:flex-col
            sm:p-5

            sm:min-h-0
          "
        >

          {/* MAIN IMAGE */}

          <div
            className="
              relative

              aspect-[4/5]

              w-full

              max-h-[48dvh]

              overflow-hidden

              bg-neutral-900

              sm:aspect-auto

              sm:h-full

              sm:min-h-0

              sm:max-h-none

              sm:rounded-2xl
            "

            style={{
              touchAction:
                "pan-y",
            }}

            onTouchStart={
              handleImageTouchStart
            }

            onTouchMove={
              handleImageTouchMove
            }

            onTouchEnd={
              handleImageTouchEnd
            }
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


            {/* ZOOM / PLUS BUTTON */}

            {images.length > 0 && (

              <button
                type="button"

                onClick={(e) => {

                  e.stopPropagation();

                  openZoom();

                }}

                aria-label="Zoom image"

                className="
                  absolute

                  bottom-3
                  left-3

                  z-20

                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  bg-black/55

                  text-white

                  shadow-lg

                  backdrop-blur-sm

                  transition-all

                  hover:bg-[#D4AF37]
                  hover:text-black

                  active:scale-95

                  sm:bottom-4
                  sm:left-4
                "
              >

                <ZoomIn
                  size={21}
                />

              </button>

            )}


            {/* DESKTOP ARROWS */}

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


            {/* MOBILE IMAGE COUNTER */}

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
          ================================================= */}

          {images.length > 1 && (

            <div
              className="
                flex

                w-full

                min-w-0

                gap-2

                overflow-x-auto
                overflow-y-hidden

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

                      min-h-14
                      min-w-14

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
          ================================================= */}

          {images.length > 1 && (

            <div
              className="
                mt-3

                hidden

                w-full

                min-w-0

                shrink-0

                flex-nowrap

                gap-2

                overflow-x-auto
                overflow-y-hidden

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

                    aria-pressed={
                      activeImage ===
                      index
                    }

                    className={`
                      h-16
                      w-16

                      min-h-16
                      min-w-16

                      shrink-0

                      overflow-hidden

                      rounded-lg

                      border-2

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
            DETAILS / SCROLLABLE BODY

            THIS IS NOW COMPLETELY SEPARATE FROM THE
            DRAWER DRAG GESTURE.
        ================================================= */}

        <div
          className="
            min-h-0

            flex-1

            overflow-y-auto
            overflow-x-hidden

            overscroll-contain

            touch-pan-y

            px-5

            pb-[calc(100px+env(safe-area-inset-bottom))]

            pt-3

            sm:px-7
            sm:py-7
            sm:pb-7

            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "
        >

          {/* PRODUCT NAME */}

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


          {/* Rating — matches ProductCard */}

          <div
            className="
              mt-3
              flex
              min-h-[22px]
              items-center
            "
          >

            {product.rating > 0 && (

              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-1.5
                  text-left
                  text-sm
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

                  {Array.from({ length: 5 }).map((_, index) => (
                    <span
                      key={index}
                      className="leading-none"
                    >
                      ★
                    </span>
                  ))}

                </span>

                <span
                  className="
                    shrink-0
                    font-medium
                    text-white
                  "
                >
                  {Number(product.rating).toFixed(1)}
                </span>

                {product.review_count > 0 && (
                  <span
                    className="
                      shrink-0
                      text-neutral-500
                    "
                  >
                    ({product.review_count})
                  </span>
                )}

              </div>

            )}

          </div>


          {/* PRICE / SPECIAL PRICE */}

          <div
            className="
              mt-4
            "
          >

            {hasSpecialDiscount && mrp > 0 && (
              <div
                className="
                  mb-1
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-neutral-500
                "
              >
                MRP ₹{mrp.toFixed(2)}
              </div>
            )}

            <div
              className="
                flex
                flex-wrap
                items-baseline
                gap-x-3
                gap-y-1.5
              "
            >

              <span
                className="
                  text-2xl
                  font-bold
                  text-white
                "
              >
                ₹{effectivePrice.toFixed(2)}
              </span>

              {hasSpecialDiscount && (
                <span
                  className="
                    text-sm
                    text-neutral-500
                    line-through
                  "
                >
                  ₹{Number(product.price).toFixed(2)}
                </span>
              )}

              {!hasSpecialDiscount &&
                product.compare_price && (
                  <span
                    className="
                      text-sm
                      text-neutral-500
                      line-through
                    "
                  >
                    ₹{product.compare_price}
                  </span>
                )}

              {hasSpecialDiscount && (
                <span
                  className="
                    rounded-md
                    border
                    border-[#D4AF37]/50
                    bg-[#D4AF37]/10
                    px-2
                    py-0.5
                    text-xs
                    font-semibold
                    tracking-wide
                    text-[#D4AF37]
                  "
                >
                  {product.special_discount_type ===
                  "percentage"
                    ? `${Math.min(
                        Number(product.special_discount_value) || 0,
                        100
                      )}% OFF`
                    : `₹${specialDiscountAmount.toFixed(0)} OFF`}
                </span>
              )}

              {!hasSpecialDiscount &&
                discount > 0 && (
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

            {hasSpecialDiscount && (
              <div className="mt-1.5 self-start">
                <span
                  className="
                    inline-flex
                    w-auto
                    max-w-max
                    items-center
                    gap-1.5
                    rounded-md
                    border
                    border-[#D8C27A]
                    bg-[#F5E6B8]
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-black
                    sm:text-[11px]
                  "
                >
                  <span aria-hidden="true">✦</span>
                  <span>Special Price</span>
                </span>
              </div>
            )}

            {hasSpecialDiscount &&
              countdownSeconds !== null &&
              countdownSeconds > 0 && (
                <div
                  className="
                    mt-3
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-red-500/60
                    bg-red-500/[0.06]
                    px-3
                    py-1.5
                    text-[10px]
                    font-semibold
                    tracking-[0.02em]
                    text-red-400
                  "
                >
                  ⏱ Offer ends in {formatCountdown(countdownSeconds)}
                </div>
              )}

          </div>


          {/* SHORT DESCRIPTION */}

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


          {/* CARE INSTRUCTIONS */}

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


          {/* DESKTOP ACTIONS */}

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
        ================================================= */}

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

                ₹{effectivePrice.toFixed(2)}

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


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {createPortal(
        content,
        document.body
      )}


      {zoomViewer &&
        createPortal(
          zoomViewer,
          document.body
        )}

    </>

  );

}