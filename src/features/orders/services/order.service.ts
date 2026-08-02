import {
  supabase
} from "@/shared/lib/supabase";

import type {
  CreateOrderPayload
} from "../types/order.types";





function generateOrderNumber(){

  return `TNM-${Date.now()}`;

}






export async function createOrder(

  payload:CreateOrderPayload

){




const orderNumber = generateOrderNumber();





const orderData = {


// Order

order_number:orderNumber,




// Customer

customer_name:
payload.customer.name,


customer_email:
payload.customer.email ?? null,


customer_phone:
payload.customer.phone,






// Amounts

subtotal:
payload.subtotal,


discount:
payload.discount,


shipping_charge:
payload.shippingCharge,


tax:
payload.tax,


total_amount:
payload.totalAmount,






// Payment

advance_amount:
payload.advanceAmount,


remaining_amount:
payload.totalAmount - payload.advanceAmount,


payment_method:
payload.paymentMethod,






// Coupon

coupon_id:
payload.coupon?.id ?? null,


coupon_code:
payload.coupon?.code ?? null,






// Shipping

shipping_full_name:
payload.shipping.fullName,


shipping_phone:
payload.shipping.phone,


shipping_address:
payload.shipping.address,


shipping_city:
payload.shipping.city,


shipping_state:
payload.shipping.state,


shipping_pincode:
payload.shipping.pincode,


shipping_landmark:
payload.shipping.landmark ?? null,







// Items

items:

payload.items.map(item=>({


product_id:item.productId,


product_name:item.productName,


product_image:item.productImage ?? null,


price:item.price,


quantity:item.quantity,


total:item.total,


}))



};








const {

data,

error

}=await supabase.rpc(

"create_order_transaction",

{

order_data:orderData

}

);






if(error){


console.error(

"Create order transaction failed:",

error

);


throw error;


}







return {


orderId:data,


orderNumber


};


}