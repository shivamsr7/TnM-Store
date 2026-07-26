import {
  Package,
  Heart,
  Gift,
  Crown,
} from "lucide-react";



const actions = [

{
title:"Orders",
value:"0",
icon:Package,
},

{
title:"Wishlist",
value:"0",
icon:Heart,
},

{
title:"Rewards",
value:"0 Points",
icon:Gift,
},

{
title:"Membership",
value:"Silver",
icon:Crown,
},

];




export default function MobileQuickActions(){



return (

<div

className="
grid
grid-cols-4
gap-2
"

>


{

actions.map((item)=>(


<div

key={item.title}

className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
px-2
py-4
text-center
"

>


<div

className="
mx-auto
flex
h-10
w-10
items-center
justify-center
rounded-full
bg-[#C8A44D]/10
text-[#C8A44D]
"

>


<item.icon size={22}/>


</div>







<p

className="
mt-3
text-[11px]
uppercase
tracking-wide
text-neutral-400
"

>

{item.title}

</p>






<p

className="
mt-1
text-sm
font-semibold
text-white
"

>

{item.value}

</p>







<button

className="
mt-2
text-[11px]
font-medium
text-[#C8A44D]
"

>

View →

</button>






</div>


))


}



</div>

);

}