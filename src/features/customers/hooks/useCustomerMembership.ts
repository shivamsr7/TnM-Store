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

point_value_amount,

welcome_bonus,

referral_bonus

`)

.single();





if(rulesError){

throw rulesError;

}






const { data: tiers, error: tiersError } =
await supabase
.from("reward_tiers")
.select(`
  tier_name,
  minimum_spend,
  benefits,
  badge_color
`)
.eq("is_active", true)
.order("minimum_spend", {
  ascending: true
});


if(tiersError){
  throw tiersError;
}


const lifetimeSpend =
Number(rewardData.lifetime_spend ?? 0);


const tier =
tiers
?.filter(
(item) =>
lifetimeSpend >= Number(item.minimum_spend)
)
.pop()
??
tiers?.[0];






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








// Timeline progress calculation

let progress = 100;


if(nextTier){

const currentTierIndex =
tiers?.findIndex(
(item)=>
item.tier_name === tier?.tier_name
) ?? 0;







const totalSteps =
(tiers?.length ?? 1) - 1;



// Completed tiers

const completedProgress =
(currentTierIndex / totalSteps) * 100;



// Progress inside current → next tier

const currentTierSpend =
Number(
tier?.minimum_spend ?? 0
);


const nextTierSpend =
Number(
nextTier.minimum_spend
);


const insideProgress =
(
(
lifetimeSpend - currentTierSpend
)
/
(
nextTierSpend - currentTierSpend
)
)
*
(
100 / totalSteps
);



progress =
completedProgress + insideProgress;


progress = Math.max(
0,
Math.min(
progress,
100
)
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

  welcome_bonus:
    rules.welcome_bonus,

  referral_bonus:
    rules.referral_bonus,

}

};




},


});


}