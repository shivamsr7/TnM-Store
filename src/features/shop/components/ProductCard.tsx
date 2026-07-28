import { useState } from "react";
import {
  Heart,
  ChevronLeft,
  ChevronRight,
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
        (a, b) => a.sort_order - b.sort_order
      )
      .map(
        (item) => item.image_url
      ) || [];




  const [activeImage, setActiveImage] = useState(0);

  const [hoverPreview, setHoverPreview] = useState(false);





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

        ((product.compare_price - product.price)

        /

        product.compare_price)

        *

        100

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








  const previousImage = () => {


    if(!images.length)
      return;



    setHoverPreview(false);



    setActiveImage(

      activeImage === 0

      ?

      images.length - 1

      :

      activeImage - 1

    );

  };








  const nextImage = () => {


    if(!images.length)
      return;



    setHoverPreview(false);



    setActiveImage(

      activeImage === images.length - 1

      ?

      0

      :

      activeImage + 1

    );

  };







  const handleAddToCart = () => {

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
border
border-[#D4AF37]/20
bg-[#0b0b0b]
transition-all
duration-500
hover:-translate-y-1
hover:border-[#D4AF37]/70
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
mx-auto
aspect-square
w-[85%]
overflow-hidden
rounded-full
bg-neutral-900

sm:w-full
sm:aspect-[4/5]
sm:rounded-3xl
"

>






{
displayImage &&

<img

src={displayImage}

alt={product.name}

className="
h-full
w-full
object-cover
transition-transform
duration-700
group-hover:scale-105
"

/>

}







{/* Wishlist */}

<button

className="
absolute
right-2
top-2
z-20
flex
h-8
w-8
items-center
justify-center
rounded-full
bg-black/50
backdrop-blur-md
text-white
transition
hover:text-[#D4AF37]

sm:right-4
sm:top-4
sm:h-10
sm:w-10
"

>

<Heart size={18}/>

</button>








{/* Badge */}

{

badge &&

<div

className="
absolute
left-4
top-4
rounded-full
bg-[#D4AF37]
px-3
py-1
text-xs
font-medium
uppercase
tracking-wide
text-black
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
p-3
sm:p-5
"

>



<a href={`/product/${product.slug}`}>

<h3

className="
line-clamp-2
text-sm
font-medium
text-[#F7E3A3]

sm:text-lg
hover:text-[#D4AF37]
transition
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
mt-3
flex
items-center
gap-2
text-sm
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
text-base
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
text-[#D4AF37]
"

>

{discount}% OFF

</span>

}


</div>









{/* Rewards */}

<p

className="
mt-2
text-xs
text-neutral-400
"

>

Earn {product.price} Reward Points ✨

</p>








{/* Add Cart */}

<button

onClick={handleAddToCart}

className="
mt-4
w-full
rounded-full
bg-white
py-2
text-xs
font-medium
text-black
transition

hover:bg-[#D4AF37]

sm:mt-5
sm:py-3
sm:text-sm
"

>

Add To Cart

</button>





</div>





</div>

);

}