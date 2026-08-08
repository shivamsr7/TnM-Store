import {
  useQuery,
} from "@tanstack/react-query";


import {
  supabase,
} from "@/shared/lib/supabase";





async function fetchCustomerOrders(
  customerId:string
){


const {
  data,
  error,

}=await supabase

.from("orders")

.select(`

id,

order_number,

order_status,

total_amount,

created_at

`)

.eq(
"customer_id",
customerId
)

.order(
"created_at",
{
  ascending:false
}

)

.limit(3);






if(error){

throw error;

}





return data ?? [];

}








export function useCustomerOrders(
  customerId?:string
){


return useQuery({


queryKey:[

"customer-orders",

customerId

],




queryFn:()=>fetchCustomerOrders(
customerId!
),




enabled:
!!customerId,



});

}