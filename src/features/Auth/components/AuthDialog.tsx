import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  applyReferralCode,
} from "@/features/customers/services/customerReferral.service";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Phone,
  ArrowLeft,
  Crown,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  toast,
} from "sonner";

import logo from "@/assets/logo/mainLogo.png";

import {
  sendOtp,
  verifyOtp,
} from "@/features/Auth/services/auth.service";

import {
  createCustomer,
} from "@/features/customers/services/customer.service";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


interface Props {

  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

}


type Step =
  | "phone"
  | "otp"
  | "profile";


export default function AuthDialog({

  open,

  onOpenChange,

}: Props) {


  /*
   * =========================================================
   * AUTH CONTEXT
   * =========================================================
   */

  const {
    loginWithPhone,
  } = useAuth();


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    step,
    setStep,
  ] = useState<Step>(
    "phone"
  );


  const [
    phone,
    setPhone,
  ] = useState("");


  const [
    otp,
    setOtp,
  ] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);


  const [
    timer,
    setTimer,
  ] = useState(30);


  const [
    fullName,
    setFullName,
  ] = useState("");


  const [
    email,
    setEmail,
  ] = useState("");


  const [
    referralCode,
    setReferralCode,
  ] = useState("");


  const [
    authSuccess,
    setAuthSuccess,
  ] = useState(false);


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /*
   * =========================================================
   * OTP REFS
   * =========================================================
   */

  const otpRefs =
    useRef<
      (HTMLInputElement | null)[]
    >([]);


  /*
   * =========================================================
   * TEST OTP
   * =========================================================
   *
   * When VITE_SKIP_OTP=true:
   *
   * - No real OTP is sent
   * - Any 6 digit OTP is accepted
   * - loginWithPhone() updates AuthContext immediately
   *
   * =========================================================
   */

  const SKIP_OTP =
    import.meta.env.VITE_SKIP_OTP ===
    "true";


  /*
   * =========================================================
   * VALIDATION
   * =========================================================
   */

  const isPhoneValid =
    phone.length === 10;


  const isOtpValid =
    otp.join("").length === 6;


  const isProfileValid =
    fullName.trim().length >= 2 &&
    (
      email === "" ||
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    );


  /*
   * =========================================================
   * OTP TIMER
   * =========================================================
   */

  useEffect(() => {

    if (
      step !== "otp"
    ) {

      return;

    }


    if (
      timer === 0
    ) {

      return;

    }


    const interval =
      setInterval(() => {

        setTimer(
          (prev) =>
            prev - 1
        );

      }, 1000);


    return () =>
      clearInterval(
        interval
      );

  }, [
    step,
    timer,
  ]);


  /*
   * =========================================================
   * CLOSE DIALOG
   * =========================================================
   */

  function closeDialog() {

    setStep(
      "phone"
    );


    setPhone(
      ""
    );


    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);


    setFullName(
      ""
    );


    setEmail(
      ""
    );


    setReferralCode(
      ""
    );


    setTimer(
      30
    );


    setAuthSuccess(
      false
    );


    setSuccessMessage(
      ""
    );


    onOpenChange(
      false
    );

  }


  /*
   * =========================================================
   * CHANGE PHONE
   * =========================================================
   */

  function changePhone() {

    setStep(
      "phone"
    );


    setTimer(
      30
    );


    setOtp([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);

  }


  /*
   * =========================================================
   * CONTINUE WITH TEST / REAL OTP
   * =========================================================
   */

  async function handleVerifyOtp() {

    try {

      const otpCode =
        otp.join("");


      /*
       * -----------------------------------------------------
       * REAL OTP
       * -----------------------------------------------------
       */

      if (
        !SKIP_OTP
      ) {

        await verifyOtp(
          phone,
          otpCode
        );

      }


      /*
       * -----------------------------------------------------
       * IMPORTANT:
       *
       * This is the missing part.
       *
       * It updates the global AuthContext immediately.
       *
       * In test mode it also saves tnm_test_phone.
       * -----------------------------------------------------
       */

      const customer =
        await loginWithPhone(
          phone
        );


      /*
       * -----------------------------------------------------
       * EXISTING CUSTOMER
       * -----------------------------------------------------
       */

      if (
        customer
      ) {

        setSuccessMessage(
          "Welcome back to T&M Family ✨"
        );


        setAuthSuccess(
          true
        );


        return;

      }


      /*
       * -----------------------------------------------------
       * NEW CUSTOMER
       * -----------------------------------------------------
       */

      toast.success(
        "OTP verified successfully ✨"
      );


      setTimeout(() => {

        setStep(
          "profile"
        );

      }, 300);

    } catch (
      error
    ) {

      console.error(
        "OTP verification error:",
        error
      );


      toast.error(
        "Invalid OTP. Please check and try again."
      );

    }

  }


  /*
   * =========================================================
   * CREATE NEW CUSTOMER
   * =========================================================
   */

  async function handleCreateAccount() {

    try {

      const nameParts =
        fullName
          .trim()
          .split(/\s+/);


      const firstName =
        nameParts[0];


      const lastName =
        nameParts
          .slice(1)
          .join(" ");


      /*
       * -----------------------------------------------------
       * CREATE CUSTOMER
       * -----------------------------------------------------
       */

      const createdCustomer =
        await createCustomer({

          first_name:
            firstName,

          last_name:
            lastName,

          email:
            email || undefined,

          phone:
            phone,

        });


      /*
       * -----------------------------------------------------
       * REFERRAL
       * -----------------------------------------------------
       */

      if (
        referralCode.trim()
      ) {

        try {

          await applyReferralCode(
            createdCustomer.id,
            referralCode.trim()
          );

        } catch (
          referralError
        ) {

          console.error(
            "Referral code error:",
            referralError
          );

          /*
           * Don't fail account creation just because
           * referral processing failed.
           */

          toast.error(
            "Account created, but referral code could not be applied."
          );

        }

      }


      /*
       * -----------------------------------------------------
       * IMPORTANT:
       *
       * Update global AuthContext immediately after creating
       * the customer.
       *
       * This prevents the need for a page refresh here too.
       * -----------------------------------------------------
       */

      const loggedInCustomer =
        await loginWithPhone(
          phone
        );


      if (
        loggedInCustomer
      ) {

        setSuccessMessage(
          "Welcome to T&M Family ✨"
        );


        setAuthSuccess(
          true
        );


        return;

      }


      /*
       * Fallback:
       *
       * The account was created successfully even if the
       * customer could not immediately be loaded.
       */

      setSuccessMessage(
        "Welcome to T&M Family ✨"
      );


      setAuthSuccess(
        true
      );

    } catch (
      error
    ) {

      console.error(
        "Create customer error:",
        error
      );


      toast.error(
        "Unable to create account. Please try again."
      );

    }

  }


  /*
   * =========================================================
   * UI
   * =========================================================
   */

  return (

    <Dialog
      open={
        open
      }

      onOpenChange={
        closeDialog
      }
    >

      <DialogContent
        className="
          w-[92vw]
          max-w-md
          overflow-hidden
          rounded-3xl
          border
          border-[#C8A44D]/30
          bg-black
          p-0
          text-white
          shadow-2xl
          md:w-full
        "
      >

        {/* =================================================
            BRAND HEADER
        ================================================== */}

        <div
          className="
            bg-gradient-to-b
            from-black
            via-[#111111]
            to-black
            px-4
            pb-3
            pt-5
            md:px-6
            md:pb-5
            md:pt-8
          "
        >

          <div
            className="
              flex
              flex-col
              items-center
              text-center
            "
          >

            <img
              src={
                logo
              }

              alt="T&M Jewels"

              className="
                h-16
                w-auto
                object-contain
                md:h-20
              "
            />


            <h2
              className="
                mt-3
                text-xl
                font-semibold
                tracking-wide
                text-[#C8A44D]
                md:text-2xl
              "
            >

              T&M Jewels

            </h2>


            <p
              className="
                mt-1
                text-xs
                text-neutral-300
                md:text-sm
              "
            >

              Your luxury jewellery experience

            </p>

          </div>


          {/* Feature cards */}

          <div
            className="
              mt-4
              grid
              grid-cols-3
              gap-2
            "
          >

            <div
              className="
                rounded-xl
                border
                border-[#C8A44D]/30
                bg-white/10
                px-2
                py-2
                text-center
              "
            >

              ♡

              <p
                className="
                  text-xs
                  text-neutral-300
                "
              >

                Wishlist

              </p>

            </div>


            <div
              className="
                rounded-xl
                border
                border-[#C8A44D]/30
                bg-white/10
                px-2
                py-2
                text-center
              "
            >

              🎁

              <p
                className="
                  text-xs
                  text-neutral-300
                "
              >

                Rewards

              </p>

            </div>


            <div
              className="
                rounded-xl
                border
                border-[#C8A44D]/30
                bg-white/10
                px-2
                py-2
                text-center
              "
            >

              💎

              <p
                className="
                  text-xs
                  text-neutral-300
                "
              >

                Offers

              </p>

            </div>

          </div>

        </div>


        {/* =================================================
            CONTENT
        ================================================== */}

        <div
          className="
            px-4
            pb-5
            pt-3
            md:px-6
            md:pb-6
          "
        >

          <AnimatePresence
            mode="wait"
          >


            {/* =================================================
                PHONE STEP
            ================================================== */}

            {!authSuccess &&
              step === "phone" && (

                <motion.div
                  key="phone"

                  initial={{
                    opacity: 0,
                    x: 20,
                  }}

                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                >

                  <h3
                    className="
                      text-lg
                      font-semibold
                    "
                  >

                    Welcome to T&M Family ✨

                  </h3>


                  <p
                    className="
                      mt-2
                      text-sm
                      text-neutral-300
                    "
                  >

                    Login to access your wishlist,
                    rewards & exclusive offers

                  </p>


                  {/* Phone */}

                  <div
                    className="
                      mt-5
                      flex
                      items-center
                      rounded-xl
                      border
                      border-white/20
                      bg-white
                      px-4
                    "
                  >

                    <Phone
                      size={18}
                      className="
                        text-[#C8A44D]
                      "
                    />


                    <span
                      className="
                        ml-3
                        text-black
                      "
                    >

                      +91

                    </span>


                    <input
                      type="tel"

                      inputMode="numeric"

                      maxLength={10}

                      value={
                        phone
                      }

                      onChange={(e) =>
                        setPhone(
                          e.target.value
                            .replace(
                              /\D/g,
                              ""
                            )
                            .slice(
                              0,
                              10
                            )
                        )
                      }

                      placeholder="Mobile number"

                      className="
                        ml-3
                        w-full
                        bg-transparent
                        py-3.5
                        text-sm
                        text-black
                        outline-none
                      "
                    />

                  </div>


                  <button
                    disabled={
                      !isPhoneValid
                    }

                    onClick={async () => {

                      try {

                        if (
                          !SKIP_OTP
                        ) {

                          await sendOtp(
                            phone
                          );

                        }


                        setOtp([
                          "",
                          "",
                          "",
                          "",
                          "",
                          "",
                        ]);


                        setTimer(
                          30
                        );


                        setStep(
                          "otp"
                        );


                        /*
                         * Focus first OTP field
                         * after it renders.
                         */

                        setTimeout(() => {

                          otpRefs
                            .current[0]
                            ?.focus();

                        }, 100);

                      } catch (
                        error
                      ) {

                        console.error(
                          "Send OTP error:",
                          error
                        );


                        toast.error(
                          "Unable to send OTP"
                        );

                      }

                    }}

                    className={`
                      mt-5
                      w-full
                      rounded-xl
                      py-3.5
                      text-sm
                      font-medium

                      ${
                        isPhoneValid
                          ? "bg-white text-black hover:bg-[#C8A44D]"
                          : "bg-neutral-500 text-neutral-300"
                      }
                    `}
                  >

                    Continue

                  </button>

                </motion.div>

              )}


            {/* =================================================
                OTP STEP
            ================================================== */}

            {!authSuccess &&
              step === "otp" && (

                <motion.div
                  key="otp"

                  initial={{
                    opacity: 0,
                    x: 20,
                  }}

                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                >

                  <button
                    type="button"

                    onClick={
                      changePhone
                    }

                    className="
                      flex
                      items-center
                      gap-2
                      text-sm
                      text-neutral-300
                      hover:text-[#C8A44D]
                    "
                  >

                    <ArrowLeft
                      size={16}
                    />

                    Change Number

                  </button>


                  <h3
                    className="
                      mt-5
                      text-lg
                      font-semibold
                    "
                  >

                    Verify your number ✨

                  </h3>


                  <p
                    className="
                      mt-2
                      text-sm
                      text-neutral-300
                    "
                  >

                    Enter the 6-digit OTP sent to

                  </p>


                  <p
                    className="
                      mt-1
                      text-sm
                      font-medium
                    "
                  >

                    +91 {phone}

                  </p>


                  {/* OTP inputs */}

                  <div
                    className="
                      mt-6
                      flex
                      justify-between
                      gap-2
                    "
                  >

                    {otp.map(
                      (
                        digit,
                        index
                      ) => (

                        <input
                          key={
                            index
                          }

                          ref={(el) => {

                            otpRefs.current[
                              index
                            ] = el;

                          }}

                          value={
                            digit
                          }

                          maxLength={1}

                          inputMode="numeric"

                          onChange={(e) => {

                            const value =
                              e.target.value
                                .replace(
                                  /\D/g,
                                  ""
                                )
                                .slice(
                                  0,
                                  1
                                );


                            const updated =
                              [...otp];


                            updated[
                              index
                            ] = value;


                            setOtp(
                              updated
                            );


                            if (
                              value &&
                              index < 5
                            ) {

                              otpRefs
                                .current[
                                  index + 1
                                ]
                                ?.focus();

                            }

                          }}

                          onKeyDown={(e) => {

                            if (
                              e.key ===
                                "Backspace" &&
                              !otp[index] &&
                              index > 0
                            ) {

                              otpRefs
                                .current[
                                  index - 1
                                ]
                                ?.focus();

                            }

                          }}

                          className="
                            h-12
                            w-10
                            rounded-xl
                            border
                            border-white/40
                            bg-white
                            text-center
                            text-lg
                            font-semibold
                            text-black
                            outline-none
                            focus:border-[#C8A44D]
                          "
                        />

                      )
                    )}

                  </div>


                  {/* Timer */}

                  <div
                    className="
                      mt-5
                      text-center
                      text-sm
                      text-neutral-300
                    "
                  >

                    {timer > 0 ? (

                      `Resend OTP in 00:${
                        timer
                          .toString()
                          .padStart(
                            2,
                            "0"
                          )
                      }`

                    ) : (

                      <button
                        type="button"

                        onClick={async () => {

                          try {

                            if (
                              SKIP_OTP
                            ) {

                              setTimer(
                                30
                              );


                              toast.success(
                                "Test OTP ready again"
                              );


                              return;

                            }


                            await sendOtp(
                              phone
                            );


                            setTimer(
                              30
                            );


                            toast.success(
                              "OTP sent again"
                            );

                          } catch (
                            error
                          ) {

                            console.error(
                              error
                            );


                            toast.error(
                              "Unable to resend OTP"
                            );

                          }

                        }}

                        className="
                          text-[#C8A44D]
                        "
                      >

                        Resend OTP

                      </button>

                    )}

                  </div>


                  {/* Verify */}

                  <button
                    type="button"

                    disabled={
                      !isOtpValid
                    }

                    onClick={
                      handleVerifyOtp
                    }

                    className={`
                      mt-5
                      w-full
                      rounded-xl
                      py-3.5
                      text-sm
                      font-medium
                      transition-all

                      ${
                        isOtpValid
                          ? "bg-[#C8A44D] text-black hover:bg-white"
                          : "cursor-not-allowed bg-neutral-500 text-neutral-300"
                      }
                    `}
                  >

                    Verify & Continue

                  </button>

                </motion.div>

              )}


            {/* =================================================
                PROFILE STEP
            ================================================== */}

            {!authSuccess &&
              step === "profile" && (

                <motion.div
                  key="profile"

                  initial={{
                    opacity: 0,
                    x: 20,
                  }}

                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                >

                  <div
                    className="
                      flex
                      flex-col
                      items-center
                      text-center
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#C8A44D]/40
                        bg-[#C8A44D]/10
                      "
                    >

                      <Crown
                        size={22}
                        className="
                          text-[#C8A44D]
                        "
                      />

                    </div>


                    <h3
                      className="
                        mt-3
                        text-lg
                        font-semibold
                      "
                    >

                      Welcome to T&M Family ✨

                    </h3>


                    <p
                      className="
                        mt-1
                        text-xs
                        text-neutral-300
                      "
                    >

                      Complete your profile to continue

                    </p>

                  </div>


                  <div
                    className="
                      mt-4
                      space-y-3
                    "
                  >

                    <input
                      value={
                        fullName
                      }

                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }

                      placeholder="Full Name"

                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/20
                        bg-white
                        px-4
                        py-3
                        text-sm
                        text-black
                        outline-none
                        focus:border-[#C8A44D]
                      "
                    />


                    <input
                      value={
                        email
                      }

                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }

                      placeholder="Email"

                      type="email"

                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/20
                        bg-white
                        px-4
                        py-3
                        text-sm
                        text-black
                        outline-none
                        focus:border-[#C8A44D]
                      "
                    />


                    <input
                      value={
                        referralCode
                      }

                      onChange={(e) =>
                        setReferralCode(
                          e.target.value
                            .toUpperCase()
                        )
                      }

                      placeholder="Referral Code (optional)"

                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/20
                        bg-white
                        px-4
                        py-3.5
                        text-sm
                        text-black
                        outline-none
                        focus:border-[#C8A44D]
                      "
                    />

                  </div>


                  <button
                    type="button"

                    disabled={
                      !isProfileValid
                    }

                    onClick={
                      handleCreateAccount
                    }

                    className={`
                      mt-5
                      w-full
                      rounded-xl
                      py-3.5
                      text-sm
                      font-medium
                      transition-all

                      ${
                        isProfileValid
                          ? "bg-[#C8A44D] text-black hover:bg-white"
                          : "cursor-not-allowed bg-neutral-500 text-neutral-300"
                      }
                    `}
                  >

                    Create Account

                  </button>

                </motion.div>

              )}


            {/* =================================================
                SUCCESS
            ================================================== */}

            {authSuccess && (

              <motion.div
                key="success"

                initial={{
                  opacity: 0,
                  scale: 0.95,
                }}

                animate={{
                  opacity: 1,
                  scale: 1,
                }}

                className="
                  flex
                  flex-col
                  items-center
                  py-8
                  text-center
                "
              >

                <div
                  className="
                    flex
                    h-16
                    w-16
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#C8A44D]/40
                    bg-[#C8A44D]/10
                  "
                >

                  <span
                    className="
                      text-3xl
                      text-[#C8A44D]
                    "
                  >

                    ✓

                  </span>

                </div>


                <h3
                  className="
                    mt-5
                    text-xl
                    font-semibold
                  "
                >

                  {
                    successMessage
                  }

                </h3>


                <p
                  className="
                    mt-2
                    text-sm
                    text-neutral-300
                  "
                >

                  Your T&M account is ready.

                </p>


                <button
                  type="button"

                  onClick={
                    closeDialog
                  }

                  className="
                    mt-6
                    w-full
                    rounded-xl
                    bg-[#C8A44D]
                    py-3.5
                    text-sm
                    font-medium
                    text-black
                    transition
                    hover:bg-white
                  "
                >

                  Continue Shopping

                </button>

              </motion.div>

            )}

          </AnimatePresence>

        </div>

      </DialogContent>

    </Dialog>

  );

}