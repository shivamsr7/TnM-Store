import {
  User,
  CalendarDays,
} from "lucide-react";



interface Props {

customer:any;

}





export default function MembershipHero({

customer,

}:Props){



const tier = "Silver";




return (

<div

className="
relative
overflow-hidden
rounded-3xl
border
border-[#C8A44D]/30
bg-gradient-to-br
from-neutral-900
to-black
p-5
"

>





{/* Gold Glow */}


<div

className="
absolute
right-0
top-0
h-32
w-32
rounded-full
bg-[#C8A44D]/10
blur-3xl
"

/>






<div

className="
relative
flex
items-center
justify-between
"

>





{/* User Info */}


<div

className="
flex
items-center
gap-4
"

>



<div

className="
flex
h-14
w-14
items-center
justify-center
rounded-full
border
border-[#C8A44D]
bg-black
text-[#C8A44D]
"

>

<User size={26}/>

</div>






<div>


<h2

className="
text-xl
font-semibold
text-white
"

>

{customer?.first_name}

{" "}

{customer?.last_name}

</h2>




<div

className="
mt-1
inline-flex
rounded-full
bg-[#C8A44D]/10
px-3
py-1
text-xs
font-medium
text-[#C8A44D]
"

>

🥈 {tier} Member

</div>





<div

className="
mt-2
flex
items-center
gap-1
text-xs
text-neutral-500
"

>

<CalendarDays size={12}/>

Member since 2026

</div>



</div>




</div>








{/* Badge */}



<div

className="
flex
h-20
w-20
items-center
justify-center
rounded-2xl
border
border-[#C8A44D]/40
bg-[#C8A44D]/5
text-4xl
font-serif
text-[#C8A44D]
"

>

S

</div>






</div>






{/* Bottom Text */}



<p

className="
mt-4
text-sm
text-neutral-400
"

>

Your exclusive T&M Family membership ✨

</p>





</div>

);

}