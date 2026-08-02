import {
  supabase
} from "@/shared/lib/supabase";



export async function validateCoupon(

code:string,

cartTotal:number

){


const {

data,

error

}=await supabase

.from("coupons")

.select("*")

.eq(

"code",

code.trim().toUpperCase()

)

.eq(

"is_active",

true

)

.single();





if(error || !data){

throw new Error(
"Invalid coupon code"
);

}





const coupon=data;





const now=new Date();





// Start date validation

if(

coupon.starts_at &&

now < new Date(coupon.starts_at)

){

throw new Error(

"This coupon is not active yet"

);

}






// Expiry validation

if(

coupon.expires_at &&

now > new Date(coupon.expires_at)

){

throw new Error(

"This coupon has expired"

);

}





// Usage limit validation

if(

coupon.usage_limit &&

coupon.used_count >= coupon.usage_limit

){

throw new Error(

"This coupon limit has been reached"

);

}





// Minimum order validation

if(

cartTotal < coupon.minimum_order_amount

){

throw new Error(

`Minimum order value ₹${coupon.minimum_order_amount} required`

);

}







let discount=0;

let freeShipping=false;

let freeGift=false;





switch(coupon.discount_type){



case "percentage":


discount =

(cartTotal * coupon.discount_value)

/

100;



if(

coupon.maximum_discount

){

discount=Math.min(

discount,

coupon.maximum_discount

);

}


break;







case "fixed":


discount=coupon.discount_value;


break;







case "free_shipping":


freeShipping=true;


discount=0;


break;







case "free_gift":


freeGift=true;


discount=0;


break;



default:


throw new Error(

"Invalid coupon type"

);


}







return {


coupon,


discount,


freeShipping,


freeGift


};


}