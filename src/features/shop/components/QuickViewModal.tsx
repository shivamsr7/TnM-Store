import { useEffect, useState } from "react";
import { X, Star } from "lucide-react";

import type { Product } from "@/features/products/types/product.types";


interface QuickViewModalProps {

  product: Product & {

    product_images?: {

      image_url: string;

      sort_order: number;

    }[];

  };

  open: boolean;

  onClose: () => void;

}



export default function QuickViewModal({

product,

open,

onClose,

}: QuickViewModalProps) {


const [show, setShow] = useState(false);



useEffect(() => {


if(open){

document.body.style.overflow = "hidden";

requestAnimationFrame(()=>{

setShow(true);

});


}
else{

setShow(false);

document.body.style.overflow = "";

}



return () => {

document.body.style.overflow = "";

};


},[open]);





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

overflow-hidden

"

onClick={onClose}

>




<div

onClick={(e)=>e.stopPropagation()}

className={`
relative

w-full

rounded-t-3xl

bg-[#0b0b0b]

p-5


/* Mobile animation */

transition-transform

duration-300

ease-out


${
show
?
"translate-y-0"
:
"translate-y-full"
}



/* Desktop */

sm:max-w-4xl

sm:h-[520px]

sm:rounded-3xl

sm:p-8

sm:flex

sm:gap-8

sm:items-center


sm:translate-y-0

sm:transition-none

`}

>





{/* Close Button */}

<button

onClick={onClose}

className="
absolute

right-4

top-4

z-30

flex

h-8

w-8

items-center

justify-center

rounded-full

bg-white/10

text-white

transition

hover:bg-[#D4AF37]

hover:text-black

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


sm:h-full

sm:w-1/2

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

<div

className="
mt-5

sm:mt-0

sm:flex-1

sm:flex

sm:flex-col

sm:justify-center

"

>


<h2

className="
text-xl

font-semibold

text-[#F7E3A3]

sm:text-2xl

"

>

{product.name}

</h2>







{

product.rating > 0 &&

<div

className="
mt-3

flex

items-center

gap-1

text-sm

text-[#D4AF37]

"

>

<Star

size={15}

fill="currentColor"

/>

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
mt-6

w-full

rounded-full

bg-white

py-3

text-sm

font-medium

text-black

transition

hover:bg-[#D4AF37]

"

>

Add To Cart

</button>







<a

href={`/product/${product.slug}`}

className="
mt-4

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


</div>

);

}