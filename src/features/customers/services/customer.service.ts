import { supabase } from "@/shared/lib/supabase";



export async function getCustomerByPhone(
phone:string
){

const {
data,
error
}=await supabase
.from("customers")
.select("*")
.eq("phone", phone)
.is("deleted_at", null)
.maybeSingle();



if(error){

throw error;

}



return data;

}






export async function createCustomer(

customer:{
first_name:string;
last_name?:string;
email?:string;
phone:string;
}

){


const {
data,
error
}=await supabase
.from("customers")
.insert({

first_name:
customer.first_name,

last_name:
customer.last_name || null,

email:
customer.email || null,

phone:
customer.phone,

phone_verified:true,

last_login_at:
new Date().toISOString()

})
.select()
.single();



if(error){

throw error;

}



return data;

}