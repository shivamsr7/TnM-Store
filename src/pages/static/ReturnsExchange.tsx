import { motion } from "framer-motion";


const policySections = [

{
title:"Return Policy",

text:
`We do not accept returns for products that have been delivered successfully.

Returns or exchanges are only considered if you receive a damaged, defective, or incorrect product, and a clear, uninterrupted unboxing video is provided.`
},


{
title:"Exchange Policy",

text:
`Yes, exchanges are available only if you receive a damaged, defective, or incorrect product.

To request an exchange, you must provide a clear, uninterrupted unboxing video showing the package being opened from start to finish, without any cuts, pauses, or edits.

Without a valid unboxing video, we will not be able to process any exchange request.`
},


{
title:"Damaged, Defective or Incorrect Product",

text:
`We’re sorry for the inconvenience.

If you receive a damaged, defective, or incorrect product, please contact our support team within 24–48 hours of delivery and share:

✦ Your order details

✦ A clear, uninterrupted unboxing video recorded from start to finish

✦ The issue must be clearly visible in the video

Once the issue is verified, we’ll arrange an exchange for your product.`
},


{
title:"How To Request An Exchange",

text:
`If you receive a damaged, defective, or incorrect product:

1. Contact our support team within 24–48 hours of delivery.

2. Share your order details.

3. Submit a clear, uninterrupted unboxing video showing the complete unboxing process.

4. The issue must be clearly visible in the video.

5. Once verified, we’ll guide you through the exchange process.`
}

];


export default function ReturnsExchange(){


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

Returns, Refunds & Exchange

</motion.h1>



<p

className="
mx-auto
mt-5
max-w-xl
text-neutral-400

"

>

Your satisfaction matters to us.
We are always here to assist you.

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

policySections.map((section,index)=>(


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
max-w-3xl

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-7

text-center

"

>


<h2

className="
text-xl
font-semibold
text-[#D4AF37]

"

>

Important Note

</h2>



<p

className="
mt-4

leading-relaxed

text-neutral-400

"

>

Please record an uninterrupted unboxing video
from the moment your package is opened.

This helps us verify any genuine issue and
assist you quickly.

</p>


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
text-[#F7E3A3]

"

>

Thank you for trusting T&M Jewels. 🤍

</p>


</section>






</main>

);

}