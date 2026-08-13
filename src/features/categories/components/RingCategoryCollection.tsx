import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import {
  useCategories,
} from "../hooks/useCategories";



export default function RingCategoryCollection(){


const {
  data:categories,
  isLoading,
}=useCategories();



if(isLoading || !categories?.length){

return null;

}



const items = categories.slice(0,6);






return (

<section

className="
bg-white
px-5
py-20

md:px-10
"

>


{/* Heading */}

<div

className="
mb-16
text-center
"

>

<div

className="
mb-3
flex
justify-center
"

>

<Sparkles

size={22}

className="
text-[#C8A44D]
animate-pulse
"

/>

</div>



<h2

className="
text-3xl
font-semibold

md:text-5xl
"

>

<span

className="
bg-gradient-to-r
from-[#b8860b]
via-[#f5d77a]
to-[#b8860b]

bg-[length:200%_auto]

bg-clip-text
text-transparent

animate-[shimmer_3s_linear_infinite]

"

>

Find Your Signature Style

</span>


✨

</h2>



<p

className="
mt-4
text-neutral-600
"

>

Explore jewellery crafted to make every moment special

</p>


</div>









{/* Ring Layout */}

<div

className="
relative
mx-auto

h-[520px]
w-[520px]

max-w-full

"

>





{/* Default Ring Avatar */}

<div

className="
absolute
left-1/2
top-1/2

flex

h-56
w-56

-translate-x-1/2
-translate-y-1/2

items-center
justify-center


rounded-full

border-[3px]

border-[#C8A44D]

shadow-[0_0_45px_rgba(200,164,77,0.35)]

"

>



<div

className="
flex
h-40
w-40

items-center
justify-center

rounded-full

border

border-[#C8A44D]/40

text-center

"

>


<p

className="
text-xl
font-semibold
tracking-widest
text-[#b8860b]
"

>

T&M

<br/>

JEWELS

</p>



</div>



</div>









{/* Categories */}

{

items.map((category,index)=>(


<motion.div

key={category.id}

animate={{

y:[0,-6,0]

}}

transition={{

duration:4,

repeat:Infinity,

delay:index*0.3

}}

className={

`
absolute

${

index===0
?
"left-[8%] top-[28%]"
:
index===1
?
"right-[8%] top-[28%]"
:
index===2
?
"left-[2%] bottom-[30%]"
:
index===3
?
"right-[2%] bottom-[30%]"
:
index===4
?
"left-1/2 bottom-[8%] -translate-x-1/2"
:
"hidden"
}

`

}

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


{/* Small gold point */}

<div

className="
mb-3
h-3
w-3

rounded-full

bg-[#C8A44D]

shadow-[0_0_12px_rgba(200,164,77,0.8)]

group-hover:scale-125

transition
"

>



</div>






<span

className="
text-sm
font-medium

uppercase

tracking-wider

text-neutral-900

transition

group-hover:text-[#b8860b]

"

>

{category.name}

</span>



</Link>



</motion.div>


))

}





</div>







</section>

);

}
