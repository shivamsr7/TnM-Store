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
      .map((item) => item.image_url) || [];



const [activeImage, setActiveImage] = useState(0);

const [hoverPreview, setHoverPreview] = useState(false);


const [imageChanging, setImageChanging] = useState(false);

const displayImage =
  hoverPreview && activeImage === 0 && images[1]
    ? images[1]
    : images[activeImage];




  const discount =
    product.compare_price
      ? Math.round(
          ((product.compare_price - product.price) /
            product.compare_price) *
            100
        )
      : 0;




  const badge =
    product.best_seller
      ? "Best Seller"
      : product.new_arrival
      ? "New Arrival"
      : product.trending
      ? "Trending"
      : product.editors_pick
      ? "Editor's Pick"
      : null;




const previousImage = () => {

if(!images.length) return;


const newIndex =
activeImage === 0
?
images.length - 1
:
activeImage - 1;


setImageChanging(true);


setTimeout(()=>{

setActiveImage(newIndex);

setImageChanging(false);

},150);


};



 const nextImage = () => {

if(!images.length) return;


const newIndex =
activeImage === images.length - 1
?
0
:
activeImage + 1;


setImageChanging(true);


setTimeout(()=>{

setActiveImage(newIndex);

setImageChanging(false);

},150);


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
rounded-3xl
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

onMouseEnter={() => {

  if(activeImage === 0){
    setHoverPreview(true);
  }

}}

onMouseLeave={() => {

  setHoverPreview(false);

}}

className="
relative
aspect-[4/5]
overflow-hidden
bg-neutral-900
"

>


{displayImage && (

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

)}




{/* Wishlist */}

<button

className="
absolute
right-4
top-4
z-20
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-black/50
backdrop-blur-md
text-white
transition
hover:text-[#D4AF37]
"

>

<Heart size={18}/>

</button>






{/* Badge */}

{badge && (

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

)}







{/* Arrows */}

{images.length > 1 && (
  <div>

    <button
      onClick={() => {
  setHoverPreview(false);
  previousImage();
}}
      className="
      absolute
      left-3
      top-1/2
      z-20
      flex
      h-8
      w-8
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      bg-black/50
      text-white
      opacity-70
      transition
      md:opacity-0
      md:group-hover:opacity-100
      hover:bg-[#D4AF37]
      hover:text-black
      "
    >
      <ChevronLeft size={18}/>
    </button>


    <button
      onClick={() => {
  setHoverPreview(false);
  nextImage();
}}
      className="
      absolute
      right-3
      top-1/2
      z-20
      flex
      h-8
      w-8
      -translate-y-1/2
      items-center
      justify-center
      rounded-full
      bg-black/50
      text-white
      opacity-70
      transition
      md:opacity-0
      md:group-hover:opacity-100
      hover:bg-[#D4AF37]
      hover:text-black
      "
    >
      <ChevronRight size={18}/>
    </button>

  </div>
)}








</div>



{/* DETAILS */}

<div

className="
p-5
"

>


<a href={`/product/${product.slug}`}>

<h3

className="
line-clamp-2
text-lg
font-medium
text-[#F7E3A3]
transition
hover:text-[#D4AF37]
"

>

{product.name}

</h3>

</a>








{/* Rating */}

{product.rating > 0 && (

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


{product.review_count > 0 && (

<span className="text-neutral-500">

({product.review_count})

</span>

)}

</div>

)}








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
text-xl
font-semibold
text-white
"

>

₹{product.price}

</span>



{product.compare_price && (

<span

className="
text-sm
text-neutral-500
line-through
"

>

₹{product.compare_price}

</span>

)}




{discount > 0 && (

<span className="text-xs text-[#D4AF37]">

{discount}% OFF

</span>

)}

</div>







{/* Rewards */}

<p

className="
mt-3
text-xs
text-neutral-400
"

>

Earn {product.price} Reward Points ✨

</p>







{/* Cart */}

<button

onClick={handleAddToCart}

className="
mt-5
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



</div>



</div>

);

}