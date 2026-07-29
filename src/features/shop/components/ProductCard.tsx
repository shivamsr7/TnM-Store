import { useState } from "react";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
  Coins,
} from "lucide-react";

import type { Product } from "@/features/products/types/product.types";


interface ProductCardProps {
  product: Product & {
    product_images?: {
      image_url: string;
      is_primary: boolean;
      sort_order: number;
    }[];
  };
}



export default function ProductCard({
  product,
}: ProductCardProps) {


const images =
product.product_images
?.sort(
(a,b)=>a.sort_order-b.sort_order
)
.map(
(item)=>item.image_url
) || [];




const [activeImage,setActiveImage] = useState(0);

const [hoverPreview,setHoverPreview] = useState(false);

const [imageChanging,setImageChanging] = useState(false);

const [showRewardInfo,setShowRewardInfo] = useState(false);





const displayImage =

hoverPreview &&
activeImage === 0 &&
images[1]

?

images[1]

:

images[activeImage];







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







const badge =

product.best_seller

?

"Best Seller"

:

product.new_arrival

?

"New Arrival"

:

product.trending

?

"Trending"

:

product.editors_pick

?

"Editor's Pick"

:

null;








const changeImage = (index:number)=>{

setImageChanging(true);

setTimeout(()=>{

setActiveImage(index);

setImageChanging(false);

},150);

};







const previousImage = ()=>{


if(!images.length)
return;


setHoverPreview(false);


changeImage(

activeImage===0

?

images.length-1

:

activeImage-1

);


};







const nextImage = ()=>{


if(!images.length)
return;


setHoverPreview(false);


changeImage(

activeImage===images.length-1

?

0

:

activeImage+1

);


};






const handleAddToCart =()=>{

console.log(
"Added to cart:",
product.name
);

};








return (

<div

className="
group
overflow-hidden
rounded-2xl

border-0
sm:border
sm:border-[#D4AF37]/20

bg-[#0b0b0b]

transition-all
duration-500

sm:hover:-translate-y-1
sm:hover:border-[#D4AF37]/70
"

>








{/* IMAGE */}

<div

onMouseEnter={()=>{

if(activeImage===0){

setHoverPreview(true);

}

}}

onMouseLeave={()=>{

setHoverPreview(false);

}}

className="
relative

aspect-square

overflow-hidden

bg-neutral-900

rounded-2xl

sm:aspect-[4/5]

sm:rounded-3xl

"

>



{

displayImage &&

<img

src={displayImage}

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


group-hover:scale-105

`}

/>

}








{/* Discount Badge */}

{

discount > 0 &&

<div

className="
absolute

left-3
top-3

z-20

rounded-full

bg-[#D4AF37]

px-3

py-1

text-xs

font-semibold

text-black

"

>

{discount}% OFF

</div>

}









{/* Product Badge - Desktop Only */}

{

badge &&

<div

className="
hidden

sm:block

absolute

left-4

bottom-4

z-20

rounded-full

bg-black/80

border

border-[#D4AF37]/40

px-3

py-1

text-xs

font-medium

text-[#D4AF37]

"

>

{badge}

</div>

}









{/* Arrows */}

{

images.length > 1 &&

<>

<button

onClick={previousImage}

className="
absolute

left-2
top-1/2

z-20

flex

h-7
w-7

-translate-y-1/2

items-center
justify-center

rounded-full

bg-black/50

text-white

transition

hover:bg-[#D4AF37]

hover:text-black


sm:left-3

sm:h-8
sm:w-8

"

>

<ChevronLeft size={16}/>

</button>







<button

onClick={nextImage}

className="
absolute

right-2
top-1/2

z-20

flex

h-7
w-7

-translate-y-1/2

items-center
justify-center

rounded-full

bg-black/50

text-white

transition

hover:bg-[#D4AF37]

hover:text-black


sm:right-3

sm:h-8
sm:w-8

"

>

<ChevronRight size={16}/>

</button>


</>

}


</div>
{/* DETAILS */}

<div
className="
flex
flex-col
p-3
sm:p-5
"
>





<a href={`/product/${product.slug}`}>

<h3

className="
line-clamp-2

min-h-[40px]

text-sm

font-medium

leading-5

text-[#F7E3A3]

transition

hover:text-[#D4AF37]

sm:min-h-0

sm:text-lg

"

>
{product.name}

</h3>

</a>








{/* Rating */}

{

product.rating > 0 &&

<div

className="
mt-2

flex

items-center

gap-2

text-xs

sm:mt-3

sm:text-sm

"

>

<span className="text-[#D4AF37]">

★ {product.rating}

</span>


{

product.review_count > 0 &&

<span className="text-neutral-500">

({product.review_count})

</span>

}


</div>

}








{/* Price */}

<div

className="
mt-3

flex

items-center

gap-2

sm:mt-4

sm:gap-3

"

>

<span

className="
text-lg

font-semibold

text-white

sm:text-xl

"

>

₹{product.price}

</span>



{

product.compare_price &&

<span

className="
text-xs

text-neutral-500

line-through

sm:text-sm

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









{/* Rewards - Desktop Only */}

<div

className="
hidden

sm:flex

relative

mt-3

items-center

gap-2

text-xs

text-[#D4AF37]

"

>

<div

className="
flex

items-center

gap-1

"

>

<Coins

size={15}

strokeWidth={2}

className="text-yellow-400"

/>


<span

className="
font-medium

text-yellow-400

"

>

{product.price}

</span>


</div>





<button

onClick={() =>
setShowRewardInfo(!showRewardInfo)
}

onMouseEnter={() =>
setShowRewardInfo(true)
}

onMouseLeave={() =>
setShowRewardInfo(false)
}

className="
text-neutral-400

transition

hover:text-[#D4AF37]

"

>

ⓘ

</button>







{

showRewardInfo && (

<div

className="
absolute

bottom-6

left-0

z-30

w-52

rounded-lg

border

border-[#D4AF37]/30

bg-black

px-3

py-2

text-xs

text-white

shadow-lg

"

>

Earn {product.price} Reward Points on this purchase ✨

</div>

)

}


</div>









{/* Cart + Wishlist */}

<div
className="
mt-auto
pt-4
flex
gap-2
"
>





<button

onClick={handleAddToCart}

className="
flex-1

rounded-full

bg-white

py-2

text-xs

font-medium

text-black

transition

hover:bg-[#D4AF37]


sm:py-3

sm:text-sm

"

>

Add To Cart

</button>







<button

className="
flex

h-9

w-9

items-center

justify-center

rounded-full

border

border-white/20

text-white

transition

hover:border-[#D4AF37]

hover:text-[#D4AF37]


sm:h-12

sm:w-12

"

>

<Heart size={18}/>

</button>



</div>






</div>





</div>

);

}