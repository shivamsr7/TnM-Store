import {
  Gift,
  Crown,
  ArrowRight,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";


import MembershipBenefitsDialog from "./MembershipBenefitsDialog";




export default function MembershipCard(){



const {
data:membership,
isLoading,

}=useCustomerMembership();





const [
benefitsOpen,
setBenefitsOpen
]=useState(false);







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





const tierName =
tier.name;





const cardTheme =

tierName === "Platinum"

?

{
background:
"from-purple-200 via-purple-100 to-purple-300",

text:
"text-purple-950",

label:
"text-purple-700",

shimmer:
"from-transparent via-purple-200/70 to-transparent"

}


:

tierName === "Gold"

?

{
background:
"from-yellow-100 via-amber-100 to-yellow-300",

text:
"text-yellow-950",

label:
"text-amber-700",

shimmer:
"from-transparent via-yellow-200/70 to-transparent"

}


:

{
background:
"from-white via-slate-200 to-slate-400",

text:
"text-slate-900",

label:
"text-neutral-600",

shimmer:
"from-transparent via-white/70 to-transparent"

};








const benefits: string[] = 

tier.benefits?.length

?

tier.benefits

:

[
"Member Only Offers",
"Early Sale Access",
"Birthday Surprise",
"Welcome Rewards",
];








return (

<>


<div

className={`
relative
overflow-hidden
rounded-3xl
border
border-white/40
bg-gradient-to-br
${cardTheme.background}
p-5
${cardTheme.text}
shadow-xl
`}

>





{/* Dynamic Shimmer */}


<div

className={`
pointer-events-none
absolute
inset-0
-translate-x-full
animate-[silverShimmer_5s_infinite]
bg-gradient-to-r
${cardTheme.shimmer}
`}

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

className={`
text-xs
uppercase
tracking-widest
${cardTheme.label}
`}

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

{tierName} Member

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

{tierName.charAt(0)}

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

{tierName}

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

onClick={()=>setBenefitsOpen(true)}

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







<MembershipBenefitsDialog

open={benefitsOpen}

onClose={()=>setBenefitsOpen(false)}

/>



</>

);

}