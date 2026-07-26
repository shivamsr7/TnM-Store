import {
  Gift,
  Crown,
  ArrowRight,
} from "lucide-react";



const benefits = [

"Member Only Offers",

"Early Sale Access",

"Birthday Surprise",

"Welcome Rewards",

];





export default function MembershipCard(){


const tier = "Silver";



return (

<div

className="
relative
overflow-hidden
rounded-3xl
border
border-white/60
bg-gradient-to-br
from-[#f8fafc]
via-[#d1d5db]
to-[#94a3b8]
p-5
text-black
shadow-[0_0_40px_rgba(255,255,255,0.18)]
"

>


{/* Moving Silver Shimmer */}

<div

className="
pointer-events-none
absolute
inset-0
-translate-x-full
animate-[shimmer_3s_infinite]
bg-gradient-to-r
from-transparent
via-white/60
to-transparent
"

></div>





{/* Content */}


<div

className="
relative
z-10
"

>



{/* Header */}


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
text-[11px]
uppercase
tracking-[0.2em]
text-neutral-600
"

>

Your Current Tier

</p>



<h2

className="
mt-1
text-xl
font-serif
font-semibold
text-neutral-900
"

>

{tier} Member

</h2>


</div>






{/* Silver Badge */}


<div

className="
flex
h-16
w-16
items-center
justify-center
rounded-full
border
border-white
bg-gradient-to-br
from-white
via-slate-300
to-slate-500
text-4xl
font-serif
text-white
shadow-inner
"

>

S

</div>




</div>








<p

className="
mt-5
text-sm
leading-relaxed
text-neutral-700
"

>

Enjoy exclusive benefits as a

<span

className="
mx-1
font-semibold
text-neutral-900
"

>

Silver

</span>

member of T&M Family.

</p>








{/* Benefits */}


<div

className="
mt-5
space-y-2
"

>


{

benefits.map((item)=>(


<div

key={item}

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
bg-white/60
"

>

<Gift

size={14}

className="
text-neutral-700
"

/>


</div>



<p

className="
text-xs
font-medium
text-neutral-800
"

>

{item}

</p>



</div>


))


}



</div>








{/* Button */}



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
transition
hover:bg-neutral-800
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