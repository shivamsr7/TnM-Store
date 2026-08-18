import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

import {
  FaInstagram,
  FaWhatsapp,
  FaFacebookF,
} from "react-icons/fa";

import logo from "@/assets/logo/mainLogo.png";


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

        {/* Brand */}

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


          <div
            className="
              mt-6
              flex
              justify-center
              gap-4
              md:justify-start
            "
          >

            {[
              {
                icon: FaInstagram,
              },
              {
                icon: FaWhatsapp,
              },
              {
                icon: FaFacebookF,
              },
            ].map(
              (
                item,
                index
              ) => {

                const Icon =
                  item.icon;

                return (

                  <a
                    key={index}
                    href="#"
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
                    <Icon
                      size={18}
                    />
                  </a>

                );

              }
            )}

          </div>

        </motion.div>


        {/* Desktop Columns */}

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

                          <Link
                            to={
                              getColumnLinkPath(
                                link
                              )
                            }
                          >
                            {
                              getColumnLinkName(
                                link
                              )
                            }
                          </Link>

                        </li>

                      )
                    )
                  }

                </ul>

              </motion.div>

            )
          )
        }


        {/* Newsletter Desktop */}

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


          <div
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
              placeholder="Enter your email"
              className="
                min-w-0
                flex-1
                bg-transparent
                px-5
                text-sm
                outline-none
              "
            />


            <button
              className="
                bg-gradient-to-r
                from-[#B8862E]
                via-[#D4AF37]
                to-[#F7E3A3]
                px-3
                font-medium
                text-black
              "
            >
              JOIN
            </button>

          </div>

        </motion.div>

      </div>


      {/* Mobile Accordion */}

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

                              <Link
                                to={
                                  getColumnLinkPath(
                                    link
                                  )
                                }
                              >
                                {
                                  getColumnLinkName(
                                    link
                                  )
                                }
                              </Link>

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


      {/* Mobile Newsletter */}

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


        <div
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
            placeholder="Enter your email"
            className="
              min-w-0
              flex-1
              bg-transparent
              px-4
              text-sm
              text-white
              placeholder:text-neutral-400
              outline-none
            "
          />


          <button
            className="
              shrink-0
              bg-gradient-to-r
              from-[#B8862E]
              via-[#D4AF37]
              to-[#F7E3A3]
              px-5
              font-medium
              text-black
            "
          >
            JOIN
          </button>

        </div>

      </div>

    </div>

  );

}
