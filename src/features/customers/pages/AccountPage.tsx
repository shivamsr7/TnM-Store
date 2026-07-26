import {
  useAuth
} from "@/features/Auth/context/AuthContext";


import ProfileCard from "../components/ProfileCard";



export default function AccountPage(){


const {
  customer
}=useAuth();




if(!customer){

return (

<div className="
flex
min-h-screen
items-center
justify-center
bg-black
text-white
">

Please login to view your account

</div>

);

}




return (

<div

className="
min-h-screen
bg-black
px-4
py-8
text-white
md:px-8
"

>


<div className="
mx-auto
max-w-5xl
"

>


<h1

className="
text-3xl
font-semibold
text-[#C8A44D]
"

>

My Account

</h1>



<p

className="
mt-2
text-neutral-400
"

>

Welcome back, {customer.first_name} ✨

</p>





<div className="
mt-8
"

>

<ProfileCard

customer={customer}

/>


</div>



</div>


</div>

);


}