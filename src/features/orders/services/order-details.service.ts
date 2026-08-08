import {
  supabase
} from "@/shared/lib/supabase";



export async function getOrderDetails(

orderId:string

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
"id",
orderId
)

.single();





if(error){

throw error;

}



return data;


}