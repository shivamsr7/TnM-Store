import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Coins,
} from "lucide-react";

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



const [show,setShow] = useState(false);

const [activeImage,setActiveImage] = useState(0);

const [imageChanging,setImageChanging] = useState(false);





useEffect(()=>{


if(open){

document.body.style.overflow="hidden";


requestAnimationFrame(()=>{

setShow(true);

});


}

else{

setShow(false);

document.body.style.overflow="";

}



return ()=>{

document.body.style.overflow="";

};


},[open]);






if(!open)
return null;





const images =

product.product_images

?.sort(

(a,b)=>a.sort_order-b.sort_order

)

.map(

(item)=>item.image_url

)

|| [];






const discount =

product.compare_price

?

Math.round(

((product.compare_price-product.price)

/

product.compare_price)

*100

)

:

0;





const changeImage=(index:number)=>{


setImageChanging(true);


setTimeout(()=>{

setActiveImage(index);

setImageChanging(false);

},150);


};






const nextImage=()=>{


if(images.length <= 1)
return;


changeImage(

activeImage === images.length-1

?

0

:

activeImage+1

);


};





const previousImage=()=>{


if(images.length <= 1)
return;


changeImage(

activeImage === 0

?

images.length-1

:

activeImage-1

);


};







const content = (


<div

className="
fixed
inset-0
z-[999]

flex
items-end
sm:items-center
justify-center

bg-black/70

backdrop-blur-sm

"

onClick={onClose}

>



<div

onClick={(e)=>e.stopPropagation()}

className={`

relative

w-full

max-h-[90vh]

overflow-y-auto


rounded-t-3xl

bg-[#0b0b0b]

p-5


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



sm:max-w-5xl

sm:h-[600px]

sm:rounded-3xl

sm:p-8

sm:flex

sm:gap-8

sm:items-center

sm:translate-y-0


`}

>






<button

onClick={onClose}

className="
absolute

right-4

top-4

z-20

flex

h-9

w-9

items-center

justify-center

rounded-full

bg-white/10

text-white

hover:bg-[#D4AF37]

hover:text-black

transition

"

>

<X size={18}/>

</button>









{/* IMAGE GALLERY */}


<div

className="
relative

aspect-square

rounded-2xl

overflow-hidden

bg-neutral-900


sm:w-1/2

"

>


{

images.length > 0 &&

<img

src={images[activeImage]}

alt={product.name}

className={`

h-full

w-full

object-cover

transition-all

duration-300


${

imageChanging

?

"opacity-0 scale-95"

:

"opacity-100 scale-100"

}

`}

/>

}





{

images.length > 1 &&

<>

<button

onClick={previousImage}

className="
absolute

left-3

top-1/2

-translate-y-1/2

flex

h-8

w-8

items-center

justify-center

rounded-full

bg-black/50

text-white

hover:bg-[#D4AF37]

hover:text-black

"

>

<ChevronLeft size={16}/>

</button>





<button

onClick={nextImage}

className="
absolute

right-3

top-1/2

-translate-y-1/2

flex

h-8

w-8

items-center

justify-center

rounded-full

bg-black/50

text-white

hover:bg-[#D4AF37]

hover:text-black

"

>

<ChevronRight size={16}/>

</button>


</>

}



{/* Image dots */}

{

images.length > 1 &&

<div

className="
absolute

bottom-4

left-0

right-0

flex

justify-center

gap-2

"

>

{

images.map((_,index)=>(

<button

key={index}

onClick={()=>changeImage(index)}

className={`

h-2

w-2

rounded-full


${

activeImage===index

?

"bg-[#D4AF37]"

:

"bg-white/50"

}

`}

/>

))

}


</div>

}


</div>









{/* DETAILS */}


<div

className="
mt-6

sm:mt-0

sm:flex-1

"

>



<h2

className="
text-2xl

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
mt-3

flex

items-center

gap-2

text-sm

text-[#D4AF37]

"

>

<Star

size={15}

fill="currentColor"

/>

{product.rating}


{

product.review_count > 0 &&

<span className="text-neutral-400">

({product.review_count})

</span>

}

</div>

}







<div

className="
mt-4

flex

items-center

gap-3

"

>

<span

className="
text-2xl

font-bold

text-white

"

>

₹{product.price}

</span>



{

product.compare_price &&

<span

className="
text-sm

text-neutral-500

line-through

"

>

₹{product.compare_price}

</span>

}



{

discount > 0 &&

<span

className="
text-xs

font-medium

text-[#D4AF37]

"

>

{discount}% OFF

</span>

}



</div>








{/* Rewards */}

<div

className="
mt-4

flex

items-center

gap-2

text-sm

text-yellow-400

"

>

<Coins size={16}/>

<span>

+{product.price} Reward Points

</span>


</div>








{

product.short_description &&

<p

className="
mt-5

text-sm

leading-6

text-neutral-300

"

>

{product.short_description}

</p>

}









{

product.care_instructions &&

<div

className="
mt-5

"

>

<h4

className="
text-sm

font-medium

text-[#D4AF37]

"

>

Care Instructions

</h4>


<p

className="
mt-2

text-sm

text-neutral-400

leading-6

"

>

{product.care_instructions}

</p>


</div>

}







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

hover:bg-[#D4AF37]

transition

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





return createPortal(

content,

document.body

);


}