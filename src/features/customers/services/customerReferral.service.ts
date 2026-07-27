import { supabase } from "@/shared/lib/supabase";


export async function applyReferralCode(
  customerId: string,
  referralCode: string
){

const {
data:referral,
error
}=await supabase
.from("customer_referrals")
.select("customer_id")
.eq(
"referral_code",
referralCode
)
.single();



if(error){

throw error;

}



const {
error:updateError
}=await supabase
.from("customer_referrals")
.update({

referred_by:
referral.customer_id,

})
.eq(
"customer_id",
customerId
);



if(updateError){

throw updateError;

}


}