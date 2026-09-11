import { useEffect, useState } from "react";
import { LogIn, Sparkles, UserPlus, X } from "lucide-react";

import { useAuth } from "@/features/Auth/context/AuthContext";
import { useAuthDialog } from "@/features/Auth/context/AuthDialogContext";

const GUEST_SIGNUP_PROMPT_KEY =
  "tnm_guest_signup_prompt_date";

function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function GuestSignupPrompt() {
  const {
    customer,
    loading: authLoading,
  } = useAuth();

  const { openAuth } = useAuthDialog();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (authLoading || customer) {
      setOpen(false);
      return;
    }

    if (
      localStorage.getItem(GUEST_SIGNUP_PROMPT_KEY) ===
      getTodayKey()
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (!customer) {
        setOpen(true);
      }
    }, 9000);

    return () => window.clearTimeout(timer);
  }, [authLoading, customer]);

  const dismissForToday = () => {
    localStorage.setItem(
      GUEST_SIGNUP_PROMPT_KEY,
      getTodayKey()
    );
    setOpen(false);
  };

  const handleAuth = () => {
    dismissForToday();
    openAuth();
  };

  if (!open || authLoading || customer) {
    return null;
  }

  return (
    <>
      <style>{`
        @keyframes tnmGuestOverlayIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes tnmGuestPopupIn {
          from {
            opacity: 0;
            transform: scale(0.94);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/25
        px-4
        backdrop-blur-[2px]
        animate-[tnmGuestOverlayIn_0.25s_ease-out]
      "
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Join T&M Members"
        className="
          relative
          w-full
          max-w-[390px]
          overflow-hidden
          rounded-3xl
          border
          border-[#C8A44D]/40
          bg-[#FFFDF8]
          text-[#171717]
          shadow-[0_25px_80px_rgba(0,0,0,0.28)]
          animate-[tnmGuestPopupIn_0.35s_ease-out]
        "
      >
        {/* Premium gold accent */}
        <div
          className="
            h-1
            w-full
            bg-gradient-to-r
            from-[#B88A20]
            via-[#E4C15A]
            to-[#B88A20]
          "
        />

        {/* Close */}
        <button
          type="button"
          onClick={dismissForToday}
          aria-label="Close"
          className="
            absolute
            right-4
            top-5
            z-10
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-full
            border
            border-black/10
            bg-white
            text-neutral-600
            shadow-sm
            transition
            hover:border-[#C8A44D]/50
            hover:text-black
          "
        >
          <X size={16} strokeWidth={2} />
        </button>

        <div className="px-5 pb-5 pt-6 sm:px-6 sm:pb-6">
          <div className="flex items-start gap-3 pr-9">
            <div
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-2xl
                border
                border-[#C8A44D]/45
                bg-[#C8A44D]/10
              "
            >
              <Sparkles
                size={20}
                className="text-[#B18A2C]"
              />
            </div>

            <div className="pt-0.5">
              <p
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.24em]
                  text-[#A47B20]
                "
              >
                T&M Members
              </p>

              <h3
                className="
                  mt-1
                  text-xl
                  font-semibold
                  leading-tight
                  tracking-tight
                  text-[#171717]
                "
              >
                Get more from every order ✨
              </h3>
            </div>
          </div>

          <p
            className="
              mt-4
              text-sm
              leading-6
              text-neutral-600
            "
          >
            Save your favourites, track orders & unlock
            exclusive member rewards.
          </p>

          <div
            className="
              mt-4
              rounded-2xl
              border
              border-[#C8A44D]/20
              bg-[#FBF6E9]
              px-3.5
              py-3
            "
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💎</span>
              <p className="text-xs font-medium text-neutral-700">
                Join the T&M Family and make every purchase
                more rewarding.
              </p>
            </div>
          </div>

          <div className="mt-5 flex gap-2.5">
            <button
              type="button"
              onClick={handleAuth}
              className="
                flex
                min-w-0
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#C8A44D]
                px-3
                py-3.5
                text-xs
                font-bold
                tracking-wide
                text-black
                shadow-sm
                transition
                hover:bg-[#D8B95A]
                active:scale-[0.98]
                sm:text-sm
              "
            >
              <UserPlus size={17} />
              <span className="truncate">
                JOIN T&M MEMBERS
              </span>
            </button>

            <button
              type="button"
              onClick={handleAuth}
              className="
                flex
                items-center
                justify-center
                gap-1.5
                rounded-xl
                border
                border-neutral-300
                bg-white
                px-4
                py-3.5
                text-xs
                font-semibold
                text-neutral-800
                transition
                hover:border-[#C8A44D]
                hover:bg-[#FFFCF4]
                active:scale-[0.98]
                sm:text-sm
              "
            >
              <LogIn size={16} />
              Login
            </button>
          </div>

          <p
            className="
              mt-3
              text-center
              text-[10px]
              text-neutral-500
            "
          >
            Takes less than a minute • Your account stays secure
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
