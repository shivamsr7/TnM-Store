import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";



export default function TierProgress(){



const {
  data:membership,
  isLoading,
}=useCustomerMembership();





if(isLoading){

return (

<div

className="
rounded-3xl
border
border-neutral-800
bg-neutral-950
p-5
text-sm
text-neutral-400
"

>

Loading tier progress...

</div>

);

}





if(!membership){

return null;

}





const {

tier,
lifetimeSpend,
nextTier,
progress

}=membership;






const remaining = nextTier

?

Math.max(
nextTier.amount - lifetimeSpend,
0
)

:

0;







const tiers = [

{
name:"Silver",
letter:"S",
style:
"from-white via-slate-300 to-slate-500",

active:
tier.name==="Silver"

},


{
name:"Gold",
letter:"G",
style:
"from-yellow-200 via-yellow-400 to-yellow-600",

active:
tier.name==="Gold"

},


{
name:"Platinum",
letter:"P",
style:
"from-purple-200 via-purple-500 to-purple-800",

active:
tier.name==="Platinum"

},

];







return (

<div

className="
rounded-3xl
border
border-[#C8A44D]/30
bg-neutral-950
p-5
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

Tier Progress

</h2>


<p

className="
mt-1
text-xs
text-neutral-400
"

>

Unlock your next T&M level

</p>


</div>





<span

className="
rounded-full
bg-[#C8A44D]/10
px-3
py-1
text-xs
font-medium
text-[#C8A44D]
"

>

{tier.name}

</span>



</div>









{/* Tier Steps */}



<div

className="
mt-6
flex
items-center
justify-between
"

>


{

tiers.map((item)=>(


<div

key={item.name}

className="
text-center
"

>


<div

className={`

mx-auto

flex

h-10

w-10

items-center

justify-center

rounded-full

border

bg-gradient-to-br

text-sm

font-bold

text-white


${item.style}


${
item.active

?

"border-white shadow-[0_0_18px_rgba(255,255,255,0.5)]"

:

"border-white/30"

}

`}

>

{item.letter}

</div>






<p

className="
mt-2
text-xs
text-neutral-400
"

>

{item.name}

</p>



</div>


))


}



</div>









<p

className="
mt-5
text-center
text-xs
text-neutral-400
"

>


{

nextTier

?

<>

<span className="
text-[#C8A44D]
font-semibold
">

₹{remaining.toLocaleString()}

</span>

{" "}

away from {nextTier.name} Member

</>

:

"Maximum tier unlocked"

}



</p>









{/* Progress */}



<div

className="
mt-4
h-2
overflow-hidden
rounded-full
bg-neutral-800
"

>


<div

className="
h-full
rounded-full
bg-[#C8A44D]
transition-all
duration-700
"

style={{

width:`${progress}%`

}}

/>


</div>







<div

className="
mt-3
flex
justify-between
text-xs
"

>


<span

className="
text-neutral-500
"

>

₹{lifetimeSpend.toLocaleString()} spent

</span>





<span

className="
text-[#C8A44D]
"

>

{progress}%

</span>



</div>







</div>

);

}