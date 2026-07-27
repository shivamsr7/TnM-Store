import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



export function useRewardTransactions(){


const {
customer
}=useAuth();




return useQuery({

queryKey:[
"reward-transactions",
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

data,
error

}=await supabase

.from("reward_transactions")

.select(`

id,

transaction_type,

points,

description,

created_at

`)

.eq(
"customer_id",
customer.id
)

.order(
"created_at",
{
ascending:false
}
);





if(error){

throw error;

}


return data ?? [];

}


});


}