import {
  Gift,
  Sparkles,
  ArrowRight,
} from "lucide-react";



export default function MobileRewardSummary(){


const points = 0;


// T&M Reward Rule:
// 1000 points = ₹10 discount

const value = (points / 1000) * 10;



return (

<div

className="
rounded-3xl
border
border-[#C8A44D]/30
bg-gradient-to-br
from-neutral-900
to-black
p-5
"

>



{/* Header */}


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
h-11
w-11
items-center
justify-center
rounded-2xl
bg-[#C8A44D]/10
text-[#C8A44D]
"

>

<Gift size={22}/>

</div>




<Sparkles

size={18}

className="
text-[#C8A44D]
"

/>


</div>







<h3

className="
mt-4
text-lg
font-semibold
text-white
"

>

Reward Points 🎁

</h3>








{/* Points Balance */}



<div

className="
mt-4
rounded-2xl
bg-[#C8A44D]/10
p-4
"

>


<p

className="
text-xs
text-neutral-400
"

>

Available Balance

</p>




<p

className="
mt-1
text-3xl
font-bold
text-[#C8A44D]
"

>

{points}

<span

className="
ml-2
text-sm
font-normal
"

>

Points

</span>


</p>




<p

className="
mt-1
text-xs
text-neutral-400
"

>

Worth ₹{value.toFixed(2)}

</p>



</div>









{/* Redeem Info */}



<div

className="
mt-4
flex
items-center
justify-between
rounded-xl
border
border-neutral-800
px-4
py-3
"

>


<p

className="
text-xs
text-neutral-400
"

>

Redeem Value

</p>




<p

className="
text-sm
font-medium
text-white
"

>

1000 pts = ₹10

</p>



</div>








{/* Button */}



<button

className="
mt-4
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-[#C8A44D]
py-3
text-xs
font-semibold
text-black
"

>


View Rewards


<ArrowRight size={14}/>


</button>





</div>

);

}