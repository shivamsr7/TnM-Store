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
  getCustomerByPhone,
} from "@/features/customers/services/customer.service";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  supabase,
} from "@/shared/lib/supabase";


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


interface LoginDebugState {

  rawPhone: string;

  normalizedPhone: string;

  supabaseUrl: string;

  tableStatus: string;

  rowCount: number | null;

  customerStatus: string;

  customerFound: boolean;

  customerId: string;

  customerPhone: string;

  customerName: string;

  error: string;

}


/*
 * =========================================================
 * COMPONENT
 * =========================================================
 */

export default function AuthDialog({

  open,

  onOpenChange,

}: Props) {


  /*
   * =========================================================
   * AUTH
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
   * VISUAL DEBUG STATE
   * =========================================================
   */

  const [
    loginDebug,
    setLoginDebug,
  ] = useState<
    LoginDebugState | null
  >(null);


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
   * TIMER
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
   * CLOSE
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


    setLoginDebug(
      null
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


    setLoginDebug(
      null
    );

  }


  /*
   * =========================================================
   * DIAGNOSTIC CUSTOMER TABLE TEST
   * =========================================================
   */

  async function testCustomerTableAccess() {

    try {

      const {
        data,
        error,
      } =
        await supabase
          .from("customers")
          .select(
            "id, phone, first_name, last_name"
          )
          .limit(5);


      if (
        error
      ) {

        return {

          status:
            "ERROR ❌",

          count:
            null,

          error:
            `${error.code || ""} ${error.message || ""}`.trim(),

        };

      }


      return {

        status:
          "ACCESSIBLE ✅",

        count:
          data?.length ?? 0,

        error:
          "",

      };

    } catch (
      error: any
    ) {

      return {

        status:
          "ERROR ❌",

        count:
          null,

        error:
          error?.message ||
          String(error),

      };

    }

  }


  /*
   * =========================================================
   * VERIFY OTP
   * =========================================================
   */

  async function handleVerifyOtp() {

    /*
     * Clear old debug.
     */

    setLoginDebug(
      null
    );


    /*
     * Normalize phone.
     */

    const rawPhone =
      phone;


    const normalizedPhone =
      phone
        .replace(
          /\D/g,
          ""
        )
        .slice(-10);


    /*
     * Initial visual diagnostic.
     */

    setLoginDebug({

      rawPhone,

      normalizedPhone,

      supabaseUrl:
        import.meta.env.VITE_SUPABASE_URL ||
        "NOT FOUND",

      tableStatus:
        "Testing...",

      rowCount:
        null,

      customerStatus:
        "Checking...",

      customerFound:
        false,

      customerId:
        "",

      customerPhone:
        "",

      customerName:
        "",

      error:
        "",

    });


    try {

      /*
       * =====================================================
       * REAL OTP
       * =====================================================
       */

      if (
        !SKIP_OTP
      ) {

        await verifyOtp(
          normalizedPhone,
          otp.join("")
        );

      }


      /*
       * =====================================================
       * TEST CUSTOMER TABLE ACCESS
       * =====================================================
       */

      const tableTest =
        await testCustomerTableAccess();


      /*
       * Show table result immediately.
       */

      setLoginDebug(
        (previous) => ({

          rawPhone,

          normalizedPhone,

          supabaseUrl:
            import.meta.env.VITE_SUPABASE_URL ||
            "NOT FOUND",

          tableStatus:
            tableTest.status,

          rowCount:
            tableTest.count,

          customerStatus:
            tableTest.error
              ? "Not checked"
              : "Checking...",

          customerFound:
            false,

          customerId:
            "",

          customerPhone:
            "",

          customerName:
            "",

          error:
            tableTest.error,

        })
      );


      /*
       * If the whole table is inaccessible,
       * stop here.
       */

      if (
        tableTest.error
      ) {

        toast.error(
          "Customers table query failed."
        );


        return;

      }


      /*
       * =====================================================
       * DIRECT CUSTOMER LOOKUP
       * =====================================================
       *
       * We call loginWithPhone() because that is the same
       * function used by your actual login flow.
       * =====================================================
       */

      const customer =
        await loginWithPhone(
          normalizedPhone
        );


      /*
       * =====================================================
       * EXISTING CUSTOMER
       * =====================================================
       */

      if (
        customer
      ) {

        const customerName =
          [
            customer.first_name,
            customer.last_name,
          ]
            .filter(Boolean)
            .join(" ");


        setLoginDebug({

          rawPhone,

          normalizedPhone,

          supabaseUrl:
            import.meta.env.VITE_SUPABASE_URL ||
            "NOT FOUND",

          tableStatus:
            tableTest.status,

          rowCount:
            tableTest.count,

          customerStatus:
            "EXISTING CUSTOMER FOUND ✅",

          customerFound:
            true,

          customerId:
            customer.id || "",

          customerPhone:
            customer.phone || "",

          customerName,

          error:
            "",

        });


        setSuccessMessage(
          "Welcome back to T&M Family ✨"
        );


        setAuthSuccess(
          true
        );


        return;

      }


      /*
       * =====================================================
       * CUSTOMER NOT FOUND
       * =====================================================
       */

      setLoginDebug({

        rawPhone,

        normalizedPhone,

        supabaseUrl:
          import.meta.env.VITE_SUPABASE_URL ||
          "NOT FOUND",

        tableStatus:
          tableTest.status,

        rowCount:
          tableTest.count,

        customerStatus:
          "CUSTOMER NOT FOUND ❌",

        customerFound:
          false,

        customerId:
          "",

        customerPhone:
          "",

        customerName:
          "",

        error:
          tableTest.error || "",

      });


      toast.error(
        "Customer was not found."
      );


      /*
       * IMPORTANT:
       *
       * Do not immediately move to profile.
       * Keep the OTP screen visible so you can read
       * the diagnostic information.
       */

      return;

    } catch (
      error: any
    ) {

      const errorMessage =
        error?.message ||
        String(error) ||
        "Unknown error";


      setLoginDebug({

        rawPhone,

        normalizedPhone,

        supabaseUrl:
          import.meta.env.VITE_SUPABASE_URL ||
          "NOT FOUND",

        tableStatus:
          "ERROR ❌",

        rowCount:
          null,

        customerStatus:
          "LOOKUP FAILED ❌",

        customerFound:
          false,

        customerId:
          "",

        customerPhone:
          "",

        customerName:
          "",

        error:
          errorMessage,

      });


      toast.error(
        "Login lookup failed."
      );

    }

  }


  /*
   * =========================================================
   * CREATE CUSTOMER
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


          toast.error(
            "Account created, but referral code could not be applied."
          );

        }

      }


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
            max-h-[75vh]
            overflow-y-auto
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
                PHONE
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


                        setLoginDebug(
                          null
                        );


                        setTimer(
                          30
                        );


                        setStep(
                          "otp"
                        );


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
                OTP
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


                  {/* =================================================
                      VISUAL DIAGNOSTIC
                  ================================================== */}

                  {loginDebug && (

                    <div
                      className="
                        mt-4
                        rounded-2xl
                        border
                        border-yellow-500/50
                        bg-yellow-500/10
                        p-4
                        text-left
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                        "
                      >

                        <p
                          className="
                            text-sm
                            font-semibold
                            text-yellow-400
                          "
                        >

                          🔧 Login Diagnostic

                        </p>


                        <span
                          className="
                            rounded-full
                            bg-yellow-500/10
                            px-2
                            py-1
                            text-[10px]
                            text-yellow-300
                          "
                        >

                          TEST

                        </span>

                      </div>


                      <div
                        className="
                          mt-4
                          space-y-2
                          text-xs
                        "
                      >

                        {/* Phone */}

                        <div
                          className="
                            rounded-lg
                            bg-black/30
                            p-2
                          "
                        >

                          <p
                            className="
                              text-neutral-500
                            "
                          >
                            Raw phone
                          </p>

                          <p
                            className="
                              mt-0.5
                              break-all
                              text-white
                            "
                          >

                            {
                              loginDebug.rawPhone ||
                              "—"
                            }

                          </p>

                        </div>


                        {/* Normalized */}

                        <div
                          className="
                            rounded-lg
                            bg-black/30
                            p-2
                          "
                        >

                          <p
                            className="
                              text-neutral-500
                            "
                          >
                            Normalized phone
                          </p>

                          <p
                            className="
                              mt-0.5
                              text-white
                            "
                          >

                            {
                              loginDebug.normalizedPhone ||
                              "—"
                            }

                          </p>

                        </div>


                        {/* Supabase */}

                        <div
                          className="
                            rounded-lg
                            bg-black/30
                            p-2
                          "
                        >

                          <p
                            className="
                              text-neutral-500
                            "
                          >
                            Supabase URL
                          </p>

                          <p
                            className="
                              mt-0.5
                              break-all
                              text-white
                            "
                          >

                            {
                              loginDebug.supabaseUrl
                            }

                          </p>

                        </div>


                        {/* Table */}

                        <div
                          className="
                            flex
                            items-center
                            justify-between
                            gap-3
                            rounded-lg
                            bg-black/30
                            p-2
                          "
                        >

                          <div>

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Customers table
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-white
                              "
                            >

                              {
                                loginDebug.tableStatus
                              }

                            </p>

                          </div>


                          <div
                            className="
                              text-right
                            "
                          >

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Rows
                            </p>

                            <p
                              className="
                                mt-0.5
                                font-semibold
                                text-white
                              "
                            >

                              {
                                loginDebug.rowCount ??
                                "—"
                              }

                            </p>

                          </div>

                        </div>


                        {/* Customer */}

                        <div
                          className="
                            rounded-lg
                            bg-black/30
                            p-2
                          "
                        >

                          <p
                            className="
                              text-neutral-500
                            "
                          >
                            Customer lookup
                          </p>

                          <p
                            className={`
                              mt-0.5
                              font-semibold

                              ${
                                loginDebug.customerFound
                                  ? "text-green-400"
                                  : "text-red-400"
                              }
                            `}
                          >

                            {
                              loginDebug.customerStatus
                            }

                          </p>

                        </div>


                        {/* Customer ID */}

                        {loginDebug.customerId && (

                          <div
                            className="
                              rounded-lg
                              bg-black/30
                              p-2
                            "
                          >

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Customer ID
                            </p>

                            <p
                              className="
                                mt-0.5
                                break-all
                                text-white
                              "
                            >

                              {
                                loginDebug.customerId
                              }

                            </p>

                          </div>

                        )}


                        {/* DB Phone */}

                        {loginDebug.customerPhone && (

                          <div
                            className="
                              rounded-lg
                              bg-black/30
                              p-2
                            "
                          >

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Phone stored in DB
                            </p>

                            <p
                              className="
                                mt-0.5
                                break-all
                                text-white
                              "
                            >

                              {
                                loginDebug.customerPhone
                              }

                            </p>

                          </div>

                        )}


                        {/* Customer name */}

                        {loginDebug.customerName && (

                          <div
                            className="
                              rounded-lg
                              bg-black/30
                              p-2
                            "
                          >

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Customer name
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-white
                              "
                            >

                              {
                                loginDebug.customerName
                              }

                            </p>

                          </div>

                        )}


                        {/* Error */}

                        {loginDebug.error && (

                          <div
                            className="
                              rounded-lg
                              border
                              border-red-500/30
                              bg-red-500/10
                              p-2
                            "
                          >

                            <p
                              className="
                                text-neutral-500
                              "
                            >
                              Error
                            </p>

                            <p
                              className="
                                mt-0.5
                                break-words
                                text-red-400
                              "
                            >

                              {
                                loginDebug.error
                              }

                            </p>

                          </div>

                        )}

                      </div>

                    </div>

                  )}

                </motion.div>

              )}


            {/* =================================================
                PROFILE
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