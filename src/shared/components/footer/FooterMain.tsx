import { useState, type FormEvent } from "react";
import OrderTrackingDialog from "@/features/orders/components/OrderTrackingDialog";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa";

import logo from "@/assets/logo/mainLogo.png";

import {
  useStoreSettings,
} from "@/shared/hooks/useStoreSettings";

import { supabase } from "@/shared/lib/supabase";


const columns = [

  {
    title: "SHOP",

    links: [
      {
        name: "All Jewellery",
        path: "/shop",
      },
      {
        name: "Necklaces",
        path: "/shop?category=necklaces",
      },
      {
        name: "Earrings",
        path: "/shop?category=earrings",
      },
      {
        name: "Rings",
        path: "/shop?category=rings",
      },
      {
        name: "Bracelets",
        path: "/shop?category=bracelets-bangles",
      },
      {
        name: "Watches",
        path: "/shop?category=watches",
      },
      {
        name: "Collections",
        path: "/shop",
      },
      {
        name: "Best Sellers",
        path: "/shop?bestSeller=true",
      },
      {
        name: "New Arrivals",
        path: "/shop?newArrival=true",
      },
    ],
  },

  {
    title: "QUICK LINKS",

    links: [
      "Track Your Order",
      "Shipping & Delivery",
      "Returns & Exchanges",
      "Jewellery Care",
      "FAQs",
      "Contact Us",
      "About Us",
    ],
  },

  {
    title: "INFORMATION",

    links: [
      "Privacy Policy",
      "Terms & Conditions",
    ],
  },

];


const getLinkPath = (
  link: string
) => {

  switch (link) {

    case "About Us":
      return "/about-us";

    case "Contact Us":
      return "/contact-us";

    case "FAQs":
      return "/faq";

    case "Track Your Order":
      return "/track-order";

    case "Shipping & Delivery":
      return "/shipping";

    case "Returns & Exchanges":
      return "/returns";

    case "Jewellery Care":
      return "/jewellery-care";

    case "Privacy Policy":
      return "/privacy-policy";

    case "Terms & Conditions":
      return "/terms";

    default:
      return "#";

  }

};


const getColumnLinkName = (
  link:
    | string
    | {
        name: string;
        path: string;
      }
) =>
  typeof link === "string"
    ? link
    : link.name;


const getColumnLinkPath = (
  link:
    | string
    | {
        name: string;
        path: string;
      }
) =>
  typeof link === "string"
    ? getLinkPath(link)
    : link.path;


export default function FooterMain() {

  const [
    open,
    setOpen,
  ] = useState<number | null>(
    null
  );

  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);

  const handleNewsletterSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const email = newsletterEmail.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
    ) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (newsletterSubmitting) {
      return;
    }

    setNewsletterSubmitting(true);

    try {
      const { data, error } = await supabase.rpc(
        "subscribe_to_newsletter",
        {
          p_email: email,
        }
      );

      if (error) {
        console.error(
          "Newsletter subscription failed:",
          error
        );

        throw new Error(
          "We couldn't subscribe you right now. Please try again."
        );
      }

      if (data?.status === "already_subscribed") {
        toast.success("You're already on the T&M list ✨");
        setNewsletterEmail("");
        return;
      }

      if (data?.status === "subscribed") {
        toast.success("You're on the list! ✨");
        setNewsletterEmail("");
        return;
      }

      if (data?.status === "invalid") {
        toast.error(
          data?.message ||
            "Please enter a valid email address."
        );
        return;
      }

      throw new Error(
        "We couldn't subscribe you right now. Please try again."
      );
    } catch (error) {
      console.error(
        "Newsletter subscription error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "We couldn't subscribe you right now. Please try again."
      );
    } finally {
      setNewsletterSubmitting(false);
    }
  };


  /* =====================================================
     ADMIN SETTINGS
  ===================================================== */

  const {
    data: settings,
  } = useStoreSettings();
