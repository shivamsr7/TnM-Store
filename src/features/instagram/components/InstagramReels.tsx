import {
  ChevronDown,
  ExternalLink,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useInstagramReels,
} from "../hooks/useInstagramReels";

import type {
  InstagramReel,
} from "../types/instagram.types";


/*
 * =========================================================
 * INSTAGRAM ICON
 * =========================================================
 */

function InstagramIcon({
  className = "",
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
      />

      <circle
        cx="12"
        cy="12"
        r="4"
      />

      <circle
        cx="17.5"
        cy="6.5"
        r="0.8"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function InstagramReels() {
  const {
    data,
    isLoading,
    isError,
  } = useInstagramReels();

  const reels =
    data?.reels ?? [];


  /*
   * =======================================================
   * SELECTED REEL
   * =======================================================
   */

  const [
    selectedReel,
    setSelectedReel,
  ] = useState<InstagramReel | null>(null);


  /*
   * =======================================================
   * DETAILS STATE
   * =======================================================
   */

  const [
    showDetails,
    setShowDetails,
  ] = useState(false);


  /*
   * =======================================================
   * OPEN REEL
   * =======================================================
   */

  const openReel = (
    reel: InstagramReel
  ) => {
    setSelectedReel(reel);
    setShowDetails(false);
  };


  /*
   * =======================================================
   * CLOSE REEL
   * =======================================================
   */

  const closeReel = () => {
    setSelectedReel(null);
    setShowDetails(false);
  };


  /*
   * =======================================================
   * LOCK BODY SCROLL
   * =======================================================
   */

  useEffect(() => {
    if (!selectedReel) {
      return;
    }

    const originalOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        originalOverflow;
    };
  }, [selectedReel]);


  /*
   * =======================================================
   * ESCAPE KEY
   * =======================================================
   */

  useEffect(() => {
    if (!selectedReel) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "Escape") {
        closeReel();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedReel]);


  /*
   * =======================================================
   * INSTAGRAM ERROR
   * =======================================================
   */

  if (isError) {
    return null;
  }


  return (
    <>
      {/* ===================================================
          INSTAGRAM SECTION
      ==================================================== */}

      <section
        className="
          bg-black
          px-4
          py-14
          sm:px-6
          sm:py-16
          lg:px-8
          lg:py-20
        "
      >

        <div
          className="
            mx-auto
            max-w-7xl
          "
        >

          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              mb-10
              flex
              flex-col
              items-center
              justify-center
              text-center
            "
          >

            <div
              className="
                mb-3
                flex
                items-center
                justify-center
                gap-2
              "
            >

              <InstagramIcon
                className="
                  h-5
                  w-5
                  text-[#C8A44D]
                "
              />

              <span
                className="
                  text-sm
                  font-medium
                  uppercase
                  tracking-[0.3em]
                  text-[#C8A44D]
                "
              >
                Follow Our Journey
              </span>

            </div>


            <h2
              className="
                text-4xl
                font-semibold
                uppercase
                tracking-wide
                text-[#C8A44D]
                sm:text-5xl
                lg:text-6xl
              "
            >
              @tnm_jewels
            </h2>


            <a
              href="https://www.instagram.com/tnm_jewels/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                rounded-full
                border
                border-[#C8A44D]/60
                px-6
                py-3
                text-sm
                font-medium
                text-[#C8A44D]
                transition
                duration-300
                hover:bg-[#C8A44D]
                hover:text-black
              "
            >

              <InstagramIcon
                className="
                  h-4
                  w-4
                "
              />

              Follow on Instagram

              <ExternalLink
                className="
                  h-3.5
                  w-3.5
                "
              />

            </a>

          </div>


          {/* =================================================
              LOADING
          ================================================== */}

          {isLoading && (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                sm:gap-4
                lg:grid-cols-4
              "
            >

              {Array.from({
                length: 4,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    aspect-[4/5]
                    animate-pulse
                    rounded-2xl
                    bg-neutral-900
                  "
                />
              ))}

            </div>
          )}


          {/* =================================================
              EMPTY STATE
          ================================================== */}

          {!isLoading &&
            reels.length === 0 && (
              <div
                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.02]
                  px-6
                  py-12
                  text-center
                "
              >

                <InstagramIcon
                  className="
                    mx-auto
                    mb-4
                    h-8
                    w-8
                    text-[#C8A44D]
                  "
                />

                <p
                  className="
                    text-sm
                    text-neutral-400
                  "
                >
                  Follow us on Instagram
                  for our latest designs,
                  styling and launches.
                </p>

              </div>
            )}


          {/* =================================================
              REELS GRID
          ================================================== */}

          {!isLoading &&
            reels.length > 0 && (
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  sm:gap-4
                  lg:grid-cols-4
                "
              >

                {reels
                  .slice(0, 8)
                  .map((reel) => (
                    <button
                      key={reel.id}
                      type="button"
                      onClick={() =>
                        openReel(reel)
                      }
                      aria-label="Open Instagram Reel"
                      className="
                        group
                        relative
                        block
                        aspect-[4/5]
                        w-full
                        overflow-hidden
                        rounded-2xl
                        bg-neutral-900
                        text-left
                        outline-none
                        focus-visible:ring-2
                        focus-visible:ring-[#C8A44D]
                        focus-visible:ring-offset-2
                        focus-visible:ring-offset-black
                      "
                    >

                      {reel.thumbnailUrl ? (
                        <img
                          src={
                            reel.thumbnailUrl
                          }
                          alt={
                            reel.caption
                              ? reel.caption.slice(
                                  0,
                                  100
                                )
                              : "T&M Jewels Instagram Reel"
                          }
                          loading="lazy"
                          className="
                            h-full
                            w-full
                            object-cover
                            transition
                            duration-500
                            group-hover:scale-105
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
                            bg-neutral-900
                          "
                        >
                          <InstagramIcon
                            className="
                              h-8
                              w-8
                              text-neutral-600
                            "
                          />
                        </div>
                      )}


                      <div
                        className="
                          absolute
                          inset-0
                          bg-black/0
                          transition
                          duration-300
                          group-hover:bg-black/30
                        "
                      />


                      <div
                        className="
                          absolute
                          right-3
                          top-3
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-black/50
                          text-white
                          backdrop-blur-sm
                          transition
                          duration-300
                          group-hover:bg-[#C8A44D]
                          group-hover:text-black
                        "
                      >
                        <InstagramIcon
                          className="
                            h-4
                            w-4
                          "
                        />
                      </div>


                      <div
                        className="
                          absolute
                          inset-0
                          flex
                          items-center
                          justify-center
                        "
                      >
                        <div
                          className="
                            flex
                            h-16
                            w-16
                            scale-90
                            items-center
                            justify-center
                            rounded-full
                            bg-white/95
                            text-black
                            opacity-0
                            shadow-xl
                            transition-all
                            duration-300
                            group-hover:scale-100
                            group-hover:opacity-100
                          "
                        >
                          <span
                            className="
                              ml-1
                              text-xl
                            "
                          >
                            ▶
                          </span>
                        </div>
                      </div>


                      <div
                        className="
                          absolute
                          bottom-3
                          left-3
                          right-3
                          translate-y-2
                          opacity-0
                          transition-all
                          duration-300
                          group-hover:translate-y-0
                          group-hover:opacity-100
                        "
                      >
                        <div
                          className="
                            flex
                            items-center
                            justify-center
                            rounded-full
                            bg-black/75
                            px-3
                            py-2
                            text-xs
                            font-medium
                            text-white
                            backdrop-blur-md
                          "
                        >
                          View Reel
                        </div>
                      </div>

                    </button>
                  ))}

              </div>
            )}

        </div>
      </section>


      {/* =====================================================
          REEL MODAL
      ====================================================== */}

      {selectedReel && (
        <div
          className="
            fixed
            inset-0
            z-[9999]
            flex
            items-center
            justify-center
            bg-black/90
            p-4
            backdrop-blur-md
            sm:p-6
          "
          role="dialog"
          aria-modal="true"
          aria-label="Instagram Reel"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeReel();
            }
          }}
        >

          {/* =================================================
              STATIC MODAL
          ================================================== */}

          <div
            className="
              relative
              flex
              max-h-[92vh]
              w-full
              max-w-[430px]
              flex-col
              overflow-hidden
              rounded-[24px]
              bg-[#111111]
              shadow-[0_30px_100px_rgba(0,0,0,0.7)]
            "
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >

            {/* =================================================
                STATIC CLOSE BUTTON
            ================================================== */}

            <button
              type="button"
              onClick={closeReel}
              aria-label="Close Reel"
              className="
                absolute
                right-3
                top-3
                z-50
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-black/70
                text-white
                shadow-lg
                backdrop-blur-md
                transition-all
                duration-300
                hover:scale-105
                hover:bg-[#C8A44D]
                hover:text-black
                active:scale-95
              "
            >
              <X
                className="
                  h-5
                  w-5
                "
              />
            </button>


            {/* =================================================
                REEL PREVIEW
            ================================================== */}

            <div
              className="
                relative
                h-[56vh]
                max-h-[560px]
                min-h-[380px]
                w-full
                shrink-0
                overflow-hidden
                bg-black
                sm:h-[62vh]
                sm:max-h-[600px]
              "
            >

              {selectedReel.thumbnailUrl ? (
                <img
                  src={
                    selectedReel.thumbnailUrl
                  }
                  alt="Instagram Reel preview"
                  className="
                    h-full
                    w-full
                    object-cover
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
                    bg-neutral-900
                  "
                >
                  <InstagramIcon
                    className="
                      h-10
                      w-10
                      text-neutral-600
                    "
                  />
                </div>
              )}


              {/* =============================================
                  OVERLAY
              ============================================== */}

              <div
                className="
                  absolute
                  inset-0
                  bg-black/20
                "
              />


              {/* =============================================
                  PLAY BUTTON
              ============================================== */}

              {selectedReel.permalink && (
                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                  "
                >
                  <a
                    href={
                      selectedReel.permalink
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Watch Reel on Instagram"
                    className="
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-black
                      shadow-[0_10px_40px_rgba(0,0,0,0.35)]
                      transition-all
                      duration-300
                      hover:scale-110
                      hover:bg-[#C8A44D]
                      active:scale-95
                    "
                  >
                    <span
                      className="
                        ml-1
                        text-2xl
                      "
                    >
                      ▶
                    </span>
                  </a>
                </div>
              )}


              {/* =============================================
                  WATCH ON INSTAGRAM
              ============================================== */}

              {selectedReel.permalink && (
                <div
                  className="
                    absolute
                    bottom-5
                    left-0
                    right-0
                    flex
                    justify-center
                    px-5
                  "
                >
                  <a
                    href={
                      selectedReel.permalink
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      items-center
                      gap-2
                      rounded-full
                      bg-black/75
                      px-5
                      py-2.5
                      text-sm
                      font-medium
                      text-white
                      backdrop-blur-md
                      transition-all
                      duration-300
                      hover:bg-[#C8A44D]
                      hover:text-black
                    "
                  >
                    <InstagramIcon
                      className="
                        h-4
                        w-4
                      "
                    />

                    Watch on Instagram

                    <ExternalLink
                      className="
                        h-3.5
                        w-3.5
                      "
                    />
                  </a>
                </div>
              )}

            </div>


            {/* =================================================
                DETAILS TOGGLE
            ================================================== */}

            <button
              type="button"
              onClick={() =>
                setShowDetails(
                  (previous) =>
                    !previous
                )
              }
              className="
                flex
                min-h-[58px]
                w-full
                shrink-0
                items-center
                justify-between
                border-t
                border-white/[0.08]
                bg-[#111111]
                px-5
                py-4
                text-left
                transition-colors
                duration-300
                hover:bg-white/[0.04]
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <InstagramIcon
                  className="
                    h-4
                    w-4
                    text-[#C8A44D]
                  "
                />

                <span
                  className="
                    text-sm
                    font-medium
                    text-white
                  "
                >
                  {showDetails
                    ? "Hide captions & details"
                    : "View captions & details"}
                </span>

              </div>


              <ChevronDown
                className={`
                  h-5
                  w-5
                  text-[#C8A44D]
                  transition-transform
                  duration-300
                  ${
                    showDetails
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {/* =================================================
                CAPTION PANEL
            ================================================== */}

            {showDetails && (
              <div
                className="
                  max-h-[220px]
                  shrink-0
                  overflow-y-auto
                  border-t
                  border-white/[0.06]
                  bg-[#111111]
                  px-5
                  py-4

                  [scrollbar-width:none]
                  [-ms-overflow-style:none]
                  [&::-webkit-scrollbar]:hidden
                "
              >

                {/* =========================================
                    ACCOUNT
                ========================================== */}

                <div
                  className="
                    mb-3
                    flex
                    items-center
                    gap-2
                  "
                >

                  <div
                    className="
                      flex
                      h-8
                      w-8
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#C8A44D]/10
                    "
                  >
                    <InstagramIcon
                      className="
                        h-4
                        w-4
                        text-[#C8A44D]
                      "
                    />
                  </div>

                  <span
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >
                    @tnm_jewels
                  </span>

                </div>


                {/* =========================================
                    CAPTION
                ========================================== */}

                {selectedReel.caption ? (
                  <p
                    className="
                      whitespace-pre-line
                      text-sm
                      leading-6
                      text-neutral-300
                    "
                  >
                    {
                      selectedReel.caption
                    }
                  </p>
                ) : (
                  <p
                    className="
                      text-sm
                      text-neutral-500
                    "
                  >
                    No caption available.
                  </p>
                )}

              </div>
            )}

          </div>

        </div>
      )}
    </>
  );
}