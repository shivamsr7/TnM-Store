import {
  Gift,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useState } from "react";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";


import RewardsHistoryDialog from "./RewardsHistoryDialog";





export default function RewardsCard(){



const {

data:membership,

isLoading,

}=useCustomerMembership();




const [openHistory,setOpenHistory]=useState(false);






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

Loading rewards...

</div>

);

}





if(!membership){

return null;

}






const {

points,

rewardValue,

rules

}=membership;







return (

<>


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

Worth ₹{rewardValue.toFixed(2)}

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

{rules.point_value_points} points = ₹{rules.point_value_amount} discount

</p>



</div>









<button

onClick={()=>setOpenHistory(true)}

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







<RewardsHistoryDialog

open={openHistory}

onClose={()=>setOpenHistory(false)}

/>



</>

);

}