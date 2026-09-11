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
    <div
      className="
        fixed
        inset-x-0
        bottom-4
        z-[90]
        flex
        justify-center
        px-3
        sm:bottom-5
        sm:px-4
        pointer-events-none
      "
    >
      <div
        role="dialog"
        aria-label="Join T&M Members"
        className="
          pointer-events-auto
          relative
          w-full
          max-w-md
          overflow-hidden
          rounded-2xl
          border
          border-[#C8A44D]/45
          bg-black
          text-white
          shadow-[0_18px_55px_rgba(0,0,0,0.35)]
          animate-[tnmGuestPromptUp_0.45s_ease-out]
        "
      >
        <button
          type="button"
          onClick={dismissForToday}
          aria-label="Close"
          className="
            absolute
            right-3
            top-3
            z-10
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-full
            bg-white/10
            text-neutral-300
            transition
            hover:bg-white/20
            hover:text-white
          "
        >
          <X size={15} />
        </button>

        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3 pr-7">
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-[#C8A44D]/35
                bg-[#C8A44D]/10
              "
            >
              <Sparkles
                size={19}
                className="text-[#C8A44D]"
              />
            </div>

            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.22em]
                  text-[#C8A44D]
                "
              >
                T&M Members
              </p>

              <h3
                className="
                  mt-0.5
                  text-base
                  font-semibold
                  tracking-wide
                  sm:text-lg
                "
              >
                Get more from every order ✨
              </h3>

              <p
                className="
                  mt-1
                  text-xs
                  leading-relaxed
                  text-neutral-300
                  sm:text-sm
                "
              >
                Save your favourites, track orders &
                unlock exclusive member rewards.
              </p>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={handleAuth}
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#C8A44D]
                px-3
                py-3
                text-xs
                font-semibold
                tracking-wide
                text-black
                transition
                hover:bg-white
                sm:text-sm
              "
            >
              <UserPlus size={16} />
              JOIN T&M MEMBERS
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
                border-white/20
                bg-white/5
                px-4
                py-3
                text-xs
                font-medium
                text-white
                transition
                hover:border-[#C8A44D]/50
                hover:bg-white/10
                sm:text-sm
              "
            >
              <LogIn size={15} />
              Login
            </button>
          </div>

          <p className="mt-2 text-center text-[10px] text-neutral-500">
            Takes less than a minute • Your account stays secure
          </p>
        </div>
      </div>
    </div>
  );
}
