import {
  ArrowRight,
} from "lucide-react";


import silverCard from "@/assets/card/silver-card.png";
import goldCard from "@/assets/card/gold-card.png";
import platinumCard from "@/assets/card/platinum-card.png";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";








export default function MobileMemberHero(){





const {
data:membership,
isLoading,

}=useCustomerMembership();





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

Loading membership...

</div>

);

}





if(!membership){

return null;

}





const tier =
membership.tier.name.toLowerCase();







const cardImages:any = {

silver:silverCard,

gold:goldCard,

platinum:platinumCard,

};






const cardImage =
cardImages[tier] ?? silverCard;








return (

<div

className="
relative
overflow-hidden
rounded-3xl
"

>





{/* Membership Card */}


<img

src={cardImage}

alt={`${membership.tier.name} Membership`}

className="
w-full
rounded-3xl
object-cover
"

/>









{/* Overlay Button */}



<div

className="
absolute
bottom-5
left-5
"

>


<button

className="
flex
items-center
gap-2
rounded-xl
bg-black/90
px-5
py-3
text-sm
font-semibold
text-white
shadow-lg
backdrop-blur-sm
"

>

View Benefits

<ArrowRight size={16}/>

</button>



</div>







</div>

);

}