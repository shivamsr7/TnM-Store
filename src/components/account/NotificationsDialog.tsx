import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
  X,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useNavigate,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/hooks/useNotifications";


import {
  timeAgo,
} from "@/features/notifications/utils/timeAgo";


import {
  groupNotifications,
} from "@/features/notifications/utils/groupNotifications";








interface Props {

open:boolean;

onClose:()=>void;

}








function getNotificationIcon(type:string){


switch(type){


case "payment":

return CreditCard;


case "reward":

return Gift;


case "shipping":

return Truck;


case "order":

return Package;


default:

return Bell;


}


}








function getNotificationColor(type:string){


switch(type){


case "payment":

return "bg-emerald-100 text-emerald-700";


case "reward":

return "bg-purple-100 text-purple-700";


case "shipping":

return "bg-blue-100 text-blue-700";


case "order":

return "bg-[#C8A44D]/20 text-[#9A7A22]";


default:

return "bg-neutral-100 text-neutral-700";


}


}









export default function NotificationsDialog({

open,

onClose,

}:Props){





const navigate =
useNavigate();





const {
customer
}=useAuth();







const [

tab,

setTab

]=useState<
"all" | "unread"
>("all");







const {

data:notifications=[],

isLoading,

}=useCustomerNotifications(

customer?.id

);







const {

mutate:markRead

}=useMarkNotificationRead();







const {

mutate:markAllRead

}=useMarkAllNotificationsRead();

const filteredNotifications =

tab==="unread"

?

notifications.filter(
(item:any)=>!item.is_read
)

:

notifications;








const groupedNotifications =

groupNotifications(
filteredNotifications
);








function handleNotificationClick(

item:any

){



markRead(
item.id
);



if(item.reference_id){


onClose();


navigate(
`/account/orders/${item.reference_id}`
);


}


}









return (

<Dialog

open={open}

onOpenChange={(value)=>{

if(!value)

onClose();

}}

>







<DialogContent

className="
max-h-[90vh]
w-[95vw]
overflow-y-auto
rounded-3xl
border-neutral-200
bg-white
p-0
text-black
shadow-xl
sm:max-w-2xl

[&>button]:hidden
"

>








<div

className="
flex
items-center
justify-between
border-b
border-neutral-200
px-6
py-5
"

>


<DialogHeader>


<DialogTitle

className="
text-xl
font-semibold
text-black
"

>

Notifications

</DialogTitle>


</DialogHeader>







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
transition
hover:bg-neutral-100
"

>

<X size={18}/>

</button>



</div>









<div

className="
space-y-5
p-6
"

>









<div

className="
flex
items-center
justify-between
"

>






<div

className="
flex
gap-3
rounded-xl
bg-neutral-100
p-1
"

>


<button

onClick={()=>setTab("all")}

className={`

rounded-lg

px-5

py-2

text-sm

transition


${

tab==="all"

?

"bg-[#C8A44D] text-black"

:

"text-neutral-600 hover:text-black"

}

`}

>

All

</button>







<button

onClick={()=>setTab("unread")}

className={`

rounded-lg

px-5

py-2

text-sm

transition


${

tab==="unread"

?

"bg-[#C8A44D] text-black"

:

"text-neutral-600 hover:text-black"

}

`}

>

Unread

</button>






</div>









<button

onClick={()=>{

if(customer?.id){

markAllRead(
customer.id
);

}

}}

className="
text-sm
font-medium
text-[#9A7A22]
hover:text-black
"

>

Mark all read

</button>








</div>









{

isLoading && (

<div

className="
py-10
text-center
text-sm
text-neutral-500
"

>

Loading notifications...

</div>

)

}









{

!isLoading &&

Object.keys(groupedNotifications).length===0 &&

(

<div

className="
rounded-2xl
border
border-neutral-200
py-10
text-center
"

>


<Bell

size={40}

className="
mx-auto
mb-4
text-neutral-400
"

/>





<h3

className="
text-lg
font-medium
text-black
"

>

No notifications

</h3>






<p

className="
mt-2
text-sm
text-neutral-500
"

>

We'll notify you about orders, payments and updates.

</p>





</div>

)

}
id="notif-part3"
<div

className="
space-y-6
"

>


{

Object.entries(
groupedNotifications
)

.map(([group,items]:any)=>(


<div

key={group}

className="
space-y-3
"

>


<h3

className="
text-sm
font-medium
text-neutral-500
"

>

{group}

</h3>







{

items.map((item:any)=>{


const Icon =
getNotificationIcon(
item.type
);





return (

<button

key={item.id}

onClick={()=>handleNotificationClick(item)}

className={`

flex

w-full

gap-4

rounded-2xl

border

p-4

text-left

transition

hover:border-[#C8A44D]/50

hover:bg-neutral-50


${

item.is_read

?

"border-neutral-200 bg-white"

:

"border-[#C8A44D]/40 bg-[#C8A44D]/10"

}

`}

>









<div

className={`

flex

h-12

w-12

shrink-0

items-center

justify-center

rounded-full


${

getNotificationColor(
item.type
)

}

`}

>

<Icon size={22}/>

</div>









<div

className="
flex-1
"

>





<div

className="
flex
items-start
justify-between
gap-3
"

>


<h4

className="
font-medium
text-black
"

>

{item.title}

</h4>







{

!item.is_read && (

<span

className="
mt-1
h-2
w-2
rounded-full
bg-[#C8A44D]
"

/>

)

}



</div>








<p

className="
mt-2
text-sm
leading-relaxed
text-neutral-600
"

>

{item.message}

</p>







<p

className="
mt-3
text-xs
text-neutral-500
"

>

{timeAgo(item.created_at)}

</p>






</div>








</button>

)


})

}



</div>


))

}



</div>







</div>







</DialogContent>







</Dialog>

);

}