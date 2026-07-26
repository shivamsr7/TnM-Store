import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import type {
  CustomerMembership,
} from "@/features/customers/types/membership";




export function useCustomerMembership(){


const {
customer
}=useAuth();





return useQuery<CustomerMembership>({


queryKey:[
"customer-membership",
customer?.id
],



enabled:
!!customer?.id,





queryFn:async()=>{



if(!customer?.id){

throw new Error(
"Customer not found"
);

}





// Customer rewards

const {

data:rewardData,

error:rewardError

}=await supabase

.from("customer_rewards")

.select(`
current_points,
lifetime_spend,
welcome_bonus_given,
tier_id,
reward_tiers!customer_rewards_tier_id_fkey(
tier_name,
minimum_spend,
benefits,
badge_color
)
`)

.eq(
"customer_id",
customer.id
)

.single();





if(rewardError){

throw rewardError;

}






// Reward rules

const {

data:rules,

error:rulesError

}=await supabase

.from("reward_rules")

.select(`

point_value_points,

point_value_amount

`)

.single();





if(rulesError){

throw rulesError;

}






const tier =
rewardData.reward_tiers?.[0];






const benefits = tier?.benefits

?

tier.benefits
.split(",")
.map((item:string)=>item.trim())
.filter(Boolean)

:

[];







const rewardValue =

rewardData.current_points /

rules.point_value_points *

rules.point_value_amount;







// Next tier

const {

data:nextTier

}=await supabase

.from("reward_tiers")

.select(`

tier_name,

minimum_spend

`)

.gt(
"minimum_spend",
rewardData.lifetime_spend
)

.order(
"minimum_spend",
{
ascending:true
}
)

.limit(1)

.maybeSingle();








let progress = 100;



if(nextTier){


progress =

(
rewardData.lifetime_spend /

nextTier.minimum_spend

) * 100;


progress = Math.min(
progress,
100
);


}








return {


tier:{

name:
tier?.tier_name ?? "Silver",


color:
tier?.badge_color ?? "#C0C0C0",


benefits,

},





points:

rewardData.current_points,



welcomeBonusGiven:
rewardData.welcome_bonus_given,

rewardValue:

Number(
rewardValue.toFixed(2)
),





lifetimeSpend:

Number(
rewardData.lifetime_spend
),





nextTier:

nextTier

?

{

name:
nextTier.tier_name,

amount:
Number(nextTier.minimum_spend),

}

:

null,





progress:

Math.round(progress),





rules:{

point_value_points:
rules.point_value_points,

point_value_amount:
rules.point_value_amount,

}

};




},


});


}