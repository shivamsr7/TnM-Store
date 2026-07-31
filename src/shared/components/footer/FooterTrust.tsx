import {
  ShieldCheck,
  Sparkles,
  Heart,
  Globe,
} from "lucide-react";


const trustItems = [

{
icon:ShieldCheck,
title:"ANTI-TARNISH",
description:"Long-lasting shine, made for everyday."
},

{
icon:Sparkles,
title:"PREMIUM QUALITY",
description:"Finest materials crafted to perfection."
},

{
icon:Heart,
title:"CRAFTED WITH LOVE",
description:"Thoughtfully designed for you."
},

{
icon:Globe,
title:"WORLDWIDE SHIPPING",
description:"Delivering happiness to your doorstep."
}

];



export default function FooterTrust(){


return (

<section

className="
border-t

border-[#C8A44D]/30

bg-[#080808]

px-4

py-5

md:py-10

"

>


<div

className="
mx-auto

grid

max-w-7xl

grid-cols-4

gap-2

md:gap-8

"

>


{

trustItems.map((item)=>{


const Icon=item.icon;


return (

<div

key={item.title}

className="
flex

flex-col

items-center

text-center

md:border-r

md:border-[#C8A44D]/20

last:border-none

"

>


<Icon

size={20}

className="
mb-2

text-[#C8A44D]

md:h-8

md:w-8

md:mb-4

"

/>




<h4

className="
text-[8px]

font-medium

tracking-wider

text-[#C8A44D]

md:text-sm

md:tracking-widest

"

>

{item.title}

</h4>





<p

className="
hidden

md:block

mt-2

text-xs

leading-relaxed

text-neutral-400

"

>

{item.description}

</p>



</div>


)


})

}


</div>


</section>

);

}