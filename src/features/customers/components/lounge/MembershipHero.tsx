import {
  User,
  CalendarDays,
} from "lucide-react";


import type {
  CustomerMembership,
} from "@/features/customers/types/membership";

import silverCard from "@/assets/card/silver-card.png";
import goldCard from "@/assets/card/gold-card.png";
import platinumCard from "@/assets/card/platinum-card.png";


interface Props {

customer:any;

membership?:CustomerMembership;

}






export default function MembershipHero({

customer,

membership,

}:Props){



const tier =
membership?.tier;



const tierName =
membership?.tier?.name ?? "Silver";




const membershipCard =
  tierName === "Platinum"
    ? platinumCard
    : tierName === "Gold"
    ? goldCard
    : silverCard;

const memberSince =
new Date(customer?.created_at)
.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
);



const tierEmoji =
tierName === "Platinum"
?
"💎"

:

tierName === "Gold"
?
"🥇"

:

"🥈";







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





{/* Glow */}


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
items-center
gap-1
rounded-full
px-3
py-1
text-xs
font-medium
"

style={{

backgroundColor:
`${tier?.color ?? "#C8A44D"}20`,

color:
tier?.color ?? "#C8A44D"

}}

>

{tierEmoji}

{tierName} Member

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

Member since {memberSince}

</div>





</div>





</div>









{/* Badge */}



<div
className={`
overflow-hidden
rounded-2xl
transition-all

${
tierName === "Platinum"
?
"h-32 w-52"

:

tierName === "Gold"
?
"h-28 w-44"

:

"h-24 w-40"

}

`}
>

<img

src={membershipCard}

alt={`${tierName} membership card`}

className="
h-full
w-full
object-cover
"

/>

</div>







</div>









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