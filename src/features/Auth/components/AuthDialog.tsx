import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

import {
  useState,
} from "react";

import {
  ArrowLeft,
  Sparkles,
} from "lucide-react";


interface Props {

  open: boolean;

  onOpenChange:
  (open:boolean)=>void;

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




function reset(){

 setStep("phone");

 setPhone("");

}





function close(){

 reset();

 onOpenChange(false);

}





return (

<Dialog

open={open}

onOpenChange={close}

>


<DialogContent

className="
max-w-md
rounded-3xl
border-none
p-0
overflow-hidden
"

>



<div className="bg-[#F8F6F1] p-6">



<div className="
flex
items-center
gap-3
">


<div className="
flex
h-11
w-11
items-center
justify-center
rounded-full
bg-white
"
>

<Sparkles

size={22}

className="text-[#C8A44D]"

/>

</div>



<div>

<h2 className="
text-xl
font-semibold
text-neutral-900
">

Welcome to T&M Jewels

</h2>


<p className="
text-sm
text-neutral-500
">

Rewards • Wishlist • Orders

</p>


</div>


</div>



</div>







<div className="p-6">


{step==="phone" && (


<>


<h3 className="
mb-2
text-lg
font-semibold
">

Login or Create Account

</h3>


<p className="
mb-5
text-sm
text-neutral-500
">

Enter your mobile number to continue

</p>



<div className="
flex
items-center
rounded-xl
border
px-4
"

>

<span className="text-sm">
+91
</span>


<input

value={phone}

onChange={(e)=>
setPhone(e.target.value)
}

placeholder="Mobile number"

className="
ml-3
w-full
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


</>

)}






{step==="otp" && (


<>

<button

onClick={()=>
setStep("phone")
}

className="
mb-4
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
text-lg
font-semibold
">

Verify OTP

</h3>


<p className="
mt-2
text-sm
text-neutral-500
">

OTP sent to +91 {phone}

</p>



<input

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

Verify

</button>


</>

)}







{step==="profile" && (


<>

<h3 className="
text-lg
font-semibold
">

Complete Profile

</h3>


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


</>

)}



</div>


</DialogContent>


</Dialog>


);

}