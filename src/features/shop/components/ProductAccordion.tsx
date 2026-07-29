import {
  ChevronDown
} from "lucide-react";

import {
  useState
} from "react";


interface ProductAccordionProps {

  product:any;

}



export default function ProductAccordion({

product

}:ProductAccordionProps){


const [open,setOpen] = useState<string | null>(null);



const sections = [


{
id:"description",

title:"Description",

content:

product.description || 
"Premium jewellery crafted with attention to detail."
},



{
id:"specifications",

title:"Specifications",

content:(

<div className="space-y-2">


{
product.brand_id &&

<p>
Brand:
<span className="text-white ml-2">
T&M Jewels
</span>
</p>

}



<p>
Material:
<span className="text-white ml-2">
Premium Alloy
</span>
</p>



<p>
Finish:
<span className="text-white ml-2">
Luxury Gold Plated Look
</span>
</p>


</div>

)

},



{
id:"care",

title:"Care Instructions",

content:

product.care_instructions ||

"Keep away from moisture, perfumes and chemicals. Store in the provided packaging when not in use."

},



{
id:"shipping",

title:"Shipping & Returns",

content:

"Orders are carefully packed and shipped securely. Delivery timelines depend on your location. Please check our return policy for details."

}



];







return (

<div

className="
mt-10

border-t

border-neutral-800

"

>


{

sections.map((section)=>(


<div

key={section.id}

className="
border-b

border-neutral-800

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
text-base

font-medium

text-white

"

>

{section.title}

</span>



<ChevronDown

size={20}

className={

`

text-[#D4AF37]

transition-transform

duration-300


${

open === section.id

?

"rotate-180"

:

""

}

`

}

/>


</button>







<div

className={`

overflow-hidden

transition-all

duration-300


${

open === section.id

?

"max-h-96 pb-5 opacity-100"

:

"max-h-0 opacity-0"

}

`}

>


<div

className="
text-sm

leading-relaxed

text-neutral-400

"

>

{section.content}

</div>


</div>



</div>



))

}



</div>

);

}