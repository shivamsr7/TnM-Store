import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  ArrowUpRight,
} from "lucide-react";

import { useWhatsAppNumber } from "../hooks/useWhatsAppNumber";

interface WhatsAppSupportChatProps {
  productName?: string;
}

export default function WhatsAppSupportChat({
  productName,
}: WhatsAppSupportChatProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSupport, setShowSupport] = useState(false);

  const {
    data: whatsappNumber = "",
    isLoading,
    isError,
  } = useWhatsAppNumber();

  /* =====================================================
     MOUNT
  ===================================================== */

  useEffect(() => {
    setMounted(true);

    return () => {
      setMounted(false);
    };
  }, []);

  /* =====================================================
     SHOW AFTER 58% PAGE SCROLL
  ===================================================== */

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      const documentHeight =
        document.documentElement.scrollHeight;

      const viewportHeight =
        window.innerHeight;

      const scrollableHeight =
        documentHeight - viewportHeight;

      if (scrollableHeight <= 0) {
        setShowSupport(false);
        return;
      }

      const scrollPercentage =
        (scrollTop / scrollableHeight) * 100;

      setShowSupport(scrollPercentage >= 58);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  /* =====================================================
     WHATSAPP
  ===================================================== */

  const cleanNumber = whatsappNumber.replace(/\D/g, "");

  const message = productName
    ? `Hi T&M Jewels! 👋 I'm interested in ${productName}. Can you help me with this?`
    : `Hi T&M Jewels! 👋 I need help with a product/order.`;

  const whatsappUrl = cleanNumber
    ? `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`
    : "";

  const handleWhatsApp = () => {
    if (!whatsappUrl) return;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /* =====================================================
     PORTAL
  ===================================================== */

  if (!mounted) {
    return null;
  }

  return createPortal(
    <>
      {/* ===================================================
          FLOATING SUPPORT BUTTON
      =================================================== */}

      {showSupport && (
        <div
          className="
            fixed
            right-3
            top-[62%]
            z-[9990]

            sm:right-5
            sm:top-[58%]
          "
        >
          <button
            type="button"
            aria-label="Open T&M Jewels customer support"
            onClick={() => setOpen(true)}
            className="
              group
              relative

              flex
              h-11
              w-11

              items-center
              justify-center

              overflow-hidden
              rounded-full

              border
              border-[#d6ad4d]/70

              bg-[#080808]

              text-[#e4c56b]

              shadow-[0_8px_30px_rgba(0,0,0,.5)]

              transition-all
              duration-300

              hover:border-[#f1d276]
              hover:shadow-[0_8px_35px_rgba(214,173,77,.25)]

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-[#e4c56b]

              sm:h-12
              sm:w-12
            "
          >
            {/* Icon */}
            <span
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-full
                bg-[#d6ad4d]/10

                sm:h-8
                sm:w-8
              "
            >
              <MessageCircle
                className="
                  h-[18px]
                  w-[18px]

                  sm:h-5
                  sm:w-5
                "
                strokeWidth={1.7}
              />
            </span>

            {/* Desktop hover text */}
            <span
              className="
                pointer-events-none
                absolute

                hidden
                whitespace-nowrap

                rounded-full
                border
                border-[#d6ad4d]/50
                bg-[#080808]

                px-3
                py-2

                text-xs
                font-medium
                text-[#e4c56b]

                opacity-0

                shadow-[0_8px_25px_rgba(0,0,0,.4)]

                transition-all
                duration-300

                group-hover:block
                group-hover:-translate-x-[115%]
                group-hover:opacity-100

                sm:block
              "
            >
              Need Help?
            </span>
          </button>
        </div>
      )}

      {/* ===================================================
          SUPPORT POPUP
      =================================================== */}

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            pointerEvents: "none",
          }}
        >
          {/* =================================================
              BACKDROP / CLOSE AREA
          ================================================= */}

          <button
            type="button"
            aria-label="Close support popup"
            className="
              pointer-events-auto
              absolute
              inset-0

              cursor-default

              bg-black/20

              sm:bg-black/10
            "
            onClick={() => setOpen(false)}
          />

          {/* =================================================
              CHAT BOX

              Mobile:
              bottom aligned with safe margins

              Desktop:
              centered vertically
          ================================================= */}

          <div
            className="
              pointer-events-auto
              absolute

              left-3
              right-3
              bottom-4

              w-auto

              max-h-[calc(100dvh-2rem)]

              overflow-y-auto
              overflow-x-hidden

              rounded-2xl

              border
              border-[#d6ad4d]/30

              bg-[#090909]

              text-white

              shadow-[0_20px_70px_rgba(0,0,0,.6)]

              sm:left-auto
              sm:right-6
              sm:top-1/2
              sm:bottom-auto

              sm:w-[360px]

              sm:-translate-y-1/2
            "
          >
            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between

                border-b
                border-white/10

                bg-[radial-gradient(circle_at_15%_0%,#29220e_0%,#090909_55%)]

                px-4
                py-4

                sm:px-5
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0

                    items-center
                    justify-center

                    rounded-full

                    border
                    border-[#d6ad4d]/60

                    bg-black

                    font-serif
                    text-[10px]
                    text-[#e4c56b]

                    sm:h-10
                    sm:w-10
                    sm:text-xs
                  "
                >
                  T&M
                </div>

                <div>
                  <p className="font-serif text-sm sm:text-base">
                    T&M Jewels
                  </p>

                  <p
                    className="
                      mt-0.5

                      text-[8px]
                      uppercase
                      tracking-[0.16em]

                      text-[#d6ad4d]

                      sm:text-[9px]
                    "
                  >
                    Customer Support
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close support chat"
                onClick={() => setOpen(false)}
                className="
                  flex
                  h-8
                  w-8

                  items-center
                  justify-center

                  rounded-full

                  text-white/60

                  transition-colors

                  hover:bg-white/5
                  hover:text-white
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* =================================================
                BODY
            ================================================= */}

            <div className="px-4 py-5 sm:px-5 sm:py-6">
              {/* Welcome */}
              <div
                className="
                  rounded-2xl
                  rounded-tl-sm

                  border
                  border-white/10

                  bg-white/[0.045]

                  px-4
                  py-4
                "
              >
                <p className="text-sm leading-6 text-white/90">
                  Hi! 👋
                </p>

                <p
                  className="
                    mt-2

                    text-[13px]
                    leading-5

                    text-white/65

                    sm:text-sm
                    sm:leading-6
                  "
                >
                  Welcome to T&M Jewels. Have a question
                  about a product, order, delivery or anything
                  else? We&apos;re happy to help. 💛
                </p>
              </div>

              {/* Product context */}
              {productName && (
                <div
                  className="
                    mt-3

                    rounded-xl

                    border
                    border-[#d6ad4d]/20

                    bg-[#d6ad4d]/[0.06]

                    px-3
                    py-2.5
                  "
                >
                  <p
                    className="
                      text-[8px]
                      uppercase
                      tracking-[0.15em]

                      text-[#d6ad4d]

                      sm:text-[9px]
                    "
                  >
                    You&apos;re viewing
                  </p>

                  <p className="mt-1 truncate text-xs text-white/75">
                    {productName}
                  </p>
                </div>
              )}

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsApp}
                disabled={
                  isLoading ||
                  isError ||
                  !cleanNumber
                }
                className="
                  mt-5

                  flex
                  w-full

                  items-center
                  justify-center
                  gap-2

                  rounded-xl

                  bg-[#d6ad4d]

                  px-4
                  py-3.5

                  text-sm
                  font-semibold
                  text-black

                  transition-colors

                  hover:bg-[#e7c56b]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <MessageCircle className="h-5 w-5" />

                {isLoading
                  ? "Loading..."
                  : "Chat with us on WhatsApp"}

                <ArrowUpRight className="h-4 w-4" />
              </button>

              {/* Error */}
              {isError && (
                <p className="mt-3 text-center text-[10px] text-red-400">
                  Unable to load WhatsApp support right now.
                </p>
              )}

              {!isLoading &&
                !isError &&
                !cleanNumber && (
                  <p className="mt-3 text-center text-[10px] text-red-400">
                    WhatsApp support is currently unavailable.
                  </p>
                )}

              <p
                className="
                  mt-3

                  text-center

                  text-[8px]
                  uppercase
                  tracking-[0.13em]

                  text-white/30

                  sm:text-[9px]
                "
              >
                Our team will reply on WhatsApp
              </p>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
}