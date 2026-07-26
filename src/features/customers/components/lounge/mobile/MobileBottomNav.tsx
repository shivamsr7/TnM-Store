import {
  Home,
  Grid2X2,
  Heart,
  Sparkles,
  User,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";





const items = [

{
label:"Home",
icon:Home,
path:"/",
},


{
label:"Categories",
icon:Grid2X2,
path:"/shop",
},


{
label:"Wishlist",
icon:Heart,
path:"/wishlist",
},


{
label:"Lounge",
icon:Sparkles,
path:"/account",
},


{
label:"Account",
icon:User,
path:"/account",
},

];






export default function MobileBottomNav(){



return (

<div

className="
fixed
bottom-0
left-0
right-0
z-50
border-t
border-neutral-800
bg-black/95
px-3
py-3
backdrop-blur-lg
"

>


<div

className="
flex
items-center
justify-between
"

>


{

items.map((item)=>(


<NavLink

key={item.label}

to={item.path}

className={({isActive})=>

`

flex
flex-col
items-center
gap-1
text-[10px]
transition

${

isActive

?

"text-[#C8A44D]"

:

"text-neutral-500"

}

`

}

>


{({isActive})=>(

<>


<div

className={`

flex
h-8
w-8
items-center
justify-center
rounded-full

${

isActive

?

"bg-[#C8A44D]/10"

:

""

}

`}

>


<item.icon

size={18}

/>


</div>




<span>

{item.label}

</span>


</>

)}



</NavLink>


))


}



</div>



</div>

);

}