import {
  CheckCircle2,
  Package,
  ShoppingBag
} from "lucide-react";



interface Props {

  orderNumber:string;

  onClose:()=>void;

}





export default function OrderSuccess({

  orderNumber,

  onClose

}:Props){



return (

<div className="py-8 text-center">





<div className="
mx-auto
flex
h-20
w-20
items-center
justify-center
rounded-full
bg-green-100
">

<CheckCircle2

size={45}

className="text-green-600"

/>

</div>






<h2 className="
mt-6
text-2xl
font-semibold
">

Order Confirmed 🎉

</h2>





<p className="
mt-2
text-sm
text-neutral-500
">

Thank you for shopping with T&M Jewels

</p>







<div className="
mt-6
rounded-2xl
border
bg-neutral-50
p-5
">


<p className="text-sm text-neutral-500">

Order Number

</p>



<p className="
mt-1
font-semibold
">

#{orderNumber}

</p>


</div>







<div className="mt-6 space-y-3">





<button

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-black
py-3
text-white
"

>

<Package size={18}/>

Track Order

</button>








<button

onClick={onClose}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
border
py-3
"

>

<ShoppingBag size={18}/>

Continue Shopping

</button>





</div>







<p className="
mt-6
text-xs
text-neutral-400
">

You will receive order updates on your registered mobile number.

</p>




</div>

);

}