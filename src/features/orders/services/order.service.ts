import {
  supabase
} from "@/shared/lib/supabase";

import type {
  CreateOrderPayload
} from "../types/order.types";


import {
  notificationService
} from "@/features/notifications/services/notification.service";


function generateOrderNumber(){

  return `TNM-${Date.now()}`;

}






async function createOrderActivity({

  orderId,
  eventType,
  title,
  description,
  metadata

}:{

  orderId:string;

  eventType:string;

  title:string;

  description?:string;

  metadata?:Record<string,unknown>;

}){


const {
  data:{
    user
  }
}=await supabase.auth.getUser();




const {

error

}=await supabase

.from("order_activity")

.insert({

  order_id:orderId,

  event_type:eventType,

  title,

  description:description ?? null,

  metadata:metadata ?? {},

  created_by:user?.id ?? null

});



if(error){

console.error(
"Create activity failed:",
error
);

}


}









export async function createOrder(

  payload:CreateOrderPayload

){





const orderNumber = generateOrderNumber();







const orderData = {


// Order

order_number:orderNumber,





// Customer

customer_id:
payload.customerId ?? null,


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


payment_transaction_id:
payload.paymentTransactionId ?? null,







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







const orderId = data;









// Activity 1: Order Created

await createOrderActivity({

orderId,


eventType:"order_created",


title:"Order Created",


description:
`Order #${orderNumber} was placed successfully.`,


metadata:{

order_number:orderNumber

}

});









// Notification 1: Order Placed

if(payload.customerId){


await notificationService.createNotification({

customerId:
payload.customerId,


title:
"Order Placed",


message:
`Your order #${orderNumber} has been placed successfully.`,


type:"order",


referenceId:
orderId,


});


}









// Activity 2: Payment Received

if(payload.paymentMethod==="prepaid"){


await createOrderActivity({

orderId,


eventType:"payment_received",


title:"Payment Received",


description:
`Payment received for order #${orderNumber}.`,


metadata:{

payment_method:"prepaid",

transaction_id:
payload.paymentTransactionId ?? null

}

});









// Notification 2: Payment Received


if(payload.customerId){


await notificationService.createNotification({

customerId:
payload.customerId,


title:
"Payment Received",


message:
`Payment received for order #${orderNumber}.`,


type:"payment",


referenceId:
orderId,


});


}


}







return {


orderId,


orderNumber


};


}