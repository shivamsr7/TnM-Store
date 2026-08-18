import { motion } from "framer-motion";
import { Link } from "react-router-dom";


const navItems = [
  {
    title: "Shop",
    links: [
      {name:"All Jewellery", path:"/shop"},
      {name:"Necklaces", path:"/category/necklaces"},
      {name:"Earrings", path:"/category/earrings"},
      {name:"Rings", path:"/category/rings"},
      {name:"Bracelets", path:"/category/bracelets"},
      {name:"Watches", path:"/category/watches"},
      {name:"Collections", path:"/collections"},
      {name:"Best Sellers", path:"/shop?filter=best-sellers"},
      {name:"New Arrivals", path:"/shop?filter=new-arrivals"},
    ]
  },
  {
    title:"Support",
    links:[
      {name:"Contact Us", path:"/contact"},
      {name:"Shipping Policy", path:"/shipping-policy"},
      {name:"Returns", path:"/return-policy"},
      {name:"FAQs", path:"/faq"},
    ]
  }
];



export default function Footer(){


return (

<footer

className="
relative
overflow-hidden

bg-black

px-6
py-16

text-white

md:px-10

"

>


{/* Animated Gold Glow */}

<motion.div

animate={{

scale:[1,1.15,1],

opacity:[0.15,0.25,0.15]

}}

transition={{

duration:8,

repeat:Infinity,

ease:"easeInOut"

}}

className="
absolute

left-1/2
top-1/2

h-[500px]
w-[500px]

-translate-x-1/2
-translate-y-1/2

rounded-full

bg-[#C8A44D]

blur-[150px]

"

/>






{/* Floating particles */}

<div className="
absolute
inset-0
pointer-events-none
">


{[1,2,3,4,5].map((item)=>(

<motion.span

key={item}

animate={{

y:[0,-40,0],

opacity:[0.3,0.8,0.3]

}}

transition={{

duration:5+item,

repeat:Infinity,

delay:item

}}

className="
absolute

h-1
w-1

rounded-full

bg-[#C8A44D]

"

style={{

left:`${15*item}%`,

top:`${20+item*10}%`

}}

/>

))}



</div>









<div

className="
relative
z-10

mx-auto

max-w-6xl

text-center

"

>





{/* Brand */}

<motion.h2

initial={{

opacity:0,
y:20

}}

whileInView={{

opacity:1,
y:0

}}

transition={{

duration:.8

}}

className="

text-3xl

font-semibold

tracking-[0.3em]

bg-gradient-to-r

from-[#b8860b]

via-[#fff1b8]

to-[#b8860b]

bg-clip-text

text-transparent

md:text-5xl

"

>

T&M JEWELS

</motion.h2>





<p

className="
mx-auto

mt-5

max-w-md

text-sm

leading-relaxed

text-neutral-400

md:text-base

"

>

Create your own style,
create your own trend.

Premium jewellery designed
for everyday elegance.

</p>








{/* Navigation */}

<div

className="
mt-12

grid

gap-10

md:grid-cols-2

"

>


{

navItems.map((section,index)=>(


<motion.div

key={section.title}

initial={{

opacity:0,
y:20

}}

whileInView={{

opacity:1,
y:0

}}

transition={{

delay:index*0.2

}}

>

<h3

className="
mb-5

text-sm

uppercase

tracking-[0.25em]

text-[#C8A44D]

"

>

{section.title}

</h3>




<div

className="
flex

flex-wrap

justify-center

gap-5

"

>

{

section.links.map(link=>(


<Link

key={link.name}

to={link.path}

className="
text-sm

text-neutral-300

transition

hover:text-[#C8A44D]

"

>

{link.name}

</Link>


))

}

</div>


</motion.div>


))

}



</div>








{/* Social */}

<div

className="
mt-12

flex

justify-center

gap-8

text-sm

text-neutral-300

"

>

<span>
Instagram
</span>

<span>
WhatsApp
</span>

<span>
Email
</span>


</div>








{/* Bottom */}

<div

className="
mt-12

border-t

border-white/10

pt-6

text-xs

tracking-wide

text-neutral-500

"

>

✦ Crafted with elegance ✦

<br/>

© {new Date().getFullYear()} T&M Jewels. All rights reserved.

</div>






</div>





</footer>

);

}