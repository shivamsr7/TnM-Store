import {
  ChevronDown,
} from "lucide-react";

import {
  useMemo,
  useState,
} from "react";


interface ProductAccordionProps {

  product:any;

}




export default function ProductAccordion({

product

}:ProductAccordionProps){


const [open,setOpen] = useState<string | null>(null);




const sections = useMemo(()=>[


{
id:"description",

title:"Description",

content:

product.description ||

"Premium jewellery crafted with attention to detail and designed to elevate your everyday style."

},




{
id:"details",

title:"Product Details",

content:(

<div

className="
space-y-3

"

>


{
product.category?.name &&

<div className="flex justify-between">

<span className="text-neutral-500">
Category
</span>

<span className="text-white">
{product.category.name}
</span>

</div>

}




<div className="flex justify-between">

<span className="text-neutral-500">
Material
</span>

<span className="text-white">
{product.material || "Premium Alloy"}
</span>

</div>





<div className="flex justify-between">

<span className="text-neutral-500">
Finish
</span>

<span className="text-white">
{product.finish || "Luxury Gold Plated Look"}
</span>

</div>




{
product.weight &&

<div className="flex justify-between">

<span className="text-neutral-500">
Weight
</span>

<span className="text-white">
{product.weight} g
</span>

</div>

}



</div>

)

},




{
id:"care",

title:"Care Guide",

content:

product.care_instructions ||

"Keep away from moisture, perfume and chemicals. Store your jewellery in the provided packaging when not in use."

},





{
id:"shipping",

title:"Shipping & Returns",

content:

"Orders are carefully packed and shipped securely. Delivery timelines depend on your location. Please check our return policy for complete details."

}



],[
product
]);









return (

<div

className="
mt-8

border-t

border-[#D4AF37]/20

"

>


{

sections.map((section)=>(


<div

key={section.id}

className="
border-b

border-[#D4AF37]/20

"

>


<button

onClick={()=>


setOpen(

open === section.id

?

null

:

section.id

)

}

className="
flex

w-full

items-center

justify-between

py-5

text-left

"

>


<span

className="
text-sm

font-medium

tracking-wide

text-white

md:text-base

"

>

{section.title}

</span>





<ChevronDown

size={18}

className={`

text-[#D4AF37]

transition-transform

duration-300

ease-out


${

open===section.id

?

"rotate-180"

:

""

}

`}

/>



</button>







<div

className={`

grid

transition-[grid-template-rows]

duration-300

ease-out


${

open===section.id

?

"grid-rows-[1fr]"

:

"grid-rows-[0fr]"

}

`}

>


<div

className="
overflow-hidden

"

>


<div

className="
pb-5

text-sm

leading-7

text-neutral-400

"

>

{section.content}

</div>


</div>


</div>



</div>


))

}



</div>

);

}