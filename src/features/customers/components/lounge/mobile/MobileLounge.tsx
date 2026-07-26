import MobileMemberHero from "./MobileMemberHero";
import MobileTierProgress from "./MobileTierProgress";
import MobileQuickActions from "./MobileQuickActions";
import MobileWelcomeGift from "./MobileWelcomeGift";
import MobileRewardSummary from "./MobileRewardSummary";
import MobileBottomNav from "./MobileBottomNav";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



export default function MobileLounge(){


const {
customer
}=useAuth();



return (

<div

className="
min-h-screen
bg-black
pb-24
text-white
"

>


{/* Header */}

<div

className="
flex
items-center
justify-between
px-5
pt-6
"

>


<button

className="
text-2xl
text-white
"

>

☰

</button>




<h1

className="
text-xl
font-serif
text-[#C8A44D]
"

>

My T&M Lounge ✨

</h1>





<button

className="
relative
flex
h-10
w-10
items-center
justify-center
rounded-full
border
border-neutral-700
"

>

🔔

<span

className="
absolute
right-1
top-1
h-2
w-2
rounded-full
bg-pink-500
"

/>

</button>



</div>







<p

className="
mt-6
px-5
text-lg
text-white
"

>

Welcome back, {customer?.first_name} 👋

</p>







<div

className="
mt-5
space-y-4
px-4
"

>



<MobileMemberHero

customer={customer}

/>





<MobileTierProgress />





<MobileQuickActions />





<MobileWelcomeGift />





<MobileRewardSummary />





</div>







<MobileBottomNav />




</div>

);

}