import {
  useEffect,
  useRef,
  useState,
} from "react";

import type {
  TouchEvent,
  TouchList,
  WheelEvent,
} from "react";

import {
  ChevronLeft,
  ChevronRight,
  Share2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from "lucide-react";

import {
  useParams,
} from "react-router-dom";

import WishlistButton from "@/features/wishlist/components/WishlistButton";


interface ProductGalleryProps {

  productId: string;

  images: {
    image_url: string;
    sort_order: number;
  }[];

  productName: string;

}


export default function ProductGallery({

  productId,

  images,

  productName,

}: ProductGalleryProps) {


  /*
   * =========================================================
   * CURRENT PRODUCT ROUTE
   * =========================================================
   *
   * Example:
   *
   * /product/crystal-drop-mangalsutra
   *
   * useParams() gives:
   *
   * slug = "crystal-drop-mangalsutra"
   *
   * This is more reliable than passing productSlug
   * from ProductDetails.
   */

  const {
    slug,
  } = useParams<{
    slug?: string;
  }>();


  /*
   * =========================================================
   * IMAGE LIST
   * =========================================================
   */

  const imageList = [
    ...images,
  ].sort(
    (a, b) =>
      a.sort_order -
      b.sort_order
  );


  /*
   * =========================================================
   * MAIN IMAGE STATE
   * =========================================================
   */

  const [
    activeImage,
    setActiveImage,
  ] = useState(0);


  const [
    direction,
    setDirection,
  ] = useState<
    "next" | "prev" | null
  >(null);


  const [
    loaded,
    setLoaded,
  ] = useState(false);


  const [
    touchStart,
    setTouchStart,
  ] = useState<number | null>(
    null
  );


  /*
   * =========================================================
   * MOBILE THUMBNAILS
   * =========================================================
   */

  const mobileThumbnailRef =
    useRef<HTMLDivElement | null>(
      null
    );


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


  /*
   * =========================================================
   * SHARE STATE
   * =========================================================
   */

  const [
    shareStatus,
    setShareStatus,
  ] = useState<
    "idle" | "copied"
  >("idle");


  /*
   * =========================================================
   * PINCH STATE
   * =========================================================
   */

  const pinchStartDistance =
    useRef<number | null>(
      null
    );


  const pinchStartZoom =
    useRef(1);


  /*
   * =========================================================
   * ZOOM PAN
   * =========================================================
   */

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
   * AUTO-SCROLL ACTIVE MOBILE THUMBNAIL
   * =========================================================
   */

  useEffect(() => {

    const container =
      mobileThumbnailRef.current;


    if (!container) {

      return;

    }


    const activeThumbnail =
      container.children[
        activeImage
      ] as HTMLElement | undefined;


    if (!activeThumbnail) {

      return;

    }


    activeThumbnail.scrollIntoView({

      behavior: "smooth",

      block: "nearest",

      inline: "center",

    });

  }, [
    activeImage,
  ]);


  /*
   * =========================================================
   * LOCK BODY SCROLL WHEN ZOOM IS OPEN
   * =========================================================
   */

  useEffect(() => {

    if (!zoomOpen) {

      return;

    }


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    return () => {

      document.body.style.overflow =
        previousOverflow;

    };

  }, [
    zoomOpen,
  ]);


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

    setZoomOpen(
      true
    );

  };


  /*
   * =========================================================
   * CLOSE ZOOM
   * =========================================================
   */

  const closeZoom = () => {

    resetZoom();

    setZoomOpen(
      false
    );

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
   * CHANGE IMAGE
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


    if (
      index < 0 ||
      index >= imageList.length
    ) {

      return;

    }


    setLoaded(false);


    setDirection(

      index > activeImage

        ? "next"

        : "prev"

    );


    setTimeout(() => {

      setActiveImage(
        index
      );

      setDirection(
        null
      );

    }, 120);

  };


  /*
   * =========================================================
   * NEXT IMAGE
   * =========================================================
   */

  const nextImage = () => {

    if (
      imageList.length <= 1
    ) {

      return;

    }


    changeImage(

      activeImage ===
        imageList.length - 1

        ? 0

        : activeImage + 1

    );

  };


  /*
   * =========================================================
   * PREVIOUS IMAGE
   * =========================================================
   */

  const previousImage = () => {

    if (
      imageList.length <= 1
    ) {

      return;

    }


    changeImage(

      activeImage === 0

        ? imageList.length - 1

        : activeImage - 1

    );

  };


  /*
   * =========================================================
   * MAIN GALLERY TOUCH START
   * =========================================================
   */

  const handleTouchStart = (
    e: TouchEvent
  ) => {

    if (
      e.touches.length !== 1
    ) {

      return;

    }


    setTouchStart(
      e.touches[0].clientX
    );

  };


  /*
   * =========================================================
   * MAIN GALLERY TOUCH END
   * =========================================================
   */

  const handleTouchEnd = (
    e: TouchEvent
  ) => {

    if (
      touchStart === null
    ) {

      return;

    }


    const touchEnd =
      e.changedTouches[0].clientX;


    const distance =
      touchStart -
      touchEnd;


    if (
      Math.abs(distance) > 50
    ) {

      if (
        distance > 0
      ) {

        nextImage();

      } else {

        previousImage();

      }

    }


    setTouchStart(
      null
    );

  };


  /*
   * =========================================================
   * PINCH DISTANCE
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
   * ZOOM TOUCH START
   * =========================================================
   */

  const handleZoomTouchStart = (
    e: TouchEvent
  ) => {

    if (
      e.touches.length === 2
    ) {

      pinchStartDistance.current =
        getTouchDistance(
          e.touches
        );


      pinchStartZoom.current =
        zoomLevel;

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

    if (
      e.touches.length !== 2
    ) {

      return;

    }


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

  };


  /*
   * =========================================================
   * ZOOM TOUCH END
   * =========================================================
   */

  const handleZoomTouchEnd = () => {

    pinchStartDistance.current =
      null;

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
   * SHARE PRODUCT
   * =========================================================
   */

  const handleShare = async (
    e: React.MouseEvent<HTMLButtonElement>
  ) => {

    e.stopPropagation();


    /*
     * IMPORTANT:
     *
     * Use the current route slug.
     *
     * If the page is:
     *
     * /product/crystal-drop-mangalsutra
     *
     * slug will be:
     *
     * crystal-drop-mangalsutra
     */

    const currentSlug =
      slug?.trim();


    /*
     * Extra fallback:
     *
     * If for any reason React Router doesn't
     * provide the slug, take it directly from
     * the current pathname.
     */

    const pathname =
      window.location.pathname;


    const pathnameParts =
      pathname
        .split("/")
        .filter(Boolean);


    const pathnameSlug =
      pathnameParts.length >= 2 &&
      pathnameParts[0] === "product"
        ? pathnameParts[1]
        : "";


    const finalSlug =
      currentSlug ||
      pathnameSlug;


    /*
     * Safety check.
     *
     * We NEVER want:
     *
     * /product/undefined
     */

    if (
      !finalSlug ||
      finalSlug === "undefined" ||
      finalSlug === "null"
    ) {

      console.error(
        "Unable to create product share URL. Product slug is missing."
      );

      return;

    }


    const shareUrl =
      `${window.location.origin}/product/${encodeURIComponent(
        finalSlug
      )}`;


    const shareData: ShareData = {

      title:
        productName,

      text:
        `Check out ${productName} at T&M Jewels.`,

      url:
        shareUrl,

    };


    try {

      /*
       * =====================================================
       * MOBILE / SUPPORTED BROWSERS
       * =====================================================
       *
       * Opens the native share sheet.
       */

      if (
        typeof navigator.share ===
        "function"
      ) {

        await navigator.share(
          shareData
        );

        return;

      }


      /*
       * =====================================================
       * DESKTOP FALLBACK
       * =====================================================
       *
       * Copy product URL.
       */

      if (
        navigator.clipboard &&
        window.isSecureContext
      ) {

        await navigator.clipboard.writeText(
          shareUrl
        );

      } else {

        const textarea =
          document.createElement(
            "textarea"
          );


        textarea.value =
          shareUrl;


        textarea.style.position =
          "fixed";


        textarea.style.left =
          "-9999px";


        textarea.style.top =
          "0";


        textarea.style.opacity =
          "0";


        document.body.appendChild(
          textarea
        );


        textarea.focus();

        textarea.select();


        document.execCommand(
          "copy"
        );


        document.body.removeChild(
          textarea
        );

      }


      /*
       * Show copied state.
       */

      setShareStatus(
        "copied"
      );


      window.setTimeout(() => {

        setShareStatus(
          "idle"
        );

      }, 1800);

    }

    catch (
      error
    ) {

      /*
       * User closing the native share
       * sheet is completely normal.
       */

      if (
        error instanceof DOMException &&
        error.name ===
          "AbortError"
      ) {

        return;

      }


      console.error(
        "Product share failed:",
        error
      );

    }

  };


  /*
   * =========================================================
   * KEYBOARD CONTROLS
   * =========================================================
   */

  useEffect(() => {

    if (!zoomOpen) {

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
   * EMPTY IMAGE STATE
   * =========================================================
   */

  if (
    imageList.length === 0
  ) {

    return (

      <section
        className="
          w-full
        "
      >

        <div
          className="
            flex
            aspect-[4/5]
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-3xl
            bg-neutral-900
            text-sm
            text-neutral-500
            shadow-xl
          "
        >

          No image available

        </div>

      </section>

    );

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <section
      className="
        w-full
      "
    >

      {/* =====================================================
          MAIN 4:5 IMAGE
      ====================================================== */}

      <div

        onTouchStart={
          handleTouchStart
        }

        onTouchEnd={
          handleTouchEnd
        }

        onDoubleClick={
          openZoom
        }

        className="
          relative
          w-full
          aspect-[4/5]
          overflow-hidden
          rounded-3xl
          bg-neutral-900
          shadow-xl
          lg:max-w-[600px]
        "

      >

        <img

          src={
            imageList[activeImage]
              .image_url
          }

          alt={
            productName
          }

          onLoad={() =>
            setLoaded(true)
          }

          className={`

            h-full
            w-full

            object-contain

            transition-all
            duration-500
            ease-out

            ${
              loaded
                ? "scale-100 opacity-100"
                : "scale-[1.02] opacity-0"
            }

            ${
              direction === "next"
                ? "translate-x-2"
                : direction === "prev"
                  ? "-translate-x-2"
                  : ""
            }

          `}

        />


        {/* =================================================
            WISHLIST
        ================================================== */}

        <div
          className="
            absolute
            right-4
            top-4
            z-30
          "
        >

          <WishlistButton

            productId={
              productId
            }

            iconSize={
              21
            }

            className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              border
              border-white/20
              bg-black/45
              text-white
              shadow-lg
              backdrop-blur-md
              transition-all
              hover:border-[#D4AF37]
              hover:bg-black/65
              hover:text-[#D4AF37]
              active:scale-95
            "

          />

        </div>


        {/* =================================================
            ZOOM BUTTON
        ================================================== */}

        <button

          type="button"

          onClick={(
            e
          ) => {

            e.stopPropagation();

            openZoom();

          }}

          aria-label="Zoom image"

          className="
            absolute
            bottom-4
            left-4
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-black/45
            text-white
            backdrop-blur-md
            transition
            hover:bg-[#D4AF37]
            hover:text-black
            active:scale-95
          "

        >

          <ZoomIn
            size={18}
          />

        </button>


        {/* =================================================
            SHARE BUTTON
        ================================================== */}

        <button

          type="button"

          onClick={
            handleShare
          }

          aria-label={
            shareStatus === "copied"
              ? "Product link copied"
              : "Share product"
          }

          title={
            shareStatus === "copied"
              ? "Link copied"
              : "Share product"
          }

          className="
            absolute
            bottom-4
            right-4
            z-30
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-full
            bg-black/45
            text-white
            backdrop-blur-md
            transition-all
            duration-200
            hover:bg-[#D4AF37]
            hover:text-black
            active:scale-95
            focus:outline-none
            focus:ring-2
            focus:ring-[#D4AF37]/60
          "

        >

          {shareStatus === "copied" ? (

            <span
              className="
                text-xs
                font-bold
              "
            >
              ✓
            </span>

          ) : (

            <Share2
              size={18}
            />

          )}

        </button>


        {/* =================================================
            PREVIOUS
        ================================================== */}

        {imageList.length > 1 && (

          <button

            type="button"

            onClick={
              previousImage
            }

            aria-label="Previous image"

            className="
              absolute
              left-4
              top-1/2
              z-30
              hidden
              h-10
              w-10
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
              size={20}
            />

          </button>

        )}


        {/* =================================================
            NEXT
        ================================================== */}

        {imageList.length > 1 && (

          <button

            type="button"

            onClick={
              nextImage
            }

            aria-label="Next image"

            className="
              absolute
              right-4
              top-1/2
              z-30
              hidden
              h-10
              w-10
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
              size={20}
            />

          </button>

        )}

      </div>


      {/* =====================================================
          MOBILE THUMBNAILS
      ====================================================== */}

      {imageList.length > 1 && (

        <div

          ref={
            mobileThumbnailRef
          }

          className="
            mt-4
            flex
            gap-2.5
            overflow-x-auto
            px-1
            pb-1
            sm:hidden
            [scrollbar-width:none]
            [&::-webkit-scrollbar]:hidden
          "

        >

          {imageList.map(
            (
              image,
              index
            ) => (

              <button

                key={
                  `${image.image_url}-${index}`
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

                aria-current={
                  activeImage === index
                    ? "true"
                    : undefined
                }

                className={`

                  relative
                  h-[68px]
                  w-[58px]
                  shrink-0
                  overflow-hidden
                  rounded-xl
                  border-2
                  bg-neutral-900
                  transition-all
                  duration-300

                  ${
                    activeImage === index
                      ? "scale-[1.03] border-[#D4AF37] opacity-100"
                      : "border-transparent opacity-65 hover:opacity-100"
                  }

                `}

              >

                <img

                  src={
                    image.image_url
                  }

                  alt={
                    `${productName} thumbnail ${index + 1}`
                  }

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


      {/* =====================================================
          DESKTOP THUMBNAILS
      ====================================================== */}

      {imageList.length > 1 && (

        <div

          className="
            mt-5
            hidden
            gap-3
            sm:flex
          "

        >

          {imageList.map(
            (
              image,
              index
            ) => (

              <button

                key={
                  `${image.image_url}-${index}`
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

                  h-20
                  w-20
                  overflow-hidden
                  rounded-xl
                  border-2
                  transition-all

                  ${
                    activeImage === index
                      ? "scale-105 border-[#D4AF37]"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }

                `}

              >

                <img

                  src={
                    image.image_url
                  }

                  alt={
                    `${productName} thumbnail ${index + 1}`
                  }

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


      {/* =====================================================
          FULLSCREEN ZOOM VIEWER
      ====================================================== */}

      {zoomOpen && (

        <div

          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/95
            backdrop-blur-sm
          "

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

        >

          {/* =================================================
              TOP CONTROLS
          ================================================== */}

          <div

            className="
              absolute
              left-0
              right-0
              top-0
              z-20
              flex
              items-center
              justify-between
              px-4
              py-4
              sm:px-6
            "

          >

            <div
              className="
                rounded-full
                bg-white/10
                px-3
                py-1.5
                text-xs
                text-white
                backdrop-blur-md
              "
            >

              {activeImage + 1}

              {" / "}

              {imageList.length}

            </div>


            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.stopPropagation();

                  zoomOut();

                }}

                aria-label="Zoom out"

                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                "

              >

                <ZoomOut
                  size={18}
                />

              </button>


              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.stopPropagation();

                  resetZoom();

                }}

                aria-label="Reset zoom"

                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                "

              >

                <RotateCcw
                  size={18}
                />

              </button>


              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.stopPropagation();

                  zoomIn();

                }}

                aria-label="Zoom in"

                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                "

              >

                <ZoomIn
                  size={18}
                />

              </button>


              <button

                type="button"

                onClick={(
                  e
                ) => {

                  e.stopPropagation();

                  closeZoom();

                }}

                aria-label="Close zoom"

                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-white/10
                  text-white
                  backdrop-blur-md
                  transition
                  hover:bg-[#D4AF37]
                  hover:text-black
                "

              >

                <X
                  size={20}
                />

              </button>

            </div>

          </div>


          {/* =================================================
              ZOOMED IMAGE
          ================================================== */}

          <div

            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              overflow-hidden
              px-4
              py-20
              sm:px-16
            "

            onClick={(
              e
            ) =>
              e.stopPropagation()
            }

          >

            <img

              src={
                imageList[activeImage]
                  .image_url
              }

              alt={
                productName
              }

              draggable={
                false
              }

              className="
                max-h-full
                max-w-full
                select-none
                object-contain
                transition-transform
                duration-200
                ease-out
              "

              style={{
                transform: `
                  translate(
                    ${zoomX}px,
                    ${zoomY}px
                  )
                  scale(
                    ${zoomLevel}
                  )
                `,
              }}

            />

          </div>


          {/* =================================================
              PREVIOUS
          ================================================== */}

          {imageList.length > 1 && (

            <button

              type="button"

              onClick={(
                e
              ) => {

                e.stopPropagation();

                previousImage();

                resetZoom();

              }}

              aria-label="Previous image"

              className="
                absolute
                left-3
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur-md
                transition
                hover:bg-[#D4AF37]
                hover:text-black
                sm:left-5
              "

            >

              <ChevronLeft
                size={22}
              />

            </button>

          )}


          {/* =================================================
              NEXT
          ================================================== */}

          {imageList.length > 1 && (

            <button

              type="button"

              onClick={(
                e
              ) => {

                e.stopPropagation();

                nextImage();

                resetZoom();

              }}

              aria-label="Next image"

              className="
                absolute
                right-3
                top-1/2
                z-20
                flex
                h-11
                w-11
                -translate-y-1/2
                items-center
                justify-center
                rounded-full
                bg-white/10
                text-white
                backdrop-blur-md
                transition
                hover:bg-[#D4AF37]
                hover:text-black
                sm:right-5
              "

            >

              <ChevronRight
                size={22}
              />

            </button>

          )}


          {/* =================================================
              MOBILE HINT
          ================================================== */}

          <div

            className="
              absolute
              bottom-5
              left-1/2
              -translate-x-1/2
              rounded-full
              bg-black/50
              px-4
              py-2
              text-[10px]
              text-white/70
              backdrop-blur-md
              sm:hidden
            "

          >

            Pinch or use + / − to zoom

          </div>

        </div>

      )}

    </section>

  );

}