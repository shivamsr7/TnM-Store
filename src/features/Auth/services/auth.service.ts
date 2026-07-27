import { supabase } from "@/shared/lib/supabase";


const SKIP_OTP =
import.meta.env.VITE_SKIP_OTP === "true";



export async function sendOtp(
  phone:string
){


if(SKIP_OTP){

return {
  skipped:true,
  phone
};

}




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



if(SKIP_OTP){



/*
 Testing login

 Uses existing Supabase auth user
 linked with phone.

*/


const testEmail =
`${phone}@test.tnmjewels.com`;



const {

data,

error

}=await supabase.auth.signInWithPassword({

email:testEmail,

password:"Test@123456"

});





if(error){

throw error;

}



return data;


}







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