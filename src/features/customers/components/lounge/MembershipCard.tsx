import {
  Gift,
  Crown,
  ArrowRight,
} from "lucide-react";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";




export default function MembershipCard(){



const {
data:membership,
isLoading,

}=useCustomerMembership();





if(isLoading){

return (

<div

className="
rounded-3xl
bg-neutral-900
p-5
text-sm
text-neutral-400
"

>

Loading membership...

</div>

);

}





if(!membership){

return null;

}







const {

tier

}=membership;







const benefits: string[] = 
tier.benefits?.length
? tier.benefits
: [
    "Member Only Offers",
    "Early Sale Access",
    "Birthday Surprise",
    "Welcome Rewards",
  ];









return (

<div

className="
relative
overflow-hidden
rounded-3xl
border
border-white/40
bg-gradient-to-br
from-white
via-slate-200
to-slate-400
p-5
text-black
shadow-xl
"

>



{/* Shimmer */}


<div

className="
pointer-events-none
absolute
inset-0
-translate-x-full
animate-[silverShimmer_5s_infinite]
bg-gradient-to-r
from-transparent
via-white/60
to-transparent
"

></div>








<div

className="
relative
z-10
"

>





<div

className="
flex
items-start
justify-between
"

>


<div>


<p

className="
text-xs
uppercase
tracking-widest
text-neutral-600
"

>

Your Current Tier

</p>



<h2

className="
mt-1
text-2xl
font-serif
font-semibold
"

>

{tier.name} Member

</h2>


</div>







<div

className="
flex
h-16
w-16
items-center
justify-center
rounded-full
bg-black
text-3xl
font-serif
text-white
"

>

{tier.name.charAt(0)}

</div>



</div>









<p

className="
mt-5
text-sm
text-neutral-700
"

>

Enjoy exclusive benefits as a

<span

className="
mx-1
font-semibold
"

>

{tier.name}

</span>

member of T&M Family.

</p>









<div

className="
mt-5
space-y-2
"

>


{

benefits.slice(0,4).map((benefit)=>(


<div

key={benefit}

className="
flex
items-center
gap-3
rounded-xl
border
border-white/60
bg-white/40
px-3
py-2
backdrop-blur-sm
"

>


<div

className="
flex
h-7
w-7
items-center
justify-center
rounded-full
bg-white
"

>

<Gift size={14}/>

</div>




<p

className="
text-xs
font-medium
"

>

{benefit}

</p>



</div>


))


}



</div>









<button

className="
mt-5
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-black
py-3
text-xs
font-semibold
text-white
"

>


<Crown size={14}/>


View All Benefits


<ArrowRight size={14}/>


</button>







</div>





</div>

);

}