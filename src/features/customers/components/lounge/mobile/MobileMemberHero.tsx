import {
  ArrowRight,
  Sparkles,
} from "lucide-react";



interface Props {

customer:any;

}




export default function MobileMemberHero({



}:Props){


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
shadow-[0_0_35px_rgba(255,255,255,0.18)]
"

>



{/* Silver shimmer */}

<div

className="
pointer-events-none
absolute
inset-0
-translate-x-full
animate-[silverShimmer_5s_infinite]
bg-gradient-to-r
from-transparent
via-white/70
to-transparent
"

></div>





<div

className="
relative
z-10
"

>





<p

className="
text-sm
text-neutral-700
"

>

You are a

</p>





<h2

className="
mt-1
text-3xl
font-serif
font-semibold
tracking-wide
text-neutral-900
"

>

SILVER MEMBER

</h2>







<p

className="
mt-3
text-sm
leading-relaxed
text-neutral-700
"

>

Welcome to the T&M Family ✨

<br/>

Enjoy exclusive benefits and rewards.

</p>








<button

className="
mt-5
flex
items-center
gap-2
rounded-xl
bg-black
px-5
py-3
text-sm
font-semibold
text-white
"

>

View Benefits

<ArrowRight size={16}/>

</button>









{/* Silver Badge */}



<div

className="
absolute
bottom-5
right-5
flex
h-28
w-28
items-center
justify-center
rounded-full
border
border-white
bg-gradient-to-br
from-white
via-slate-300
to-slate-500
text-6xl
font-serif
text-white
shadow-inner
"

>

<Sparkles

size={18}

className="
absolute
right-2
top-2
text-white
"

/>


S


</div>







</div>



</div>

);

}