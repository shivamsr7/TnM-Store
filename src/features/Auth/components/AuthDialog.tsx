import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
 applyReferralCode
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

import { toast } from "sonner";

import logo from "@/assets/logo/mainLogo.png";

import {
  sendOtp,
  verifyOtp,
} from "@/features/Auth/services/auth.service";


import {
  getCustomerByPhone,
  createCustomer,
} from "@/features/customers/services/customer.service";



interface Props {

open:boolean;

onOpenChange:(open:boolean)=>void;

}



type Step =
"phone"
|
"otp"
|
"profile";




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

const [referralCode,setReferralCode]=
useState("");

const [authSuccess,setAuthSuccess]=
useState(false);



const [successMessage,setSuccessMessage]=
useState("");



const otpRefs =
useRef<(HTMLInputElement|null)[]>([]);


const SKIP_OTP =
import.meta.env.VITE_SKIP_OTP === "true";


const isPhoneValid =
phone.length===10;



const isOtpValid =
otp.join("").length===6;



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



const interval=setInterval(()=>{

setTimer(prev=>prev-1);

},1000);



return()=>clearInterval(interval);


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


setAuthSuccess(false);

setSuccessMessage("");


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

src={logo}

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
<p className="text-xs text-neutral-300">
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
<p className="text-xs text-neutral-300">
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
<p className="text-xs text-neutral-300">
Offers
</p>

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


{!authSuccess && step==="phone" && (

<motion.div

key="phone"

initial={{opacity:0,x:20}}

animate={{opacity:1,x:0}}

>


<h3 className="
text-lg
font-semibold
">

Welcome to T&M Family ✨

</h3>



<p className="
mt-2
text-sm
text-neutral-300
">

Login to access your wishlist, rewards & exclusive offers

</p>





<div className="
mt-5
flex
items-center
rounded-xl
border
border-white/20
bg-white
px-4
">


<Phone
size={18}
className="text-[#C8A44D]"
/>



<span className="
ml-3
text-black
">

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
"

/>


</div>



<button

disabled={!isPhoneValid}

onClick={async()=>{

try{

if(!SKIP_OTP){

  await sendOtp(phone);

}

setTimer(30);

setStep("otp");


}

catch(error){

toast.error(
"Unable to send OTP"
);

console.log(error);

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

?

"bg-white text-black hover:bg-[#C8A44D]"

:

"bg-neutral-500 text-neutral-300"

}

`}

>

Continue

</button>


</motion.div>

)}





{/* OTP STEP */}


{!authSuccess && step==="otp" && (

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

focus:border-[#C8A44D]

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

onClick={async()=>{


try{


await sendOtp(phone);


setTimer(30);


toast.success(
"OTP sent again"
);


}

catch(error){

toast.error(
"Unable to resend OTP"
);

console.log(error);

}


}}

className="
text-[#C8A44D]
"

>

Resend OTP

</button>


}

</div>






<button

disabled={!isOtpValid}

onClick={async()=>{


try{


const otpCode =
otp.join("");



if(!SKIP_OTP){

  await verifyOtp(
    phone,
    otpCode
  );

}
else{

  localStorage.setItem(
    "tnm_test_phone",
    phone
  );

}





const customer =
await getCustomerByPhone(
phone
);





if(customer){



setSuccessMessage(
"Welcome back to T&M Family ✨"
);



setAuthSuccess(true);



}

else{



toast.success(
"OTP verified successfully ✨"
);



setTimeout(()=>{


setStep("profile");


},500);



}



}



catch(error){


toast.error(
"Invalid OTP. Please check and try again."
);


console.log(error);


}



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
isOtpValid

?

"bg-[#C8A44D] text-black hover:bg-white"

:

"cursor-not-allowed bg-neutral-500 text-neutral-300"

}

`

}

>

Verify & Continue

</button>



</motion.div>

)}
)








{/* PROFILE STEP */}


{!authSuccess && step==="profile" && (

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

py-3

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

value={referralCode}

onChange={(e)=>
setReferralCode(
e.target.value.toUpperCase()
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

disabled={!isProfileValid}

onClick={async()=>{


try{


const nameParts =
fullName.trim().split(" ");



const firstName =
nameParts[0];



const lastName =
nameParts
.slice(1)
.join(" ");





const customer =
await createCustomer({

first_name:firstName,

last_name:lastName,

email:email || undefined,

phone:phone

});



if(referralCode){

await applyReferralCode(
customer.id,
referralCode
);

}





setSuccessMessage(

"Welcome to T&M Family ✨"

);



setAuthSuccess(true);



}



catch(error){


console.log(error);



toast.error(

"Unable to create account. Please try again."

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

transition-all


${
isProfileValid

?

"bg-[#C8A44D] text-black hover:bg-white"

:

"cursor-not-allowed bg-neutral-500 text-neutral-300"

}

`

}

>

Create Account

</button>



</motion.div>

)}









{/* SUCCESS SCREEN */}



{authSuccess && (

<motion.div

key="success"

initial={{

opacity:0,

scale:0.95

}}

animate={{

opacity:1,

scale:1

}}

className="
flex
flex-col
items-center
text-center
py-8
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

{successMessage}

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

onClick={closeDialog}

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