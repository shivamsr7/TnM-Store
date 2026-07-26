import {
  useState,
} from "react";

import {
  ArrowLeft,
  Crown,
  Sparkles,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";


type Step =
"phone"
|"otp"
|"profile";


export default function AuthContent(){


const [step,setStep]=
useState<Step>("phone");


const [phone,setPhone]=
useState("");



return (

<div className="overflow-y-auto">

<div

className="
bg-[#F8F6F1]
px-6
py-7
"

>


<div className="flex items-center gap-3">


<div

className="
flex
h-12
w-12
items-center
justify-center
rounded-full
bg-white
"

>

<Sparkles

className="text-[#C8A44D]"

/>

</div>


<div>

<h2 className="
text-xl
font-semibold
">

T&M Jewels

</h2>


<p className="
text-sm
text-neutral-500
">

Welcome to our family

</p>

</div>


</div>


<div className="
mt-5
flex
gap-2
text-xs
">

<span className="
rounded-full
bg-white
px-3
py-2
">

✨ Rewards

</span>


<span className="
rounded-full
bg-white
px-3
py-2
">

♡ Wishlist

</span>


</div>


</div>





<div className="p-6">


<AnimatePresence mode="wait">


{step==="phone" && (

<motion.div
key="phone"
initial={{opacity:0,x:20}}
animate={{opacity:1,x:0}}
>


<h3 className="
text-lg
font-semibold
">

Login or Create Account

</h3>


<p className="
mt-2
text-sm
text-neutral-500
">

Enter mobile number

</p>


<div className="
mt-5
flex
items-center
rounded-xl
border
px-4
">

<span>
+91
</span>


<input

type="tel"

inputMode="numeric"

value={phone}

onChange={(e)=>
setPhone(e.target.value)
}

placeholder="Mobile number"

className="
ml-3
w-full
py-3
outline-none
"

/>


</div>



<button

onClick={()=>
setStep("otp")
}

className="
mt-5
w-full
rounded-xl
bg-black
py-3
text-white
"

>

Continue

</button>


</motion.div>

)}







{step==="otp" && (

<motion.div
key="otp"
initial={{opacity:0,x:20}}
animate={{opacity:1,x:0}}
>


<button

onClick={()=>
setStep("phone")
}

className="
flex
items-center
gap-2
text-sm
"

>

<ArrowLeft size={16}/>

Back

</button>



<h3 className="
mt-5
text-lg
font-semibold
">

Verify OTP

</h3>


<input

placeholder="Enter OTP"

className="
mt-5
w-full
rounded-xl
border
px-4
py-3
"

/>


<button

onClick={()=>
setStep("profile")
}

className="
mt-5
w-full
rounded-xl
bg-black
py-3
text-white
"

>

Verify

</button>


</motion.div>

)}








{step==="profile" && (

<motion.div
key="profile"
initial={{opacity:0,x:20}}
animate={{opacity:1,x:0}}
>


<div className="flex gap-2">

<Crown className="text-[#C8A44D]"/>

<h3 className="font-semibold">

Join T&M Family

</h3>

</div>


<input

placeholder="Full Name"

className="
mt-5
w-full
rounded-xl
border
px-4
py-3
"

/>


<input

placeholder="Email"

className="
mt-3
w-full
rounded-xl
border
px-4
py-3
"

/>


<button

className="
mt-5
w-full
rounded-xl
bg-black
py-3
text-white
"

>

Create Account

</button>


</motion.div>

)}



</AnimatePresence>


</div>


</div>

);

}