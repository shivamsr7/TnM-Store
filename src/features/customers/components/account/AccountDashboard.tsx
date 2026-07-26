import AccountSidebar from "./AccountSidebar";


export default function AccountDashboard(){

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


<div

className="
mx-auto
max-w-6xl
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
text-sm
text-neutral-400
"

>

Manage your T&M Jewels account

</p>




<div

className="
mt-8
grid
gap-6
md:grid-cols-[240px_1fr]
"

>


<AccountSidebar />



<div

className="
rounded-2xl
border
border-neutral-800
bg-neutral-950
p-6
"

>


<h2

className="
text-xl
font-semibold
"

>

Welcome ✨

</h2>


<p

className="
mt-2
text-sm
text-neutral-400
"

>

Select an option from your account menu.

</p>


</div>



</div>



</div>


</div>

);


}