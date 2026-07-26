import {
  User,
  Package,
  Heart,
  Gift,
  Crown,
} from "lucide-react";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";




function LoungeCard({
icon,
title,
value,
}:{
icon:React.ReactNode;
title:string;
value:string;
}){


return (

<div

className="
rounded-2xl
border
border-[#C8A44D]/30
bg-[#111111]
p-5
transition
hover:border-[#C8A44D]
"

>


<div className="
text-[#C8A44D]
">

{icon}

</div>


<p

className="
mt-4
text-xs
uppercase
tracking-wider
text-neutral-400
"

>

{title}

</p>



<p

className="
mt-1
text-lg
font-semibold
text-white
"

>

{value}

</p>



</div>

);

}






export default function AccountDashboard(){


const {
customer
}=useAuth();




return (

<div

className="
min-h-screen
bg-black
px-4
py-8
text-white
md:px-8
"

>


<div

className="
mx-auto
max-w-5xl
"

>



<h1

className="
text-3xl
font-semibold
text-[#C8A44D]
"

>

My T&M Lounge ✨

</h1>




<p

className="
mt-2
text-neutral-400
"

>

Welcome back, {customer?.first_name}

</p>






{/* Profile Card */}


<div

className="
mt-8
rounded-3xl
border
border-[#C8A44D]/40
bg-gradient-to-br
from-neutral-900
to-black
p-6
"

>


<div className="
flex
items-center
gap-4
">


<div

className="
flex
h-14
w-14
items-center
justify-center
rounded-full
bg-[#C8A44D]/10
text-[#C8A44D]
"

>

<User />

</div>




<div>

<h2 className="
text-xl
font-semibold
">

{customer?.first_name}

{" "}

{customer?.last_name}

</h2>


<p className="
text-sm
text-neutral-400
">

T&M Family Member ✨

</p>


</div>


</div>


</div>








{/* Cards */}


<div

className="
mt-6
grid
grid-cols-2
gap-4
"

>


<LoungeCard

icon={<Package />}

title="Orders"

value="0 Orders"

/>


<LoungeCard

icon={<Heart />}

title="Wishlist"

value="0 Items"

/>


<LoungeCard

icon={<Gift />}

title="Rewards"

value="0 Points"

/>


<LoungeCard

icon={<Crown />}

title="Membership"

value="Silver"

/>


</div>






<div

className="
mt-6
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
text-center
"

>


<p className="
text-sm
text-neutral-400
"

>

Your jewellery journey with T&M ✨

</p>


</div>





</div>


</div>

);

}