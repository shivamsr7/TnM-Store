import {
  Gift,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useClaimWelcomeBonus,
} from "@/features/customers/hooks/useClaimWelcomeBonus";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";


import InviteEarnDialog from "./InviteEarnDialog";





export default function WelcomeGift(){



const {
  data:membership,
}=useCustomerMembership();




const {
  mutate:claimBonus,
  isPending,
}=useClaimWelcomeBonus();




const [inviteOpen,setInviteOpen]=useState(false);






const claimed =
membership?.welcomeBonusGiven ?? false;








return (

<>


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

{

claimed

?

<CheckCircle size={20}/>

:

<Gift size={20}/>

}


</div>





<div>


<h3

className="
text-base
font-semibold
text-white
"

>

{

claimed

?

"Welcome Bonus Claimed"

:

"Welcome Gift"

}

</h3>



<p

className="
text-xs
text-neutral-400
"

>

{

claimed

?

"Your reward points are added"

:

"A surprise from T&M"

}

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

{

claimed

?

"50 points have been added to your wallet ✨"

:

"Your first reward is waiting ✨"

}

</p>







{

!claimed && (


<button

onClick={()=>claimBonus()}

disabled={isPending}

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
disabled:opacity-50
"

>

{

isPending

?

"Claiming..."

:

"Claim Now"

}


<ArrowRight size={14}/>

</button>


)



}






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

onClick={()=>setInviteOpen(true)}

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







<InviteEarnDialog

open={inviteOpen}

onClose={()=>setInviteOpen(false)}

/>



</>

);

}