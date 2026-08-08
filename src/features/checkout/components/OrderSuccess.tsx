import {
  CheckCircle2,
  Package,
  ShoppingBag,
  Sparkles,
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

<div className="
py-8
text-center
">





<div className="

mx-auto

flex

h-24

w-24

items-center

justify-center

rounded-full

bg-green-100

">

<CheckCircle2

size={52}

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

leading-relaxed

text-neutral-500

">

Thank you for choosing T&M Jewels.

Your jewellery piece is being prepared with care.

</p>









<div className="

mt-6

rounded-2xl

border

bg-neutral-50

p-5

">




<p className="

text-xs

uppercase

tracking-wide

text-neutral-400

">

Order Number

</p>







<p className="

mt-2

text-xl

font-semibold

"

>

#{orderNumber}

</p>






</div>









<div className="

mt-5

rounded-2xl

bg-neutral-50

p-4

text-left

">




<div className="

flex

items-center

gap-3

">

<Sparkles

size={18}

className="text-[#C8A44D]"

/>



<p className="

text-sm

font-medium

">

Your order is being packed

</p>



</div>







<p className="

mt-2

text-xs

text-neutral-500

">

We will share updates on your registered mobile number.

</p>







</div>









<div className="

mt-6

space-y-3

">





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

font-medium

text-white

transition

hover:bg-neutral-800

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

font-medium

transition

hover:bg-neutral-50

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

Need help? Our support team is always here for you.

</p>





</div>

);

}