import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import { useCategories } from "../hooks/useCategories";


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
bg-black

px-5
pb-16
pt-16

md:px-10
"

>





{/* Heading */}

<div

className="
mb-12
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
mt-3
text-neutral-400

md:text-base

"

>

Discover jewellery crafted to make every moment special

</p>



</div>







{/* Category Circles */}

<div

className="
mx-auto

grid

w-full

max-w-7xl

grid-cols-3

gap-x-4

gap-y-10


md:flex

md:justify-between

md:gap-3

"

>


{

displayCategories.map(

(category,index)=>(


<motion.div

key={category.id}

animate={{

y:

typeof window !== "undefined" && window.innerWidth < 768

?

[0,-8,0]

:

0

}}

transition={{

duration:4,

repeat:

typeof window !== "undefined" && window.innerWidth < 768

?

Infinity

:

0,

ease:"easeInOut",

delay:index * 0.3

}}

className="
flex

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

h-28

w-28

overflow-hidden

rounded-full

border

border-[#C8A44D]/60

transition-all

duration-500

group-hover:scale-105

group-hover:border-[#C8A44D]


md:h-[clamp(80px,12vw,150px)]

md:w-[clamp(80px,12vw,150px)]

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


</motion.div>


))

}



</div>







</section>

);

}