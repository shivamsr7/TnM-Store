import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";





export function useCustomerProfile(){



const {
customer
}=useAuth();





return useQuery({


queryKey:[
"customer-profile",
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

.from("customers")

.select(`

id,

first_name,

last_name,

email,

phone,

created_at

`)

.eq(
"id",
customer.id
)

.single();





if(error){

throw error;

}





return data;



},


});

}