console.log("FOOTER SOCIAL SETTINGS", settings);

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
   * automatically add 91.
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

    <div
      className="
        mx-auto
        max-w-7xl
        px-5
        py-14
      "
    >

      <div
        className="
          grid
          gap-10
          md:grid-cols-5
        "
      >

        {/* =================================================
            BRAND
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          viewport={{
            once: true,
          }}

          transition={{
            duration: 0.6,
          }}

          className="
            min-w-0
            text-center
            md:col-span-1
            md:text-left
          "
        >

          <img
            src={logo}
            alt="T&M Jewels"

            className="
              mx-auto
              w-44
              md:mx-0
            "
          />


          <p
            className="
              mt-5
              text-sm
              leading-relaxed
              text-neutral-400
            "
          >
            Timeless designs.
            <br />
            Modern elegance.
            <br />
            Jewellery that celebrates you.
          </p>


          {/* =================================================
              SOCIAL ICONS
          ================================================= */}

          <div
            className="
              mt-6
              flex
              justify-center
              gap-4
              md:justify-start
            "
          >

            {/* =================================================
                INSTAGRAM
            ================================================= */}

            <a
              href={
                instagramUrl ||
                undefined
              }

              target={
                instagramUrl
                  ? "_blank"
                  : undefined
              }

              rel={
                instagramUrl
                  ? "noopener noreferrer"
                  : undefined
              }

              aria-label="Instagram"

              onClick={(event) => {

                if (!instagramUrl) {
                  event.preventDefault();
                }

              }}

              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]/50

                text-[#C8A44D]

                transition-all
                duration-300

                hover:-translate-y-1

                hover:bg-[#C8A44D]

                hover:text-black
              "
            >

              <FaInstagram
                size={18}
              />

            </a>


            {/* =================================================
                WHATSAPP
            ================================================= */}

            <a
              href={
                whatsappUrl ||
                undefined
              }

              target={
                whatsappUrl
                  ? "_blank"
                  : undefined
              }

              rel={
                whatsappUrl
                  ? "noopener noreferrer"
                  : undefined
              }

              aria-label="WhatsApp"

              onClick={(event) => {

                if (!whatsappUrl) {
                  event.preventDefault();
                }

              }}

              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]/50

                text-[#C8A44D]

                transition-all
                duration-300

                hover:-translate-y-1

                hover:bg-[#C8A44D]

                hover:text-black
              "
            >

              <FaWhatsapp
                size={18}
              />

            </a>


            {/* =================================================
                FACEBOOK
            ================================================= */}

            <a
              href={
                facebookUrl ||
                undefined
              }

              target={
                facebookUrl
                  ? "_blank"
                  : undefined
              }

              rel={
                facebookUrl
                  ? "noopener noreferrer"
                  : undefined
              }

              aria-label="Facebook"

              onClick={(event) => {

                if (!facebookUrl) {
                  event.preventDefault();
                }

              }}

              className="
                flex
                h-10
                w-10
                items-center
                justify-center

                rounded-full

                border
                border-[#C8A44D]/50

                text-[#C8A44D]

                transition-all
                duration-300

                hover:-translate-y-1

                hover:bg-[#C8A44D]

                hover:text-black
              "
            >

              <FaFacebookF
                size={18}
              />

            </a>

          </div>

        </motion.div>


        {/* =================================================
            DESKTOP COLUMNS
        ================================================= */}

        {
          columns.map(
            (
              column,
              index
            ) => (

              <motion.div
                key={column.title}

                initial={{
                  opacity: 0,
                  y: 25,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                viewport={{
                  once: true,
                }}

                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}

                className="
                  hidden
                  min-w-0
                  md:block
                "
              >

                <h3
                  className="
                    mb-5
                    text-sm
                    font-semibold
                    tracking-wider
                    text-[#C8A44D]
                  "
                >
                  {column.title}
                </h3>


                <ul
                  className="
                    space-y-3
                    text-sm
                    text-neutral-300
                  "
                >

                  {
                    column.links.map(
                      (link) => (

                        <li
                          key={
                            getColumnLinkName(
                              link
                            )
                          }

                          className="
                            transition
                            hover:text-[#C8A44D]
                          "
                        >

                          {getColumnLinkName(link) === "Track Your Order" ? (
                            <button
                              type="button"
                              onClick={() => setTrackingDialogOpen(true)}
                              className="text-left transition hover:text-[#C8A44D]"
                            >
                              Track Your Order
                            </button>
                          ) : (
                            <Link
                              to={getColumnLinkPath(link)}
                            >
                              {getColumnLinkName(link)}
                            </Link>
                          )}

                        </li>

                      )
                    )
                  }

                </ul>

              </motion.div>

            )
          )
        }


        {/* =================================================
            NEWSLETTER DESKTOP
        ================================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 25,
          }}

          whileInView={{
            opacity: 1,
            y: 0,
          }}

          viewport={{
            once: true,
          }}

          transition={{
            duration: 0.6,
            delay: 0.3,
          }}

          className="
            hidden
            min-w-0
            md:block
          "
        >

          <h3
            className="
              text-sm
              font-semibold
              tracking-wider
              text-[#C8A44D]
            "
          >
            STAY SPARKLED ✨
          </h3>


          <p
            className="
              mt-5
              text-sm
              leading-relaxed
              text-neutral-400
            "
          >
            Be the first to know about new arrivals,
            exclusive offers & member-only perks.
          </p>


          <form
            onSubmit={handleNewsletterSubmit}
            className="
              mt-5
              flex
              w-full
              max-w-[320px]
              overflow-hidden
              rounded-full
              border
              border-[#C8A44D]/50
              bg-black/30
            "
          >

            <input
              type="email"
              value={newsletterEmail}
              onChange={(event) =>
                setNewsletterEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={newsletterSubmitting}

              className="
                min-w-0
                flex-1
                bg-transparent
                px-5
                text-sm
                outline-none
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            />


            <button
              type="submit"
              disabled={newsletterSubmitting}

              className="
                shrink-0

                bg-gradient-to-r
                from-[#B8862E]
                via-[#D4AF37]
                to-[#F7E3A3]

                px-3

                font-medium

                text-black

                transition-opacity

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {newsletterSubmitting ? "..." : "JOIN"}
            </button>

          </form>

        </motion.div>

      </div>


      {/* =================================================
          MOBILE ACCORDION
      ================================================= */}

      <div
        className="
          md:hidden
        "
      >

        {
          columns.map(
            (
              column,
              index
            ) => (

              <div
                key={column.title}

                className="
                  border-b
                  border-white/10
                "
              >

                <button
                  onClick={() =>
                    setOpen(
                      open === index
                        ? null
                        : index
                    )
                  }

                  className="
                    flex
                    w-full
                    items-center
                    justify-between

                    py-5

                    text-sm
                    font-semibold

                    tracking-wider

                    text-[#C8A44D]
                  "
                >

                  {column.title}


                  <ChevronDown
                    size={18}

                    className={
                      open === index
                        ? "rotate-180 transition"
                        : "transition"
                    }
                  />

                </button>


                {
                  open === index && (

                    <ul
                      className="
                        space-y-3
                        pb-5
                        text-sm
                        text-neutral-300
                      "
                    >

                      {
                        column.links.map(
                          (link) => (

                            <li
                              key={
                                getColumnLinkName(
                                  link
                                )
                              }
                            >

                              {getColumnLinkName(link) === "Track Your Order" ? (
                                <button
                                  type="button"
                                  onClick={() => setTrackingDialogOpen(true)}
                                  className="text-left transition hover:text-[#C8A44D]"
                                >
                                  Track Your Order
                                </button>
                              ) : (
                                <Link
                                  to={getColumnLinkPath(link)}
                                >
                                  {getColumnLinkName(link)}
                                </Link>
                              )}

                            </li>

                          )
                        )
                      }

                    </ul>

                  )
                }

              </div>

            )
          )
        }

      </div>


      <OrderTrackingDialog
        open={trackingDialogOpen}
        onClose={() => setTrackingDialogOpen(false)}
      />

      {/* =================================================
          MOBILE NEWSLETTER
      ================================================= */}

      <div
        className="
          mt-8
          md:hidden
        "
      >

        <h3
          className="
            text-sm
            font-semibold
            tracking-wider
            text-[#C8A44D]
          "
        >
          STAY SPARKLED ✨
        </h3>


        <p
          className="
            mt-3
            text-sm
            text-neutral-400
          "
        >
          Join our community for new launches and exclusive offers.
        </p>


        <form
          onSubmit={handleNewsletterSubmit}
          className="
            mt-5
            flex
            w-full
            max-w-[280px]
            overflow-hidden
            rounded-full
            border
            border-[#C8A44D]/50
            bg-black/30
          "
        >

          <input
            type="email"
            value={newsletterEmail}
            onChange={(event) =>
              setNewsletterEmail(event.target.value)
            }
            placeholder="Enter your email"
            autoComplete="email"
            disabled={newsletterSubmitting}

            className="
              min-w-0
              flex-1
              bg-transparent
              px-4
              text-sm
              text-white
              placeholder:text-neutral-400
              outline-none
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          />


          <button
            type="submit"
            disabled={newsletterSubmitting}

            className="
              shrink-0

              bg-gradient-to-r
              from-[#B8862E]
              via-[#D4AF37]
              to-[#F7E3A3]

              px-5

              font-medium

              text-black

              transition-opacity

              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {newsletterSubmitting ? "..." : "JOIN"}
          </button>

        </form>

      </div>

    </div>

  );

}