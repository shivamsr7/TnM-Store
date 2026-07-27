import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  Crown,
  Check,
  Sparkles,
} from "lucide-react";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";




interface Props {

  open:boolean;

  onClose:()=>void;

}





export default function MembershipBenefitsDialog({

open,

onClose,

}:Props){



const {

data:membership

}=useCustomerMembership();





if(!membership){

return null;

}





const benefits =
membership.tier.benefits?.length
?
membership.tier.benefits
:
[
  "Member Only Offers",
  "Early Sale Access",
  "Birthday Surprise",
  "Welcome Rewards",
];







return (

<Dialog

open={open}

onOpenChange={onClose}

>


<DialogContent

className="
max-w-md
overflow-hidden
rounded-3xl
border
border-[#C8A44D]/30
bg-gradient-to-b
from-neutral-950
via-black
to-neutral-950
text-white
p-0
"

>







<div

className="
border-b
border-neutral-800
bg-gradient-to-r
from-[#C8A44D]/20
to-transparent
p-6
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
h-12
w-12
items-center
justify-center
rounded-2xl
bg-[#C8A44D]/10
text-[#C8A44D]
"

>

<Crown size={24}/>

</div>




<div>

<DialogHeader>

<DialogTitle

className="
text-xl
font-semibold
"

>

{membership.tier.name} Benefits ✨

</DialogTitle>

</DialogHeader>


<p

className="
mt-1
text-xs
text-neutral-400
"

>

Exclusive T&M privileges

</p>


</div>



</div>



<Sparkles

size={22}

className="
absolute
right-6
top-7
text-[#C8A44D]
"

/>



</div>









<div

className="
space-y-3
p-5
"

>

{

benefits.map((item,index)=>(


<div

key={index}

className="
flex
items-center
gap-3
rounded-2xl
border
border-neutral-800
bg-neutral-900
p-4
"

>


<div

className="
flex
h-8
w-8
items-center
justify-center
rounded-full
bg-[#C8A44D]/10
text-[#C8A44D]
"

>

<Check size={16}/>

</div>





<p

className="
text-sm
text-neutral-200
"

>

{item}

</p>



</div>


))

}



</div>






</DialogContent>

</Dialog>

);

}