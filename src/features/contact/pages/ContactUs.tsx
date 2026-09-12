import { createPortal } from "react-dom";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
  FaPaperPlane,
  FaCheckCircle,
  FaArrowRight,
  FaPaperclip,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import {
  useContactSettings,
} from "../hooks/useContactSettings";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  storageService,
} from "@/shared/services/storage.service";

import {
  sendCustomerQueryCreatedEmail,
} from "@/shared/services/customerQueryEmail.service";


const MAX_ATTACHMENTS = 3;

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


interface Attachment {
  file: File;
  preview: string;
}


interface UploadedAttachment {
  path: string;
  publicUrl: string;
  name: string;
  type: string;
  size: number;
}


export default function ContactUs() {

  const {
    data: settings,
    isLoading,
    isError,
  } = useContactSettings();


  const {
    customer,
  } = useAuth();

  const [searchParams] = useSearchParams();


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


  const [attachments, setAttachments] =
    useState<Attachment[]>([]);


  const [ticketNumber, setTicketNumber] =
    useState<string | null>(null);


  const [submitting, setSubmitting] =
    useState(false);


  const [submitted, setSubmitted] =
    useState(false);


  const [submitError, setSubmitError] =
    useState("");

  /* =====================================================
     TRACK TICKET STATE
  ===================================================== */

  const [trackDialogOpen, setTrackDialogOpen] =
    useState(false);

  const [trackTicketNumber, setTrackTicketNumber] =
    useState("");

  const [trackEmail, setTrackEmail] =
    useState("");

  const [tracking, setTracking] =
    useState(false);

  const [trackError, setTrackError] =
    useState("");

  const [trackedTicket, setTrackedTicket] =
    useState<{
      ticket_number: string;
      category: string;
      order_number: string | null;
      message: string;
      status: string;
      admin_note: string | null;
      created_at: string;
      updated_at: string;
      resolved_at: string | null;
    } | null>(null);


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
     LOGGED-IN CUSTOMER EMAIL
  ===================================================== */

  useEffect(() => {
    if (!customer?.email) return;

    setFormData((previous) => ({
      ...previous,
      email: customer.email ?? "",
    }));

    setTrackEmail(customer.email);
  }, [customer?.email]);

  useEffect(() => {
    const ticketFromUrl = searchParams.get("ticket")?.trim().toUpperCase();

    if (!ticketFromUrl) return;

    setTrackTicketNumber(ticketFromUrl);
    setTrackDialogOpen(true);
    setTrackError("");
    setTrackedTicket(null);

    if (customer?.email) {
      setTrackEmail(customer.email);
    }
  }, [searchParams, customer?.email]);


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
     TRACK TICKET
  ===================================================== */

  const openTrackDialog = () => {
    setTrackDialogOpen(true);
    setTrackError("");
    setTrackedTicket(null);

    if (customer?.email) {
      setTrackEmail(customer.email);
    }
  };

  const closeTrackDialog = () => {
    if (tracking) return;

    setTrackDialogOpen(false);
    setTrackError("");
    setTrackedTicket(null);
    setTrackTicketNumber("");
    if (!customer?.email?.trim()) {
      setTrackEmail("");
    }
  };

  const handleTrackTicket = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (tracking) return;

    const ticket = trackTicketNumber.trim().toUpperCase();
    const email = (
      customer?.email?.trim() ||
      trackEmail
    ).trim().toLowerCase();

    if (!ticket) {
      setTrackError("Please enter your ticket number.");
      return;
    }

    if (!email) {
      setTrackError("Please enter the email used for your enquiry.");
      return;
    }

    setTracking(true);
    setTrackError("");
    setTrackedTicket(null);

    try {
      const { data, error } = await supabase.rpc(
        "track_customer_ticket",
        {
          p_ticket_number: ticket,
          p_email: email,
        }
      );

      if (error) {
        console.error("Ticket tracking error:", error);
        throw error;
      }

      const result = Array.isArray(data) ? data[0] : data;

      if (!result) {
        setTrackError(
          "We couldn't find a ticket with these details. Please check your ticket number and email."
        );
        return;
      }

      setTrackedTicket(result);
    } catch (error) {
      console.error("Failed to track customer ticket:", error);
      setTrackError(
        "We couldn't check your ticket right now. Please try again."
      );
    } finally {
      setTracking(false);
    }
  };

  const getTicketStatusIndex = (status: string) => {
    const normalized = status?.toLowerCase();

    if (normalized === "in_progress") return 1;
    if (normalized === "resolved") return 2;
    if (normalized === "closed") return 3;

    return 0;
  };

  const ticketStatusLabel = (status: string) => {
    switch (status?.toLowerCase()) {
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "closed":
        return "Closed";
      default:
        return "New";
    }
  };

  const formatTicketDate = (value: string) => {
    if (!value) return "";

    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  };


  /* =====================================================
     FORM HANDLER
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


    if (submitError) {

      setSubmitError("");

    }

  };


  /* =====================================================
     ATTACHMENT HANDLER
  ===================================================== */

  const handleAttachmentChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const files =
      Array.from(
        event.target.files || []
      );


    if (!files.length) {
      return;
    }


    setSubmitError("");


    const remainingSlots =
      MAX_ATTACHMENTS -
      attachments.length;


    if (remainingSlots <= 0) {

      setSubmitError(
        `You can attach up to ${MAX_ATTACHMENTS} files.`
      );

      event.target.value = "";

      return;

    }


    const selectedFiles =
      files.slice(
        0,
        remainingSlots
      );


    const validAttachments: Attachment[] = [];


    for (const file of selectedFiles) {

      if (
        !ALLOWED_FILE_TYPES.includes(
          file.type
        )
      ) {

        setSubmitError(
          "Only JPG, PNG and WEBP images can be attached."
        );

        continue;

      }


      if (
        file.size > MAX_FILE_SIZE
      ) {

        setSubmitError(
          "Each attachment must be 5 MB or smaller."
        );

        continue;

      }


      validAttachments.push({
        file,
        preview:
          URL.createObjectURL(file),
      });

    }


    setAttachments((previous) => [
      ...previous,
      ...validAttachments,
    ]);


    event.target.value = "";

  };


  /* =====================================================
     REMOVE ATTACHMENT
  ===================================================== */

  const removeAttachment = (
    index: number
  ) => {

    setAttachments((previous) => {

      const item =
        previous[index];


      if (item?.preview) {

        URL.revokeObjectURL(
          item.preview
        );

      }


      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

    });


    setSubmitError("");

  };


  /* =====================================================
     SUBMIT QUERY
  ===================================================== */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();


    if (submitting) {
      return;
    }


    setSubmitting(true);

    setSubmitError("");


    const uploadedFiles:
      UploadedAttachment[] = [];


    try {

      /* =================================================
         1. UPLOAD ATTACHMENTS
         ================================================= */

      for (
        const attachment
        of attachments
      ) {

        const uploaded =
          await storageService.upload(
            attachment.file,
            "customer-queries"
          );


        uploadedFiles.push({
          path:
            uploaded.path,

          publicUrl:
            uploaded.publicUrl,

          name:
            attachment.file.name,

          type:
            attachment.file.type,

          size:
            attachment.file.size,
        });

      }


      /* =================================================
         2. SAVE QUERY + GET TICKET NUMBER
         ================================================= */

      const {
        data: query,
        error,
      } = await supabase
        .from("customer_queries")
        .insert({
          customer_id:
            customer?.id || null,

          name:
            formData.name.trim(),

          email:
            formData.email.trim(),

          category:
            formData.category,

          order_number:
            formData.orderNumber.trim() ||
            null,

          message:
            formData.message.trim(),

          attachments:
            uploadedFiles.length
              ? uploadedFiles
              : null,

          status:
            "new",
        })
        .select("ticket_number")
        .single();


      if (error) {

        console.error(
          "Customer query submission error:",
          error
        );

        throw error;

      }


      if (
        !query?.ticket_number
      ) {

        throw new Error(
          "Ticket number could not be generated."
        );

      }


      setTicketNumber(
        query.ticket_number
      );

      // Email delivery must never block ticket creation.
      try {
        const emailResult = await sendCustomerQueryCreatedEmail({
          to: formData.email.trim(),
          customerName: formData.name.trim(),
          ticketNumber: query.ticket_number,
          category: formData.category,
          orderNumber: formData.orderNumber.trim() || null,
          message: formData.message.trim(),
          status: "new",
          createdAt: new Date().toISOString(),
        });

        if (!emailResult?.success) {
          console.warn("Ticket created, but acknowledgement email was not sent.");
        }
      } catch (emailError) {
        console.error("Ticket acknowledgement email failed:", emailError);
      }


      /* =================================================
         3. CLEAN LOCAL PREVIEWS
         ================================================= */

      attachments.forEach(
        (attachment) => {

          if (attachment.preview) {

            URL.revokeObjectURL(
              attachment.preview
            );

          }

        }
      );


      setAttachments([]);

      setSubmitted(true);


    } catch (error) {

      console.error(
        "Failed to submit customer query:",
        error
      );


      /* =================================================
         CLEAN UP UPLOADED FILES
         IF DATABASE INSERT FAILED
         ================================================= */

      for (
        const uploaded
        of uploadedFiles
      ) {

        try {

          await storageService.remove(
            uploaded.path
          );

        } catch (
          cleanupError
        ) {

          console.error(
            "Failed to clean uploaded attachment:",
            cleanupError
          );

        }

      }


      setSubmitError(
        "We couldn't send your message right now. Please try again."
      );


    } finally {

      setSubmitting(false);

    }

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
              Questions about your order, products or
              delivery? We're here to make things easy.
            </p>

          </motion.div>

        </section>


        {/* =================================================
            QUICK CONTACT
        ================================================= */}

        <section className="mt-7">

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
              FORM
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


            {/* =================================================
                SUCCESS STATE
            ================================================= */}

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


                {/* TICKET NUMBER */}

                {ticketNumber && (

                  <div
                    className="
                      mx-auto
                      mt-6
                      max-w-xs

                      rounded-2xl

                      border
                      border-[#D4AF37]/25

                      bg-[#D4AF37]/5

                      px-5
                      py-4

                      text-center
                    "
                  >

                    <p
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.16em]

                        text-neutral-500
                      "
                    >
                      Your Ticket Number
                    </p>


                    <p
                      className="
                        mt-2

                        select-all

                        text-lg
                        font-semibold
                        tracking-wider

                        text-[#F7E3A3]
                      "
                    >
                      {ticketNumber}
                    </p>


                    <p
                      className="
                        mt-2

                        text-[10px]
                        leading-relaxed

                        text-neutral-600
                      "
                    >
                      Save this number to track your enquiry.
                    </p>

                  </div>

                )}


                <button
                  type="button"

                  onClick={() => {

                    setSubmitted(false);

                    setFormData({
                      name: "",
                      email: customer?.email?.trim() || formData.email,
                      category: "",
                      orderNumber: "",
                      message: "",
                    });

                    setAttachments([]);

                    setTicketNumber(null);

                    setSubmitError("");

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

                  <FaArrowRight
                    className="text-[9px]"
                  />

                </button>

              </motion.div>

            ) : (

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

                      autoComplete="name"

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

                      autoComplete="email"

                      readOnly={Boolean(customer?.email?.trim())}

                      className={`
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

                        ${
                          customer?.email?.trim()
                            ? "cursor-not-allowed bg-[#171717] text-neutral-400"
                            : ""
                        }
                      `}
                    />

                    {customer?.email?.trim() && (
                      <p
                        className="
                          mt-1.5
                          text-[10px]
                          text-neutral-600
                        "
                      >
                        Email linked to your account
                      </p>
                    )}

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
                    >
                      Select a topic
                    </option>

                    <option value="Order & Payment">
                      Order & Payment
                    </option>

                    <option value="Product Question">
                      Product Question
                    </option>

                    <option value="Delivery & Shipping">
                      Delivery & Shipping
                    </option>

                    <option value="Return / Damaged Item">
                      Return / Damaged Item
                    </option>

                    <option value="Product Availability">
                      Product Availability
                    </option>

                    <option value="Collaboration">
                      Collaboration
                    </option>

                    <option value="Other">
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

                  <label
                    htmlFor="message"

                    className="
                      mb-2
                      block

                      text-xs
                      font-medium

                      text-neutral-300
                    "
                  >
                    Your Message
                  </label>


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


                {/* =================================================
                    ATTACHMENTS
                ================================================= */}

                <div>

                  <div
                    className="
                      mb-2

                      flex
                      items-center
                      justify-between
                      gap-3
                    "
                  >

                    <label
                      htmlFor="attachments"

                      className="
                        block

                        text-xs
                        font-medium

                        text-neutral-300
                      "
                    >
                      Attach Photos / Screenshots

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


                    <span
                      className="
                        text-[10px]
                        text-neutral-600
                      "
                    >
                      {attachments.length}/{MAX_ATTACHMENTS}
                    </span>

                  </div>


                  <label
                    htmlFor="attachments"

                    className={`
                      flex
                      cursor-pointer

                      items-center
                      justify-center
                      gap-2

                      rounded-xl

                      border
                      border-dashed
                      border-white/10

                      bg-black

                      px-4
                      py-4

                      text-xs
                      text-neutral-500

                      transition

                      ${
                        attachments.length >=
                        MAX_ATTACHMENTS
                          ? "cursor-not-allowed opacity-40"
                          : "hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                      }
                    `}
                  >

                    <FaPaperclip
                      className="
                        text-[#D4AF37]
                      "
                    />


                    <span>
                      {attachments.length >=
                      MAX_ATTACHMENTS
                        ? "Maximum attachments added"
                        : "Click to attach photos or screenshots"}
                    </span>

                  </label>


                  <input
                    id="attachments"

                    type="file"

                    accept="
                      image/jpeg,
                      image/png,
                      image/webp
                    "

                    multiple

                    disabled={
                      attachments.length >=
                      MAX_ATTACHMENTS
                    }

                    onChange={
                      handleAttachmentChange
                    }

                    className="hidden"
                  />


                  <p
                    className="
                      mt-2

                      text-[10px]

                      text-neutral-600
                    "
                  >
                    JPG, PNG or WEBP · Maximum 5 MB each · Up to 3 files
                  </p>


                  {/* PREVIEWS */}

                  {attachments.length > 0 && (

                    <div
                      className="
                        mt-3

                        grid
                        grid-cols-3

                        gap-3
                      "
                    >

                      {attachments.map(
                        (
                          attachment,
                          index
                        ) => (

                          <div
                            key={`${attachment.file.name}-${index}`}

                            className="
                              group
                              relative

                              aspect-square

                              overflow-hidden

                              rounded-xl

                              border
                              border-white/10

                              bg-black
                            "
                          >

                            <img
                              src={
                                attachment.preview
                              }

                              alt={`Attachment ${index + 1}`}

                              className="
                                h-full
                                w-full

                                object-cover
                              "
                            />


                            <button
                              type="button"

                              onClick={() =>
                                removeAttachment(
                                  index
                                )
                              }

                              className="
                                absolute
                                right-1.5
                                top-1.5

                                flex
                                h-7
                                w-7

                                items-center
                                justify-center

                                rounded-full

                                bg-black/80

                                text-white

                                shadow-lg

                                transition

                                hover:bg-red-500
                              "

                              aria-label={`Remove attachment ${index + 1}`}
                            >

                              <FaTimes
                                className="
                                  text-[10px]
                                "
                              />

                            </button>


                            <div
                              className="
                                absolute
                                inset-x-0
                                bottom-0

                                truncate

                                bg-gradient-to-t
                                from-black
                                to-transparent

                                px-2
                                pb-2
                                pt-5

                                text-[9px]
                                text-white
                              "
                            >
                              {attachment.file.name}
                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>


                {/* ERROR */}

                {submitError && (

                  <div
                    className="
                      rounded-xl

                      border
                      border-red-500/20

                      bg-red-500/5

                      px-4
                      py-3

                      text-xs
                      leading-relaxed

                      text-red-400
                    "
                  >
                    {submitError}
                  </div>

                )}


                {/* SUBMIT */}

                <div className="pt-1">

                  <button
                    type="submit"

                    disabled={submitting}

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

                      active:scale-[0.98]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                      disabled:hover:translate-y-0
                    "
                  >

                    {submitting ? (

                      <>
                        <span
                          className="
                            h-4
                            w-4

                            animate-spin

                            rounded-full

                            border-2
                            border-black/30
                            border-t-black
                          "
                        />

                        {attachments.length > 0
                          ? "Uploading & Sending..."
                          : "Sending..."}
                      </>

                    ) : (

                      <>
                        Send Message

                        <FaArrowRight
                          className="
                            text-xs

                            transition-transform

                            group-hover:translate-x-1
                          "
                        />
                      </>

                    )}

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
              TRACK TICKET
          ================================================= */}

          <button
            type="button"
            onClick={openTrackDialog}
            className="
              group
              mt-4
              flex
              w-full
              items-center
              justify-between
              rounded-2xl
              border
              border-[#D4AF37]/20
              bg-[#0d0d0d]
              px-5
              py-4
              text-left
              transition-all
              duration-300
              hover:border-[#D4AF37]/50
              hover:bg-[#11110f]
              lg:hidden
            "
          >
            <span className="flex items-center gap-3">
              <span
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#D4AF37]/10
                  text-[#D4AF37]
                "
              >
                <FaSearch className="text-sm" />
              </span>

              <span>
                <span className="block text-sm font-medium text-white">
                  Track Your Ticket
                </span>
                <span className="mt-0.5 block text-[10px] text-neutral-500">
                  Check the status of your enquiry
                </span>
              </span>
            </span>

            <FaArrowRight
              className="
                text-xs
                text-[#D4AF37]
                transition-transform
                group-hover:translate-x-1
              "
            />
          </button>


          {/* =================================================
              SUPPORT SIDEBAR
          ================================================= */}

          <aside
            className="
              space-y-4
            "
          >

            {/* TRACK TICKET */}

            <div
              className="
                hidden
                rounded-[24px]
                border
                border-[#D4AF37]/20
                bg-[#0d0d0d]
                p-6
                sm:p-7
                lg:block
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
                  text-lg
                  text-[#D4AF37]
                "
              >
                <FaSearch />
              </div>

              <h3
                className="
                  mt-5
                  text-xl
                  font-semibold
                  text-[#F7E3A3]
                "
              >
                Track Your Ticket
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-relaxed
                  text-neutral-400
                "
              >
                Already contacted us? Check the latest status of your enquiry.
              </p>

              <button
                type="button"
                onClick={openTrackDialog}
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
                Track Ticket
                <FaArrowRight className="text-[10px]" />
              </button>
            </div>


            {/* SUPPORT HOURS */}

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
            CONTACT SETTINGS ERROR
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


      {/* =====================================================
          TRACK TICKET DIALOG
      ===================================================== */}

      {trackDialogOpen &&
        createPortal(
          <div
            className="
              fixed
              inset-0
              z-[9999]

              flex
              items-center
              justify-center

              bg-black/85
              backdrop-blur-sm

              sm:p-6
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="track-ticket-title"
          >

            <div
              className="
                flex
                h-full
                w-full
                flex-col
                overflow-hidden
                bg-[#F8F5EC]

                sm:h-auto
                sm:max-h-[calc(100vh-3rem)]
                sm:max-w-lg

                sm:rounded-[28px]
                sm:border
                sm:border-[#D4AF37]/20

                sm:shadow-2xl
              "
            >

            {/* DIALOG HEADER */}

            <div
              className="
                flex
                shrink-0
                items-center
                justify-between

                border-b
                border-black/10

                px-5
                py-5

                sm:px-7
                sm:py-6
              "
            >

              <div className="flex items-center gap-3">

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#D4AF37]/10
                    text-[#D4AF37]
                  "
                >
                  <FaSearch />
                </div>

                <div>
                  <h2
                    id="track-ticket-title"
                    className="
                      text-lg
                      font-semibold
                      text-[#2A241B]
                    "
                  >
                    Track Your Ticket
                  </h2>

                  <p className="mt-0.5 text-[10px] text-neutral-500">
                    Check your enquiry status
                  </p>
                </div>

              </div>


              <button
                type="button"
                onClick={closeTrackDialog}
                disabled={tracking}
                aria-label="Close ticket tracking"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-black/10
                  bg-white/70
                  text-neutral-500
                  transition
                  hover:border-[#D4AF37]/50
                  hover:text-[#B8862E]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <FaTimes className="text-xs" />
              </button>

            </div>


            {/* SCROLLABLE CONTENT */}

            <div
              className="
                min-h-0
                flex-1
                overflow-y-auto
                overscroll-contain
                px-5
                py-6

                sm:px-7
                sm:py-7
              "
            >

              {!trackedTicket ? (

                <form
                  onSubmit={handleTrackTicket}
                  className="space-y-5"
                >

                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#D4AF37]/30
                      bg-white/60
                      px-4
                      py-4
                    "
                  >
                    <p className="text-xs leading-relaxed text-neutral-400">
                      Enter your ticket number to see the latest update from our support team.
                    </p>
                  </div>


                  {/* TICKET NUMBER */}

                  <div>
                    <label
                      htmlFor="trackTicketNumber"
                      className="
                        mb-2
                        block
                        text-xs
                        font-medium
                        text-[#3B352B]
                      "
                    >
                      Ticket Number
                    </label>

                    <input
                      id="trackTicketNumber"
                      type="text"
                      value={trackTicketNumber}
                      onChange={(event) => {
                        setTrackTicketNumber(
                          event.target.value.toUpperCase()
                        );
                        if (trackError) setTrackError("");
                      }}
                      placeholder="e.g. TNM-260913-4821"
                      autoComplete="off"
                      autoCapitalize="characters"
                      required
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        tracking-wide
                        text-[#2A241B]
                        outline-none
                        placeholder:text-neutral-400
                        transition
                        focus:border-[#D4AF37]/60
                        focus:ring-2
                        focus:ring-[#D4AF37]/10
                      "
                    />
                  </div>


                  {/* EMAIL FOR GUEST */}

                  {!customer?.email?.trim() && (

                    <div>
                      <label
                        htmlFor="trackEmail"
                        className="
                          mb-2
                          block
                          text-xs
                          font-medium
                          text-[#3B352B]
                        "
                      >
                        Email Address
                      </label>

                      <input
                        id="trackEmail"
                        type="email"
                        value={trackEmail}
                        onChange={(event) => {
                          setTrackEmail(event.target.value);
                          if (trackError) setTrackError("");
                        }}
                        placeholder="Email used for your enquiry"
                        autoComplete="email"
                        readOnly={Boolean(customer?.email?.trim())}
                        required
                        className="
                          w-full
                          rounded-xl
                          border
                          border-white/10
                          bg-white
                          px-4
                          py-3.5
                          text-sm
                          text-[#2A241B]
                          outline-none
                          placeholder:text-neutral-400
                          transition
                          focus:border-[#D4AF37]/60
                          focus:ring-2
                          focus:ring-[#D4AF37]/10
                        "
                      />
                    </div>

                  )}


                  {customer?.email && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-black/10
                        bg-white/60
                        px-4
                        py-3
                      "
                    >
                      <p className="text-[10px] uppercase tracking-wider text-neutral-600">
                        Tracking with
                      </p>
                      <p className="mt-1 truncate text-xs text-[#3B352B]">
                        {customer.email}
                      </p>
                    </div>
                  )}


                  {/* ERROR */}

                  {trackError && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-red-500/20
                        bg-red-500/5
                        px-4
                        py-3
                        text-xs
                        leading-relaxed
                        text-red-400
                      "
                    >
                      {trackError}
                    </div>
                  )}


                  <button
                    type="submit"
                    disabled={tracking}
                    className="
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
                      transition
                      hover:-translate-y-0.5
                      active:scale-[0.98]
                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
                  >
                    {tracking ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-black/30
                            border-t-black
                          "
                        />
                        Checking Ticket...
                      </>
                    ) : (
                      <>
                        Track Ticket
                        <FaArrowRight className="text-xs" />
                      </>
                    )}
                  </button>

                </form>

              ) : (

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                >

                  {/* CURRENT STATUS */}

                  <div
                    className="
                      rounded-2xl
                      border
                      border-[#D4AF37]/30
                      bg-white/65
                      px-5
                      py-5
                      text-center
                    "
                  >
                    <p
                      className="
                        text-[10px]
                        font-medium
                        uppercase
                        tracking-[0.18em]
                        text-neutral-500
                      "
                    >
                      Current Status
                    </p>

                    <p
                      className="
                        mt-2
                        text-xl
                        font-semibold
                        text-[#2A241B]
                      "
                    >
                      {ticketStatusLabel(trackedTicket.status)}
                    </p>

                    <p
                      className="
                        mt-2
                        break-all
                        text-sm
                        font-medium
                        tracking-wider
                        text-[#D4AF37]
                      "
                    >
                      {trackedTicket.ticket_number}
                    </p>
                  </div>


                  {/* STATUS TIMELINE */}

                  <div className="mt-7 px-1">

                    {[
                      "New",
                      "In Progress",
                      "Resolved",
                      "Closed",
                    ].map((label, index) => {

                      const currentIndex =
                        getTicketStatusIndex(
                          trackedTicket.status
                        );

                      const isComplete =
                        index <= currentIndex;

                      const isCurrent =
                        index === currentIndex;

                      return (
                        <div
                          key={label}
                          className="
                            relative
                            flex
                            min-h-[58px]
                            items-start
                            gap-4
                          "
                        >

                          {index < 3 && (
                            <span
                              className={`
                                absolute
                                left-[9px]
                                top-5
                                h-[42px]
                                w-px
                                ${
                                  index <
                                  currentIndex
                                    ? "bg-[#D4AF37]/70"
                                    : "bg-black/10"
                                }
                              `}
                            />
                          )}

                          <span
                            className={`
                              relative
                              z-10
                              flex
                              h-5
                              w-5
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              ${
                                isComplete
                                  ? "border-[#D4AF37] bg-[#D4AF37] text-black"
                                  : "border-black/10 bg-white text-transparent"
                              }
                            `}
                          >
                            {isComplete && (
                              <FaCheckCircle className="text-[10px]" />
                            )}
                          </span>

                          <div className="-mt-0.5">
                            <p
                              className={`
                                text-sm
                                font-medium
                                ${
                                  isCurrent
                                    ? "text-[#2A241B]"
                                    : isComplete
                                      ? "text-[#4A443A]"
                                      : "text-neutral-400"
                                }
                              `}
                            >
                              {label}
                            </p>

                            {isCurrent && (
                              <p className="mt-1 text-[10px] text-[#D4AF37]">
                                Your ticket is currently here.
                              </p>
                            )}
                          </div>

                        </div>
                      );
                    })}

                  </div>


                  {/* DETAILS */}

                  <div className="mt-5 space-y-3">

                    <div
                      className="
                        rounded-2xl
                        border
                        border-black/10
                        bg-white/65
                        p-4
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          text-neutral-600
                        "
                      >
                        Category
                      </p>

                      <p className="mt-1 text-sm text-[#3B352B]">
                        {trackedTicket.category}
                      </p>
                    </div>


                    {trackedTicket.order_number && (
                      <div
                        className="
                          rounded-2xl
                          border
                          border-white/5
                          bg-black
                          p-4
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            text-neutral-600
                          "
                        >
                          Order Number
                        </p>

                        <p className="mt-1 text-sm tracking-wide text-[#3B352B]">
                          {trackedTicket.order_number}
                        </p>
                      </div>
                    )}


                    <div
                      className="
                        rounded-2xl
                        border
                        border-black/10
                        bg-white/65
                        p-4
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          text-neutral-600
                        "
                      >
                        Submitted
                      </p>

                      <p className="mt-1 text-sm text-[#3B352B]">
                        {formatTicketDate(trackedTicket.created_at)}
                      </p>
                    </div>


                    <div
                      className="
                        rounded-2xl
                        border
                        border-black/10
                        bg-white/65
                        p-4
                      "
                    >
                      <p
                        className="
                          text-[10px]
                          uppercase
                          tracking-wider
                          text-neutral-600
                        "
                      >
                        Your Message
                      </p>

                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#4A443A]">
                        {trackedTicket.message}
                      </p>
                    </div>


                    {trackedTicket.admin_note && (
                      <div
                        className="
                          rounded-2xl
                          border
                          border-[#D4AF37]/30
                          bg-[#FFF9E8]
                          p-4
                        "
                      >
                        <p
                          className="
                            text-[10px]
                            uppercase
                            tracking-wider
                            text-[#D4AF37]
                          "
                        >
                          Support Response
                        </p>

                        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#4A443A]">
                          {trackedTicket.admin_note}
                        </p>
                      </div>
                    )}

                  </div>


                </motion.div>

              )}

            </div>


            {/* STATIC ACTION FOOTER */}

            {trackedTicket && (
              <div
                className="
                  shrink-0
                  border-t
                  border-black/10
                  bg-[#F8F5EC]
                  px-5
                  py-4
                  pb-[max(1rem,env(safe-area-inset-bottom))]
                  sm:px-7
                  sm:py-5
                "
              >
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >
                  <button
                    type="button"
                    onClick={() => {
                      setTrackedTicket(null);
                      setTrackError("");
                    }}
                    className="
                      rounded-xl
                      border
                      border-black/10
                      bg-white
                      px-4
                      py-3
                      text-xs
                      font-medium
                      text-[#4A443A]
                      transition
                      hover:border-[#D4AF37]/50
                      hover:text-[#B8862E]
                    "
                  >
                    Track Another
                  </button>

                  <button
                    type="button"
                    onClick={closeTrackDialog}
                    className="
                      rounded-xl
                      bg-gradient-to-r
                      from-[#B8862E]
                      via-[#D4AF37]
                      to-[#F7E3A3]
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-black
                      transition
                      hover:-translate-y-0.5
                    "
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>,
        document.body
      )}

    </main>

  );

}