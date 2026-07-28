import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import logo from "@/assets/logo/mainlogo.png";


const columns = [

{
title:"SHOP",
links:[
"All Jewellery",
"Necklaces",
"Earrings",
"Rings",
"Bracelets",
"Watches",
"Collections",
"Best Sellers",
"New Arrivals"
]
},


{
title:"QUICK LINKS",
links:[
"Track Your Order",
"Shipping & Delivery",
"Returns & Exchanges",
"Size Guide",
"Jewellery Care",
"FAQs",
"Contact Us",
"About Us"
]
},


{
title:"INFORMATION",
links:[
"Our Story",
"Why Anti-Tarnish?",
"Jewellery Guide",
"Care Instructions",
"Privacy Policy",
"Terms & Conditions"
]
}

];



export default function FooterMain(){


const [open,setOpen]=useState<number | null>(null);



return (

<div

className="
mx-auto

max-w-7xl

px-5

py-14

"

>



<div

className="
grid

gap-12

md:grid-cols-5

"

>


{/* Brand */}

<div

className="
md:col-span-1

"

>


<img

src={logo}

alt="T&M Jewels"

className="
w-44

"

/>



<p

className="
mt-5

text-sm

leading-relaxed

text-neutral-400

"

>

Timeless designs.
Modern elegance.

Jewellery that celebrates you.

</p>





<div

className="
mt-6

flex

gap-3

"

>

{

["Instagram","WhatsApp","Facebook","Pinterest"].map(item=>(


<div

key={item}

className="
flex

h-9

w-9

items-center

justify-center

rounded-full

border

border-[#C8A44D]/50

text-xs

text-[#C8A44D]

transition

hover:bg-[#C8A44D]

hover:text-black

"

>

{item[0]}

</div>


))

}

</div>



</div>









{/* Desktop Columns */}

{

columns.map((column)=>(


<div

key={column.title}

className="
hidden

md:block

"

>


<h3

className="
mb-5

text-sm

font-semibold

tracking-wider

text-[#C8A44D]

"

>

{column.title}

</h3>



<ul

className="
space-y-3

text-sm

text-neutral-300

"

>

{

column.links.map(link=>(

<li

key={link}

className="
transition

hover:text-[#C8A44D]

"

>

<Link to="#">

{link}

</Link>

</li>

))

}

</ul>


</div>


))

}









{/* Newsletter Desktop */}

<div

className="
hidden

md:block

"

>


<h3

className="
text-sm

font-semibold

tracking-wider

text-[#C8A44D]

"

>

STAY SPARKLED ✨

</h3>



<p

className="
mt-5

text-sm

leading-relaxed

text-neutral-400

"

>

Be the first to know about new arrivals,
exclusive offers & member-only perks.

</p>




<div

className="
mt-5

flex

border

border-[#C8A44D]/40

"

>

<input

placeholder="Enter your email"

className="
w-full

bg-transparent

px-4

text-sm

outline-none

"

/>


<button

className="
bg-[#C8A44D]

px-5

text-black

"

>

→

</button>


</div>


</div>







{/* Mobile Accordion */}

<div

className="
md:hidden

"

>

{

columns.map((column,index)=>(


<div

key={column.title}

className="
border-b

border-white/10

"

>


<button

onClick={()=>setOpen(

open===index ? null : index

)}

className="
flex

w-full

items-center

justify-between

py-5

text-sm

font-semibold

tracking-wider

text-[#C8A44D]

"

>

{column.title}


<ChevronDown

size={18}

className={

open===index

?

"rotate-180 transition"

:

"transition"

}

/>


</button>





{

open===index && (

<ul

className="
space-y-3

pb-5

text-sm

text-neutral-300

"

>

{

column.links.map(link=>(


<li key={link}>

<Link to="#">

{link}

</Link>

</li>


))

}


</ul>

)

}



</div>


))

}



</div>

{/* Mobile Newsletter */}

<div

className="
mt-8
md:hidden

"

>


<h3

className="
text-sm

font-semibold

tracking-wider

text-[#C8A44D]

"

>

STAY SPARKLED ✨

</h3>



<p

className="
mt-3

text-sm

text-neutral-400

"

>

Join our community for new launches and exclusive offers.

</p>



<div

className="
mt-4

flex

border

border-[#C8A44D]/40

"

>


<input

placeholder="Enter your email"

className="
w-full

bg-transparent

px-4

text-sm

outline-none

"

/>


<button

className="
bg-[#C8A44D]

px-5

text-black

"

>

JOIN

</button>


</div>



</div>



</div>





</div>

);

}