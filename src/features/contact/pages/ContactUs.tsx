import { useState } from "react";
import { motion } from "framer-motion";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaArrowRight,
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
     FORM STATE
  ===================================================== */

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "",
    orderNumber: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);


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
     WHATSAPP
  ===================================================== */

  const cleanWhatsApp =
    whatsapp.replace(/\D/g, "");


  const whatsappLink =
    cleanWhatsApp
      ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
          "Hi T&M Jewels! 👋 I need some help."
        )}`
      : "#";


  /* =====================================================
     INSTAGRAM
  ===================================================== */

  const instagramUsername =
    instagram
      .replace(
        /^https?:\/\/(www\.)?instagram\.com\//,
        ""
      )
      .replace(/^@/, "")
      .replace(/\/.*$/, "");


  const instagramLink =
    instagramUsername
      ? `https://instagram.com/${instagramUsername}`
      : "#";


  /* =====================================================
     FORM HANDLERS
  ===================================================== */

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));


    if (submitted) {
      setSubmitted(false);
    }

  };


  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    /*
      UI phase only.

      Supabase enquiry submission
      will be connected separately.
    */

    setSubmitted(true);

  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (isLoading) {

    return (

      <main
        className="
          min-h-screen
          bg-black
          px-4
          py-10
          text-white
        "
      >

        <div
          className="
            flex
            min-h-[60vh]
            items-center
            justify-center
          "
        >

          <p
            className="
              text-sm
              tracking-wide
              text-[#D4AF37]
            "
          >
            Loading...
          </p>

        </div>

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
        overflow-hidden
        bg-black
        px-4
        py-8
        text-white

        sm:px-6
        sm:py-12

        lg:px-8
        lg:py-16
      "
    >

      <div
        className="
          mx-auto
          max-w-6xl
        "
      >

        {/* =================================================
            HERO
        ================================================= */}

        <section
          className="
            relative
            overflow-hidden
            rounded-[28px]

            border
            border-[#D4AF37]/20

            bg-gradient-to-b
            from-[#11110f]
            to-[#090909]

            px-5
            py-9

            text-center

            sm:px-8
            sm:py-12

            lg:px-12
            lg:py-14
          "
        >

          {/* Decorative glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-20

              h-48
              w-48

              rounded-full

              bg-[#D4AF37]/10

              blur-3xl
            "
          />


          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-20

              h-48
              w-48

              rounded-full

              bg-[#D4AF37]/5

              blur-3xl
            "
          />


          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}

            animate={{
              opacity: 1,
              y: 0,
            }}

            transition={{
              duration: 0.5,
            }}

            className="
              relative
              z-10
            "
          >

            <span
              className="
                inline-flex
                items-center
                rounded-full

                border
                border-[#D4AF37]/25

                bg-[#D4AF37]/5

                px-4
                py-1.5

                text-[11px]
                font-medium
                uppercase
                tracking-[0.18em]

                text-[#D4AF37]
              "
            >
              Customer Care
            </span>


            <h1
              className="
                mt-5

                bg-gradient-to-r
                from-[#B8862E]
                via-[#F7E3A3]
                to-[#B8862E]

                bg-clip-text

                text-4xl
                font-semibold
                tracking-tight

                text-transparent

                sm:text-5xl

                lg:text-6xl
              "
            >
              Contact Us
            </h1>


            <p
              className="
                mx-auto
                mt-4

                max-w-xl

                text-sm
                leading-relaxed

                text-neutral-400

                sm:text-base
              "
            >
              Questions about your order, products or delivery?
              We're here to make things easy.
            </p>

          </motion.div>

        </section>


        {/* =================================================
            QUICK CONTACT
        ================================================= */}

        <section
          className="
            mt-7
          "
        >

          <div
            className="
              mb-3
              flex
              items-center
              justify-between
            "
          >

            <h2
              className="
                text-sm
                font-semibold
                uppercase
                tracking-[0.12em]

                text-[#F7E3A3]
              "
            >
              Quick Contact
            </h2>


            <span
              className="
                text-xs
                text-neutral-600
              "
            >
              Choose what works
            </span>

          </div>


          <div
            className="
              grid
              grid-cols-3
              gap-2

              sm:gap-3
            "
          >

            {/* WHATSAPP */}

            <a
              href={whatsappLink}

              target={
                whatsappLink === "#"
                  ? undefined
                  : "_blank"
              }

              rel={
                whatsappLink === "#"
                  ? undefined
                  : "noopener noreferrer"
              }

              className="
                group

                flex
                min-h-[92px]

                flex-col
                items-center
                justify-center

                rounded-2xl

                border
                border-[#D4AF37]/20

                bg-[#0d0d0d]

                px-2
                py-4

                text-center

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#D4AF37]/60
                hover:bg-[#11110f]

                sm:min-h-[105px]
              "
            >

              <FaWhatsapp
                className="
                  text-xl
                  text-[#D4AF37]

                  transition-transform
                  group-hover:scale-110
                "
              />

              <span
                className="
                  mt-2

                  text-xs
                  font-medium

                  text-white
                "
              >
                WhatsApp
              </span>


              <span
                className="
                  mt-1

                  text-[10px]

                  text-neutral-500
                "
              >
                Quick help
              </span>

            </a>


            {/* EMAIL */}

            <a
              href={`mailto:${supportEmail}`}

              className="
                group

                flex
                min-h-[92px]

                flex-col
                items-center
                justify-center

                rounded-2xl

                border
                border-[#D4AF37]/20

                bg-[#0d0d0d]

                px-2
                py-4

                text-center

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#D4AF37]/60
                hover:bg-[#11110f]

                sm:min-h-[105px]
              "
            >

              <FaEnvelope
                className="
                  text-lg
                  text-[#D4AF37]

                  transition-transform
                  group-hover:scale-110
                "
              />

              <span
                className="
                  mt-2

                  text-xs
                  font-medium

                  text-white
                "
              >
                Email
              </span>


              <span
                className="
                  mt-1

                  max-w-full
                  truncate

                  text-[10px]

                  text-neutral-500
                "
              >
                Send an email
              </span>

            </a>


            {/* INSTAGRAM */}

            <a
              href={instagramLink}

              target={
                instagramLink === "#"
                  ? undefined
                  : "_blank"
              }

              rel={
                instagramLink === "#"
                  ? undefined
                  : "noopener noreferrer"
              }

              className="
                group

                flex
                min-h-[92px]

                flex-col
                items-center
                justify-center

                rounded-2xl

                border
                border-[#D4AF37]/20

                bg-[#0d0d0d]

                px-2
                py-4

                text-center

                transition-all
                duration-300

                hover:-translate-y-1
                hover:border-[#D4AF37]/60
                hover:bg-[#11110f]

                sm:min-h-[105px]
              "
            >

              <FaInstagram
                className="
                  text-xl
                  text-[#D4AF37]

                  transition-transform
                  group-hover:scale-110
                "
              />

              <span
                className="
                  mt-2

                  text-xs
                  font-medium

                  text-white
                "
              >
                Instagram
              </span>


              <span
                className="
                  mt-1

                  max-w-full
                  truncate

                  text-[10px]

                  text-neutral-500
                "
              >
                Message us
              </span>

            </a>

          </div>

        </section>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <section
          className="
            mt-8

            grid
            gap-7

            lg:grid-cols-[1fr_340px]
            lg:items-start
          "
        >

          {/* =================================================
              ENQUIRY FORM
          ================================================= */}

          <div
            className="
              rounded-[26px]

              border
              border-[#D4AF37]/20

              bg-[#0d0d0d]

              p-5

              sm:p-8

              lg:p-10
            "
          >

            {/* FORM HEADER */}

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10

                    shrink-0

                    items-center
                    justify-center

                    rounded-xl

                    bg-[#D4AF37]/10

                    text-[#D4AF37]
                  "
                >

                  <FaPaperPlane />

                </div>


                <div>

                  <h2
                    className="
                      text-2xl
                      font-semibold

                      text-[#F7E3A3]

                      sm:text-3xl
                    "
                  >
                    How Can We Help?
                  </h2>


                  <p
                    className="
                      mt-1

                      text-xs

                      text-neutral-500

                      sm:text-sm
                    "
                  >
                    Send us your question and we'll take care of it.
                  </p>

                </div>

              </div>

            </div>


            {/* SUCCESS */}

            {submitted ? (

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}

                animate={{
                  opacity: 1,
                  y: 0,
                }}

                className="
                  mt-8

                  rounded-2xl

                  border
                  border-[#D4AF37]/25

                  bg-black

                  px-5
                  py-10

                  text-center
                "
              >

                <div
                  className="
                    mx-auto

                    flex
                    h-16
                    w-16

                    items-center
                    justify-center

                    rounded-full

                    bg-[#D4AF37]/10
                  "
                >

                  <FaCheckCircle
                    className="
                      text-3xl

                      text-[#D4AF37]
                    "
                  />

                </div>


                <h3
                  className="
                    mt-5

                    text-xl
                    font-semibold

                    text-[#F7E3A3]
                  "
                >
                  Message Sent
                </h3>


                <p
                  className="
                    mx-auto
                    mt-3

                    max-w-sm

                    text-sm
                    leading-relaxed

                    text-neutral-400
                  "
                >
                  Thanks for reaching out to T&M Jewels.
                  We've received your enquiry and will
                  get back to you soon.
                </p>


                <button
                  type="button"

                  onClick={() => {
                    setSubmitted(false);

                    setFormData({
                      name: "",
                      email: "",
                      category: "",
                      orderNumber: "",
                      message: "",
                    });
                  }}

                  className="
                    mt-7

                    inline-flex
                    items-center
                    gap-2

                    rounded-full

                    border
                    border-[#D4AF37]/40

                    px-6
                    py-2.5

                    text-xs
                    font-medium

                    text-[#D4AF37]

                    transition

                    hover:bg-[#D4AF37]
                    hover:text-black
                  "
                >
                  Send Another Message
                </button>

              </motion.div>

            ) : (

              /* =================================================
                 FORM
              ================================================= */

              <form
                onSubmit={handleSubmit}

                className="
                  mt-8
                  space-y-5
                "
              >

                {/* NAME + EMAIL */}

                <div
                  className="
                    grid
                    gap-5

                    sm:grid-cols-2
                  "
                >

                  {/* NAME */}

                  <div>

                    <label
                      htmlFor="name"

                      className="
                        mb-2

                        block

                        text-xs
                        font-medium

                        text-neutral-300
                      "
                    >
                      Full Name
                    </label>


                    <input
                      id="name"

                      name="name"

                      type="text"

                      value={formData.name}

                      onChange={handleChange}

                      placeholder="Your name"

                      required

                      className="
                        w-full

                        rounded-xl

                        border
                        border-white/10

                        bg-black

                        px-4
                        py-3.5

                        text-sm
                        text-white

                        outline-none

                        placeholder:text-neutral-600

                        transition

                        focus:border-[#D4AF37]/60
                        focus:ring-2
                        focus:ring-[#D4AF37]/10
                      "
                    />

                  </div>


                  {/* EMAIL */}

                  <div>

                    <label
                      htmlFor="email"

                      className="
                        mb-2

                        block

                        text-xs
                        font-medium

                        text-neutral-300
                      "
                    >
                      Email Address
                    </label>


                    <input
                      id="email"

                      name="email"

                      type="email"

                      value={formData.email}

                      onChange={handleChange}

                      placeholder="you@example.com"

                      required

                      className="
                        w-full

                        rounded-xl

                        border
                        border-white/10

                        bg-black

                        px-4
                        py-3.5

                        text-sm
                        text-white

                        outline-none

                        placeholder:text-neutral-600

                        transition

                        focus:border-[#D4AF37]/60
                        focus:ring-2
                        focus:ring-[#D4AF37]/10
                      "
                    />

                  </div>

                </div>


                {/* CATEGORY */}

                <div>

                  <label
                    htmlFor="category"

                    className="
                      mb-2

                      block

                      text-xs
                      font-medium

                      text-neutral-300
                    "
                  >
                    What can we help you with?
                  </label>


                  <select
                    id="category"

                    name="category"

                    value={formData.category}

                    onChange={handleChange}

                    required

                    className="
                      w-full

                      rounded-xl

                      border
                      border-white/10

                      bg-black

                      px-4
                      py-3.5

                      text-sm

                      text-white

                      outline-none

                      transition

                      focus:border-[#D4AF37]/60
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                    "
                  >

                    <option
                      value=""
                      disabled
                      className="bg-black"
                    >
                      Select a topic
                    </option>

                    <option
                      value="Order & Payment"
                      className="bg-black"
                    >
                      Order & Payment
                    </option>

                    <option
                      value="Product Question"
                      className="bg-black"
                    >
                      Product Question
                    </option>

                    <option
                      value="Delivery & Shipping"
                      className="bg-black"
                    >
                      Delivery & Shipping
                    </option>

                    <option
                      value="Return / Damaged Item"
                      className="bg-black"
                    >
                      Return / Damaged Item
                    </option>

                    <option
                      value="Product Availability"
                      className="bg-black"
                    >
                      Product Availability
                    </option>

                    <option
                      value="Collaboration"
                      className="bg-black"
                    >
                      Collaboration
                    </option>

                    <option
                      value="Other"
                      className="bg-black"
                    >
                      Other
                    </option>

                  </select>

                </div>


                {/* ORDER NUMBER */}

                <div>

                  <label
                    htmlFor="orderNumber"

                    className="
                      mb-2

                      block

                      text-xs
                      font-medium

                      text-neutral-300
                    "
                  >
                    Order Number

                    <span
                      className="
                        ml-1

                        font-normal

                        text-neutral-600
                      "
                    >
                      Optional
                    </span>
                  </label>


                  <input
                    id="orderNumber"

                    name="orderNumber"

                    type="text"

                    value={formData.orderNumber}

                    onChange={handleChange}

                    placeholder="e.g. TNM12345"

                    className="
                      w-full

                      rounded-xl

                      border
                      border-white/10

                      bg-black

                      px-4
                      py-3.5

                      text-sm
                      text-white

                      outline-none

                      placeholder:text-neutral-600

                      transition

                      focus:border-[#D4AF37]/60
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                    "
                  />

                </div>


                {/* MESSAGE */}

                <div>

                  <div
                    className="
                      mb-2

                      flex
                      items-center
                      justify-between
                    "
                  >

                    <label
                      htmlFor="message"

                      className="
                        block

                        text-xs
                        font-medium

                        text-neutral-300
                      "
                    >
                      Your Message
                    </label>


                    <span
                      className="
                        text-[10px]

                        text-neutral-600
                      "
                    >
                      Required
                    </span>

                  </div>


                  <textarea
                    id="message"

                    name="message"

                    value={formData.message}

                    onChange={handleChange}

                    placeholder="Tell us how we can help..."

                    required

                    rows={6}

                    className="
                      w-full

                      resize-none

                      rounded-xl

                      border
                      border-white/10

                      bg-black

                      px-4
                      py-3.5

                      text-sm
                      leading-relaxed

                      text-white

                      outline-none

                      placeholder:text-neutral-600

                      transition

                      focus:border-[#D4AF37]/60
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                    "
                  />

                </div>


                {/* SUBMIT */}

                <div
                  className="
                    pt-1
                  "
                >

                  <button
                    type="submit"

                    className="
                      group

                      flex
                      w-full

                      items-center
                      justify-center
                      gap-2

                      rounded-xl

                      bg-gradient-to-r

                      from-[#B8862E]
                      via-[#D4AF37]
                      to-[#F7E3A3]

                      px-6
                      py-3.5

                      text-sm
                      font-semibold

                      text-black

                      transition-all
                      duration-300

                      hover:-translate-y-0.5
                      hover:shadow-lg
                      hover:shadow-[#D4AF37]/10

                      active:scale-[0.98]
                    "
                  >

                    Send Message

                    <FaArrowRight
                      className="
                        text-xs

                        transition-transform

                        group-hover:translate-x-1
                      "
                    />

                  </button>


                  <p
                    className="
                      mt-3

                      text-center

                      text-[10px]

                      text-neutral-600

                      sm:text-xs
                    "
                  >
                    We usually respond within 24–48 hours.
                  </p>

                </div>

              </form>

            )}

          </div>


          {/* =================================================
              RIGHT / SUPPORT
          ================================================= */}

          <aside
            className="
              space-y-4
            "
          >

            {/* CUSTOMER SUPPORT */}

            <div
              className="
                rounded-[24px]

                border
                border-[#D4AF37]/20

                bg-[#0d0d0d]

                p-6

                sm:p-7
              "
            >

              <span
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]

                  text-[#D4AF37]
                "
              >
                Support Hours
              </span>


              <h3
                className="
                  mt-3

                  text-xl
                  font-semibold

                  text-[#F7E3A3]
                "
              >
                We're here for you.
              </h3>


              <div
                className="
                  mt-5

                  rounded-2xl

                  border
                  border-white/5

                  bg-black

                  p-4
                "
              >

                <p
                  className="
                    text-xs
                    uppercase
                    tracking-wider

                    text-neutral-500
                  "
                >
                  Monday — Saturday
                </p>


                <p
                  className="
                    mt-1

                    text-lg
                    font-medium

                    text-white
                  "
                >
                  10:00 AM — 7:00 PM
                </p>


                <p
                  className="
                    mt-1

                    text-xs

                    text-[#D4AF37]
                  "
                >
                  Indian Standard Time
                </p>

              </div>

            </div>


            {/* WHATSAPP CTA */}

            <div
              className="
                overflow-hidden

                rounded-[24px]

                border
                border-[#D4AF37]/20

                bg-gradient-to-br
                from-[#17150f]
                to-[#0d0d0d]

                p-6

                sm:p-7
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11

                  items-center
                  justify-center

                  rounded-full

                  bg-[#D4AF37]/10

                  text-xl
                  text-[#D4AF37]
                "
              >

                <FaWhatsapp />

              </div>


              <h3
                className="
                  mt-5

                  text-xl
                  font-semibold

                  text-[#F7E3A3]
                "
              >
                Need help quickly?
              </h3>


              <p
                className="
                  mt-2

                  text-sm
                  leading-relaxed

                  text-neutral-400
                "
              >
                For quick assistance, chat with our team
                directly on WhatsApp.
              </p>


              <a
                href={whatsappLink}

                target={
                  whatsappLink === "#"
                    ? undefined
                    : "_blank"
                }

                rel={
                  whatsappLink === "#"
                    ? undefined
                    : "noopener noreferrer"
                }

                className="
                  mt-5

                  inline-flex
                  w-full

                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  border
                  border-[#D4AF37]/30

                  bg-black

                  px-5
                  py-3

                  text-xs
                  font-medium

                  text-[#D4AF37]

                  transition

                  hover:bg-[#D4AF37]
                  hover:text-black
                "
              >
                Chat on WhatsApp

                <FaArrowRight
                  className="text-[10px]"
                />

              </a>

            </div>


            {/* RESPONSE NOTE */}

            <div
              className="
                rounded-[20px]

                border
                border-white/5

                bg-[#090909]

                px-5
                py-4
              "
            >

              <p
                className="
                  text-xs
                  leading-relaxed

                  text-neutral-500
                "
              >
                ✦ Your questions matter to us. Every
                enquiry is reviewed by our team.
              </p>

            </div>

          </aside>

        </section>


        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <section
          className="
            mt-10

            border-t
            border-white/5

            pt-7

            text-center
          "
        >

          <p
            className="
              text-xs

              text-neutral-600
            "
          >
            T&M Jewels · Crafted with care, always here to help.
          </p>

        </section>


        {/* =================================================
            ERROR
        ================================================= */}

        {isError && (

          <p
            className="
              mx-auto
              mt-6

              max-w-xl

              text-center

              text-[10px]

              text-neutral-600
            "
          >
            Some contact information could not be loaded.
            Please try again later.
          </p>

        )}

      </div>

    </main>

  );

}