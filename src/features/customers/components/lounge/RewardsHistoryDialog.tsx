import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  Gift,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";


import {
  useRewardTransactions,
} from "@/features/customers/hooks/useRewardTransactions";



interface Props{

open:boolean;

onClose:()=>void;

}



export default function RewardsHistoryDialog({

open,

onClose,

}:Props){



const {

data:transactions=[],

isLoading,

}=useRewardTransactions();







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
shadow-2xl
"

>







{/* Header */}


<div

className="
relative
border-b
border-neutral-800
bg-gradient-to-r
from-[#C8A44D]/20
via-transparent
to-[#C8A44D]/10
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
text-white
"

>

Rewards History 🎁

</DialogTitle>

</DialogHeader>




<p

className="
mt-1
text-xs
text-neutral-400
"

>

Your T&M reward journey

</p>



</div>



</div>








<Sparkles

className="
absolute
right-6
top-7
text-[#C8A44D]/70
"

size={22}

/>



</div>









{/* Body */}



<div

className="
max-h-[420px]
space-y-3
overflow-y-auto
p-5
"

>





{

isLoading && (

<div

className="
rounded-2xl
bg-neutral-900
p-5
text-center
text-sm
text-neutral-400
"

>

Loading rewards...

</div>

)

}








{

!isLoading && transactions.length===0 && (

<div

className="
rounded-3xl
border
border-neutral-800
bg-neutral-900/50
p-8
text-center
"

>


<div

className="
mx-auto
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

<Gift size={26}/>

</div>




<p

className="
mt-4
font-medium
"

>

No rewards yet

</p>



<p

className="
mt-1
text-xs
text-neutral-500
"

>

Complete purchases to earn rewards

</p>



</div>

)

}









{

transactions.map((item)=>(


<div

key={item.id}

className="
flex
items-center
justify-between
rounded-2xl
border
border-neutral-800
bg-neutral-900/70
p-4
transition
hover:border-[#C8A44D]/40
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

className={`
flex
h-10
w-10
items-center
justify-center
rounded-full

${
item.points >=0

?

"bg-green-500/10 text-green-400"

:

"bg-red-500/10 text-red-400"

}

`}

>


{

item.points >=0

?

<Plus size={18}/>

:

<Minus size={18}/>

}



</div>








<div>


<p

className="
text-sm
font-medium
text-white
"

>

{item.description || item.transaction_type}

</p>




<p

className="
mt-1
text-xs
text-neutral-500
"

>

{new Date(item.created_at)
.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"short",
year:"numeric"
}
)}

</p>



</div>




</div>







<p

className={`

text-lg
font-bold

${
item.points >=0

?

"text-green-400"

:

"text-red-400"

}

`}

>

{

item.points >=0

?

`+${item.points}`

:

item.points

}

</p>





</div>



))

}





</div>






</DialogContent>

</Dialog>

);

}