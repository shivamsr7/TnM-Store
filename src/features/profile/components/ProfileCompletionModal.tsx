import {
  CalendarDays,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "sonner";

import { supabase } from "@/shared/lib/supabase";

import { useAuth } from "@/features/Auth/context/AuthContext";


const DAILY_PROMPT_KEY =
  "tnm_profile_completion_prompt_date";


function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
}


export default function ProfileCompletionModal({
  open,
  onClose,
}: ProfileCompletionModalProps) {
  const {
    customer,
    updateCustomer,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);

  const emailMissing =
    !customer?.email?.trim();

  const dobMissing =
    !customer?.date_of_birth;

  const dobUpdateCount =
    customer?.date_of_birth_update_count ?? 0;

  const dobLocked =
    dobUpdateCount >= 2;

  const shouldAskDob =
    dobMissing && !dobLocked;

  const shouldAskEmail =
    emailMissing;

  const fieldsRemaining =
    Number(shouldAskEmail) +
    Number(shouldAskDob);

  const title = useMemo(() => {
    if (shouldAskEmail && shouldAskDob) {
      return "Complete Your T&M Profile";
    }

    if (shouldAskEmail) {
      return "One Little Detail Missing";
    }

    return "Make Your T&M Experience More Personal";
  }, [
    shouldAskEmail,
    shouldAskDob,
  ]);


  useEffect(() => {
    if (!open || !customer) {
      return;
    }

    setEmail(customer.email ?? "");
    setDateOfBirth(customer.date_of_birth ?? "");
    setSaving(false);
  }, [
    open,
    customer,
  ]);


  if (!customer || !open) {
    return null;
  }


  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const currentCustomer = customer;

    if (!currentCustomer) {
      return;
    }

    if (shouldAskEmail) {
      const trimmedEmail = email.trim();

      if (!trimmedEmail) {
        toast.error("Please enter your email address.");
        return;
      }

      if (!isValidEmail(trimmedEmail)) {
        toast.error("Please enter a valid email address.");
        return;
      }
    }


    if (shouldAskDob && !dateOfBirth) {
      toast.error("Please select your date of birth.");
      return;
    }


    setSaving(true);


    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "update_customer_profile_completion",
        {
          p_customer_id: currentCustomer.id,

          /*
           * Always send the existing value when that field
           * is not being completed in this popup.
           *
           * This prevents an unchanged DOB/email from being
           * accidentally overwritten.
           */
          p_email: shouldAskEmail
            ? email.trim()
            : currentCustomer.email ?? null,

          p_date_of_birth: shouldAskDob
            ? dateOfBirth
            : currentCustomer.date_of_birth ?? null,
        }
      );


      if (error) {
        if (
          error.message?.includes(
            "DATE_OF_BIRTH_UPDATE_LIMIT_REACHED"
          )
        ) {
          throw new Error(
            "Your date of birth can no longer be changed."
          );
        }

        throw error;
      }


      if (!data) {
        throw new Error(
          "Unable to update your profile."
        );
      }


      updateCustomer(data);


      toast.success(
        fieldsRemaining > 1
          ? "Profile details saved successfully."
          : "Profile detail saved successfully."
      );


      const todayKey = getTodayKey();

      localStorage.setItem(
        DAILY_PROMPT_KEY,
        todayKey
      );

      onClose();

    } catch (error) {
      console.error(
        "Profile completion update failed:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );

    } finally {
      setSaving(false);
    }
  }


  function handleLater() {
    localStorage.setItem(
      DAILY_PROMPT_KEY,
      getTodayKey()
    );

    onClose();
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/55
        p-4
        backdrop-blur-[3px]
      "
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-completion-title"
    >

      <div
        className="
          relative
          w-full
          max-w-[540px]
          overflow-hidden
          rounded-[28px]
          border
          border-neutral-200
          bg-white
          shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        "
      >

        {/* Decorative top section */}
        <div
          className="
            relative
            overflow-hidden
            bg-neutral-950
            px-6
            pb-7
            pt-8
            text-white
            sm:px-8
          "
        >

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-48
              w-48
              rounded-full
              bg-[#C8A44D]/20
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-24
              -left-16
              h-40
              w-40
              rounded-full
              bg-white/10
              blur-3xl
            "
          />


          <button
            type="button"
            onClick={handleLater}
            disabled={saving}
            aria-label="Close"
            className="
              absolute
              right-5
              top-5
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border
              border-white/15
              bg-white/5
              text-white/80
              transition
              hover:bg-white/10
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X className="h-4 w-4" />
          </button>


          <div
            className="
              relative
              mb-5
              flex
              items-center
              gap-2
            "
          >
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                border
                border-[#C8A44D]/40
                bg-[#C8A44D]/10
              "
            >
              <Sparkles
                className="h-4 w-4 text-[#C8A44D]"
              />
            </div>

            <span
              className="
                text-[11px]
                font-semibold
                uppercase
                tracking-[0.28em]
                text-[#C8A44D]
              "
            >
              T&M JEWELS
            </span>
          </div>


          <h2
            id="profile-completion-title"
            className="
              relative
              max-w-[420px]
              text-2xl
              font-semibold
              tracking-tight
              sm:text-[28px]
            "
          >
            {title}
          </h2>


          <p
            className="
              relative
              mt-2
              max-w-[440px]
              text-sm
              leading-6
              text-white/65
            "
          >
            Just a couple of details to make your
            T&M Jewels experience more personal.
          </p>


          <div
            className="
              relative
              mt-5
              flex
              items-center
              gap-3
            "
          >
            <div
              className="
                h-1
                flex-1
                overflow-hidden
                rounded-full
                bg-white/10
              "
            >
              <div
                className="
                  h-full
                  rounded-full
                  bg-[#C8A44D]
                  transition-all
                "
                style={{
                  width:
                    fieldsRemaining === 2
                      ? "50%"
                      : "100%",
                }}
              />
            </div>

            <span
              className="
                text-[11px]
                font-medium
                text-white/50
              "
            >
              Almost there
            </span>
          </div>

        </div>


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="
            space-y-5
            px-6
            py-6
            sm:px-8
            sm:py-7
          "
        >

          {shouldAskEmail && (
            <div>
              <label
                htmlFor="profile-completion-email"
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-neutral-800
                "
              >
                <Mail className="h-4 w-4 text-[#A88332]" />
                Email Address
              </label>

              <input
                id="profile-completion-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email address"
                autoComplete="email"
                disabled={saving}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-neutral-200
                  bg-neutral-50
                  px-4
                  text-sm
                  text-neutral-900
                  outline-none
                  transition
                  placeholder:text-neutral-400
                  focus:border-[#C8A44D]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#C8A44D]/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />
            </div>
          )}


          {shouldAskDob && (
            <div>
              <label
                htmlFor="profile-completion-dob"
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-neutral-800
                "
              >
                <CalendarDays
                  className="h-4 w-4 text-[#A88332]"
                />
                Date of Birth
              </label>

              <input
                id="profile-completion-dob"
                type="date"
                value={dateOfBirth}
                onChange={(event) =>
                  setDateOfBirth(event.target.value)
                }
                max={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                disabled={saving}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-neutral-200
                  bg-neutral-50
                  px-4
                  text-sm
                  text-neutral-900
                  outline-none
                  transition
                  focus:border-[#C8A44D]
                  focus:bg-white
                  focus:ring-2
                  focus:ring-[#C8A44D]/10
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              />

              <p
                className="
                  mt-2
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                You can update your date of birth up to
                2 times. Changes used:{" "}
                {dobUpdateCount}/2.
              </p>
            </div>
          )}


          <button
            type="submit"
            disabled={saving}
            className="
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-xl
              bg-neutral-950
              px-5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-neutral-800
              active:scale-[0.99]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {saving
              ? "Saving..."
              : "Save & Continue →"}
          </button>


          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              text-xs
              text-neutral-400
            "
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Your information is private & secure
          </div>


          <button
            type="button"
            onClick={handleLater}
            disabled={saving}
            className="
              mx-auto
              block
              text-sm
              font-medium
              text-neutral-500
              underline-offset-4
              transition
              hover:text-neutral-900
              hover:underline
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Maybe later
          </button>

        </form>

      </div>

    </div>
  );
}


/*
 * =========================================================
 * DAILY PROMPT HELPERS
 * =========================================================
 */

export function shouldShowProfileCompletionPrompt(
  customer: {
    email?: string | null;
    date_of_birth?: string | null;
    date_of_birth_update_count?: number;
  } | null
) {
  if (!customer) {
    return false;
  }

  const emailMissing =
    !customer.email?.trim();

  const dobMissing =
    !customer.date_of_birth;

  const dobLocked =
    (customer.date_of_birth_update_count ?? 0) >= 2;

  const dobNeeded =
    dobMissing && !dobLocked;

  if (!emailMissing && !dobNeeded) {
    return false;
  }

  return (
    localStorage.getItem(
      DAILY_PROMPT_KEY
    ) !== getTodayKey()
  );
}
