import {
  Package,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  Link,
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
"border-yellow-500/30 bg-yellow-500/10 text-yellow-400",


confirmed:
"border-blue-500/30 bg-blue-500/10 text-blue-400",


packed:
"border-purple-500/30 bg-purple-500/10 text-purple-400",


shipped:
"border-indigo-500/30 bg-indigo-500/10 text-indigo-400",


delivered:
"border-green-500/30 bg-green-500/10 text-green-400",


cancelled:
"border-red-500/30 bg-red-500/10 text-red-400",


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
${styles[status] ?? "border-neutral-700 bg-neutral-800 text-neutral-400"}
`}

>

{status}

</span>

);

}








export default function RecentOrders(){



const {
customer
}=useAuth();




const {

data:orders=[],

isLoading

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
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
text-sm
text-neutral-400
"

>

Loading orders...

</div>

);


}








return (

<>


<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-5
"

>







<div

className="
mb-5
flex
items-center
justify-between
"

>


<h2

className="
text-lg
font-semibold
text-white
"

>

Recent Orders

</h2>





<Link

to="/account/orders"

className="
text-sm
text-[#C8A44D]
hover:text-white
"

>

View All

</Link>



</div>









{

orders.length === 0 ? (


<div

className="
py-10
text-center
"

>


<Package

size={40}

className="
mx-auto
mb-3
text-neutral-700
"

/>



<p

className="
text-sm
text-neutral-400
"

>

No orders yet

</p>



</div>



)

:

(


<div

className="
space-y-3
"

>


{

orders.map((order:any)=>(


<div

key={order.id}

className="
rounded-xl
border
border-neutral-800
p-4
transition
hover:border-[#C8A44D]/40
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
font-semibold
text-white
"

>

#{order.order_number}

</p>




<p

className="
mt-1
text-xs
text-neutral-500
"

>

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







<OrderStatusBadge

status={
order.order_status
}

/>





</div>









<div

className="
mt-4
flex
items-center
justify-between
"

>



<p

className="
text-base
font-semibold
text-[#C8A44D]
"

>

₹{order.total_amount}

</p>







<button

onClick={()=>setSelectedOrder(order.id)}

className="
text-sm
text-neutral-300
transition
hover:text-[#C8A44D]
"

>

View Order →

</button>







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