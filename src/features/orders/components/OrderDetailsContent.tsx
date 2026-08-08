import {
  ORDER_STEPS,
  getStatusIndex,
} from "../utils/order-status";



interface Props {

order:any;

onContactSupport?:()=>void;

}







function StatusBadge({

status,

}:{

status:string;

}){


const styles:any={


pending:
"bg-yellow-50 text-yellow-700 border-yellow-200",

confirmed:
"bg-blue-50 text-blue-700 border-blue-200",

packed:
"bg-purple-50 text-purple-700 border-purple-200",

shipped:
"bg-indigo-50 text-indigo-700 border-indigo-200",

delivered:
"bg-green-50 text-green-700 border-green-200",

cancelled:
"bg-red-50 text-red-700 border-red-200",

};



return (

<span

className={`
rounded-full
border
px-4
py-1.5
text-xs
font-medium
capitalize
${styles[status] ?? "bg-neutral-100 text-neutral-600"}
`}

>

{status}

</span>

);

}








export default function OrderDetailsContent({

order,

onContactSupport,

}:Props){



const currentStatusIndex =

getStatusIndex(
order.order_status
);






return (

<div

className="
space-y-6
text-black
"

>







{/* Order Header */}

<div

className="
rounded-3xl
border
border-neutral-200
bg-neutral-50
p-5
"

>


<div

className="
flex
flex-col
gap-4
sm:flex-row
sm:items-start
sm:justify-between
"

>


<div>


<p

className="
text-sm
text-neutral-500
"

>

Order Number

</p>


<h2

className="
mt-1
text-xl
font-semibold
"

>

#{order.order_number}

</h2>




<p

className="
mt-2
text-sm
text-neutral-500
"

>

Placed on{" "}

{

new Date(order.created_at)

.toLocaleDateString(

"en-IN",

{

day:"2-digit",

month:"short",

year:"numeric"

}

)

}

</p>


</div>







<StatusBadge

status={
order.order_status
}

/>






</div>


</div>

// Order Timeline

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
mb-6
font-semibold
"

>

Order Status

</h3>








<div

className="
space-y-5
"

>


{

ORDER_STEPS.map((step,index)=>{


const completed =

index <= currentStatusIndex;





return (

<div

key={step.key}

className="
flex
items-start
gap-4
"

>





<div

className="
flex
flex-col
items-center
"

>


<div

className={`

h-4

w-4

rounded-full

${

completed

?

"bg-[#C8A44D]"

:

"bg-neutral-300"

}

`}

/>







{

index !== ORDER_STEPS.length - 1 && (

<div

className={`

mt-1

h-8

w-px

${

completed

?

"bg-[#C8A44D]"

:

"bg-neutral-300"

}

`}

/>

)

}



</div>







<div>

<p

className={`

text-sm

${

completed

?

"font-medium text-black"

:

"text-neutral-400"

}

`}

>

{step.label}

</p>






{

completed && (

<p

className="
mt-1
text-xs
text-neutral-500
"

>

Completed

</p>

)

}



</div>






</div>

)

})

}



</div>







</div>









{/* Items */}

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
mb-5
font-semibold
"

>

Items

</h3>







<div

className="
space-y-3
"

>


{

order.order_items?.map((item:any)=>(


<div

key={item.id}

className="
flex
flex-col
gap-3
rounded-2xl
border
border-neutral-200
p-3
sm:flex-row
sm:items-center
sm:justify-between
"

>







<div

className="
flex
items-center
gap-3
"

>



<img

src={

item.product_image ||

"/placeholder.png"

}

alt={item.product_name}

className="
h-16
w-16
rounded-xl
border
border-neutral-200
object-cover
"

/>







<div>


<p

className="
font-medium
text-black
"

>

{item.product_name}

</p>






<p

className="
mt-1
text-sm
text-neutral-500
"

>

Qty: {item.quantity}

</p>






</div>





</div>







<p

className="
font-semibold
text-[#C8A44D]
"

>

₹{item.total}

</p>







</div>





))

}



</div>







</div>

{/* Payment */}

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
font-semibold
"

>

Payment

</h3>







<div

className="
mt-5
space-y-4
text-sm
"

>






<div

className="
flex
justify-between
gap-4
"

>


<span

className="
text-neutral-500
"

>

Payment Method

</span>






<span

className="
font-medium
capitalize
"

>

{order.payment_method}

</span>






</div>








<div

className="
flex
justify-between
gap-4
"

>


<span

className="
text-neutral-500
"

>

Transaction ID

</span>






<span

className="
max-w-[200px]
break-all
text-right
text-sm
font-medium
"

>

{

order.payment_transaction_id ||

"Not available"

}

</span>






</div>






</div>







</div>









{/* Payment Summary */}

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
mb-5
font-semibold
"

>

Payment Summary

</h3>







<div

className="
space-y-4
text-sm
"

>



<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Subtotal

</span>


<span>

₹{order.subtotal}

</span>


</div>








<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Discount

</span>


<span>

- ₹{order.discount}

</span>


</div>







<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Shipping

</span>


<span>

₹{order.shipping_charge}

</span>


</div>








{

order.tax > 0 && (

<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Tax

</span>


<span>

₹{order.tax}

</span>


</div>

)

}







{

order.coupon_code && (

<div

className="
rounded-xl
bg-[#C8A44D]/10
p-3
text-sm
"

>


<p

className="
font-medium
text-[#9A7A22]
"

>

Coupon Applied

</p>



<p

className="
mt-1
text-neutral-600
"

>

{order.coupon_code}

</p>


</div>

)

}







<div

className="
border-t
border-neutral-200
pt-4
"

 />








<div

className="
flex
justify-between
text-base
font-semibold
"

>

<span>

Total

</span>


<span

className="
text-[#C8A44D]
"

>

₹{order.total_amount}

</span>


</div>







</div>






</div>









{/* Shipping Details */}

{

(order.courier_name || order.tracking_number) && (

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
font-semibold
"

>

Shipping Details

</h3>







<div

className="
mt-4
space-y-3
text-sm
"

>





{

order.courier_name && (

<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Courier

</span>


<span

className="
font-medium
"

>

{order.courier_name}

</span>


</div>

)

}









{

order.tracking_number && (

<div

className="
flex
justify-between
gap-4
"

>

<span

className="
text-neutral-500
"

>

Tracking Number

</span>


<span

className="
break-all
font-medium
"

>

{order.tracking_number}

</span>


</div>

)

}



</div>







</div>

)

}









{/* Delivery Address */}

<div

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
"

>


<h3

className="
font-semibold
"

>

Delivery Address

</h3>







<div

className="
mt-4
space-y-1.5
text-sm
text-neutral-600
"

>


<p

className="
font-medium
text-black
"

>

{order.shipping_full_name}

</p>



<p>

{order.shipping_phone}

</p>



<p

className="
leading-relaxed
"

>

{order.shipping_address}

</p>



<p>

{order.shipping_city},

{" "}

{order.shipping_state}

-

{order.shipping_pincode}

</p>



{

order.shipping_landmark && (

<p>

Landmark: {order.shipping_landmark}

</p>

)

}



</div>







</div>









{/* Contact Support */}

{

onContactSupport && (

<div

className="
rounded-3xl
border
border-[#C8A44D]/30
bg-[#C8A44D]/10
p-5
"

>


<h3

className="
font-semibold
text-[#9A7A22]
"

>

Need help with this order?

</h3>







<p

className="
mt-2
text-sm
text-neutral-600
"

>

Our support team is always here to help.

</p>








<button

onClick={onContactSupport}

className="
mt-4
rounded-xl
border
border-[#C8A44D]
px-5
py-2
text-sm
font-medium
text-[#9A7A22]
transition
hover:bg-[#C8A44D]
hover:text-black
"

>

Contact Support

</button>






</div>

)

}









{/* Final Total */}

<div

className="
flex
items-center
justify-between
rounded-3xl
bg-[#C8A44D]
p-5
font-semibold
text-black
"

>


<span>

Total Paid

</span>




<span

className="
text-lg
"

>

₹{order.total_amount}

</span>






</div>








</div>

);

}