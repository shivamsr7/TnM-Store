import {
  useEffect,
  useState,
} from "react";


import {
  useParams,
} from "react-router-dom";


import {
  getOrderDetails,
} from "../services/order-details.service";


import {
  ORDER_STEPS,
  getStatusIndex,
} from "../utils/order-status";







function StatusBadge({
  status,
}:{
  status:string;
}){


const colors:any={


pending:
"bg-yellow-500/10 text-yellow-400 border-yellow-500/20",


confirmed:
"bg-blue-500/10 text-blue-400 border-blue-500/20",


packed:
"bg-purple-500/10 text-purple-400 border-purple-500/20",


shipped:
"bg-indigo-500/10 text-indigo-400 border-indigo-500/20",


delivered:
"bg-green-500/10 text-green-400 border-green-500/20",


cancelled:
"bg-red-500/10 text-red-400 border-red-500/20",


};



return (

<span

className={`
rounded-full
border
px-3
py-1
text-xs
capitalize
${colors[status] ?? "bg-neutral-800 text-neutral-300"}
`}

>

{status}

</span>

);

}









export default function OrderDetails(){



const {
id
}=useParams();



const [
order,
setOrder
]=useState<any>(null);



const [
loading,
setLoading
]=useState(true);








useEffect(()=>{


async function load(){


if(!id)

return;



try{


const data =
await getOrderDetails(id);


setOrder(data);


}

catch(error){


console.error(
"Failed to fetch order",
error
);


}

finally{


setLoading(false);


}


}



load();


},[id]);









if(loading){


return (

<div className="
min-h-screen
bg-black
py-10
text-center
text-neutral-400
">

Loading order...

</div>

);


}








if(!order){


return (

<div className="
min-h-screen
bg-black
py-10
text-center
text-neutral-400
">

Order not found

</div>

);


}







const currentStatusIndex =

getStatusIndex(
order.order_status
);







return (

<div className="
min-h-screen
bg-black
px-4
py-8
text-white
"

>

<div className="
mx-auto
max-w-3xl
space-y-6
"

>
    {/* Order Header */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<div className="
flex
items-start
justify-between
gap-4
">


<div>


<h2 className="
text-2xl
font-semibold
text-white
">

Order Details

</h2>




<p className="
mt-3
font-medium
text-[#C8A44D]
">

#{order.order_number}

</p>





<p className="
mt-1
text-sm
text-neutral-400
">

Placed on{" "}

{

new Date(
order.created_at
).toLocaleDateString(
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









{/* Order Timeline */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<h3 className="
mb-6
font-semibold
text-white
">

Order Status

</h3>






<div className="
space-y-6
">


{

ORDER_STEPS.map((step,index)=>{


const completed =

index <= currentStatusIndex;





return (

<div

key={step.key}

className="
flex
items-center
gap-4
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

"bg-neutral-700"

}

`}

/>







<p

className={`

text-sm

${

completed

?

"text-white font-medium"

:

"text-neutral-500"

}

`}

>

{step.label}

</p>






</div>

)

})


}



</div>


</div>









{/* Items */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<h3 className="
mb-5
font-semibold
text-white
">

Items

</h3>







<div className="
space-y-4
">


{

order.order_items?.map((item:any)=>(


<div

key={item.id}

className="
flex
items-center
justify-between
gap-4
rounded-xl
border
border-neutral-800
p-3
"

>


<div className="
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

className="
h-16
w-16
rounded-xl
object-cover
"







/>







<div>


<p className="
font-medium
text-white
">

{item.product_name}

</p>




<p className="
mt-1
text-sm
text-neutral-400
">

Qty: {item.quantity}

</p>



</div>





</div>







<p className="
font-semibold
text-[#C8A44D]
">

₹{item.total}

</p>







</div>


))


}



</div>


</div>

{/* Payment Details */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<h3 className="
font-semibold
text-white
">

Payment

</h3>





<div className="
mt-4
space-y-3
text-sm
"

>



<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Method

</span>


<span className="capitalize text-white">

{order.payment_method}

</span>


</div>







<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Transaction ID

</span>


<span className="max-w-[180px] truncate text-white">

{order.payment_transaction_id || "Not available"}

</span>


</div>






</div>



</div>









{/* Amount Summary */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<h3 className="
mb-4
font-semibold
text-white
">

Payment Summary

</h3>





<div className="
space-y-3
text-sm
"

>


<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Subtotal

</span>


<span>

₹{order.subtotal ?? order.total_amount}

</span>


</div>







<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Discount

</span>


<span>

- ₹{order.discount ?? 0}

</span>


</div>







<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Shipping

</span>


<span>

₹{order.shipping_charge ?? 0}

</span>


</div>









<hr className="
border-neutral-800
"

 />








<div className="
flex
justify-between
font-semibold
"

>

<span>

Total

</span>


<span className="text-[#C8A44D]">

₹{order.total_amount}

</span>


</div>







{

order.advance_amount > 0 && (


<>


<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Paid

</span>


<span className="text-green-400">

₹{order.advance_amount}

</span>


</div>







<div className="
flex
justify-between
"

>

<span className="text-neutral-400">

Remaining

</span>


<span className="text-yellow-400">

₹{order.remaining_amount}

</span>


</div>


</>


)

}



</div>



</div>









{/* Delivery Address */}


<div className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
">


<h3 className="
font-semibold
text-white
">

Delivery Address

</h3>





<div className="
mt-4
space-y-1
text-sm
text-neutral-300
"

>


<p>

{order.shipping_full_name}

</p>



<p>

{order.shipping_phone}

</p>



<p>

{order.shipping_address}

</p>



<p>

{order.shipping_city},

{" "}

{order.shipping_state}

{" - "}

{order.shipping_pincode}

</p>



{

order.shipping_landmark && (

<p className="text-neutral-400">

Landmark: {order.shipping_landmark}

</p>

)

}



</div>



</div>









{/* Final Total */}


<div className="
flex
justify-between
rounded-2xl
bg-[#C8A44D]
p-5
font-semibold
text-black
"

>


<span>

Total Paid

</span>



<span>

₹{order.total_amount}

</span>



</div>


</div>






</div>


);

}


