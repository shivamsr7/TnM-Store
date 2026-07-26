export default function TierProgress(){



const currentSpend = 1200;

const goldTarget = 5000;


const progress = Math.min(

(currentSpend / goldTarget) * 100,

100

);


const remaining = goldTarget - currentSpend;



return (

<div

className="
rounded-3xl
border
border-[#C8A44D]/30
bg-neutral-950
p-5
"

>



<div

className="
flex
items-center
justify-between
"

>


<div>


<h2

className="
text-lg
font-semibold
text-white
"

>

Tier Progress

</h2>


<p

className="
mt-1
text-xs
text-neutral-400
"

>

Unlock your next T&M level

</p>


</div>



<span

className="
rounded-full
bg-[#C8A44D]/10
px-3
py-1
text-xs
font-medium
text-[#C8A44D]
"

>

Silver

</span>



</div>







{/* Tier Steps */}



<div

className="
mt-5
flex
items-center
justify-between
"

>



{

[

{

name:"Silver",

letter:"S",

active:true

},

{

name:"Gold",

letter:"G",

active:false

},

{

name:"Platinum",

letter:"P",

active:false

}

]

.map((tier)=>(


<div

key={tier.name}

className="
text-center
"

>


<div

className={`

mx-auto

flex

h-9

w-9

items-center

justify-center

rounded-full

border

text-sm

font-semibold


${
tier.active

?

"border-[#C8A44D] bg-[#C8A44D]/10 text-[#C8A44D]"

:

"border-neutral-700 text-neutral-500"

}

`}

>

{tier.letter}

</div>



<p

className="
mt-2
text-[11px]
text-neutral-400
"

>

{tier.name}

</p>



</div>


))


}



</div>









<p

className="
mt-5
text-center
text-xs
text-neutral-400
"

>

₹{remaining.toLocaleString()} away from Gold Member

</p>









{/* Progress */}



<div

className="
mt-4
h-2
overflow-hidden
rounded-full
bg-neutral-800
"

>


<div

className="
h-full
rounded-full
bg-[#C8A44D]
transition-all
"

style={{

width:`${progress}%`

}}

/>


</div>







<div

className="
mt-3
flex
justify-between
text-xs
"

>


<span

className="
text-neutral-500
"

>

₹{currentSpend.toLocaleString()} spent

</span>



<span

className="
text-[#C8A44D]
"

>

{Math.round(progress)}%

</span>



</div>






</div>

);

}