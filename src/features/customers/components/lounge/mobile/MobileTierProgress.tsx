export default function MobileTierProgress(){


const currentSpend = 1200;

const goldTarget = 5000;


const progress = Math.min(
  (currentSpend / goldTarget) * 100,
  100
);


const remaining = goldTarget - currentSpend;



const tiers = [

{
name:"Silver",
letter:"S",
style:"from-white via-slate-300 to-slate-500",
active:true,
},

{
name:"Gold",
letter:"G",
style:"from-yellow-200 via-yellow-400 to-yellow-600",
active:false,
},

{
name:"Platinum",
letter:"P",
style:"from-purple-200 via-purple-500 to-purple-800",
active:false,
},

];




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



<p

className="
mt-1
text-xs
text-neutral-400
"

>

Unlock higher T&M benefits

</p>







{/* Tier Progress */}



<div

className="
relative
mt-6
"

>


{/* Background Line */}

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

/>





{/* Completed Line */}

<div

className="
absolute
left-5
top-5
h-1
rounded-full
bg-[#C8A44D]
"

style={{

width:`${progress}%`

}}

/>







<div

className="
relative
flex
justify-between
"

>



{

tiers.map((tier)=>(


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
bg-gradient-to-br
text-sm
font-bold
text-white
shadow-inner

${tier.style}

${
tier.active

?

"border-white shadow-[0_0_18px_rgba(255,255,255,0.5)]"

:

"border-white/30"

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


))


}



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

away from Gold Member


</p>







<div

className="
mt-4
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

{Math.round(progress)}% Completed

</span>



</div>






</div>

);

}