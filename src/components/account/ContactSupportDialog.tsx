import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  X,
} from "lucide-react";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";

import {
  useContactSettings,
} from "@/features/contact/hooks/useContactSettings";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ContactSupportDialog({
  open,
  onClose,
}: Props) {
  /*
   * =========================================================
   * CONTACT SETTINGS
   * =========================================================
   *
   * Use the same dynamic contact-settings source as the
   * Contact Us page.
   *
   * =========================================================
   */

  const {
    data: settings,
    isLoading,
    isError,
  } = useContactSettings();

  /*
   * =========================================================
   * CONTACT VALUES
   * =========================================================
   */

  const supportEmail =
    settings?.supportEmail ||
    "shop.tnm@gmail.com";

  const whatsapp =
    settings?.whatsapp ||
    "";

  const instagram =
    settings?.instagram ||
    "";

  /*
   * =========================================================
   * CLEAN WHATSAPP NUMBER
   * =========================================================
   */

  const cleanWhatsApp =
    whatsapp.replace(/\D/g, "");

  /*
   * =========================================================
   * WHATSAPP LINK
   * =========================================================
   */

  const whatsappLink =
    cleanWhatsApp
      ? `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
          "Hi T&M Jewels! 👋 I need some help."
        )}`
      : "#";

  /*
   * =========================================================
   * INSTAGRAM USERNAME
   * =========================================================
   */

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

  /*
   * =========================================================
   * INSTAGRAM LINK
   * =========================================================
   */

  const instagramLink =
    instagramUsername
      ? `https://instagram.com/${instagramUsername}`
      : "#";

  /*
   * =========================================================
   * CONTACT CARDS
   * =========================================================
   */

  const contactCards = [
    {
      title: "Email",
      icon: FaEnvelope,
      description:
        "For product queries, order assistance and collaborations.",
      value: supportEmail,
      action: "Send Email",
      link: `mailto:${supportEmail}`,
      external: false,
      disabled: !supportEmail,
    },

    {
      title: "WhatsApp",
      icon: FaWhatsapp,
      description:
        "Need a quick response? Chat with us on WhatsApp.",
      value:
        whatsapp ||
        "Connect with our team instantly",
      action: "Chat on WhatsApp",
      link: whatsappLink,
      external: true,
      disabled: !cleanWhatsApp,
    },

    {
      title: "Instagram",
      icon: FaInstagram,
      description:
        "Follow us or send us a message on Instagram.",
      value:
        instagramUsername
          ? `@${instagramUsername}`
          : "@tnm_jewels",
      action: "Visit Instagram",
      link: instagramLink,
      external: true,
      disabled: !instagramUsername,
    },
  ];

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="
          flex
          max-h-[90vh]
          w-[95vw]
          flex-col
          overflow-hidden
          rounded-3xl
          border-neutral-200
          bg-white
          p-0
          text-black
          shadow-xl
          sm:max-w-xl
          [&>button]:hidden
        "
      >
        {/* =================================================
            HEADER — STATIC
        ================================================== */}

        <div
          className="
            sticky
            top-0
            z-20
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-neutral-200
            bg-white
            px-6
            py-5
          "
        >
          <DialogHeader>
            <DialogTitle
              className="
                text-xl
                font-semibold
                text-black
              "
            >
              Contact Support
            </DialogTitle>
          </DialogHeader>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-neutral-300
              transition
              hover:bg-neutral-100
            "
            aria-label="Close contact support"
          >
            <X size={18} />
          </button>
        </div>

        {/* =================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            space-y-6
            p-6
          "
        >
          {/* =================================================
              INTRO
          ================================================== */}

          <div className="text-center">
            <p
              className="
                text-sm
                leading-relaxed
                text-neutral-600
              "
            >
              If you have any questions about our products,
              your order, or need any assistance, feel free
              to contact us.

              <br />

              We’re always happy to help.
            </p>
          </div>

          {/* =================================================
              LOADING
          ================================================== */}

          {isLoading && (
            <div
              className="
                rounded-2xl
                border
                border-neutral-200
                bg-neutral-50
                p-6
                text-center
              "
            >
              <p
                className="
                  text-sm
                  text-neutral-500
                "
              >
                Loading contact information...
              </p>
            </div>
          )}

          {/* =================================================
              CONTACT CARDS
          ================================================== */}

          {!isLoading && (
            <div className="space-y-4">
              {contactCards.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      rounded-2xl
                      border
                      border-[#D4AF37]/30
                      bg-neutral-50
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        items-center
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          h-12
                          w-12
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#D4AF37]/40
                          text-xl
                          text-[#D4AF37]
                        "
                      >
                        <Icon />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3
                          className="
                            font-semibold
                            text-[#9A7A22]
                          "
                        >
                          {item.title}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-sm
                            text-neutral-600
                          "
                        >
                          {item.description}
                        </p>

                        <p
                          className="
                            mt-2
                            break-all
                            text-sm
                            text-[#9A7A22]
                          "
                        >
                          {item.value}
                        </p>
                      </div>
                    </div>

                    <a
                      href={item.disabled ? "#" : item.link}
                      target={
                        item.external && !item.disabled
                          ? "_blank"
                          : undefined
                      }
                      rel={
                        item.external && !item.disabled
                          ? "noopener noreferrer"
                          : undefined
                      }
                      aria-disabled={item.disabled}
                      onClick={(event) => {
                        if (item.disabled) {
                          event.preventDefault();
                        }
                      }}
                      className={`
                        mt-4
                        inline-flex
                        rounded-full
                        px-5
                        py-2
                        text-sm
                        font-medium
                        transition
                        ${
                          item.disabled
                            ? "cursor-not-allowed bg-neutral-200 text-neutral-400"
                            : "bg-gradient-to-r from-[#B8862E] via-[#D4AF37] to-[#F7E3A3] text-black hover:scale-105"
                        }
                      `}
                    >
                      {item.action}
                    </a>
                  </div>
                );
              })}
            </div>
          )}

          {/* =================================================
              ERROR
          ================================================== */}

          {isError && (
            <p
              className="
                text-center
                text-xs
                text-neutral-500
              "
            >
              Some contact information could not be loaded.
              Please try again later.
            </p>
          )}

          {/* =================================================
              CUSTOMER SUPPORT
          ================================================== */}

          <div
            className="
              rounded-2xl
              border
              border-[#D4AF37]/30
              bg-neutral-50
              p-6
              text-center
            "
          >
            <h3
              className="
                text-lg
                font-semibold
                text-[#9A7A22]
              "
            >
              🕒 Customer Support
            </h3>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-neutral-600
              "
            >
              Monday – Saturday

              <br />

              10:00 AM – 7:00 PM (IST)
            </p>
          </div>

          {/* =================================================
              THANK YOU
          ================================================== */}

          <div className="text-center">
            <h3
              className="
                text-xl
                font-semibold
                text-[#9A7A22]
              "
            >
              Thank You 🤍
            </h3>

            <p
              className="
                mt-3
                text-sm
                leading-relaxed
                text-neutral-600
              "
            >
              Thank you for choosing T&M Jewels.

              <br />

              We truly appreciate your trust and support.

              <br />

              We’re always here to help and will get back
              to you as soon as possible.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
