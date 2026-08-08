import {
  supabase,
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





if(error){

throw error;

}





return data ?? [];

}







export async function deleteCustomerAddress(
id:string
){


const {
error

}=await supabase

.from("customer_addresses")

.delete()

.eq(
"id",
id
);





if(error){

throw error;

}

}





export async function setDefaultAddress(
customerId:string,
addressId:string
){


// remove old default

await supabase

.from("customer_addresses")

.update({

is_default:false

})

.eq(
"customer_id",
customerId
);






// set new default

const {

error

}=await supabase

.from("customer_addresses")

.update({

is_default:true

})

.eq(
"id",
addressId
);





if(error){

throw error;

}

}

export async function createCustomerAddress(
data:any
){


const {
error

}=await supabase

.from("customer_addresses")

.insert(data);





if(error){

throw error;

}


}

export async function updateCustomerAddress(
id:string,
data:any
){


const {
error

}=await supabase

.from("customer_addresses")

.update(data)

.eq(
"id",
id
);





if(error){

throw error;

}

}