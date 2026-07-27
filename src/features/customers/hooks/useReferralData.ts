import {
  useQuery,
} from "@tanstack/react-query";


import {
  supabase,
} from "@/shared/lib/supabase";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";





export function useReferralData(){


const {
  customer,
}=useAuth();





return useQuery({

queryKey:[
"customer-referral",
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






const {

data:referral,

error:referralError

}=await supabase

.from("customer_referrals")

.select(`

referral_code,

total_referrals,

successful_referrals

`)

.eq(
"customer_id",
customer.id
)

.single();





if(referralError){

throw referralError;

}








// Fetch referral rewards earned


const {

data:transactions,

error:transactionError

}=await supabase

.from("reward_transactions")

.select(`
points
`)

.eq(
"customer_id",
customer.id
)

.eq(
"transaction_type",
"referral_bonus"
);







if(transactionError){

throw transactionError;

}






const referralPoints =

transactions?.reduce(

(total,item)=>

total + item.points,

0

) ?? 0;






return {


...referral,


referralPoints


};



}


});

}