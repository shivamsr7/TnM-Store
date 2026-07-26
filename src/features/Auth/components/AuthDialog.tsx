import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  ArrowLeft,
  Crown,
  Phone,
} from "lucide-react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import logo from "@/assets/logo/mainLogo.png";


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



const [step,setStep]=
useState<Step>("phone");


const [phone,setPhone]=
useState("");


const [otp,setOtp]=
useState([
"",
"",
"",
"",
"",
"",
]);


const [timer,setTimer]=
useState(30);



const [fullName,setFullName]=
useState("");


const [email,setEmail]=
useState("");



const otpRefs =
useRef<(HTMLInputElement|null)[]>([]);





const isPhoneValid =
phone.length===10;



const isProfileValid =
fullName.trim().length>=2 &&
(
email==="" ||
/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
);





useEffect(()=>{


if(step!=="otp")
return;


if(timer===0)
return;



const interval =
setInterval(()=>{

setTimer(
prev=>prev-1
);

},1000);



return ()=>clearInterval(interval);


},[step,timer]);







function closeDialog(){

setStep("phone");

setPhone("");

setOtp([
"",
"",
"",
"",
"",
"",
]);

setFullName("");

setEmail("");

setTimer(30);

onOpenChange(false);

}







function changePhone(){

setStep("phone");

setTimer(30);

}






return (

<Dialog

open={open}

onOpenChange={closeDialog}

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





{/* Header */}

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


<div

className="
flex
h-16
w-16

md:h-20
md:w-20

items-center
justify-center

overflow-hidden



shadow-lg

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
mt-2

text-xl

font-semibold

tracking-wide

text-[#C8A44D]

md:mt-4
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

md:mt-2
md:text-sm

"

>

Your luxury jewellery experience

</p>




</div>









{/* Benefits */}

<div

className="
mt-4

grid
grid-cols-3
gap-2

md:mt-6

"

>



<div

className="
rounded-xl

border
border-[#C8A44D]/30

bg-white/10

px-2
py-3

text-center

text-white

"

>

<p>

♡

</p>


<span

className="
text-xs
text-neutral-300
"

>

Wishlist

</span>


</div>





<div

className="
rounded-xl

border
border-[#C8A44D]/30

bg-white/10

px-2
py-3

text-center

text-white

"

>

<p>

🎁

</p>


<span

className="
text-xs
text-neutral-300
"

>

Rewards

</span>


</div>





<div

className="
rounded-xl

border
border-[#C8A44D]/30

bg-white/10

px-2
py-3

text-center

text-white

"

>

<p>

💎

</p>


<span

className="
text-xs
text-neutral-300
"

>

Offers

</span>


</div>



</div>




</div>







<div

className="
px-4
pb-5
pt-3

md:px-6
md:pb-6

"

>


<AnimatePresence mode="wait">





{/* PHONE STEP */}


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
mt-2

text-base
font-semibold
text-white

md:text-lg

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

Login to access your wishlist, rewards & exclusive offers

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

focus-within:border-[#C8A44D]

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

value={phone}

onChange={(e)=>

setPhone(
e.target.value.replace(/\D/g,"")
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

placeholder:text-neutral-500

"

/>




</div>






<button

disabled={!isPhoneValid}

onClick={()=>{

setTimer(30);

setStep("otp");

}}

className={`

mt-5

w-full

rounded-xl

py-3.5

text-sm

font-medium

transition-all


${
isPhoneValid

?

"bg-white text-black hover:bg-[#C8A44D] hover:text-white"

:

"cursor-not-allowed bg-neutral-500 text-neutral-300"

}

`}

>

Continue

</button>



</motion.div>

)}







{/* OTP STEP */}



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

onClick={changePhone}

className="
flex
items-center
gap-2

text-sm

text-neutral-300

hover:text-[#C8A44D]

transition

"

>

<ArrowLeft size={16}/>

Change Number

</button>






<h3

className="
mt-5

text-lg

font-semibold

text-white

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

text-white

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


{

otp.map((digit,index)=>(


<input

key={index}

ref={(el)=>{

otpRefs.current[index]=el;

}}

value={digit}

maxLength={1}

inputMode="numeric"

onChange={(e)=>{

const value =
e.target.value.replace(/\D/g,"");


const updated=[...otp];

updated[index]=value;


setOtp(updated);



if(value && index<5){

otpRefs.current[index+1]?.focus();

}

}}



onKeyDown={(e)=>{

if(
e.key==="Backspace"
&&
!otp[index]
&&
index>0
){

otpRefs.current[index-1]?.focus();

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

transition

focus:border-[#C8A44D]

focus:ring-1

focus:ring-[#C8A44D]

"

/>


))

}


</div>







<div

className="
mt-5

text-center

text-sm

text-neutral-300

"

>


{

timer>0

?

`Resend OTP in 00:${timer}`


:

<button

className="
font-medium

text-[#C8A44D]

"

onClick={()=>setTimer(30)}

>

Resend OTP

</button>


}


</div>







<button

onClick={()=>
setStep("profile")
}

className="
mt-5

w-full

rounded-xl

bg-white

py-3.5

text-sm

font-medium

text-black

transition-all

hover:bg-[#C8A44D]

hover:text-white

"

>

Verify & Continue

</button>



</motion.div>

)}









{/* PROFILE STEP */}



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

md:h-12
md:w-12

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

text-white

md:mt-4

md:text-xl

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

Complete your profile and unlock rewards, wishlist & exclusive offers

</p>



</div>







<div

className="
mt-3

space-y-4

"

>


<input

value={fullName}

onChange={(e)=>
setFullName(e.target.value)
}

placeholder="Full Name"

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







<input

value={email}

onChange={(e)=>
setEmail(e.target.value)
}

placeholder="Email (optional)"

type="email"

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








{/* Benefits */}










<button

disabled={!isProfileValid}

className={`

mt-5

md:mt-6

w-full

rounded-xl

py-3.5

text-sm

font-medium

transition-all



${
isProfileValid

?

"bg-white text-black hover:bg-[#C8A44D] hover:text-white"

:

"cursor-not-allowed bg-neutral-500 text-neutral-300"

}

`}

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