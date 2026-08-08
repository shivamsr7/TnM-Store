import {
  User,
  Mail,
  Phone,
} from "lucide-react";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";







interface Props {

onEditProfile:()=>void;

}







export default function ProfileCard({

onEditProfile,

}:Props){



const {
customer
}=useAuth();







if(!customer){

return null;

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
flex
flex-col
gap-4
sm:flex-row
sm:items-center
sm:justify-between
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
h-16
w-16
shrink-0
items-center
justify-center
overflow-hidden
rounded-full
border
border-[#C8A44D]/30
bg-[#C8A44D]/10
"

>


{

customer.avatar

?

<img

src={customer.avatar || "/default-avatar.png"}

alt="Profile"

onError={(e)=>{

e.currentTarget.src="/default-avatar.png";

}}

className="
h-full
w-full
object-cover
"

/>


:

<User

size={28}

className="
text-[#C8A44D]
"

/>

}



</div>









<div>


<h2

className="
text-lg
font-semibold
text-white
"

>

{customer.first_name}

{" "}

{customer.last_name}

</h2>





<p

className="
text-sm
text-neutral-400
"

>

Customer Profile

</p>



</div>








</div>









<button

onClick={onEditProfile}

className="
w-full
rounded-full
border
border-[#C8A44D]
px-4
py-2
text-xs
text-[#C8A44D]
transition
hover:bg-[#C8A44D]
hover:text-black
sm:w-fit
"

>

Edit Profile

</button>







</div>









<div

className="
mt-6
space-y-4
"

>









<div

className="
flex
items-center
gap-3
text-sm
text-neutral-300
"

>

<Mail

size={18}

className="
text-[#C8A44D]
"

/>



<span

className="
break-all
"

>

{customer.email || "Email not added"}

</span>



</div>









<div

className="
flex
items-center
gap-3
text-sm
text-neutral-300
"

>

<Phone

size={18}

className="
text-[#C8A44D]
"

/>



<span>

{customer.phone || "Phone not added"}

</span>



</div>









</div>








</div>

);

}