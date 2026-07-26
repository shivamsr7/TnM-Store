import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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


interface Props {
  open: boolean;
  onOpenChange: (open:boolean)=>void;
}


type Step =
  | "phone"
  | "otp"
  | "profile";



export default function AuthDialog({

  open,

  onOpenChange,

}:Props){


const [step,setStep] =
useState<Step>("phone");


const [phone,setPhone] =
useState("");



function closeDialog(){

  setStep("phone");

  setPhone("");

  onOpenChange(false);

}





return (

<Dialog

open={open}

onOpenChange={closeDialog}

>


<DialogContent

className="

w-full

max-w-md

max-h-[90dvh]

overflow-hidden

rounded-3xl

border-none

p-0

shadow-2xl


data-[state=open]:animate-in

data-[state=closed]:animate-out

data-[state=open]:slide-in-from-bottom

data-[state=closed]:slide-out-to-bottom


sm:max-h-[85vh]

"

>



{/* Header */}


<div

className="
shrink-0
bg-[#F8F6F1]
px-6
py-7
"

>


<div

className="
flex
items-center
gap-3
"

>


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

size={24}

className="text-[#C8A44D]"

/>

</div>



<div>

<h2

className="
text-xl
font-semibold
text-neutral-900
"

>

T&M Jewels

</h2>


<p

className="
text-sm
text-neutral-500
"

>

Welcome to our family

</p>


</div>


</div>





<div

className="
mt-5
flex
gap-2
text-xs
text-neutral-600
"

>

<span className="rounded-full bg-white px-3 py-2">
✨ Rewards
</span>


<span className="rounded-full bg-white px-3 py-2">
♡ Wishlist
</span>


<span className="rounded-full bg-white px-3 py-2">
♛ Offers
</span>


</div>


</div>







{/* Scroll Content */}


<div

className="

max-h-[60vh]

overflow-y-auto

overscroll-contain

px-6

pb-8

pt-6

"

>


<AnimatePresence mode="wait">



{step==="phone" && (

<motion.div

key="phone"

initial={{
opacity:0,
x:20
}}

animate={{
opacity:1,
x:0
}}

>


<h3

className="
text-lg
font-semibold
text-neutral-900
"

>

Login or Create Account

</h3>


<p

className="
mt-2
text-sm
text-neutral-500
"

>

Enter your mobile number to continue

</p>



<div

className="
mt-5
flex
items-center
rounded-xl
border
border-neutral-200
bg-white
px-4
"

>

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
text-sm
font-medium
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

initial={{
opacity:0,
x:20
}}

animate={{
opacity:1,
x:0
}}

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
text-neutral-600
"

>

<ArrowLeft size={16}/>

Back

</button>




<h3

className="
mt-5
text-lg
font-semibold
"

>

Verify OTP

</h3>


<p

className="
mt-2
text-sm
text-neutral-500
"

>

OTP sent to +91 {phone}

</p>



<input

inputMode="numeric"

placeholder="Enter OTP"

className="
mt-5
w-full
rounded-xl
border
px-4
py-3
outline-none
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
text-sm
font-medium
text-white
"

>

Verify OTP

</button>


</motion.div>

)}







{step==="profile" && (

<motion.div

key="profile"

initial={{
opacity:0,
x:20
}}

animate={{
opacity:1,
x:0
}}

>


<div

className="
flex
items-center
gap-2
"

>

<Crown

size={20}

className="text-[#C8A44D]"

/>


<h3 className="
text-lg
font-semibold
">

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

placeholder="Email (optional)"

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
text-sm
font-medium
text-white
"

>

Create Account

</button>


</motion.div>

)}



</AnimatePresence>


</div>


</DialogContent>


</Dialog>

);

}