import {
  Gift,
  Users,
  ArrowRight,
} from "lucide-react";



export default function WelcomeGift(){



return (

<div

className="
grid
gap-4
md:grid-cols-2
"

>





{/* Welcome Gift */}



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
gap-3
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



<div>


<h3

className="
text-base
font-semibold
text-white
"

>

Welcome Gift

</h3>



<p

className="
text-xs
text-neutral-400
"

>

A surprise from T&M

</p>


</div>



</div>







<p

className="
mt-4
text-sm
text-neutral-300
"

>

Your first reward is waiting ✨

</p>





<button

className="
mt-4
flex
items-center
gap-2
rounded-xl
bg-[#C8A44D]
px-4
py-2
text-xs
font-semibold
text-black
"

>

Claim Now

<ArrowRight size={14}/>

</button>



</div>









{/* Referral */}



<div

className="
rounded-3xl
border
border-neutral-800
bg-neutral-950
p-5
"

>



<div

className="
flex
items-center
gap-3
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
bg-white/5
text-[#C8A44D]
"

>

<Users size={20}/>

</div>





<div>


<h3

className="
text-base
font-semibold
text-white
"

>

Refer & Earn

</h3>


<p

className="
text-xs
text-neutral-400
"

>

Grow T&M Family

</p>


</div>



</div>








<p

className="
mt-4
text-sm
text-neutral-300
"

>

Earn rewards by inviting your friends.

</p>






<button

className="
mt-4
rounded-xl
border
border-[#C8A44D]
px-4
py-2
text-xs
font-semibold
text-[#C8A44D]
"

>

Invite Friends

</button>




</div>






</div>

);

}