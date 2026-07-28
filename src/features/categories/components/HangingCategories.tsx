import { Link } from "react-router-dom";

import {
  useCategories,
} from "../hooks/useCategories";


export default function HangingCategories(){


const {
  data:categories,
  isLoading,
}=useCategories();




if(isLoading || !categories?.length){

return null;

}



const displayCategories =
categories.slice(0,6);





return (

<section

className="
relative
isolate
overflow-hidden

bg-gradient-to-br
from-black
via-neutral-900
to-black

px-5
pb-16
pt-8

md:px-10

"

>


{/* Luxury Gold Glow */}

<div

className="
pointer-events-none

absolute

left-1/2
top-[65%]

h-[450px]
w-[450px]

-translate-x-1/2
-translate-y-1/2

rounded-full

bg-[#C8A44D]/10

blur-[120px]

"

/>







{/* Heading */}

<div

className="
relative
z-10

mb-6

text-center

"

>


<h2

className="
text-3xl
font-semibold
tracking-wide

md:text-5xl

bg-gradient-to-r
from-[#b8860b]
via-[#f5d77a]
to-[#b8860b]

bg-clip-text
text-transparent

"

>

Explore Our Collection

</h2>




<p

className="
mt-2

text-neutral-400

md:text-base

"

>

Discover jewellery crafted to make every moment special

</p>



</div>







{/* Static Category Circles */}

<div

className="
relative
z-10

mx-auto

flex

w-full

max-w-7xl

justify-between

gap-3

overflow-hidden

"

>


{

displayCategories.map(

(category)=>(


<div

key={category.id}

className="
flex

min-w-0

flex-1

flex-col

items-center

"

>


<Link

to={`/category/${category.slug}`}

className="
group

flex

flex-col

items-center

"

>





<div

className="
relative

h-[clamp(80px,12vw,150px)]

w-[clamp(80px,12vw,150px)]

overflow-hidden

rounded-full

border

border-[#C8A44D]/60

bg-black/20

shadow-[0_0_35px_rgba(200,164,77,0.30)]

transition-all

duration-500

group-hover:scale-105

group-hover:border-[#C8A44D]

"

>


<img

src={
category.image_url ??
"/placeholder-category.png"
}

alt={category.name}

className="
h-full

w-full

object-cover

transition-transform

duration-500

group-hover:scale-110

"

/>




<div

className="
absolute

inset-0

bg-black/10

"

/>


</div>







<p

className="
mt-4

text-center

text-xs

font-medium

uppercase

tracking-wider

text-white


md:text-sm

"

>

{category.name}

</p>



</Link>



</div>


))

}



</div>







</section>

);

}