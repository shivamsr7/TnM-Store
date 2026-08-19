import {
  ShieldCheck,
  CreditCard,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import {
  useState
} from "react";


import {
  createRazorpayOrder,
  verifyRazorpayPayment
} from "@/features/payment/services/razorpay.service";



interface Props {

  totalAmount:number;

  onSuccess:(paymentData:any)=>void;

}





export default function PaymentStep({

  totalAmount,

  onSuccess

}:Props){



const [loading,setLoading]=useState(false);

const [error,setError]=useState("");







async function handlePayment(){


if(loading)
return;



try{


setError("");

setLoading(true);





// Create Razorpay Order

const razorpayOrder = await createRazorpayOrder(

totalAmount

);






const options = {


key:
import.meta.env.VITE_RAZORPAY_KEY_ID,



amount:
razorpayOrder.amount,



currency:
razorpayOrder.currency,



name:
"T&M Jewels",



description:
"Jewellery Purchase",



order_id:
razorpayOrder.id,





handler:async function(response:any){


try{


setLoading(true);



const verification =

await verifyRazorpayPayment({

razorpay_payment_id:
response.razorpay_payment_id,


razorpay_order_id:
response.razorpay_order_id,


razorpay_signature:
response.razorpay_signature

});





if(verification.success){


onSuccess({

...response,

verified:true

});


}

else{


setError(

"Payment verification failed. Please try again."

);


setLoading(false);


}



}

catch(error){


console.error(error);


setError(

"Payment verification failed. Please try again."

);


setLoading(false);


}



},





prefill:{


name:"",


email:"",


contact:""



},





theme:{


color:"#000000"


},





modal:{


ondismiss:()=>{


setLoading(false);


setError(

"Payment cancelled"

);


}



}



};







const razorpay = new window.Razorpay(options);



razorpay.open();




}

catch(err:any){



console.error(
err
);



setError(

err.message ||

"Payment failed. Please try again."

);



setLoading(false);



}



}







return (

<div className="space-y-5">






<h3 className="text-lg font-semibold">

Payment

</h3>








<div

className="

rounded-2xl

border

bg-neutral-50

p-5

"

>


<div className="flex items-center gap-3">


<div

className="

flex

h-11

w-11

items-center

justify-center

rounded-full

bg-white

shadow-sm

"

>

<CreditCard size={20}/>

</div>



<div>


<p className="font-medium">

Secure Online Payment

</p>


<p className="text-sm text-neutral-500">

UPI • Cards • Net Banking

</p>


</div>



</div>



</div>








<div

className="

rounded-2xl

border

p-5

"

>


<div className="flex justify-between">


<span className="text-neutral-600">

Amount Payable

</span>



<span className="text-lg font-semibold">

₹{totalAmount}

</span>


</div>



</div>








<button

onClick={handlePayment}

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

hover:bg-neutral-800

disabled:cursor-not-allowed

disabled:opacity-60

"

>


{

loading

?

<>

<Loader2

size={18}

className="animate-spin"

/>

Processing Payment...

</>

:

`Pay ₹${totalAmount}`

}



</button>







{

error &&

<div

className="

rounded-xl

bg-red-50

px-4

py-3

text-center

text-sm

text-red-600

"

>

{error}

</div>

}








<div

className="

flex

items-center

justify-center

gap-2

text-sm

text-neutral-500

"

>

<ShieldCheck size={16}/>

Secure payment powered by Razorpay

</div>







<div

className="

flex

items-center

justify-center

gap-2

text-xs

text-neutral-400

"

>

<CheckCircle2 size={14}/>

Your payment details are protected

</div>







</div>

);

}