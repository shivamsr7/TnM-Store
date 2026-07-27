import { supabase } from "@/shared/lib/supabase";


export async function applyReferralCode(
  customerId: string,
  referralCode: string
){

  if(!referralCode){
    return;
  }



  const {
    data:referrer,
    error:referrerError
  } = await supabase

  .from("customer_referrals")

  .select(`
    customer_id
  `)

  .eq(
    "referral_code",
    referralCode
  )

  .single();





  if(referrerError || !referrer){

    throw new Error(
      "Invalid referral code"
    );

  }






  // Prevent self referral

  if(
    referrer.customer_id === customerId
  ){

    throw new Error(
      "You cannot use your own referral code"
    );

  }







  // Update new customer's referral record


  const {
    error:updateError

  } = await supabase

  .from("customer_referrals")

  .update({

    referred_by:
    referrer.customer_id

  })

  .eq(
    "customer_id",
    customerId
  );






  if(updateError){

    throw updateError;

  }



}