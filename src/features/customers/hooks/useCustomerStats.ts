import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";




export function useCustomerStats(){


const {
customer
}=useAuth();





return useQuery({


queryKey:[
"customer-stats",
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





// Orders count

const {

count:ordersCount,

error:ordersError

}=await supabase

.from("orders")

.select(
"id",
{
count:"exact",
head:true
}
)

.eq(
"customer_id",
customer.id
)

.not(
"order_status",
"in",
"('cancelled','returned','refunded')"
);






if(ordersError){

throw ordersError;

}







return {

ordersCount:
ordersCount ?? 0,

};




},


});


}