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





export default function QuickActions(){



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
grid-cols-2
gap-3
lg:grid-cols-3
"

>

{

Array.from({
length:3
}).map((_,index)=>(


<div

key={index}

className="
h-32
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
label:"Orders",
icon:Package,
},



// Wishlist will be added after wishlist table creation
//
// {
// title:"Wishlist",
// value:"0",
// label:"Items",
// icon:Heart,
// },



{
title:"Rewards",
value:
`${membership.points}`,
label:"Points",
icon:Gift,
},



{
title:"Membership",
value:
membership.tier.name,
label:"",
icon:Crown,
},

];







return (

<div

className="
grid
grid-cols-2
gap-3
lg:grid-cols-3
"

>


{

actions.map((item)=>(


<div

key={item.title}

className="
group
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-4
transition-all
duration-300
hover:border-[#C8A44D]/60
"

>


<div

className="
flex
items-center
justify-between
"

>


<div

className="
flex
h-10
w-10
items-center
justify-center
rounded-xl
bg-[#C8A44D]/10
text-[#C8A44D]
"

>

<item.icon size={20}/>

</div>




</div>







<p

className="
mt-4
text-xs
uppercase
tracking-wider
text-neutral-500
"

>

{item.title}

</p>








<div

className="
mt-1
flex
items-end
gap-1
"

>


<p

className="
text-xl
font-semibold
text-white
"

>

{item.value}

</p>




<p

className="
pb-1
text-xs
text-neutral-400
"

>

{item.label}

</p>



</div>







</div>


))


}



</div>

);

}