import {
  useCoupons
} from "./useCoupons";



export function useBestCoupon(cartTotal:number){


const {
data:coupons=[],
isLoading
}=useCoupons();




const now=new Date();



const eligibleCoupons=coupons.filter((coupon:any)=>{


if(!coupon.is_active)

return false;



if(

coupon.starts_at &&

now < new Date(coupon.starts_at)

)

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




if(

cartTotal < coupon.minimum_order_amount

)

return false;



return true;


});





const couponsWithSaving = eligibleCoupons.map((coupon:any)=>{


let saving=0;



if(coupon.discount_type==="percentage"){


saving =

(cartTotal *

coupon.discount_value)

/

100;



if(coupon.maximum_discount){

saving=Math.min(

saving,

coupon.maximum_discount

);

}


}





if(coupon.discount_type==="fixed"){


saving=coupon.discount_value;


}





return {

...coupon,

estimatedSaving:saving

};


});





const bestCoupon = couponsWithSaving.sort(

(a,b)=>

b.estimatedSaving-a.estimatedSaving

)[0];




return {

bestCoupon,

isLoading

};


}