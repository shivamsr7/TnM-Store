import {
  useState
} from "react";

import {
  ArrowRight,
  Loader2
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

<div className="space-y-4">





<div

className="
flex
overflow-hidden
rounded-xl
border
border-neutral-200
"

>


<div

className="
flex
items-center
border-r
px-4
text-sm
text-neutral-600
"

>

+91

</div>



<input

className="
flex-1
px-4
py-3
outline-none
"

placeholder="Enter mobile number"

value={phone}

onChange={(e)=>{

setPhone(

e.target.value.replace(/\D/g,"")

);

}}

maxLength={10}

/>


</div>








{

otpSent &&

<input

className="
w-full
rounded-xl
border
border-neutral-200
px-4
py-3
outline-none
"

placeholder="Enter OTP"

value={otp}

onChange={(e)=>{

setOtp(

e.target.value.replace(/\D/g,"")

);

}}

maxLength={6}

/>

}








<button

onClick={

otpSent

?

verifyOtp

:

sendOtp

}

disabled={loading}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-black
py-3.5
font-medium
text-white
transition
hover:opacity-90
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

?

"Verify OTP"

:

"Send OTP"

}

<ArrowRight size={18}/>

</>

}



</button>








{

error &&

<p

className="
text-center
text-sm
text-red-500
"

>

{error}

</p>

}








{

otpSent &&

<button

type="button"

onClick={()=>{

setOtpSent(false);

setOtp("");

}}

className="
w-full
text-center
text-sm
text-neutral-500
"

>

Change mobile number

</button>

}



</div>

);

}