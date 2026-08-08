import {
  useState,
} from "react";


import {
  ArrowLeft,
  Package,
} from "lucide-react";


import {
  useNavigate,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerOrders,
} from "@/features/orders/hooks/useCustomerOrders";


import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog";









function OrderStatusBadge({

status,

}:{

status:string;

}){


const styles:any={


pending:
"border-yellow-200 bg-yellow-50 text-yellow-700",


confirmed:
"border-blue-200 bg-blue-50 text-blue-700",


packed:
"border-purple-200 bg-purple-50 text-purple-700",


shipped:
"border-indigo-200 bg-indigo-50 text-indigo-700",


delivered:
"border-green-200 bg-green-50 text-green-700",


cancelled:
"border-red-200 bg-red-50 text-red-700",


};






return (

<span

className={`
rounded-full
border
px-3
py-1
text-xs
font-medium
capitalize
${

styles[status]

??

"border-neutral-200 bg-neutral-100 text-neutral-600"

}
`}

>

{status}

</span>

);

}









export default function MyOrders(){



const navigate =
useNavigate();






const {
customer
}=useAuth();






const {

data:orders=[],

isLoading,

}=useCustomerOrders(

customer?.id

);







const [

selectedOrder,

setSelectedOrder

]=useState<string | null>(null);







if(isLoading){


return (

<div

className="
py-10
text-center
text-sm
text-neutral-500
"

>

Loading orders...

</div>

);

}








if(!customer){


return (

<div

className="
py-10
text-center
"

>


<h3

className="
font-semibold
text-black
"

>

Please login

</h3>



<p

className="
mt-1
text-sm
text-neutral-500
"

>

Login to view your orders

</p>



</div>

);

}









return (

<>

<div

className="
mx-auto
max-w-4xl
space-y-6
px-4
py-8
"

>








<button

onClick={()=>navigate("/account")}

className="
flex
items-center
gap-2
text-sm
text-neutral-500
transition
hover:text-black
"

>

<ArrowLeft size={16}/>

Back to Account

</button>









<div

className="
space-y-2
"

>


<h1

className="
text-2xl
font-semibold
text-black
sm:text-3xl
"

>

My Orders

</h1>



<p

className="
text-sm
text-neutral-500
"

>

Track your T&M Jewels purchases

</p>





<p

className="
text-sm
font-medium
text-[#9A7A22]
"

>

{orders.length} {orders.length===1 ? "Order" : "Orders"} Found

</p>



</div>









{

orders.length===0 ? (


<div

className="
rounded-3xl
border
border-neutral-200
bg-white
py-14
text-center
shadow-sm
"

>


<Package

size={42}

className="
mx-auto
mb-4
text-neutral-400
"

/>





<h3

className="
font-semibold
text-black
"

>

No orders yet

</h3>






<p

className="
mt-2
text-sm
text-neutral-500
"

>

Start shopping with T&M Jewels

</p>






</div>



)

:

(


<div

className="
space-y-4
"

>


{

orders.map((order:any)=>(


<div

key={order.id}

className="
rounded-3xl
border
border-neutral-200
bg-white
p-5
shadow-sm
transition
hover:shadow-md
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
font-semibold
text-black
"

>

#{order.order_number}

</p>






<p

className="
mt-1
text-sm
text-neutral-500
"

>

Placed on{" "}

{

new Date(
order.created_at
)

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







<OrderStatusBadge

status={
order.order_status
}

/>







</div>







<div

className="
mt-5
border-t
border-neutral-200
pt-5
"

>







<div

className="
flex
items-center
justify-between
"

>


<div>


<p

className="
text-sm
text-neutral-500
"

>

Total Amount

</p>






<p

className="
mt-1
text-lg
font-semibold
text-black
"

>

₹{order.total_amount}

</p>







</div>









<button

onClick={()=>setSelectedOrder(order.id)}

className="
rounded-xl
border
border-[#C8A44D]
px-5
py-2.5
text-sm
font-medium
text-[#9A7A22]
transition
hover:bg-[#C8A44D]
hover:text-black
"

>

View Details

</button>






</div>







</div>







</div>





))

}



</div>





)

}








</div>









<OrderDetailsDialog

open={!!selectedOrder}

orderId={selectedOrder}

onClose={()=>setSelectedOrder(null)}

/>







</>

);

}