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
description:"Long-lasting shine"
},

{
icon:Sparkles,
title:"PREMIUM QUALITY",
description:"Crafted with care"
},

{
icon:Heart,
title:"CRAFTED WITH LOVE",
description:"Designed for you"
},

{
icon:Globe,
title:"WORLDWIDE SHIPPING",
description:"Delivered worldwide"
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

"

>


<div

className="
mx-auto

flex

max-w-7xl

gap-5

overflow-x-auto

scrollbar-hide

md:grid

md:grid-cols-4

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

min-w-max

items-center

gap-2

border-r

border-[#C8A44D]/20

pr-5

last:border-none

md:block

md:min-w-0

md:pr-0

md:text-center

"

>


<Icon

size={20}

className="
shrink-0

text-[#C8A44D]

md:mx-auto

md:mb-2

"

/>




<div>


<h4

className="
text-[10px]

font-medium

tracking-widest

text-[#C8A44D]

"

>

{item.title}

</h4>




<p

className="
hidden

mt-1

text-[11px]

text-neutral-500

md:block

"

>

{item.description}

</p>


</div>



</div>


)


})

}


</div>


</section>

);

}