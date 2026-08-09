import {
  X,
  Trash2,
  Minus,
  Plus,
} from "lucide-react";


import {
  useEffect,
  useState
} from "react";


import {
  validateCoupon
} from "@/features/coupons/services/coupon.service";


import {
  useCartStore
} from "../store/cart.store";


import CouponModal from "@/features/coupons/components/CouponModal";


import {
  useBestCoupon
} from "@/features/coupons/hooks/useBestCoupon";


import {
  useUnlockCoupon
} from "@/features/coupons/hooks/useUnlockCoupon";


import CheckoutDialog from "@/features/checkout/components/CheckoutDialog";



const FREE_GIFT_AMOUNT = 1000;





export default function CartDrawer(){



const {

items,

isCartOpen,

closeCart,

removeItem,

updateQuantity,

getTotal,

applyCoupon,

removeCoupon,

appliedCoupon,

discount,

getFinalTotal,

}=useCartStore();





const total=getTotal();

const finalTotal=getFinalTotal();







/*
 Mobile body scroll lock
*/

useEffect(()=>{


if(isCartOpen){


document.body.style.overflow="hidden";

document.body.style.position="fixed";

document.body.style.width="100%";


}

else{


document.body.style.overflow="";

document.body.style.position="";

document.body.style.width="";


}



return ()=>{


document.body.style.overflow="";

document.body.style.position="";

document.body.style.width="";


};


},[isCartOpen]);







const {
bestCoupon
}=useBestCoupon(total);






const {

couponErrorMessage

}=useCartStore();






const {

unlockCoupon,

remainingAmount

}=useUnlockCoupon(total);







const [

couponCode,

setCouponCode

]=useState("");





const [

couponLoading,

setCouponLoading

]=useState(false);





const [

couponMessage,

setCouponMessage

]=useState("");





const [

couponError,

setCouponError

]=useState("");





const [

showCoupons,

setShowCoupons

]=useState(false);





const [

checkoutOpen,

setCheckoutOpen

]=useState(false);







const remaining=Math.max(

FREE_GIFT_AMOUNT-total,

0

);







const progress=Math.min(

(total/FREE_GIFT_AMOUNT)*100,

100

);


const handleApplyCoupon = async()=>{


if(!couponCode.trim())

return;



try{


setCouponLoading(true);

setCouponError("");

setCouponMessage("");




const result = await validateCoupon(

couponCode,

total

);





applyCoupon({

id:result.coupon.id,

code:result.coupon.code,

title:result.coupon.title,

discount:result.discount,

freeShipping:result.freeShipping,

freeGift:result.freeGift,

minimumOrderAmount:
result.coupon.minimum_order_amount

});







setCouponMessage(

result.freeShipping

?

"🎉 Free shipping coupon applied!"

:

result.freeGift

?

"🎁 Free gift coupon applied!"

:

`Coupon applied! You saved ₹${result.discount}`

);



}

catch(error:any){


setCouponError(

error.message || "Invalid coupon"

);


}

finally{


setCouponLoading(false);


}


};









return (

<>





{/* Overlay */}

<div

onClick={closeCart}

className={`

fixed

inset-0

z-[999]

bg-black/40

transition-opacity

duration-300


${

isCartOpen

?

"opacity-100"

:

"pointer-events-none opacity-0"

}

`}

/>









{/* Drawer */}

<div

className={`

fixed

right-0

top-0

z-[1000]

flex

h-[100dvh]

w-full

max-w-md

flex-col

bg-white

text-black

shadow-2xl


transition-transform

duration-300

ease-in-out


${

isCartOpen

?

"translate-x-0"

:

"translate-x-full"

}

`}

>









{/* Header */}

<div

className="

flex

h-[76px]

shrink-0

items-center

justify-between

border-b

bg-white

px-4

pt-[env(safe-area-inset-top)]

"

>





<h2

className="

text-lg

font-semibold

"

>

Your Cart ({items.length})

</h2>







<button

onClick={closeCart}

className="

flex

h-10

w-10

items-center

justify-center

rounded-full

transition

hover:bg-neutral-100

"

>

<X size={22}/>

</button>







</div>









{/* Scroll Content */}

<div

className="

flex-1

overflow-y-auto

overscroll-contain

px-4

pb-5

pt-5

"

>










{

items.length > 0 && (

<>

{/* Offer Banner */}

<div

className="

rounded-2xl

bg-black

px-4

py-4

text-center

text-sm

font-semibold

text-white

"

>

✨ Buy 4 at ₹2999 | Use Code : MONSOON4

</div>









{/* Free Gift Progress */}

<div

className="

mt-6

"

>


<p

className="

text-sm

font-medium

"

>

{

remaining > 0

?

`Add ₹${remaining} more to unlock Free Gift`

:

"🎁 Free Gift unlocked"

}

</p>







{

remaining > 0 &&

<div

className="

mt-3

h-2

overflow-hidden

rounded-full

bg-neutral-200

"

>

<div

className="

h-full

bg-black

transition-all

"

style={{

width:`${progress}%`

}}

/>

</div>

}



</div>






</>

)

}









{/* Empty Cart */}

{

items.length===0

?

<div

className="

mt-10

rounded-3xl

border

border-neutral-200

bg-neutral-50

px-5

py-10

text-center

"

>


<div

className="

mx-auto

flex

h-16

w-16

items-center

justify-center

rounded-full

bg-white

text-3xl

shadow-sm

"

>

🛍️

</div>







<h3

className="

mt-5

text-lg

font-semibold

"

>

Your cart is empty

</h3>







<p

className="

mt-2

text-sm

leading-relaxed

text-neutral-500

"

>

Looks like you haven't added anything yet.

Explore our jewellery collection and find your perfect piece.

</p>







<button

onClick={closeCart}

className="

mt-5

rounded-xl

bg-black

px-6

py-3

text-sm

font-medium

text-white

"

>

Continue Shopping

</button>







</div>





:

<div

className="

mt-6

space-y-3

"

>









{

items.map(item=>(


<div

key={item.id}

className="

rounded-2xl

border

border-neutral-200

p-3

sm:p-4

"

>







<div

className="

flex

gap-3

"

>






<img

src={item.image}

alt={item.name}

className="

h-20

w-20

shrink-0

rounded-xl

object-cover

sm:h-24

sm:w-24

"

/>








<div

className="

min-w-0

flex-1

"

>





<div

className="

flex

justify-between

gap-2

"

>


<p

className="

line-clamp-2

text-sm

font-medium

leading-tight

"

>

{item.name}

</p>






<span

className="

shrink-0

text-sm

font-semibold

"

>

₹{item.price}

</span>



</div>









<div

className="

mt-4

flex

items-center

gap-2

"

>





<button

disabled={item.quantity===1}

onClick={()=>updateQuantity(

item.id,

item.quantity-1

)}

className={`

flex

h-8

w-8

items-center

justify-center

rounded-lg

border


${

item.quantity===1

?

"cursor-not-allowed opacity-40"

:

"hover:bg-neutral-100"

}

`}

>

<Minus size={14}/>

</button>







<span

className="

min-w-5

text-center

text-sm

font-medium

"

>

{item.quantity}

</span>







<button

onClick={()=>updateQuantity(

item.id,

item.quantity+1

)}

className="

flex

h-8

w-8

items-center

justify-center

rounded-lg

border

hover:bg-neutral-100

"

>

<Plus size={14}/>

</button>







<button

onClick={()=>removeItem(item.id)}

className="

ml-auto

rounded-lg

p-1

text-red-500

hover:bg-red-50

"

>

<Trash2 size={17}/>

</button>






</div>







</div>







</div>







</div>





))

}







</div>

}









{

items.length > 0 &&

<>

{/* Best Coupon */}

{

bestCoupon && !appliedCoupon &&

<div

className="

mt-6

rounded-2xl

bg-green-50

p-4

"

>


<p

className="

font-medium

"

>

🎉 Best offer available

</p>






<p

className="

mt-1

text-sm

text-neutral-600

"

>

Use {bestCoupon.code}

and save ₹{bestCoupon.estimatedSaving}

</p>







<button

onClick={async()=>{


const result = await validateCoupon(

bestCoupon.code,

total

);



applyCoupon({

id:result.coupon.id,

code:result.coupon.code,

title:result.coupon.title,

discount:result.discount,

freeShipping:result.freeShipping,

freeGift:result.freeGift,

minimumOrderAmount:
result.coupon.minimum_order_amount

});


}}

className="

mt-3

rounded-xl

bg-black

px-4

py-2

text-sm

text-white

"

>

Apply

</button>






</div>

}









{

unlockCoupon && !appliedCoupon &&

<div

className="

mt-5

rounded-2xl

bg-yellow-50

p-4

"

>


<p

className="

font-medium

"

>

🎁 Unlock {unlockCoupon.code}

</p>






<p

className="

mt-1

text-sm

text-neutral-700

"

>

Add ₹{remainingAmount} more to get this offer

</p>







<button

onClick={()=>setShowCoupons(true)}

className="

mt-3

text-sm

font-semibold

"

>

View Offer →

</button>







</div>

}










{/* Coupon Box */}

<div

className="

mt-6

rounded-2xl

border

border-neutral-200

p-4

"

>





{

appliedCoupon

?

<div

className="

flex

items-start

justify-between

gap-3

rounded-xl

border

border-green-200

bg-green-50

p-3

"

>


<div>


<p

className="

font-medium

"

>

✓ {appliedCoupon.code}

</p>






<p

className="

mt-1

text-sm

text-green-700

"

>

{

appliedCoupon.freeShipping

?

"🎉 Free shipping unlocked"

:

appliedCoupon.freeGift

?

"🎁 Free gift unlocked"

:

`You saved ₹${discount}`

}

</p>







</div>







<button

onClick={()=>{

removeCoupon();

setCouponCode("");

setCouponMessage("");

setCouponError("");

}}

className="

text-sm

text-red-500

"

>

Remove

</button>








</div>







:

<>

<div

className="

flex

gap-2

"

>


<input

value={couponCode}

onChange={(e)=>setCouponCode(e.target.value)}

placeholder="Enter Coupon Code"

className="

min-w-0

flex-1

rounded-xl

border

px-3

py-3

text-sm

outline-none

focus:border-black

"

/>







<button

onClick={handleApplyCoupon}

disabled={couponLoading}

className="

rounded-xl

bg-black

px-4

text-sm

text-white

disabled:opacity-50

"

>

{

couponLoading

?

"..."

:

"Apply"

}

</button>







</div>







<button

onClick={()=>setShowCoupons(true)}

className="

mt-4

w-full

text-sm

font-medium

"

>

View All Offers →

</button>





</>

}









{

couponMessage &&

<p

className="

mt-3

text-sm

text-green-600

"

>

{couponMessage}

</p>

}







{

couponErrorMessage &&

<p

className="

mt-3

text-sm

text-red-500

"

>

{couponErrorMessage}

</p>

}







{

couponError &&

<p

className="

mt-3

text-sm

text-red-500

"

>

{couponError}

</p>

}





</div>









</>

}









</div>









{/* Fixed Footer */}

<div

className="

shrink-0

border-t

bg-white

px-4

pb-[env(safe-area-inset-bottom)]

pt-4

"

>








{

items.length > 0

?

<>

<div

className="

space-y-3

text-sm

"

>





<div

className="

flex

justify-between

"

>

<span>

Subtotal

</span>



<span>

₹{total.toFixed(2)}

</span>


</div>









{

appliedCoupon &&

<div

className="

flex

justify-between

text-green-600

"

>


<span>

Coupon ({appliedCoupon.code})

</span>





<span>

-₹{discount.toFixed(2)}

</span>




</div>

}







<div

className="

flex

justify-between

text-neutral-600

"

>


<span>

Shipping

</span>




<span>

{

appliedCoupon?.freeShipping

?

"FREE"

:

"Calculated at checkout"

}

</span>



</div>









<div

className="

border-t

pt-3

flex

justify-between

text-lg

font-bold

"

>

<span>

Estimated Total

</span>




<span>

₹{finalTotal.toFixed(2)}

</span>




</div>





</div>









<button

onClick={()=>setCheckoutOpen(true)}

className="

mt-4

flex

w-full

items-center

justify-center

rounded-xl

bg-black

py-3.5

text-sm

font-semibold

text-white

transition

active:scale-[0.98]

hover:bg-neutral-800

"

>

Continue To Checkout

</button>







<p

className="

mt-2

text-center

text-xs

text-neutral-500

"

>

⚡ Dispatched in 1 day

</p>





</>



:

<div

className="

text-center

"

>

<p

className="

text-sm

text-neutral-500

"

>

Add jewellery pieces to continue shopping

</p>







<button

onClick={closeCart}

className="

mt-4

w-full

rounded-xl

bg-black

py-3.5

text-sm

font-semibold

text-white

"

>

Start Shopping

</button>





</div>

}







</div>


</div>






<CouponModal

open={showCoupons}

onClose={()=>setShowCoupons(false)}

cartTotal={total}

appliedCoupon={appliedCoupon}

onApply={async(coupon)=>{


try{


setCouponLoading(true);

setCouponError("");

setCouponMessage("");






const result = await validateCoupon(

coupon.code,

total

);







applyCoupon({

id:result.coupon.id,

code:result.coupon.code,

title:result.coupon.title,

discount:result.discount,

freeShipping:result.freeShipping,

freeGift:result.freeGift,

minimumOrderAmount:
result.coupon.minimum_order_amount

});







setCouponMessage(

result.freeShipping

?

"🎉 Free shipping coupon applied!"

:

result.freeGift

?

"🎁 Free gift coupon applied!"

:

`Coupon applied! You saved ₹${result.discount}`

);






setShowCoupons(false);



}

catch(error:any){


setCouponError(

error.message || "Invalid coupon"

);



}

finally{


setCouponLoading(false);


}



}}

/>









<CheckoutDialog

open={checkoutOpen}

onClose={()=>setCheckoutOpen(false)}

/>







</>

);

}