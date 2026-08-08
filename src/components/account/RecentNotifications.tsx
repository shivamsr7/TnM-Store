import {
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerNotifications,
  useMarkNotificationRead,
} from "@/features/notifications/hooks/useNotifications";


import {
  timeAgo,
} from "@/features/notifications/utils/timeAgo";







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

return "bg-emerald-500/10 text-emerald-400";



case "reward":

return "bg-purple-500/10 text-purple-400";



case "shipping":

return "bg-blue-500/10 text-blue-400";



case "order":

return "bg-[#C8A44D]/10 text-[#C8A44D]";



default:

return "bg-neutral-800 text-neutral-400";


}

}









export default function RecentNotifications(){



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









function handleClick(item:any){


if(!item.is_read){

markRead(item.id);

}


}









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

Loading notifications...

</div>

);


}









return (

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

Recent Activity

</h2>



<Link

to="/account/notifications"

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

notifications.length===0 ? (


<div

className="
py-10
text-center
"

>


<Bell

size={38}

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

No notifications yet

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

notifications
.slice(0,5)
.map((item:any)=>{


const Icon =
getNotificationIcon(
item.type
);



return (

<button

key={item.id}

onClick={()=>handleClick(item)}

className={`

flex

w-full

gap-3

rounded-xl

border

p-4

text-left

transition

hover:border-[#C8A44D]/40


${

item.is_read

?

"border-neutral-800"

:

"border-[#C8A44D]/40 bg-[#C8A44D]/5"

}

`}

>







<div

className={`

flex

h-11

w-11

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

<Icon size={20}/>

</div>








<div

className="
min-w-0
flex-1
"

>


<div

className="
flex
items-start
justify-between
gap-2
"

>


<p

className="
text-sm
font-medium
text-white
"

>

{item.title}

</p>





{

!item.is_read && (

<span

className="
mt-1
h-2
w-2
shrink-0
rounded-full
bg-[#C8A44D]
"

/>

)

}



</div>








<p

className="
mt-1
line-clamp-2
text-xs
leading-relaxed
text-neutral-400
"

>

{item.message}

</p>








<p

className="
mt-2
text-[11px]
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


)

}





</div>

);

}