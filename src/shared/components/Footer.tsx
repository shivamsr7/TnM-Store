import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import {
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
} from "react-icons/fa";

import { useStoreSettings } from "@/shared/hooks/useStoreSettings";


const navItems = [
  {
    title: "Shop",

    links: [
      {
        name: "All Jewellery",
        path: "/shop",
      },
      {
        name: "Necklaces",
        path: "/category/necklaces",
      },
      {
        name: "Earrings",
        path: "/category/earrings",
      },
      {
        name: "Rings",
        path: "/category/rings",
      },
      {
        name: "Bracelets",
        path: "/category/bracelets",
      },
      {
        name: "Watches",
        path: "/category/watches",
      },
      {
        name: "Collections",
        path: "/collections",
      },
      {
        name: "Best Sellers",
        path: "/shop?filter=best-sellers",
      },
      {
        name: "New Arrivals",
        path: "/shop?filter=new-arrivals",
      },
    ],
  },

  {
    title: "Support",

    links: [
      {
        name: "Contact Us",
        path: "/contact-us",
      },
      {
        name: "Shipping Policy",
        path: "/shipping-policy",
      },
      {
        name: "Returns",
        path: "/return-policy",
      },
      {
        name: "FAQs",
        path: "/faq",
      },
    ],
  },
];


