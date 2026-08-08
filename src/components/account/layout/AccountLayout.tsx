import {
  Outlet,
  useNavigate,
} from "react-router-dom";


import {
  ArrowLeft,
} from "lucide-react";








export default function AccountLayout(){



const navigate = useNavigate();






return (

<div

className="
min-h-screen
bg-black
px-4
py-6
text-white
sm:px-6
lg:px-8
"

>



<div

className="
mx-auto
max-w-5xl
"

>






{/* Account Header */}

<div

className="
mb-6
space-y-3
"

>


<button

onClick={()=>navigate("/account")}

className="
flex
items-center
gap-2
text-sm
text-neutral-400
transition
hover:text-white
"

>

<ArrowLeft size={16}/>

My Account

</button>







<h1

className="
text-2xl
font-semibold
text-[#C8A44D]
sm:text-3xl
"

>

My Account

</h1>






</div>









{/* Page Content */}

<Outlet />







</div>







</div>

);

}