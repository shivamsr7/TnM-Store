import {
  Heart,
  ShoppingBag,
  CheckCircle2,
  MapPin
} from "lucide-react";

import { useEffect, useState } from "react";


interface ProductActionsProps {

  product:any;

}



export default function ProductActions({

product

}:ProductActionsProps){

const [cartAttention,setCartAttention] = useState(false);
const [wishlistAttention,setWishlistAttention] = useState(false);



useEffect(()=>{


const interval = setInterval(()=>{


setCartAttention(true);


setTimeout(()=>{

setWishlistAttention(true);

},300);



setTimeout(()=>{

setCartAttention(false);

setWishlistAttention(false);

},900);



},4000);



return ()=>clearInterval(interval);


},[]);

return (

<div

className="
w-full

mt-6

"

>





{/* Stock Status */}

{

product.stock > 0 &&

<div

className="
flex

items-center

gap-2

text-sm

text-green-400

"

>

<CheckCircle2

size={20}

/>


<span>

In stock - ready to ship

</span>


</div>

}





{

product.stock <= 0 &&

<div

className="
flex

items-center

gap-2

text-sm

text-red-400

"

>

<span>

✕ Out of stock

</span>

</div>

}









{/* Variants Placeholder */}

{

product.variants &&

product.variants.length > 0 &&

<div

className="
mt-6

"

>


<p

className="
mb-3

text-sm

font-medium

text-white

"

>

Color

</p>


<div

className="
flex

gap-3

"

>

{

product.variants.map(

(variant:any)=>(

<button

key={variant.id}

className="
h-10

w-10

rounded-full

border

border-[#D4AF37]

"

style={{

backgroundColor:
variant.color

}}

/>

)

)

}


</div>


</div>

}









{/* Add To Cart + Wishlist */}

<div

className="
mt-8

flex

gap-3

"

>



<button

className={`

flex-1

flex

items-center

justify-center

gap-2


rounded-none

bg-[#D4AF37]

py-4

text-sm

font-medium

text-black


transition-all

duration-150

hover:bg-[#e5c45a]


${

cartAttention

?

"animate-cart-hit"

:

""

}

`}

>

<ShoppingBag size={18}/>

ADD TO CART

</button>







<button

className={`

flex

h-14

w-14

items-center

justify-center


border

border-neutral-600

text-white


transition-all

duration-150


hover:border-[#D4AF37]

hover:text-[#D4AF37]


${

wishlistAttention

?

"scale-110 border-[#D4AF37] text-[#D4AF37]"

:

"scale-100"

}

`}

>

<Heart size={22}/>

</button>



</div>








{/* Buy Now */}

<button

className="
mt-3

w-full

rounded-none

bg-white

py-4

text-sm

font-medium

text-black


transition

hover:bg-[#D4AF37]

"

>

BUY IT NOW

</button>









{/* Delivery Checker */}

<div

className="
mt-8

border-t

border-neutral-800

pt-6

"

>


<div

className="
flex

items-center

justify-between

"

>


<h3

className="
text-base

font-semibold

text-white

"

>

Deliver To

</h3>


<button

className="
text-sm

text-[#D4AF37]

"

>

Change

</button>


</div>







<div

className="
mt-4

flex

items-center

gap-2

rounded-xl

border

border-neutral-700

px-4

py-4

text-sm

text-neutral-400

"

>

<MapPin size={18}/>


<span>

Enter your pincode to check delivery date

</span>


</div>



</div>







</div>

);

}