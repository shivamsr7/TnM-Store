import {
  CalendarDays,
  Check,
  Copy,
  Gift,
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

import {
  getOrCreateBirthdayCoupon,
} from "@/features/coupons/services/birthdayCoupon.service";


const DAILY_PROMPT_KEY =
  "tnm_profile_completion_prompt_date";

const BIRTHDAY_PROMPT_KEY =
  "tnm_birthday_coupon_prompt_date";


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


export interface BirthdayCouponForModal {
  id: string;
  code: string;
  title?: string | null;
  description?: string | null;
  discount_type: "fixed" | "percentage";
  discount_value: number;
  minimum_order_amount: number;
  maximum_discount?: number | null;
  one_use_per_customer?: boolean;
  starts_at?: string | null;
  expires_at?: string | null;
  is_active?: boolean;
  coupon_type?: "standard" | "birthday";
}

interface ProfileCompletionModalProps {
  open: boolean;
  onClose: () => void;
  birthdayCoupon?: BirthdayCouponForModal | null;
}


export default function ProfileCompletionModal({
  open,
  onClose,
  birthdayCoupon = null,
}: ProfileCompletionModalProps) {
  const {
    customer,
    updateCustomer,
  } = useAuth();

  const [email, setEmail] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [saving, setSaving] = useState(false);

  const [birthdayReward, setBirthdayReward] =
    useState<BirthdayCouponForModal | null>(
      birthdayCoupon
    );

  const [copied, setCopied] =
    useState(false);

  const isBirthdayMode =
    !!birthdayReward;

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
    setCopied(false);

    setBirthdayReward(
      birthdayCoupon ?? null
    );
  }, [
    open,
    customer,
    birthdayCoupon,
  ]);


  if (!customer || !open) {
    return null;
  }


  function formatBirthdayDate(
    value: string | null | undefined
  ) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  }


  function formatDiscount(
    coupon: BirthdayCouponForModal
  ) {
    if (
      coupon.discount_type ===
      "percentage"
    ) {
      return `${coupon.discount_value}% OFF`;
    }

    return `₹${coupon.discount_value} OFF`;
  }


  async function copyBirthdayCode() {
    if (!birthdayReward?.code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        birthdayReward.code
      );

      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);

    } catch (error) {
      console.error(
        "Unable to copy birthday coupon:",
        error
      );

      toast.error(
        "Unable to copy the coupon code."
      );
    }
  }


  function closeBirthdayReward() {
    localStorage.setItem(
      BIRTHDAY_PROMPT_KEY,
      getTodayKey()
    );

    setBirthdayReward(null);
    setCopied(false);
    onClose();
  }


  function renderBirthdayReward() {
    if (!birthdayReward) {
      return null;
    }

    const startsAt =
      formatBirthdayDate(
        birthdayReward.starts_at
      );

    const expiresAt =
      formatBirthdayDate(
        birthdayReward.expires_at
      );

    const validity =
      startsAt && expiresAt
        ? `${startsAt} – ${expiresAt}`
        : expiresAt
          ? `Valid until ${expiresAt}`
          : "Valid throughout your birthday month";

    return (
      <div
        className="
          relative
          overflow-hidden
          rounded-[28px]
          border
          border-[#E7D49A]
          bg-gradient-to-b
          from-[#FFFDF8]
          via-white
          to-[#FFF8E9]
          shadow-[0_25px_80px_rgba(0,0,0,0.25)]
        "
      >

        <div
          className="
            pointer-events-none
            absolute
            -right-16
            -top-16
            h-44
            w-44
            rounded-full
            bg-[#F2D58A]/25
            blur-3xl
          "
        />

        <div
          className="
            pointer-events-none
            absolute
            -bottom-20
            -left-16
            h-40
            w-40
            rounded-full
            bg-[#E9C8D7]/20
            blur-3xl
          "
        />


        <button
          type="button"
          onClick={closeBirthdayReward}
          aria-label="Close birthday reward"
          className="
            absolute
            right-5
            top-5
            z-10
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-full
            border
            border-neutral-200
            bg-white/80
            text-neutral-500
            shadow-sm
            transition
            hover:bg-white
            hover:text-neutral-900
          "
        >
          <X className="h-4 w-4" />
        </button>


        <div
          className="
            relative
            px-6
            pb-7
            pt-8
            text-center
            sm:px-8
            sm:pt-9
          "
        >

          <div
            className="
              mx-auto
              flex
              h-20
              w-20
              items-center
              justify-center
              rounded-full
              border
              border-[#E7C96E]
              bg-gradient-to-br
              from-[#FFF8D8]
              to-[#F8E6A8]
              shadow-[0_10px_30px_rgba(188,148,45,0.18)]
            "
          >
            <span className="text-[38px] leading-none">
              🎂
            </span>
          </div>


          <p
            className="
              mt-6
              text-[11px]
              font-semibold
              uppercase
              tracking-[0.28em]
              text-[#B18427]
            "
          >
            A Little Something From T&M Jewels
          </p>


          <h2
            className="
              mt-2
              text-[28px]
              font-semibold
              tracking-tight
              text-neutral-900
              sm:text-[30px]
            "
          >
            Happy Birthday! 💛
          </h2>


          <p
            className="
              mx-auto
              mt-2
              max-w-[430px]
              text-sm
              leading-6
              text-neutral-500
            "
          >
            Your birthday treat is ready.
            Enjoy a little extra sparkle from
            T&M Jewels. ✨
          </p>


          <div
            className="
              mt-6
              rounded-[22px]
              border
              border-[#E9D9AB]
              bg-white/80
              px-5
              py-5
              shadow-sm
            "
          >

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-neutral-400
              "
            >
              Your Birthday Reward
            </p>


            <p
              className="
                mt-1
                text-3xl
                font-bold
                tracking-tight
                text-neutral-900
              "
            >
              {formatDiscount(
                birthdayReward
              )}
            </p>


            <p
              className="
                mt-1
                text-xs
                text-neutral-500
              "
            >
              on orders above ₹
              {birthdayReward.minimum_order_amount.toLocaleString(
                "en-IN"
              )}
            </p>

          </div>


          <div
            className="
              mt-4
              rounded-[20px]
              border
              border-dashed
              border-[#DDBD69]
              bg-[#FFFCF2]
              p-4
            "
          >

            <p
              className="
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.22em]
                text-neutral-400
              "
            >
              Your Birthday Code
            </p>


            <div
              className="
                mt-2
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  min-w-0
                  flex-1
                  rounded-xl
                  bg-white
                  px-3
                  py-2.5
                  text-center
                  shadow-sm
                "
              >
                <p
                  className="
                    truncate
                    text-sm
                    font-bold
                    tracking-[0.12em]
                    text-[#9A7420]
                  "
                >
                  {birthdayReward.code}
                </p>
              </div>


              <button
                type="button"
                onClick={copyBirthdayCode}
                className="
                  flex
                  h-11
                  shrink-0
                  items-center
                  gap-2
                  rounded-xl
                  bg-neutral-950
                  px-4
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-neutral-800
                  active:scale-[0.98]
                "
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy
                  </>
                )}
              </button>

            </div>

          </div>


          <div
            className="
              mt-4
              flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-white/70
              px-3
              py-2.5
              text-xs
              text-neutral-500
            "
          >
            <CalendarDays
              className="
                h-3.5
                w-3.5
                text-[#B18427]
              "
            />
            <span>
              <span className="font-medium text-neutral-700">
                Valid:
              </span>{" "}
              {validity}
            </span>
          </div>


          <div
            className="
              mt-2
              flex
              items-center
              justify-center
              gap-2
              text-[11px]
              text-neutral-400
            "
          >
            <Gift className="h-3.5 w-3.5" />
            {birthdayReward.one_use_per_customer
              ? "One-time birthday reward"
              : "Birthday reward"}
          </div>


          <button
            type="button"
            onClick={closeBirthdayReward}
            className="
              mt-6
              flex
              h-12
              w-full
              items-center
              justify-center
              rounded-2xl
              bg-neutral-950
              px-5
              text-sm
              font-semibold
              text-white
              shadow-lg
              transition
              hover:bg-neutral-800
              active:scale-[0.99]
            "
          >
            Start Shopping ✨
          </button>


          <p
            className="
              mt-3
              text-[10px]
              text-neutral-400
            "
          >
            Your birthday reward is ready whenever you are. 💛
          </p>

        </div>
      </div>
    );
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


      /*
       * Profile completion is saved first. If the customer is
       * currently in their birthday month, the secure generator
       * returns their existing birthday coupon or creates it.
       *
       * Showing the reward here means a customer who just added
       * their DOB gets the same premium birthday experience as
       * a returning customer on refresh.
       */
      try {

        const coupon =
          await getOrCreateBirthdayCoupon(
            currentCustomer.id
          );

        if (coupon) {

          setBirthdayReward(
            coupon as BirthdayCouponForModal
          );

          setCopied(false);

          localStorage.setItem(
            BIRTHDAY_PROMPT_KEY,
            getTodayKey()
          );

          localStorage.setItem(
            DAILY_PROMPT_KEY,
            getTodayKey()
          );

          return;
        }

      } catch (birthdayError) {

        console.error(
          "Birthday coupon preparation after profile save failed:",
          birthdayError
        );

      }


      toast.success(
        fieldsRemaining > 1
          ? "Profile details saved successfully."
          : "Profile detail saved successfully."
      );


      localStorage.setItem(
        DAILY_PROMPT_KEY,
        getTodayKey()
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


  if (isBirthdayMode) {
    return (
      <div
        className="
          fixed
          inset-0
          z-[110]
          flex
          items-center
          justify-center
          bg-black/55
          p-4
          backdrop-blur-[4px]
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="birthday-reward-title"
      >
        <div
          id="birthday-reward-title"
          className="w-full max-w-[560px]"
        >
          {renderBirthdayReward()}
        </div>
      </div>
    );
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
