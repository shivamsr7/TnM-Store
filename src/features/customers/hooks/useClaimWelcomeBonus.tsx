import { useMutation, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



export function useClaimWelcomeBonus() {


const {
customer
}=useAuth();


const queryClient = useQueryClient();




return useMutation({

mutationFn: async()=>{


if(!customer?.id){

throw new Error(
"Customer not found"
);

}





const {
data:rules,
error:rulesError
}=await supabase

.from("reward_rules")

.select("welcome_bonus")

.single();



if(rulesError){

throw rulesError;

}





const {
data:reward,
error:rewardError
}=await supabase

.from("customer_rewards")

.select(`
id,
current_points,
lifetime_earned,
welcome_bonus_given
`)

.eq(
"customer_id",
customer.id
)

.single();





if(rewardError){

throw rewardError;

}





if(reward.welcome_bonus_given){

throw new Error(
"Welcome bonus already claimed"
);

}





const bonus =
rules.welcome_bonus;






const {
error:updateError
}=await supabase

.from("customer_rewards")

.update({

current_points:
reward.current_points + bonus,

lifetime_earned:
reward.lifetime_earned + bonus,

welcome_bonus_given:true,

updated_at:new Date()

})

.eq(
"id",
reward.id
);






if(updateError){

throw updateError;

}







const {
error:transactionError
}=await supabase

.from("reward_transactions")

.insert({

customer_id:
customer.id,

transaction_type:
"welcome_bonus",

points:
bonus,

description:
"Welcome bonus claimed"

});





if(transactionError){

throw transactionError;

}


},





onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"customer-membership"
]

});


queryClient.invalidateQueries({

queryKey:[
"reward-transactions"
]

});


}



});


}