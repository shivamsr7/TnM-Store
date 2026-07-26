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
"phone"
|"otp"
|"profile";




export default function AuthDialog({

open,

onOpenChange,

}:Props){



const [
step,
setStep
]=useState<Step>("phone");



const [
phone,
setPhone
]=useState("");



const [
otp,
setOtp
]=useState([
"",
"",
"",
"",
"",
"",
]);



const [
timer,
setTimer
]=useState(30);



const otpRefs =
useRef<(HTMLInputElement|null)[]>([]);



const isPhoneValid =
phone.length === 10;





useEffect(()=>{


if(step !== "otp")
return;


if(timer === 0)
return;



const interval =
setInterval(()=>{

setTimer(
prev=>prev-1
);

},1000);



return ()=>clearInterval(interval);



},[
step,
timer
]);







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

♡
<p className="text-xs text-neutral-600">
Wishlist
</p>

</div>


<div className="
rounded-xl
bg-white
px-2
py-3
text-center
">

🎁
<p className="text-xs text-neutral-600">
Rewards
</p>

</div>


<div className="
rounded-xl
bg-white
px-2
py-3
text-center
">

💎
<p className="text-xs text-neutral-600">
Offers
</p>

</div>


</div>



</div>







<div className="p-6">


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

className={`
mt-5
flex
items-center
rounded-xl
border
bg-white
px-4

${
phone.length
?
"border-[#C8A44D]"
:
"border-neutral-200"
}

`}

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
py-3
text-sm
font-medium
text-white

${
isPhoneValid
?
"bg-[#111111] hover:bg-[#C8A44D]"
:
"bg-neutral-300 cursor-not-allowed"
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
text-neutral-900
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

ref={(el) => {
  otpRefs.current[index] = el;
}}

value={digit}

maxLength={1}

inputMode="numeric"


onChange={(e)=>{


const value =
e.target.value.replace(/\D/g,"");


const updated=[
...otp
];


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



className={`
h-12
w-10
rounded-xl
border
border-black
text-center
text-lg
font-semibold
outline-none
transition-all
focus:border-[#C8A44D]
focus:ring-1
focus:ring-[#C8A44D]

${
digit
?
"border-[#C8A44D]"
:
"border-neutral-200"
}

`}


/>


))

}


</div>





<div

className="
mt-5
text-center
text-sm
text-neutral-500
"

>


{

timer>0 ?

(
<>
Resend OTP in 00:{timer}
</>
)

:

(

<button

onClick={()=>
setTimer(30)
}

className="
font-medium
text-[#C8A44D]
"

>

Resend OTP

</button>

)

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
py-3
text-sm
font-medium
text-white
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


<div className="
flex
items-center
gap-2
">

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