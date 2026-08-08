import {
  Package,
  MapPin,
  Bell,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react";

import NotificationsDialog from "./NotificationsDialog";
import ContactSupportDialog from "./ContactSupportDialog";
import {
  useNavigate,
} from "react-router-dom";


import {
  useState,
} from "react";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import LogoutConfirmDialog from "./LogoutConfirmDialog";






interface Props {

onOpenAddresses:()=>void;

}







export default function AccountActions({

onOpenAddresses,

}:Props){



const navigate =
useNavigate();




const {
logout
}=useAuth();







const [

showLogout,

setShowLogout

]=useState(false);






const [

loggingOut,

setLoggingOut

]=useState(false);


const [
showNotifications,
setShowNotifications
]=useState(false);


const [
showSupport,
setShowSupport
]=useState(false);






const actions=[


{

title:"My Orders",

description:"Track and manage your orders",

icon:Package,

action:()=>navigate("/account/orders"),

},





{

title:"Saved Addresses",

description:"Manage delivery addresses",

icon:MapPin,

action:onOpenAddresses,

},




{
title:"Notifications",
description:"View your updates",
icon:Bell,
action:()=>setShowNotifications(true),
},


{
title:"Contact Support",
description:"Need help? Contact us",
icon:Headphones,
action:()=>setShowSupport(true),
},



];









async function handleLogout(){


try{


setLoggingOut(true);


await logout();


setShowLogout(false);



}

finally{


setLoggingOut(false);


}



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
lg:sticky
lg:top-5
"

>







<h2

className="
mb-5
text-lg
font-semibold
text-white
"

>

Account

</h2>








<div

className="
space-y-3
"

>

{

actions.map((item)=>{


const Icon=item.icon;



return (

<button

key={item.title}

onClick={item.action}

className="
group
flex
min-h-[70px]
w-full
items-center
justify-between
rounded-xl
border
border-neutral-800
p-4
text-left
transition
hover:border-[#C8A44D]/50
hover:bg-neutral-900
"

>






<div

className="
flex
items-center
gap-4
"

>


<div

className="
flex
h-11
w-11
items-center
justify-center
rounded-full
bg-[#C8A44D]/20
text-[#C8A44D]
"

>

<Icon size={20}/>

</div>






<div>

<p

className="
text-sm
font-medium
text-white
"

>

{item.title}

</p>


<p

className="
mt-1
text-xs
text-neutral-400
"

>

{item.description}

</p>


</div>



</div>






<ChevronRight

size={18}

className="
text-neutral-500
transition
group-hover:text-[#C8A44D]
"

/>





</button>

)


})

}



</div>









<button

onClick={()=>setShowLogout(true)}

className="
mt-5
flex
min-h-[50px]
w-full
items-center
justify-center
gap-2
rounded-xl
border
border-red-500/30
text-sm
text-red-400
transition
hover:bg-red-500/10
"

>

<LogOut size={18}/>

Logout

</button>







</div>









<LogoutConfirmDialog

open={showLogout}

loading={loggingOut}

onClose={()=>setShowLogout(false)}

onConfirm={handleLogout}

/>
<NotificationsDialog

open={showNotifications}

onClose={()=>setShowNotifications(false)}

/>



<ContactSupportDialog

open={showSupport}

onClose={()=>setShowSupport(false)}

/>





</>

);

}