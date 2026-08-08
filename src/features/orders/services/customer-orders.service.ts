import {
  supabase
} from "@/shared/lib/supabase";



export async function getCustomerOrders(

customerId:string

){


const {

data,

error

}=await supabase

.from("orders")

.select(`

*

,

order_items(

*

)

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

);





if(error){

console.error(
"Fetch orders failed:",
error
);

throw error;

}



return data ?? [];

}