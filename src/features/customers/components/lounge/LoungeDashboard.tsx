import MembershipHero from "./MembershipHero";
import MembershipCard from "./MembershipCard";
import TierProgress from "./TierProgress";
import QuickActions from "./QuickActions";
import RewardsCard from "./RewardsCard";
import BenefitsSection from "./BenefitsSection";
import WelcomeGift from "./WelcomeGift";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerMembership,
} from "@/features/customers/hooks/useCustomerMembership";




export default function LoungeDashboard(){


const {
customer
}=useAuth();



const {
data:membership,
}=useCustomerMembership();





return (

<div

className="
min-h-screen
overflow-hidden
bg-black
px-4
py-5
text-white
lg:px-6
"

>


<div

className="
mx-auto
max-w-[1400px]
"

>





{/* Header */}


<div

className="
flex
items-start
justify-between
"

>


<div>


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
mt-1
text-sm
text-neutral-400
"

>

Welcome back, {customer?.first_name}

</p>


</div>





<div

className="
flex
gap-3
"

>

<button

className="
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

</button>




<button

className="
flex
h-10
w-10
items-center
justify-center
rounded-full
border
border-[#C8A44D]
"

>

👤

</button>


</div>


</div>








{/* Main Layout */}


<div

className="
mt-5
grid
gap-5
xl:grid-cols-[1fr_320px]
"

>





{/* Left */}


<div

className="
space-y-5
"

>



<MembershipHero

customer={customer}

membership={membership}

/>





<TierProgress />






<QuickActions />







<BenefitsSection

membership={membership}

/>







<WelcomeGift />





</div>








{/* Right */}


<div

className="
space-y-5
"

>


<MembershipCard />



<RewardsCard />



</div>







</div>






</div>


</div>

);

}