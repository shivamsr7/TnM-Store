import {
  Package,
  Gift,
  Crown,
} from "lucide-react";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";


import {
  useCustomerStats,
} from "@/features/customers/hooks/useCustomerStats";





export default function MobileQuickActions(){



const {
  data:membership,
  isLoading:membershipLoading,

}=useCustomerMembership();




const {
  data:stats,
  isLoading:statsLoading,

}=useCustomerStats();





if(membershipLoading || statsLoading){

return (

<div

className="
grid
grid-cols-3
gap-3
"

>

{

Array.from({
length:3
}).map((_,index)=>(


<div

key={index}

className="
h-28
rounded-2xl
bg-neutral-900
animate-pulse
"

/>


))

}

</div>

);

}





if(!membership){

return null;

}







const actions = [

{
title:"Orders",
value:
`${stats?.ordersCount ?? 0}`,
icon:Package,
},



// Wishlist will be added after wishlist table creation
//
// {
// title:"Wishlist",
// value:wishlistCount,
// icon:Heart,
// },



{
title:"Rewards",
value:
`${membership.points}`,
icon:Gift,
},



{
title:"Membership",
value:
membership.tier.name,
icon:Crown,
},


];








return (

<div

className="
grid
grid-cols-3
gap-3
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
text-[10px]
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