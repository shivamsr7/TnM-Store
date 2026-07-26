import {
 User,
 Package,
 Heart,
 Gift,
 Crown,
 LogOut,
} from "lucide-react";

import {
 useAuth
} from "@/features/Auth/context/AuthContext";



const menu = [

{
label:"Profile",
icon:User
},

{
label:"Orders",
icon:Package
},

{
label:"Wishlist",
icon:Heart
},

{
label:"Rewards",
icon:Gift
},

{
label:"Membership",
icon:Crown
},

];




export default function AccountSidebar(){


const {
logout
}=useAuth();



return (

<div

className="
space-y-2
"

>


{

menu.map((item)=>(


<button

key={item.label}

className="
flex
w-full
items-center
gap-3
rounded-xl
border
border-neutral-800
px-4
py-3
text-left
text-sm
text-neutral-300
transition
hover:border-[#C8A44D]
hover:text-[#C8A44D]
"

>


<item.icon

size={18}

/>


{item.label}


</button>


))


}





<button

onClick={logout}

className="
flex
w-full
items-center
gap-3
rounded-xl
border
border-red-900/40
px-4
py-3
text-left
text-sm
text-red-400
"

>


<LogOut size={18}/>


Logout


</button>




</div>

);


}