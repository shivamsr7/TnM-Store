import { motion } from "framer-motion";

import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";



const contactCards = [

{
title:"Email",
icon:FaEnvelope,
description:
"For product queries, order assistance and collaborations.",
value:"shop.tnm@gmail.com",
action:"Send Email",
link:"mailto:shop.tnm@gmail.com"
},

{
title:"WhatsApp",
icon:FaWhatsapp,
description:
"Need a quick response? Chat with us on WhatsApp.",
value:"Connect with our team instantly",
action:"Chat on WhatsApp",
link:"#"
},

{
title:"Instagram",
icon:FaInstagram,
description:
"Follow us or send us a message on Instagram.",
value:"@tnm_jewels",
action:"Visit Instagram",
link:"#"
}

];




export default function ContactUs(){


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

transition={{
duration:.6
}}

className="
text-4xl

font-semibold

tracking-wide

bg-gradient-to-r

from-[#B8862E]

via-[#F7E3A3]

to-[#B8862E]

bg-clip-text

text-transparent

md:text-6xl

"

>

Contact Us

</motion.h1>




<p

className="
mx-auto

mt-5

max-w-2xl

text-neutral-400

md:text-lg

"

>

We’d Love to Hear From You

</p>



<p

className="
mx-auto

mt-3

max-w-xl

leading-relaxed

text-neutral-400

"

>

If you have any questions about our products,
your order, or need any assistance, feel free
to contact us.

We’re always happy to help.

</p>



</section>









{/* Contact Cards */}

<section

className="
mx-auto

mt-14

grid

max-w-5xl

gap-6

md:grid-cols-3

"

>


{

contactCards.map((item,index)=>{


const Icon=item.icon;


return (

<motion.div

key={item.title}

initial={{
opacity:0,
y:30
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
group

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-7

text-center

transition-all

duration-300

hover:-translate-y-2

hover:border-[#D4AF37]

"

>


<div

className="
mx-auto

flex

h-14

w-14

items-center

justify-center

rounded-full

border

border-[#D4AF37]/40

text-2xl

text-[#D4AF37]

transition

group-hover:bg-[#D4AF37]

group-hover:text-black

"

>

<Icon />

</div>





<h2

className="
mt-5

text-xl

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

{item.description}

</p>




<p

className="
mt-4

text-sm

text-[#D4AF37]

"

>

{item.value}

</p>





{

item.title==="WhatsApp"

?

<a

href={item.link}

className="
mt-6

inline-flex

rounded-full

bg-gradient-to-r

from-[#B8862E]

via-[#D4AF37]

to-[#F7E3A3]

px-6

py-2

text-sm

font-medium

text-black

transition

hover:scale-105

"

>

{item.action}

</a>


:

<a

href={item.link}

className="
mt-6

inline-block

text-sm

text-[#D4AF37]

hover:underline

"

>

{item.action}

</a>


}



</motion.div>


)

})

}


</section>









{/* Customer Support */}

<section

className="
mx-auto

mt-14

max-w-xl

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

text-[#F7E3A3]

"

>

🕒 Customer Support

</h2>




<p

className="
mt-4

leading-relaxed

text-neutral-400

"

>

Monday – Saturday

<br/>

10:00 AM – 7:00 PM (IST)

</p>


</section>









{/* Thank You */}

<section

className="
mx-auto

mt-14

max-w-2xl

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

Thank You 🤍

</h2>




<p

className="
mt-4

leading-relaxed

text-neutral-400

"

>

Thank you for choosing T&M Jewels.

We truly appreciate your trust and support.

We’re always here to help and will get back
to you as soon as possible.

</p>



</section>






</main>

);

}