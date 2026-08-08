import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ContactSupportDialog from "@/components/account/ContactSupportDialog";

import {
  X,
} from "lucide-react";


import {
  useEffect,
  useState,
} from "react";


import {
  getOrderDetails,
} from "../services/order-details.service";


import OrderDetailsContent from "./OrderDetailsContent";







interface Props {

  open:boolean;

  onClose:()=>void;

  orderId:string | null;

}









export default function OrderDetailsDialog({

open,

onClose,

orderId,

}:Props){





const [
order,
setOrder
]=useState<any>(null);





const [
loading,
setLoading
]=useState(false);



const [

showSupport,

setShowSupport

]=useState(false);





useEffect(()=>{


async function loadOrder(){



if(!orderId)

return;





setLoading(true);





try{


const data =
await getOrderDetails(orderId);



setOrder(data);



}

catch(error){


console.error(
"Failed to load order details",
error
);


setOrder(null);


}

finally{


setLoading(false);


}



}





if(open){

loadOrder();

}



},[
open,
orderId
]);









return (

<Dialog

open={open}

onOpenChange={(value)=>{

if(!value){

onClose();

}

}}

>






<DialogContent

className="
flex
max-h-[95vh]
w-[95vw]
flex-col
overflow-hidden
border-neutral-200
bg-white
p-0
text-black

sm:max-w-3xl

[&>button]:hidden
"

>







{/* Custom Header */}

<div

className="
sticky
top-0
z-10
border-b
border-neutral-200
bg-white
px-5
py-4
"

>


<DialogHeader>


<div

className="
flex
items-center
justify-between
"

>


<DialogTitle

className="
text-lg
font-semibold
text-black
"

>

Order Details

</DialogTitle>







<button

onClick={onClose}

className="
flex
h-9
w-9
items-center
justify-center
rounded-full
border
border-neutral-300
text-neutral-700
transition
hover:bg-neutral-100
"

>

<X size={18}/>

</button>






</div>


</DialogHeader>



</div>









{/* Content */}

<div

className="
overflow-y-auto
px-5
py-5
"

>







{

loading && (

<div

className="
py-16
text-center
text-sm
text-neutral-500
"

>

Loading order...

</div>

)

}







{

!loading && order && (

<OrderDetailsContent

order={order}

onContactSupport={()=>setShowSupport(true)}

/>

)

}







{

!loading && !order && (

<div

className="
py-16
text-center
text-sm
text-neutral-500
"

>

Order not found

</div>

)

}






</div>







</DialogContent>


<ContactSupportDialog

open={showSupport}

onClose={()=>setShowSupport(false)}

/>




</Dialog>

);

}