export default function Footer() {

  /* =====================================================
     ADMIN SETTINGS
  ===================================================== */

  const {
    data: settings,
  } = useStoreSettings();

console.log("FOOTER SETTINGS:", settings);
  /* =====================================================
     SOCIAL VALUES
  ===================================================== */

  const instagram =
    settings?.instagram?.trim() || "";

  const facebook =
    settings?.facebook?.trim() || "";

  const whatsapp =
    settings?.whatsapp?.trim() || "";


  /* =====================================================
     INSTAGRAM URL
  ===================================================== */

  const instagramUrl =
    instagram
      ? instagram.startsWith("http://") ||
        instagram.startsWith("https://")
        ? instagram
        : `https://instagram.com/${instagram.replace(
            /^@/,
            ""
          )}`
      : "";


  /* =====================================================
     FACEBOOK URL
  ===================================================== */

  const facebookUrl =
    facebook
      ? facebook.startsWith("http://") ||
        facebook.startsWith("https://")
        ? facebook
        : `https://facebook.com/${facebook.replace(
            /^@/,
            ""
          )}`
      : "";


  /* =====================================================
     WHATSAPP URL
  ===================================================== */

  let whatsappNumber =
    whatsapp.replace(/\D/g, "");


  /*
   * If Admin stores a normal
   * 10-digit Indian number,
   * automatically add country code.
   */

  if (
    whatsappNumber.length === 10
  ) {
    whatsappNumber =
      `91${whatsappNumber}`;
  }


  const whatsappUrl =
    whatsappNumber
      ? `https://wa.me/${whatsappNumber}`
      : "";


  return (

    <footer
      className="
        relative
        overflow-hidden

        bg-black

        px-6
        py-16

        text-white

        md:px-10
      "
    >

      {/* =================================================
          ANIMATED GOLD GLOW
      ================================================= */}

      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}

        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}

        className="
          absolute
          left-1/2
          top-1/2

          h-[500px]
          w-[500px]

          -translate-x-1/2
          -translate-y-1/2

          rounded-full

          bg-[#C8A44D]

          blur-[150px]
        "
      />


      {/* =================================================
          FLOATING PARTICLES
      ================================================= */}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
        "
      >

        {[1, 2, 3, 4, 5].map(
          (item) => (

            <motion.span
              key={item}

              animate={{
                y: [0, -40, 0],
                opacity: [0.3, 0.8, 0.3],
              }}

              transition={{
                duration: 5 + item,
                repeat: Infinity,
                delay: item,
              }}

              className="
                absolute

                h-1
                w-1

                rounded-full

                bg-[#C8A44D]
              "

              style={{
                left: `${15 * item}%`,
                top: `${20 + item * 10}%`,
              }}
            />

          )
        )}

      </div>


      {/* =================================================
          CONTENT
      ================================================= */}

      <div
        className="
          relative
          z-10

          mx-auto

          max-w-6xl

          text-center
        "
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <motion.h2
          initial={{
            opacity: 0,
            y: 20,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.8,
          }}

          className="
            text-3xl
            font-semibold

            tracking-[0.3em]

            bg-gradient-to-r

            from-[#b8860b]
            via-[#fff1b8]
            to-[#b8860b]

            bg-clip-text

            text-transparent

            md:text-5xl
          "
        >
          T&M JEWELS
        </motion.h2>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <p
          className="
            mx-auto

            mt-5

            max-w-md

            text-sm
            leading-relaxed

            text-neutral-400

            md:text-base
          "
        >
          Create your own style,
          create your own trend.

          <br />

          Premium jewellery designed
          for everyday elegance.
        </p>


        {/* =================================================
            NAVIGATION
        ================================================= */}

        <div
          className="
            mt-12

            grid
            gap-10

            md:grid-cols-2
          "
        >

          {navItems.map(
            (
              section,
              index
            ) => (

              <motion.div
                key={section.title}

                initial={{
                  opacity: 0,
                  y: 20,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                transition={{
                  delay: index * 0.2,
                }}
              >

                <h3
                  className="
                    mb-5

                    text-sm
                    uppercase

                    tracking-[0.25em]

                    text-[#C8A44D]
                  "
                >
                  {section.title}
                </h3>


                <div
                  className="
                    flex
                    flex-wrap

                    justify-center

                    gap-5
                  "
                >

                  {section.links.map(
                    (link) => (

                      <Link
                        key={link.name}

                        to={link.path}

                        className="
                          text-sm

                          text-neutral-300

                          transition

                          hover:text-[#C8A44D]
                        "
                      >
                        {link.name}
                      </Link>

                    )
                  )}

                </div>

              </motion.div>

            )
          )}

        </div>


        {/* =================================================
            SOCIAL MEDIA
        ================================================= */}

        <div
          className="
            mt-12

            flex
            items-center
            justify-center

            gap-5
          "
        >

          {/* =================================================
              INSTAGRAM
          ================================================= */}

          {instagramUrl && (

            <a
              href={instagramUrl}

              target="_blank"

              rel="noopener noreferrer"

              aria-label="Instagram"

              className="
                flex

                h-12
                w-12

                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]

                text-[#C8A44D]

                transition-all
                duration-300

                hover:bg-[#C8A44D]
                hover:text-black

                hover:scale-105
              "
            >

              <FaInstagram
                size={20}
              />

            </a>

          )}


          {/* =================================================
              WHATSAPP
          ================================================= */}

          {whatsappUrl && (

            <a
              href={whatsappUrl}

              target="_blank"

              rel="noopener noreferrer"

              aria-label="WhatsApp"

              className="
                flex

                h-12
                w-12

                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]

                text-[#C8A44D]

                transition-all
                duration-300

                hover:bg-[#C8A44D]
                hover:text-black

                hover:scale-105
              "
            >

              <FaWhatsapp
                size={21}
              />

            </a>

          )}


          {/* =================================================
              FACEBOOK
          ================================================= */}

          {facebookUrl && (

            <a
              href={facebookUrl}

              target="_blank"

              rel="noopener noreferrer"

              aria-label="Facebook"

              className="
                flex

                h-12
                w-12

                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]

                text-[#C8A44D]

                transition-all
                duration-300

                hover:bg-[#C8A44D]
                hover:text-black

                hover:scale-105
              "
            >

              <FaFacebookF
                size={19}
              />

            </a>

          )}

        </div>


        {/* =================================================
            BOTTOM
        ================================================= */}

        <div
          className="
            mt-12

            border-t
            border-white/10

            pt-6

            text-xs

            tracking-wide

            text-neutral-500
          "
        >

          ✦ Crafted with elegance ✦

          <br />

          © {new Date().getFullYear()}
          {" "}
          T&M Jewels.
          All rights reserved.

        </div>

      </div>

    </footer>

  );
}