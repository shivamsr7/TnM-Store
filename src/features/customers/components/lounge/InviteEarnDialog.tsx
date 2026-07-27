import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  Copy,
  Check,
  Users,
  Gift,
  Share2,
  Sparkles,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useReferralData,
} from "@/features/customers/hooks/useReferralData";




interface Props {

  open:boolean;

  onClose:()=>void;

}





export default function InviteEarnDialog({

open,

onClose,

}:Props){



const {

data:referral,

isLoading,

}=useReferralData();





const [copied,setCopied]=useState(false);






const copyCode = async()=>{


if(!referral?.referral_code){

return;

}



await navigator.clipboard.writeText(

referral.referral_code

);



setCopied(true);



setTimeout(()=>{

setCopied(false);

},2000);



};







const shareWhatsApp = ()=>{


const message =

`✨ Join T&M Jewels ✨


Shop premium jewellery and unlock exclusive rewards.


Use my referral code:

${referral?.referral_code}


🎁 You get 250 reward points on your first successful order.


`;



window.open(

`https://wa.me/?text=${encodeURIComponent(message)}`,

"_blank"

);


};








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
p-0
text-white
"

>







{/* Header */}



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

<Gift size={24}/>

</div>





<div>


<DialogHeader>

<DialogTitle

className="
text-xl
font-semibold
"

>

Invite & Earn ✨

</DialogTitle>

</DialogHeader>



<p

className="
mt-1
text-xs
text-neutral-400
"

>

Grow the T&M Jewels family

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
space-y-4
p-5
"

>








{/* Reward Explanation */}



<div

className="
rounded-2xl
border
border-[#C8A44D]/30
bg-[#C8A44D]/10
p-4
"

>


<p

className="
text-sm
font-semibold
text-white
"

>

Invite friends & earn rewards ✨

</p>





<div

className="
mt-3
space-y-2
text-sm
"

>


<div

className="
flex
justify-between
"

>

<span className="
text-neutral-400
">

You earn

</span>


<span className="
font-semibold
text-[#C8A44D]
">

500 Points

</span>


</div>





<div

className="
flex
justify-between
"

>

<span className="
text-neutral-400
">

Friend gets

</span>


<span className="
font-semibold
text-[#C8A44D]
">

250 Points

</span>


</div>




</div>


</div>









{/* Referral Code */}



<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-900
p-5
text-center
"

>


<p

className="
text-xs
uppercase
tracking-widest
text-neutral-500
"

>

Your Referral Code

</p>





<p

className="
mt-3
text-3xl
font-bold
tracking-widest
text-[#C8A44D]
"

>

{

isLoading

?

"Loading..."

:

referral?.referral_code

}


</p>







<button

onClick={copyCode}

className="
mx-auto
mt-4
flex
items-center
gap-2
rounded-xl
bg-white
px-4
py-2
text-xs
font-semibold
text-black
"

>

{

copied

?

<Check size={14}/>

:

<Copy size={14}/>

}



{

copied

?

"Copied"

:

"Copy Code"

}



</button>



</div>









{/* Referral Stats */}



<div

className="
grid
grid-cols-3
gap-3
"

>





<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-900
p-3
text-center
"

>

<Users

size={20}

className="
mx-auto
text-[#C8A44D]
"

/>


<p

className="
mt-2
text-xs
text-neutral-400
"

>

Successful

</p>


<p

className="
mt-1
text-lg
font-semibold
"

>

{referral?.successful_referrals ?? 0}

</p>


</div>







<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-900
p-3
text-center
"

>

<Gift

size={20}

className="
mx-auto
text-[#C8A44D]
"

/>


<p

className="
mt-2
text-xs
text-neutral-400
"

>

Total

</p>


<p

className="
mt-1
text-lg
font-semibold
"

>

{referral?.total_referrals ?? 0}

</p>


</div>







<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-900
p-3
text-center
"

>

<Sparkles

size={20}

className="
mx-auto
text-[#C8A44D]
"

/>


<p

className="
mt-2
text-xs
text-neutral-400
"

>

Points

</p>


<p

className="
mt-1
text-lg
font-semibold
"

>

{referral?.referralPoints ?? 0}

</p>


</div>






</div>









{/* Share Button */}



<button

onClick={shareWhatsApp}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-[#C8A44D]
py-3
text-sm
font-semibold
text-black
"

>


<Share2 size={16}/>

Invite Friends & Earn


</button>








</div>






</DialogContent>

</Dialog>

);

}