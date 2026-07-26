interface Props {

customer:any;

}



export default function ProfileCard({

customer

}:Props){


return (

<div

className="
rounded-2xl
border
border-[#C8A44D]/30
bg-neutral-950
p-6
"

>


<h2

className="
text-lg
font-semibold
text-white
"

>

Personal Information

</h2>





<div className="
mt-5
space-y-4
"

>


<div>

<p className="
text-xs
text-neutral-400
">

Name

</p>

<p className="
text-sm
text-white
">

{customer.first_name}

{" "}

{customer.last_name}

</p>

</div>




<div>

<p className="
text-xs
text-neutral-400
">

Email

</p>

<p className="
text-sm
text-white
">

{customer.email || "Not added"}

</p>

</div>




<div>

<p className="
text-xs
text-neutral-400
">

Mobile

</p>

<p className="
text-sm
text-white
">

{customer.phone}

</p>

</div>



</div>


</div>

);


}