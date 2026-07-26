import {
  Gift,
  Sparkles,
  ArrowRight,
} from "lucide-react";



export default function RewardsCard(){


const points = 0;


// T&M reward rule:
// 1000 points = ₹10

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

<Gift size={20}/>

</div>




<Sparkles

size={18}

className="
text-[#C8A44D]
"

/>


</div>







<h2

className="
mt-4
text-lg
font-semibold
text-white
"

>

Rewards Wallet 🎁

</h2>





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

Available Points

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







<div

className="
mt-4
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
mt-1
text-sm
text-white
"

>

1000 points = ₹10 discount

</p>



</div>








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
transition
hover:bg-[#E2C675]
"

>

View Rewards

<ArrowRight size={14}/>


</button>






</div>

);

}