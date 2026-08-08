import {
  supabase
} from "@/shared/lib/supabase";





export async function getCustomerAddresses(

customerId:string

){


const {

data,

error

}=await supabase

.from("customer_addresses")

.select("*")

.eq(

"customer_id",

customerId

)

.order(

"is_default",

{

ascending:false

}

)

.order(

"created_at",

{

ascending:false

}

);





if(error)

throw error;



return data ?? [];

}








export async function createCustomerAddress(

address:any

){


const {

data,

error

}=await supabase

.from("customer_addresses")

.insert({

customer_id:
address.customer_id,


type:
address.type ?? "home",


full_name:
address.full_name,


phone:
address.phone,


address_line_1:
address.address_line_1,


address_line_2:
address.address_line_2 ?? null,


city:
address.city,


state:
address.state,


postal_code:
address.postal_code,


country:
address.country ?? "India",


is_default:
address.is_default ?? false,


})

.select()

.single();





if(error)

throw error;



return data;


}