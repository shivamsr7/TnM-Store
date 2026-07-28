import { motion } from "framer-motion";


const careTips = [

{
title:"Avoid Water & Moisture",
text:"Remove jewellery before swimming, bathing or any activity involving excessive moisture."
},

{
title:"Keep Away From Perfume",
text:"Avoid direct contact with perfumes, sprays, chemicals and harsh substances."
},

{
title:"Clean After Every Use",
text:"Gently wipe your jewellery with a soft, clean cloth after wearing."
},

{
title:"Store Properly",
text:"Keep your jewellery in an airtight pouch or jewellery box when not in use."
}

];


export default function JewelleryCare(){


return (

<main

className="
min-h-screen
bg-black
px-5
py-16
"

>


{/* Heading */}

<section

className="
text-center

"

>


<motion.h1

initial={{
opacity:0,
y:20
}}

animate={{
opacity:1,
y:0
}}

className="
text-4xl
font-semibold

bg-gradient-to-r

from-[#B8862E]

via-[#F7E3A3]

to-[#B8862E]

bg-clip-text

text-transparent

md:text-6xl

"

>

Jewellery Care

</motion.h1>



<p

className="
mx-auto
mt-5
max-w-2xl
leading-relaxed
text-neutral-400

"

>

Keep your jewellery beautiful and shining
for longer with simple care practices.

</p>


</section>









{/* Intro */}

<section

className="
mx-auto
mt-12
max-w-3xl
rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-8

text-center

"

>


<p

className="
leading-relaxed
text-neutral-300

"

>

Your jewellery is designed to shine.

With the right care, you can preserve its
beauty, finish and elegance for a long time.

</p>


</section>









{/* Care Cards */}

<section

className="
mx-auto
mt-14
grid
max-w-5xl
gap-6
md:grid-cols-4

"

>


{

careTips.map((item,index)=>(


<motion.div

key={item.title}

initial={{
opacity:0,
y:25
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:index*.1
}}

className="
rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-6

text-center

hover:border-[#D4AF37]

transition

"

>


<div

className="
mx-auto
flex
h-12
w-12
items-center
justify-center

rounded-full

border

border-[#D4AF37]/40

text-[#D4AF37]

"

>

✦

</div>



<h2

className="
mt-5
text-lg
font-semibold
text-[#F7E3A3]

"

>

{item.title}

</h2>



<p

className="
mt-3
text-sm
leading-relaxed
text-neutral-400

"

>

{item.text}

</p>


</motion.div>


))

}


</section>









{/* Anti Tarnish Section */}

<section

className="
mx-auto
mt-16
max-w-4xl

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-8

text-center

"

>


<h2

className="
text-2xl
font-semibold
text-[#D4AF37]

"

>

Anti-Tarnish Jewellery Care

</h2>



<p

className="
mt-5
leading-relaxed
text-neutral-400

"

>

Our anti-tarnish jewellery is designed for
everyday elegance.

Following proper care instructions helps
maintain its shine and finish for a longer time.

</p>


</section>








{/* Closing */}

<section

className="
mx-auto
mt-14
max-w-2xl
text-center

"

>


<p

className="
font-serif
text-2xl
italic
text-[#F7E3A3]

"

>

A little care goes a long way. ✨

</p>


</section>





</main>

);

}