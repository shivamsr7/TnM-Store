import {
  ArrowRight,
} from "lucide-react";
import silverCard from "@/assets/card/silver-card.png"

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
"

>


{/* Membership Card Image */}

<img

src={silverCard}

alt="Silver Membership"

className="
w-full
rounded-3xl
object-cover
"

/>






{/* Overlay Content */}


<div

className="
absolute
bottom-5
left-5
right-5
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