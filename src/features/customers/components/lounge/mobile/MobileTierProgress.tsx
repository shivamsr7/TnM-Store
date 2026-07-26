export default function MobileTierProgress(){


const currentSpend = 1200;

const goldTarget = 5000;


const progress =

(currentSpend / goldTarget) * 100;



const remaining =

goldTarget - currentSpend;



return (

<div

className="
rounded-3xl
border
border-neutral-800
bg-neutral-950
p-5
"

>



<h2

className="
text-lg
font-semibold
text-[#C8A44D]
"

>

Progress to Next Tier

</h2>







<div

className="
mt-6
relative
"

>





{/* Progress Line */}


<div

className="
absolute
left-5
right-5
top-5
h-1
rounded-full
bg-neutral-700
"

>


<div

className="
h-full
rounded-full
bg-[#C8A44D]
"

style={{

width:`${progress}%`

}}


/>


</div>









<div

className="
relative
flex
justify-between
"

>





{[

{
name:"Silver",
letter:"S",
active:true
},

{
name:"Gold",
letter:"S",
active:false
},

{
name:"Platinum",
letter:"S",
active:false
}

].map((tier)=>(


<div

key={tier.name}

className="
flex
flex-col
items-center
"

>



<div

className={`
flex
h-10
w-10
items-center
justify-center
rounded-full
border
text-sm
font-semibold

${
tier.active

?

"border-[#C8A44D] bg-gradient-to-br from-white via-slate-300 to-slate-500 text-white"

:

"border-neutral-700 bg-neutral-900 text-neutral-500"

}

`}

>

{tier.letter}

</div>






<p

className="
mt-2
text-xs
text-neutral-300
"

>

{tier.name}

</p>



</div>


))}



</div>





</div>








<p

className="
mt-6
text-center
text-sm
text-neutral-300
"

>

<span

className="
font-semibold
text-[#C8A44D]
"

>

₹{remaining.toLocaleString()}

</span>

{" "}

/ ₹5,000 more to reach Gold

</p>







<div

className="
mt-4
flex
justify-between
text-xs
text-neutral-500
"

>


<span>

₹{currentSpend.toLocaleString()} spent

</span>


<span

className="
text-[#C8A44D]
"

>

{Math.round(progress)}% Completed

</span>


</div>





</div>

);

}