import { supabase } from "@/shared/lib/supabase";



export async function sendOtp(
  phone:string
){

const {
  data,
  error
}=await supabase.auth.signInWithOtp({

phone:`+91${phone}`

});


if(error){

throw error;

}


return data;

}






export async function verifyOtp(
phone:string,
otp:string
){


const {

data,

error

}=await supabase.auth.verifyOtp({

phone:`+91${phone}`,

token:otp,

type:"sms"

});



if(error){

throw error;

}



return data;


}