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



// Mobile swipe close states

const [dragStart,setDragStart] = useState<number | null>(null);

const [dragY,setDragY] = useState(0);







useEffect(()=>{


if(open){

document.body.style.overflow="hidden";


setActiveImage(0);


requestAnimationFrame(()=>{

setShow(true);

});


}

else{

setShow(false);

setDragY(0);

document.body.style.overflow="";

}



return ()=>{

document.body.style.overflow="";

};


},[open]);









const handleSheetTouchStart = (

e: React.TouchEvent

)=>{


// only mobile

if(window.innerWidth >= 640)
return;



setDragStart(

e.touches[0].clientY

);


};







const handleSheetTouchMove = (

e: React.TouchEvent

)=>{


if(dragStart === null)
return;



const currentY = e.touches[0].clientY;


const distance = currentY - dragStart;



if(distance > 0){


/*
 Rubber band resistance

 Normal movement:
 1px finger = 1px sheet

 After 120px:
 movement slows down
*/


const resistance =

distance < 120

?

distance

:

120 + ((distance - 120) * 0.35);



setDragY(

Math.min(resistance,220)

);


}


};








const handleSheetTouchEnd = ()=>{


if(dragStart === null)
return;



if(dragY > 90){

onClose();

}

else{

setDragY(0);

}



setDragStart(null);


};








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

touch-none

"

onClick={onClose}

>




<div

onClick={(e)=>e.stopPropagation()}

onTouchStart={handleSheetTouchStart}

onTouchMove={(e)=>{

const target = e.target as HTMLElement;


if(
target.closest("a") ||
target.closest("button")
){

return;

}


handleSheetTouchMove(e);

}}

onTouchEnd={handleSheetTouchEnd}


style={{

transform:

dragY > 0

?

`translate3d(0, ${dragY}px, 0)`

:

undefined,


transition:

dragY === 0

?

"transform 300ms ease-out"

:

"none"

}}


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





{/* Mobile Drag Handle */}

<div

className="
absolute

top-3

left-1/2

-translate-x-1/2

h-1

w-12

rounded-full

bg-white/30

sm:hidden

"

/>
{/* Close Button */}

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

transition

hover:bg-[#D4AF37]

hover:text-black

sm:h-9

sm:w-9

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







{/* Image Dots */}

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


transition


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

max-h-[35vh]

overflow-y-auto

pr-1

sm:mt-0

sm:max-h-none

sm:overflow-visible

sm:flex-1

sm:flex

sm:flex-col

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









{/* Rating */}

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








{/* Price */}

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









{/* Short Description */}

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









{/* Care */}

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

leading-6

text-neutral-400

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

transition

hover:bg-[#D4AF37]

"

>

Add To Cart

</button>








<a

href={`/product/${product.slug}`}

onTouchStart={(e)=>{

e.stopPropagation();

}}

onClick={(e)=>{

e.stopPropagation();

}}

className="
relative

z-[100]

mt-4

block

text-center

text-sm

text-[#D4AF37]

cursor-pointer

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