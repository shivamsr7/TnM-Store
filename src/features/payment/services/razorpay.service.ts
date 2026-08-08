import {
supabase
} from "@/shared/lib/supabase";



export async function createRazorpayOrder(

amount:number

){



const {

data,

error

}=await supabase.functions.invoke(

"create-razorpay-order",

{

body:{
amount
}

}

);




if(error)

throw error;



return data;


}



export async function verifyRazorpayPayment(

paymentData:any

){


const {

data,

error

}=await supabase.functions.invoke(

"verify-razorpay-payment",

{

body:paymentData

}

);



if(error)

throw error;



return data;

}