import {
  useEffect,
  useState
} from "react";

import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
} from "lucide-react";

import {
  supabase
} from "@/shared/lib/supabase";



interface Props {

  onSuccess:(data:{
    phone:string;
  })=>void;

}





export default function LoginStep({

  onSuccess

}:Props){


const [phone,setPhone]=useState("");

const [otp,setOtp]=useState("");

const [otpSent,setOtpSent]=useState(false);

const [loading,setLoading]=useState(false);

const [error,setError]=useState("");
const [resendCooldown,setResendCooldown]=useState(0);







useEffect(() => {

  if (resendCooldown <= 0) {
    return;
  }

  const timer = window.setInterval(() => {
    setResendCooldown((current) =>
      current <= 1 ? 0 : current - 1
    );
  }, 1000);

  return () => {
    window.clearInterval(timer);
  };

}, [resendCooldown]);


async function sendOtp(){


try{


setError("");



if(phone.length!==10){

setError(
"Enter valid mobile number"
);

return;

}



setLoading(true);



const {

error

}=await supabase.auth.signInWithOtp({

phone:`+91${phone}`

});



if(error)

throw error;



setOtpSent(true);
setOtp("");
setResendCooldown(30);



}

catch(err:any){


setError(

err.message ||

"Unable to send OTP"

);


}

finally{


setLoading(false);


}


}








async function resendOtp(){

  if (loading || resendCooldown > 0) {
    return;
  }

  try {

    setError("");
    setLoading(true);

    const {
      error
    } = await supabase.auth.signInWithOtp({
      phone:`+91${phone}`
    });

    if (error) {
      throw error;
    }

    setOtp("");
    setResendCooldown(30);

  }

  catch(err:any){

    setError(
      err.message ||
      "Unable to resend OTP"
    );

  }

  finally {

    setLoading(false);

  }

}


async function verifyOtp(){


try{


setError("");

setLoading(true);



const {

error

}=await supabase.auth.verifyOtp({

phone:`+91${phone}`,

token:otp,

type:"sms"

});



if(error)

throw error;



// Login successful

onSuccess({

phone

});



}

catch(err:any){


setError(

err.message ||

"Invalid OTP"

);


}

finally{


setLoading(false);


}


}








return (

<div
  className="
    space-y-5
    motion-safe:animate-[loginStepIn_400ms_ease-out]
  "
>

  <div
    className="
      relative
      overflow-hidden
      rounded-3xl
      border
      border-neutral-200
      bg-gradient-to-br
      from-white
      via-white
      to-[#C8A44D]/[0.07]
      p-5
      shadow-[0_18px_50px_rgba(0,0,0,0.06)]
    "
  >

    <div
      className="
        pointer-events-none
        absolute
        -right-12
        -top-12
        h-32
        w-32
        rounded-full
        bg-[#C8A44D]/10
        blur-2xl
      "
    />

    <div className="relative">

      <div className="mb-5 flex items-center gap-3">

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-2xl
            bg-[#C8A44D]/15
            text-[#9A7A22]
            shadow-sm
          "
        >
          {
            otpSent
              ? <ShieldCheck size={21} />
              : <Smartphone size={21} />
          }
        </div>

        <div>

          <p
            className="
              text-sm
              font-semibold
              text-neutral-900
            "
          >
            {
              otpSent
                ? "Verify your mobile"
                : "Enter your mobile number"
            }
          </p>

          <p
            className="
              mt-0.5
              text-xs
              leading-5
              text-neutral-500
            "
          >
            {
              otpSent
                ? `We've sent a 6-digit OTP to +91 ${phone}`
                : "We'll send you a secure one-time password"
            }
          </p>

        </div>

      </div>

      <div
        className={`
          flex
          overflow-hidden
          rounded-2xl
          border
          bg-white
          shadow-sm
          transition-all
          duration-200

          ${
            otpSent
              ? "border-neutral-200 opacity-80"
              : "border-neutral-300 focus-within:border-[#C8A44D] focus-within:ring-4 focus-within:ring-[#C8A44D]/10"
          }
        `}
      >

        <div
          className="
            flex
            min-w-[62px]
            items-center
            justify-center
            border-r
            border-neutral-200
            bg-neutral-50
            px-3
            text-sm
            font-medium
            text-neutral-600
          "
        >
          +91
        </div>

        <input
          className="
            min-w-0
            flex-1
            bg-transparent
            px-4
            py-4
            text-[16px]
            text-neutral-900
            outline-none
            placeholder:text-neutral-400
          "
          placeholder="Enter mobile number"
          value={phone}
          onChange={(e)=>{
            setPhone(
              e.target.value.replace(/\D/g,"")
            );
            setError("");
          }}
          maxLength={10}
          inputMode="numeric"
          autoComplete="tel"
          disabled={otpSent || loading}
        />

        {
          otpSent && (
            <div
              className="
                flex
                items-center
                pr-4
                text-emerald-500
              "
            >
              <CheckCircle2 size={19} />
            </div>
          )
        }

      </div>

      {
        otpSent && (

          <div
            className="
              mt-4
              motion-safe:animate-[otpReveal_350ms_ease-out]
            "
          >

            <label
              className="
                mb-2
                block
                text-xs
                font-medium
                text-neutral-600
              "
            >
              Enter 6-digit OTP
            </label>

            <input
              className="
                w-full
                rounded-2xl
                border
                border-neutral-300
                bg-white
                px-4
                py-4
                text-center
                text-xl
                font-semibold
                tracking-[0.45em]
                text-neutral-900
                outline-none
                transition-all
                focus:border-[#C8A44D]
                focus:ring-4
                focus:ring-[#C8A44D]/10
                placeholder:tracking-normal
                placeholder:text-sm
                placeholder:font-normal
              "
              placeholder="Enter OTP"
              value={otp}
              onChange={(e)=>{
                setOtp(
                  e.target.value.replace(/\D/g,"")
                );
                setError("");
              }}
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
            />

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <button
                type="button"
                onClick={resendOtp}
                disabled={
                  loading ||
                  resendCooldown > 0
                }
                className="
                  text-xs
                  font-medium
                  text-[#9A7A22]
                  transition
                  hover:text-black
                  disabled:cursor-not-allowed
                  disabled:text-neutral-400
                "
              >
                {
                  resendCooldown > 0
                    ? `Resend OTP in ${resendCooldown}s`
                    : "Resend OTP"
                }
              </button>

              <button
                type="button"
                onClick={()=>{
                  setOtpSent(false);
                  setOtp("");
                  setError("");
                  setResendCooldown(0);
                }}
                className="
                  text-xs
                  font-medium
                  text-neutral-500
                  transition
                  hover:text-black
                "
              >
                Change number
              </button>

            </div>

          </div>

        )
      }

      {
        error && (

          <div
            className="
              mt-4
              rounded-xl
              border
              border-red-100
              bg-red-50
              px-3
              py-2.5
              text-center
              text-xs
              leading-5
              text-red-600
              motion-safe:animate-[errorShake_250ms_ease-out]
            "
          >
            {error}
          </div>

        )
      }

      <button
        onClick={
          otpSent
            ? verifyOtp
            : sendOtp
        }
        disabled={
          loading ||
          (otpSent && otp.length !== 6)
        }
        className="
          mt-5
          flex
          w-full
          items-center
          justify-center
          gap-2
          rounded-2xl
          bg-black
          py-4
          text-[15px]
          font-semibold
          text-white
          shadow-[0_10px_25px_rgba(0,0,0,0.16)]
          transition-all
          duration-200
          hover:-translate-y-0.5
          hover:shadow-[0_14px_30px_rgba(0,0,0,0.20)]
          active:translate-y-0
          active:scale-[0.99]
          disabled:cursor-not-allowed
          disabled:opacity-60
        "
      >

        {
          loading

            ?

            <Loader2
              size={18}
              className="animate-spin"
            />

            :

            <>
              {
                otpSent
                  ? "Verify & Continue"
                  : "Send OTP"
              }

              <ArrowRight
                size={18}
                className="
                  transition-transform
                  duration-200
                "
              />
            </>

        }

      </button>

      <div
        className="
          mt-4
          flex
          items-center
          justify-center
          gap-1.5
          text-[11px]
          text-neutral-400
        "
      >

        <ShieldCheck size={13} />

        <span>
          Secure login • Your number stays private
        </span>

      </div>

    </div>

  </div>


  <style>
    {`
      @keyframes loginStepIn {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes otpReveal {
        from {
          opacity: 0;
          transform: translateY(-6px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes errorShake {
        0%, 100% {
          transform: translateX(0);
        }
        35% {
          transform: translateX(-4px);
        }
        70% {
          transform: translateX(4px);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      }
    `}
  </style>

</div>

);
}

