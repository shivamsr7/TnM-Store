import { motion } from "framer-motion";


const shippingSections = [

{
title:"Delivery Timeline",

text:
`Orders are usually delivered within:

✦ Metro Cities: 5–7 business days

✦ Non-Metro Locations: 7–15 business days

Delivery time may vary depending on your location.`
},


{
title:"Shipping Across India",

text:
`Yes, we deliver across all states in India.

We work with trusted courier partners to ensure your jewellery reaches you safely.`
},


{
title:"Shipping Charges",

text:
`Shipping charges are calculated at checkout based on your delivery location and order value.

Enjoy FREE Shipping on orders above ₹2,000.`
},


{
title:"Order Tracking",

text:
`Once your order has been shipped, you’ll receive tracking details.

You can track your order anytime from the Order Tracking page on our website.

Your order status will be updated through every step:

✦ Order Confirmed

✦ Packed

✦ Shipped

✦ In Transit

✦ Out for Delivery

✦ Delivered`
},


{
title:"Delivery Delays",

text:
`While we always try to deliver your order on time, delays may occasionally occur due to courier or unforeseen circumstances.

If your order is delayed, please contact our support team and we’ll assist you with the latest update.`
},


{
title:"International Shipping",

text:
`Currently, we primarily ship across India.

International shipping may be available for selected countries in the future.

Shipping charges and delivery timelines will vary based on the destination.`
}

];


export default function ShippingDelivery(){


return (

<main

className="
min-h-screen
bg-black
px-5
py-16
"

>


<section className="text-center">


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

Shipping & Delivery

</motion.h1>



<p

className="
mx-auto
mt-5
max-w-xl
text-neutral-400
"

>

We deliver your jewellery with care,
safety and reliability.

</p>


</section>







<section

className="
mx-auto
mt-14
max-w-4xl
space-y-6

"

>


{

shippingSections.map((section,index)=>(


<motion.div

key={section.title}

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

p-7

"

>


<h2

className="
text-xl
font-semibold
text-[#F7E3A3]

"

>

{section.title}

</h2>



<p

className="
mt-4

whitespace-pre-line

leading-relaxed

text-neutral-400

"

>

{section.text}

</p>



</motion.div>


))

}


</section>







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
text-[#D4AF37]

"

>

Your jewellery journey begins the moment
you place your order. ✨

</p>


</section>




</main>

);

}