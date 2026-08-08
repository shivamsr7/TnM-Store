import { useStoreSettings } from "@/features/settings/hooks/useStoreSettings";


interface Props {

selectedMethod:"prepaid" | "partial_cod" | "cod";

setSelectedMethod:
(method:"prepaid" | "partial_cod" | "cod")=>void;

}



export default function PaymentSection({

selectedMethod,

setSelectedMethod

}:Props){



const {
data:settings,
isLoading

}=useStoreSettings();




if(isLoading){

return (

<p>
Loading payment options...
</p>

);

}





return (

<div className="space-y-4">


<h2 className="text-lg font-semibold">

Payment

</h2>





{

settings?.razorpayEnabled &&

<div

onClick={()=>setSelectedMethod("prepaid")}

className={`

cursor-pointer

rounded-xl

border

p-4


${

selectedMethod==="prepaid"

?

"border-black"

:

"border-neutral-200"

}

`}

>

<div className="font-medium">

Online Payment

</div>


<p className="text-sm text-neutral-500">

Pay securely using UPI, Cards, Net Banking

</p>


</div>

}








{

settings?.partialCodEnabled &&

<div

onClick={()=>setSelectedMethod("partial_cod")}

className={`

cursor-pointer

rounded-xl

border

p-4


${

selectedMethod==="partial_cod"

?

"border-black"

:

"border-neutral-200"

}

`}

>

<div className="font-medium">

Partial COD

</div>


<p className="text-sm text-neutral-500">

Pay advance and remaining amount on delivery

</p>


</div>

}








{

settings?.codEnabled &&

settings?.codAvailable &&

<div

onClick={()=>setSelectedMethod("cod")}

className={`

cursor-pointer

rounded-xl

border

p-4


${

selectedMethod==="cod"

?

"border-black"

:

"border-neutral-200"

}

`}

>

<div className="font-medium">

Cash on Delivery

</div>


</div>

}


</div>

);

}