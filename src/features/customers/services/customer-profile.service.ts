import {
  supabase,
} from "@/shared/lib/supabase";





export async function updateCustomerProfile(

id:string,

data:{
first_name:string;
last_name?:string;
avatar?:string | null;
}

){



const {

data:updatedCustomer,

error

}=await supabase

.from("customers")

.update({

first_name:data.first_name,

last_name:data.last_name,

avatar:data.avatar,

})

.eq(
"id",
id
)

.select()

.single();






if(error){

throw error;

}




return updatedCustomer;

}