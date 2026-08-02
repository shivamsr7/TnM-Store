import {
  supabase
} from "@/shared/lib/supabase";



export async function incrementCouponUsage(

couponId:string

){

const {

data:coupon,

error:fetchError

}=await supabase

.from("coupons")

.select("used_count")

.eq("id",couponId)

.single();



if(fetchError)

throw fetchError;



const updatedCount =

(coupon.used_count ?? 0) + 1;





const {

error

}=await supabase

.from("coupons")

.update({

used_count:updatedCount

})

.eq(

"id",

couponId

);



if(error)

throw error;



return true;

}