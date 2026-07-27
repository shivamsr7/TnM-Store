import {
  Gift,
  Sparkles,
  Zap,
  Cake,
} from "lucide-react";



const benefits = [

{
title:"Offers",
icon:Gift,
},

{
title:"Early Access",
icon:Zap,
},

{
title:"Founder Picks",
icon:Sparkles,
},

{
title:"Birthday",
icon:Cake,
},

];





import type {
  CustomerMembership,
} from "@/features/customers/types/membership";


interface Props {

  membership?: CustomerMembership;

}


export default function BenefitsSection({

}: Props){



return (

<div

className="
rounded-3xl
border
border-neutral-800
bg-neutral-950
p-4
"

>



<div

className="
flex
items-center
justify-between
"

>


<div>


<h2

className="
text-lg
font-semibold
text-white
"

>

Your Benefits ✨

</h2>



<p

className="
text-xs
text-neutral-400
"

>

Exclusive T&M privileges

</p>



</div>



</div>








<div

className="
mt-4
grid
grid-cols-2
gap-3
lg:grid-cols-4
"

>



{

benefits.map((item)=>(


<div

key={item.title}

className="
flex
flex-col
items-center
justify-center
rounded-xl
border
border-neutral-800
bg-black
px-3
py-4
text-center
"

>


<div

className="
flex
h-9
w-9
items-center
justify-center
rounded-full
bg-[#C8A44D]/10
text-[#C8A44D]
"

>


<item.icon size={18}/>


</div>




<p

className="
mt-2
text-xs
text-neutral-300
"

>

{item.title}

</p>



</div>


))


}



</div>






</div>

);

}