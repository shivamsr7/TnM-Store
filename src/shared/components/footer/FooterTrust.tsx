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
border-[#C8A44D]/40

bg-[#080808]

px-5
py-10

"

>


<div

className="
mx-auto

grid

max-w-7xl

gap-8


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
relative

text-center

md:border-r

md:border-[#C8A44D]/30

last:border-none

"

>


<Icon

size={32}

className="
mx-auto

mb-4

text-[#C8A44D]

"

/>



<h4

className="
text-sm

font-medium

tracking-wider

text-[#C8A44D]

"

>

{item.title}

</h4>



<p

className="
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