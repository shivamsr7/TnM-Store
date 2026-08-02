import {
  X
} from "lucide-react";

import {
  useCoupons
} from "../hooks/useCoupons";



interface Props {

  open:boolean;

  onClose:()=>void;

  onApply:(coupon:any)=>void;

  cartTotal:number;

  appliedCoupon?:any;

}





export default function CouponModal({

  open,

  onClose,

  onApply,

  cartTotal,

  appliedCoupon

}:Props){



const {

data:coupons=[],

isLoading

}=useCoupons();





if(!open)

return null;





const now = new Date();





const validCoupons = coupons.filter((coupon:any)=>{


if(

coupon.expires_at &&

now > new Date(coupon.expires_at)

)

return false;



if(

coupon.starts_at &&

now < new Date(coupon.starts_at)

)

return false;



if(

coupon.usage_limit &&

coupon.used_count >= coupon.usage_limit

)

return false;



return true;

});






const applicableCoupons = validCoupons

.filter((coupon:any)=>

cartTotal >= coupon.minimum_order_amount

)

.sort(

(a:any,b:any)=>

b.discount_value - a.discount_value

);






const lockedCoupons = validCoupons

.filter((coupon:any)=>

cartTotal < coupon.minimum_order_amount

);









return (

<>


<div

className="
fixed

inset-0

z-[1100]

bg-black/40

"

onClick={onClose}

/>








<div

className="
fixed

bottom-0

left-0

right-0

z-[1200]

max-h-[85vh]

overflow-y-auto

rounded-t-3xl

bg-white

p-5

"

>





<div

className="
flex

items-center

justify-between

"

>


<h2 className="text-lg font-semibold">

Available Offers

</h2>



<button onClick={onClose}>

<X/>

</button>


</div>







{

isLoading &&

<p className="mt-5 text-sm text-neutral-500">

Loading offers...

</p>

}









{/* Applicable */}

{

applicableCoupons.length > 0 &&

<>

<h3 className="mt-6 text-sm font-semibold">

Available for you

</h3>





<div className="mt-3 space-y-3">


{

applicableCoupons.map((coupon:any)=>(


<div

key={coupon.id}

className={`

rounded-2xl

border

p-4


${

appliedCoupon?.code===coupon.code

?

"border-green-500 bg-green-50"

:

"border-neutral-200"

}

`}

>


<div className="flex justify-between gap-4">


<div>


<div className="flex items-center gap-2">

<p className="font-semibold">

{coupon.code}

</p>


{

appliedCoupon?.code===coupon.code &&

<span className="text-xs text-green-600">

Applied

</span>

}

</div>




<p className="text-sm text-neutral-700">

{coupon.title}

</p>



{

coupon.minimum_order_amount>0 &&

<p className="mt-1 text-xs text-neutral-500">

Min order ₹{coupon.minimum_order_amount}

</p>

}



</div>





<button

disabled={appliedCoupon?.code===coupon.code}

onClick={()=>onApply(coupon)}

className={`

rounded-xl

px-4

py-2

text-sm

text-white


${

appliedCoupon?.code===coupon.code

?

"bg-green-600"

:

"bg-black"

}

`}

>

{

appliedCoupon?.code===coupon.code

?

"Applied"

:

"Apply"

}

</button>



</div>


</div>


))

}


</div>


</>

}









{/* Locked */}

{

lockedCoupons.length > 0 &&

<>

<h3 className="mt-8 text-sm font-semibold">

More Offers

</h3>




<div className="mt-3 space-y-3">


{

lockedCoupons.map((coupon:any)=>(


<div

key={coupon.id}

className="

rounded-2xl

border

bg-neutral-50

p-4

opacity-70

"

>


<p className="font-semibold">

🔒 {coupon.code}

</p>


<p className="text-sm">

{coupon.title}

</p>



<p className="mt-1 text-xs text-neutral-500">

Add ₹

{

coupon.minimum_order_amount-cartTotal

}

 more to unlock

</p>



</div>


))

}


</div>


</>

}



{

!isLoading &&

applicableCoupons.length===0 &&

lockedCoupons.length===0 &&

<p className="mt-6 text-sm text-neutral-500">

No offers available.

</p>

}



</div>


</>

);

}