import {
  Heart,
  ShoppingBag,
  CheckCircle2,
  Sparkles
} from "lucide-react";

import DeliveryChecker from "./DeliveryChecker";


interface ProductActionsProps {

  product:any;

}





export default function ProductActions({

product

}:ProductActionsProps){





const isOutOfStock =
product.stock <= 0;






return (

<div

className="
mt-6

w-full

"

>







{/* Stock Status */}

{

!isOutOfStock &&

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

size={18}

/>


<span>

Ready to ship

</span>


</div>

}






{

isOutOfStock &&

<div

className="
text-sm

text-red-400

"

>

✕ Out of stock

</div>

}









{/* Variants */}

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

border-[#D4AF37]/50

transition-transform

duration-200

hover:scale-105

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









{/* Reward Points */}

<div

className="
mt-6

flex

items-center

gap-2

rounded-xl

border

border-[#D4AF37]/20

bg-[#D4AF37]/5

px-4

py-3

text-sm

text-[#F7E3A3]

"

>


<Sparkles

size={16}

/>


<span>

Earn {product.price} T&M Reward Points

</span>


</div>









{/* Main Actions */}

<div

className="
mt-6

flex

gap-3

"

>






<button

disabled={isOutOfStock}

className="

flex-1

flex

items-center

justify-center

gap-2


rounded-xl

bg-[#D4AF37]

py-4

text-sm

font-semibold

text-black


transition-colors

duration-200


hover:bg-[#e5c45a]


disabled:cursor-not-allowed

disabled:opacity-50

"

>


<ShoppingBag

size={18}

/>


{

isOutOfStock

?

"OUT OF STOCK"

:

"ADD TO CART"

}


</button>








<button

className="

flex

h-14

w-14

items-center

justify-center


rounded-xl

border

border-neutral-700

text-white


transition-colors

duration-200


hover:border-[#D4AF37]

hover:text-[#D4AF37]

"

>


<Heart

size={22}

/>


</button>



</div>









{/* Buy Now */}

<button

disabled={isOutOfStock}

className="

mt-3

w-full


rounded-xl

bg-white

py-4


text-sm

font-semibold

text-black


transition-colors

duration-200


hover:bg-[#D4AF37]


disabled:opacity-50

"

>

BUY IT NOW

</button>









{/* Delivery */}

<DeliveryChecker

product={product}

/>







</div>

);

}