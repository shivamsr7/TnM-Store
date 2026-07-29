import { X, Star } from "lucide-react";

import type { Product } from "@/features/products/types/product.types";


interface QuickViewModalProps {

  product: Product & {

    product_images?: {

      image_url:string;

      sort_order:number;

    }[];

  };

  open:boolean;

  onClose:()=>void;

}



export default function QuickViewModal({

product,

open,

onClose,

}:QuickViewModalProps){



if(!open)
return null;



const image =
product.product_images
?.sort(
(a,b)=>a.sort_order-b.sort_order
)
[0]
?.image_url;





return (

<div

className="
fixed
inset-0
z-50

flex
items-end
sm:items-center
justify-center

bg-black/60
backdrop-blur-sm

"

onClick={onClose}

>



<div

className="
relative

w-full

rounded-t-3xl

bg-[#0b0b0b]

p-5

sm:max-w-md

sm:rounded-3xl

"

onClick={(e)=>e.stopPropagation()}

>



<button

onClick={onClose}

className="
absolute
right-4
top-4

flex
h-8
w-8

items-center
justify-center

rounded-full

bg-white/10

text-white

"

>

<X size={18}/>

</button>








{/* Image */}

<div

className="
aspect-square

overflow-hidden

rounded-2xl

bg-neutral-900

"

>

{

image &&

<img

src={image}

alt={product.name}

className="
h-full
w-full
object-cover
"

/>

}

</div>









{/* Details */}

<h2

className="
mt-5

text-xl

font-semibold

text-[#F7E3A3]

"

>

{product.name}

</h2>






{

product.rating > 0 &&

<div

className="
mt-2

flex

items-center

gap-1

text-sm

text-[#D4AF37]

"

>

<Star size={15} fill="currentColor"/>

{product.rating}

</div>

}







<div

className="
mt-3

text-2xl

font-bold

text-white

"

>

₹{product.price}

</div>









<button

className="
mt-5

w-full

rounded-full

bg-white

py-3

text-sm

font-medium

text-black

hover:bg-[#D4AF37]

transition

"

>

Add To Cart

</button>





<a

href={`/product/${product.slug}`}

className="
mt-3

block

text-center

text-sm

text-[#D4AF37]

"

>

View Full Details →

</a>





</div>


</div>

);

}