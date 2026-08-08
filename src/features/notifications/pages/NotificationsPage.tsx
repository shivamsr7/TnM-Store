import {
  useState,
} from "react";


import {
  useNavigate,
} from "react-router-dom";


import {
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
} from "lucide-react";



import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



import {
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useNotifications";



import {
  timeAgo,
} from "../utils/timeAgo";



import {
  groupNotifications,
} from "../utils/groupNotifications";








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

return "bg-[#C8A44D]/20 text-[#C8A44D]";



default:

return "bg-neutral-100 text-neutral-700";


}


}









export default function NotificationsPage(){





const navigate = useNavigate();





const [tab,setTab]=useState<
"all" | "unread"
>("all");







const {
customer

}=useAuth();








const {

data:notifications=[],

isLoading

}=useCustomerNotifications(

customer?.id

);








const {

mutate:markRead

}=useMarkNotificationRead();








const {

mutate:markAllRead

}=useMarkAllNotificationsRead();









if(!customer){


return (

<div className="
py-10
text-center
">

Please login

</div>

);


}








if(isLoading){


return (

<div className="
py-10
text-center
">

Loading notifications...

</div>

);


}









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


navigate(
`/account/orders/${item.reference_id}`
);


}


}

return (

<div className="
mx-auto
max-w-3xl
px-4
py-8
space-y-6
">







{/* Header */}

<div className="
flex
items-center
justify-between
">


<h1 className="
text-2xl
font-semibold
text-white
">

Notifications

</h1>




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
text-[#C8A44D]
hover:text-white
"

>

Mark all read

</button>



</div>









{/* Tabs */}

<div className="
flex
gap-3
rounded-xl
bg-neutral-900
p-1
w-fit
">


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

"text-neutral-400 hover:text-white"

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

"text-neutral-400 hover:text-white"

}

`}

>

Unread

</button>





</div>









{

Object.keys(groupedNotifications).length===0 ? (


<div className="
rounded-2xl
border
border-neutral-800
bg-black
py-12
text-center
">


<Bell

className="
mx-auto
mb-4
text-neutral-600
"

size={40}

/>



<h3 className="
text-lg
font-medium
text-white
">

No notifications

</h3>



<p className="
mt-2
text-sm
text-neutral-500
">

We'll notify you about orders,
payments and rewards.

</p>



</div>



)

:

(


<div className="
space-y-8
">


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


<h2 className="
text-sm
font-medium
text-neutral-400
"

>

{group}

</h2>









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

p-5

text-left

transition

hover:border-[#C8A44D]/40


${

item.is_read

?

"border-neutral-800 bg-black"

:

"border-[#C8A44D]/30 bg-[#C8A44D]/5"

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









<div className="flex-1">


<div className="
flex
items-start
justify-between
gap-3
">


<h3 className="
font-medium
text-white
">

{item.title}

</h3>





{

!item.is_read && (

<span className="
mt-1
h-2
w-2
rounded-full
bg-[#C8A44D]
"

>

</span>

)

}



</div>







<p className="
mt-2
text-sm
text-neutral-400
">

{item.message}

</p>








<p className="
mt-3
text-xs
text-neutral-500
">

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


)

}





</div>

);

}