import {
  ExternalLink,
} from "lucide-react";

import {
  useInstagramReels,
} from "../hooks/useInstagramReels";


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
   * ERROR
   * =======================================================
   *
   * Instagram is an additional homepage section.
   * If Instagram fails, it should never break the homepage.
   * =======================================================
   */

  if (isError) {

    return null;

  }


  return (

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
            mb-8
            flex
            flex-col
            items-center
            justify-between
            gap-5
            text-center
            sm:flex-row
            sm:text-left
          "
        >

          <div>

            <div
              className="
                mb-2
                flex
                items-center
                justify-center
                gap-2
                sm:justify-start
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
                  text-xs
                  font-medium
                  uppercase
                  tracking-[0.25em]
                  text-[#C8A44D]
                "
              >
                Follow Our Journey
              </span>

            </div>


            <h2
              className="
                text-2xl
                font-medium
                tracking-wide
                text-white
                sm:text-3xl
                lg:text-4xl
              "
            >
              @tnm_jewels
            </h2>

          </div>


          {/* =================================================
              FOLLOW BUTTON
          ================================================== */}

          <a
            href="https://www.instagram.com/tnm_jewels/"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#C8A44D]/50
              px-5
              py-2.5
              text-sm
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
            LOADING SKELETON
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
            }).map(
              (
                _,
                index
              ) => (

                <div
                  key={index}
                  className="
                    aspect-[4/5]
                    animate-pulse
                    rounded-2xl
                    bg-neutral-900
                  "
                />

              )
            )}

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
                .slice(
                  0,
                  8
                )
                .map(
                  (
                    reel
                  ) => (

                    <a
                      key={
                        reel.id
                      }
                      href={
                        reel.permalink ??
                        reel.mediaUrl ??
                        "#"
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        reel.caption
                          ? `View Instagram Reel: ${reel.caption.slice(
                              0,
                              80
                            )}`
                          : "View T&M Jewels Instagram Reel"
                      }
                      className="
                        group
                        relative
                        block
                        aspect-[4/5]
                        overflow-hidden
                        rounded-2xl
                        bg-neutral-900
                      "
                    >

                      {/* ===================================
                          THUMBNAIL
                      ==================================== */}

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


                      {/* ===================================
                          HOVER OVERLAY
                      ==================================== */}

                      <div
                        className="
                          absolute
                          inset-0
                          bg-black/0
                          transition
                          duration-300
                          group-hover:bg-black/35
                        "
                      />


                      {/* ===================================
                          INSTAGRAM ICON
                      ==================================== */}

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


                      {/* ===================================
                          VIEW ON INSTAGRAM
                      ==================================== */}

                      <div
                        className="
                          absolute
                          bottom-3
                          left-3
                          right-3
                          translate-y-2
                          opacity-0
                          transition
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
                            gap-2
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

                          Watch on Instagram

                          <ExternalLink
                            className="
                              h-3
                              w-3
                            "
                          />

                        </div>

                      </div>

                    </a>

                  )
                )}

            </div>

          )}

      </div>

    </section>

  );

}