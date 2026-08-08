import {
  supabase
} from "@/shared/lib/supabase";



export async function updateOrderStatus(

orderId:string,

status:string

){


const {

data,

error

}=await supabase

.from("orders")

.update({

order_status:status

})

.eq(

"id",

orderId

)

.select()

.single();




if(error){

console.error(
"Update order status failed",
error
);

throw error;

}



return data;


}