import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import logo from "@/assets/logo/mainLogo.png"
import {
  useState,
} from "react";

import {
  ArrowLeft,
  Crown,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";


interface Props {

  open:boolean;

  onOpenChange:(open:boolean)=>void;

}



type Step =
  | "phone"
  | "otp"
  | "profile";




export default function AuthDialog({

  open,

  onOpenChange,

}:Props){



const [
  step,
  setStep,
]=useState<Step>("phone");



const [
  phone,
  setPhone,
]=useState("");





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
max-w-md
overflow-hidden
rounded-3xl
border-none
p-0
shadow-2xl
"

>


{/* Brand Header */}

<div

className="
bg-gradient-to-b
from-[#F8F6F1]
to-white
px-6
pb-6
pt-8
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


<div

className="
flex
h-16
w-16
items-center
justify-center
overflow-hidden
rounded-full
bg-white
shadow-sm
"

>

<img

src={logo}

alt="T&M Jewels"

className="
h-full
w-full
object-contain
p-2
"

/>

</div>




<h2
className="
mt-4
text-2xl
font-semibold
tracking-wide
text-[#C8A44D]
"
>
T&M Jewels
</h2>




<p

className="
mt-2
text-sm
text-neutral-500
"

>

Your luxury jewellery experience

</p>



</div>






<div

className="
mt-6
grid
grid-cols-3
gap-2
"

>


<div className="
rounded-xl
bg-white
px-2
py-3
text-center
">

<p>♡</p>

<span className="
text-xs
text-neutral-600
">

Wishlist

</span>

</div>



<div className="
rounded-xl
bg-white
px-2
py-3
text-center
">

<p>🎁</p>

<span className="
text-xs
text-neutral-600
">

Rewards

</span>

</div>



<div className="
rounded-xl
bg-white
px-2
py-3
text-center
">

<p>💎</p>

<span className="
text-xs
text-neutral-600
">

Offers

</span>

</div>


</div>



</div>








{/* Content */}

<div

className="
p-6
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

exit={{
opacity:0,
x:-20
}}

>


<h3

className="
text-lg
font-semibold
text-neutral-900
"

>

Welcome to T&M Family ✨

</h3>



<p

className="
mt-2
text-sm
text-neutral-500
"

>

Login to access your wishlist, rewards & exclusive offers

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

setPhone(
e.target.value
)

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
bg-[#111111]
py-3
text-sm
font-medium
text-white
transition-colors
hover:bg-[#C8A44D]
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

placeholder="Enter OTP"

inputMode="numeric"

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
bg-[#111111]
py-3
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

className="
text-[#C8A44D]
"

/>


<h3

className="
text-lg
font-semibold
"

>

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
bg-[#111111]
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



</DialogContent>


</Dialog>

);

}