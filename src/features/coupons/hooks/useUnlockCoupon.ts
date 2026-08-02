import {
  useCoupons
} from "./useCoupons";



export function useUnlockCoupon(cartTotal:number){


const {
data:coupons=[],
isLoading
}=useCoupons();



const now=new Date();



const lockedCoupons = coupons.filter((coupon:any)=>{


if(!coupon.is_active)

return false;



if(

coupon.expires_at &&

now > new Date(coupon.expires_at)

)

return false;



if(

coupon.usage_limit &&

coupon.used_count >= coupon.usage_limit

)

return false;



return (

coupon.minimum_order_amount > cartTotal

);


});





const nearestCoupon = lockedCoupons.sort(

(a,b)=>

a.minimum_order_amount -

b.minimum_order_amount

)[0];





if(!nearestCoupon)

return {

unlockCoupon:null,

remainingAmount:0,

isLoading

};






return {

unlockCoupon:nearestCoupon,

remainingAmount:

nearestCoupon.minimum_order_amount-cartTotal,

isLoading

};



}