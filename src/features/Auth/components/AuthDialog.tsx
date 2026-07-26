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
max-w-md
overflow-hidden
rounded-3xl
border-none
p-0
shadow-2xl
"

>



{/* Header */}

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
h-20
w-20
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



</div>






<div className="p-6">


<AnimatePresence mode="wait">





{/* PHONE */}


{step==="phone" && (

<motion.div

key="phone"

initial={{opacity:0,x:20}}

animate={{opacity:1,x:0}}

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
px-4
focus-within:border-[#C8A44D]
"

>


<Phone

size={18}

className="text-[#C8A44D]"

/>


<span className="ml-3">

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
py-3.5
text-sm
outline-none
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
text-white

${
isPhoneValid
?
"bg-[#111111] hover:bg-[#C8A44D]"
:
"cursor-not-allowed bg-neutral-300"
}

`}

>

Continue

</button>


</motion.div>

)}








{/* OTP */}



{step==="otp" && (

<motion.div

key="otp"

initial={{opacity:0,x:20}}

animate={{opacity:1,x:0}}

>


<button

onClick={changePhone}

className="
flex
items-center
gap-2
text-sm
text-neutral-600
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
"

>

Verify your number ✨

</h3>


<p

className="
mt-2
text-sm
text-neutral-500
"

>

Enter the 6-digit OTP sent to

</p>


<p className="
mt-1
text-sm
font-medium
">

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


className="
h-12
w-10
rounded-xl
border
border-black
text-center
text-lg
font-semibold
outline-none
focus:border-[#C8A44D]
"

/>


))

}

</div>





<div className="
mt-5
text-center
text-sm
text-neutral-500
">

{
timer>0
?
`Resend OTP in 00:${timer}`
:
<button
className="
text-[#C8A44D]
"
onClick={()=>
setTimer(30)
}
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
bg-[#111111]
py-3.5
text-sm
font-medium
text-white
"

>

Verify & Continue

</button>



</motion.div>

)}









{/* PROFILE */}



{step==="profile" && (

<motion.div

key="profile"

initial={{opacity:0,x:20}}

animate={{opacity:1,x:0}}

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
h-12
w-12
items-center
justify-center
rounded-full
bg-[#F8F6F1]
"

>

<Crown

size={22}

className="text-[#C8A44D]"

/>

</div>



<h3

className="
mt-4
text-xl
font-semibold
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

Complete your profile and unlock rewards, wishlist & exclusive offers

</p>


</div>






<div

className="
mt-6
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
border-neutral-200
px-4
py-3.5
text-sm
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
border-neutral-200
px-4
py-3.5
text-sm
outline-none
focus:border-[#C8A44D]
"

/>


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
bg-[#F8F6F1]
px-2
py-3
text-center
">

🎁

<p className="text-xs">
Rewards
</p>

</div>


<div className="
rounded-xl
bg-[#F8F6F1]
px-2
py-3
text-center
">

💎

<p className="text-xs">
Offers
</p>

</div>


<div className="
rounded-xl
bg-[#F8F6F1]
px-2
py-3
text-center
">

♡

<p className="text-xs">
Wishlist
</p>

</div>


</div>






<button

disabled={!isProfileValid}

className={`
mt-6
w-full
rounded-xl
py-3.5
text-sm
font-medium
text-white

${
isProfileValid
?
"bg-[#111111] hover:bg-[#C8A44D]"
:
"cursor-not-allowed bg-neutral-300"
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