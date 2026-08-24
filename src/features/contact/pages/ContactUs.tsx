import { motion } from "framer-motion";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

import {
  useContactSettings,
} from "../hooks/useContactSettings";


export default function ContactUs() {

  const {
    data: settings,
    isLoading,
    isError,
  } = useContactSettings();


  /* =====================================================
     CONTACT VALUES
  ===================================================== */

  const supportEmail =
    settings?.supportEmail ||
    "shop.tnm@gmail.com";


  const whatsapp =
    settings?.whatsapp ||
    "";


  const instagram =
    settings?.instagram ||
    "";


  /* =====================================================
     CLEAN WHATSAPP NUMBER
  ===================================================== */

  const cleanWhatsApp =
    whatsapp.replace(/\D/g, "");


  /* =====================================================
     WHATSAPP LINK
  ===================================================== */

  const whatsappLink =
    cleanWhatsApp
      ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
          "Hi T&M Jewels! 👋 I need some help."
        )}`
      : "#";


  /* =====================================================
     INSTAGRAM LINK
  ===================================================== */

  const instagramUsername =
    instagram
      .replace(
        /^https?:\/\/(www\.)?instagram\.com\//,
        ""
      )
      .replace(
        /^@/,
        ""
      )
      .replace(
        /\/.*$/,
        ""
      );


  const instagramLink =
    instagramUsername
      ? `https://instagram.com/${instagramUsername}`
      : "#";


  /* =====================================================
     CONTACT CARDS
  ===================================================== */

  const contactCards = [

    {
      title:
        "Email",

      icon:
        FaEnvelope,

      description:
        "For product queries, order assistance and collaborations.",

      value:
        supportEmail,

      action:
        "Send Email",

      link:
        `mailto:${supportEmail}`,
    },


    {
      title:
        "WhatsApp",

      icon:
        FaWhatsapp,

      description:
        "Need a quick response? Chat with us on WhatsApp.",

      value:
        whatsapp ||
        "Connect with our team instantly",

      action:
        "Chat on WhatsApp",

      link:
        whatsappLink,
    },


    {
      title:
        "Instagram",

      icon:
        FaInstagram,

      description:
        "Follow us or send us a message on Instagram.",

      value:
        instagramUsername
          ? `@${instagramUsername}`
          : "@tnm_jewels",

      action:
        "Visit Instagram",

      link:
        instagramLink,
    },

  ];


  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          px-5
          py-16
        "
      >

        <section
          className="
            flex
            min-h-[60vh]
            items-center
            justify-center
          "
        >

          <div
            className="
              text-sm
              tracking-wide
              text-[#D4AF37]
            "
          >
            Loading contact information...
          </div>

        </section>

      </main>

    );

  }


  /* =====================================================
     PAGE
  ===================================================== */

  return (

    <main
      className="
        min-h-screen
        bg-black
        px-5
        py-16
      "
    >

      {/* =================================================
          HEADING
      ================================================= */}

      <section
        className="
          text-center
        "
      >

        <motion.h1
          initial={{
            opacity: 0,
            y: 20,
          }}

          animate={{
            opacity: 1,
            y: 0,
          }}

          transition={{
            duration: 0.6,
          }}

          className="
            bg-gradient-to-r
            from-[#B8862E]
            via-[#F7E3A3]
            to-[#B8862E]

            bg-clip-text

            text-4xl
            font-semibold
            tracking-wide
            text-transparent

            md:text-6xl
          "
        >
          Contact Us
        </motion.h1>


        <p
          className="
            mx-auto
            mt-5
            max-w-2xl
            text-neutral-400

            md:text-lg
          "
        >
          We’d Love to Hear From You
        </p>


        <p
          className="
            mx-auto
            mt-3
            max-w-xl
            leading-relaxed
            text-neutral-400
          "
        >
          If you have any questions about our products,
          your order, or need any assistance, feel free
          to contact us.

          <br />

          We’re always happy to help.
        </p>

      </section>


      {/* =================================================
          CONTACT CARDS
      ================================================= */}

      <section
        className="
          mx-auto
          mt-14

          grid
          max-w-5xl
          gap-6

          md:grid-cols-3
        "
      >

        {contactCards.map(
          (
            item,
            index
          ) => {

            const Icon =
              item.icon;


            const disabled =
              item.link === "#";


            return (

              <motion.div
                key={item.title}

                initial={{
                  opacity: 0,
                  y: 30,
                }}

                whileInView={{
                  opacity: 1,
                  y: 0,
                }}

                viewport={{
                  once: true,
                }}

                transition={{
                  delay: index * 0.1,
                }}

                className="
                  group

                  rounded-3xl

                  border
                  border-[#D4AF37]/30

                  bg-[#0d0d0d]

                  p-7

                  text-center

                  transition-all
                  duration-300

                  hover:-translate-y-2
                  hover:border-[#D4AF37]
                "
              >

                {/* ICON */}

                <div
                  className="
                    mx-auto

                    flex
                    h-14
                    w-14

                    items-center
                    justify-center

                    rounded-full

                    border
                    border-[#D4AF37]/40

                    text-2xl
                    text-[#D4AF37]

                    transition

                    group-hover:bg-[#D4AF37]
                    group-hover:text-black
                  "
                >

                  <Icon />

                </div>


                {/* TITLE */}

                <h2
                  className="
                    mt-5

                    text-xl
                    font-semibold

                    text-[#F7E3A3]
                  "
                >
                  {item.title}
                </h2>


                {/* DESCRIPTION */}

                <p
                  className="
                    mt-3

                    text-sm
                    leading-relaxed

                    text-neutral-400
                  "
                >
                  {item.description}
                </p>


                {/* VALUE */}

                <p
                  className="
                    mt-4

                    break-all

                    text-sm
                    text-[#D4AF37]
                  "
                >
                  {item.value}
                </p>


                {/* ACTION */}

                {item.title ===
                  "WhatsApp" ? (

                  <a
                    href={item.link}

                    target={
                      disabled
                        ? undefined
                        : "_blank"
                    }

                    rel={
                      disabled
                        ? undefined
                        : "noopener noreferrer"
                    }

                    aria-disabled={
                      disabled
                    }

                    onClick={(event) => {

                      if (disabled) {
                        event.preventDefault();
                      }

                    }}

                    className="
                      mt-6

                      inline-flex

                      rounded-full

                      bg-gradient-to-r

                      from-[#B8862E]
                      via-[#D4AF37]
                      to-[#F7E3A3]

                      px-6
                      py-2

                      text-sm
                      font-medium

                      text-black

                      transition

                      hover:scale-105
                    "
                  >
                    {item.action}
                  </a>

                ) : (

                  <a
                    href={item.link}

                    target={
                      item.title ===
                      "Instagram"
                        ? "_blank"
                        : undefined
                    }

                    rel={
                      item.title ===
                      "Instagram"
                        ? "noopener noreferrer"
                        : undefined
                    }

                    className="
                      mt-6

                      inline-block

                      text-sm
                      text-[#D4AF37]

                      hover:underline
                    "
                  >
                    {item.action}
                  </a>

                )}

              </motion.div>

            );

          }
        )}

      </section>


      {/* =================================================
          BUSINESS CONTACT DETAILS
      ================================================= */}

      {settings?.phone ||
        settings?.address ? (

        <section
          className="
            mx-auto
            mt-14

            max-w-xl

            rounded-3xl

            border
            border-[#D4AF37]/30

            bg-[#0d0d0d]

            p-8

            text-center
          "
        >

          <h2
            className="
              text-2xl
              font-semibold

              text-[#F7E3A3]
            "
          >
            Business Information
          </h2>


          {settings?.phone && (

            <p
              className="
                mt-5

                text-sm
                text-neutral-400
              "
            >
              <span className="text-[#D4AF37]">
                Phone:
              </span>{" "}
              {settings.phone}
            </p>

          )}


          {settings?.address && (

            <p
              className="
                mt-3

                text-sm
                leading-relaxed

                text-neutral-400
              "
            >
              <span className="text-[#D4AF37]">
                Address:
              </span>{" "}
              {settings.address}
            </p>

          )}

        </section>

      ) : null}


      {/* =================================================
          CUSTOMER SUPPORT
      ================================================= */}

      <section
        className="
          mx-auto

          mt-14

          max-w-xl

          rounded-3xl

          border
          border-[#D4AF37]/30

          bg-[#0d0d0d]

          p-8

          text-center
        "
      >

        <h2
          className="
            text-2xl
            font-semibold

            text-[#F7E3A3]
          "
        >
          🕒 Customer Support
        </h2>


        <p
          className="
            mt-4

            leading-relaxed

            text-neutral-400
          "
        >
          Monday – Saturday

          <br />

          10:00 AM – 7:00 PM (IST)
        </p>

      </section>


      {/* =================================================
          THANK YOU
      ================================================= */}

      <section
        className="
          mx-auto

          mt-14

          max-w-2xl

          text-center
        "
      >

        <h2
          className="
            text-2xl
            font-semibold

            text-[#D4AF37]
          "
        >
          Thank You 🤍
        </h2>


        <p
          className="
            mt-4

            leading-relaxed

            text-neutral-400
          "
        >
          Thank you for choosing T&M Jewels.

          <br />

          We truly appreciate your trust and support.

          <br />

          We’re always here to help and will get back
          to you as soon as possible.
        </p>

      </section>


      {/* =================================================
          ERROR NOTICE
      ================================================= */}

      {isError && (

        <p
          className="
            mx-auto
            mt-8
            max-w-xl
            text-center
            text-xs
            text-neutral-500
          "
        >
          Some contact information could not be loaded.
          Please try again later.
        </p>

      )}

    </main>

  );

}