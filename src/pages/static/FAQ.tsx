import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";



const faqSections = [

{
title:"Products & Jewellery Care",

items:[

{
question:"Is your jewellery anti-tarnish?",

answer:
`We offer a wide range of anti-tarnish jewellery designed for long-lasting everyday wear.

If a product is anti-tarnish, it will be clearly mentioned on the product page.`
},


{
question:"What materials are your products made from?",

answer:
`Our jewellery is crafted using high-quality materials, including stainless steel, brass, and other premium materials depending on the design.

The material of each product is clearly mentioned on the product page.`
},


{
question:"How should I care for my jewellery?",

answer:
`With proper care, your jewellery can stay beautiful for a long time.

To maintain its shine:

✦ Avoid contact with perfumes, water, chemicals, and other harsh substances.

✦ Wipe your jewellery with a soft, clean cloth after every use.

✦ Store it in an airtight pouch or jewellery box when not in use.

✦ Handle your jewellery with care to maintain its shine and finish.`
},


{
question:"Can I wear my jewellery every day?",

answer:
`Yes. Our anti-tarnish jewellery is designed for everyday wear with proper care.

To keep it looking its best, we recommend following our jewellery care instructions.`
},


{
question:"Will the colour fade over time?",

answer:
`Our anti-tarnish jewellery is designed to maintain its shine and finish for a long time with proper care.

To maximize its longevity, avoid exposure to perfumes, water, chemicals, and other harsh substances.`
},


{
question:"Are your rings adjustable?",

answer:
`We offer both adjustable and fixed-size rings.

If a ring is adjustable, it will be clearly mentioned on the product page. For fixed-size rings, the available size(s) will also be listed before you place your order.`
}

]

},

{
title:"Orders",

items:[

{
question:"How do I place an order?",

answer:
`Placing an order is easy:

1. Browse our collection and select your favourite product.

2. Click Add to Cart or Buy Now.

3. Proceed to Checkout.

4. Enter your mobile number and verify it using the OTP.

5. Fill in your delivery address and PIN code.

6. Choose your preferred payment method.

7. Review your order details and click Place Order.

8. Once your order is confirmed, you’ll receive an order confirmation.`
},



{
question:"How can I track my order?",

answer:
`Once your order has been shipped, you’ll receive your tracking details.

You can also track your order anytime from the Order Tracking page on our website.

Your order status will be updated in real time, including:

✦ Order Confirmed

✦ Packed

✦ Shipped

✦ In Transit

✦ Out for Delivery

✦ Delivered

This helps you stay updated on your order every step of the way.`
},



{
question:"Will I receive an order confirmation?",

answer:
`Yes. Once your order is successfully placed, you’ll receive an order confirmation with your order details.

Please keep it safe for future reference.`
},



{
question:"Can I modify my order after placing it?",

answer:
`No. Once an order has been placed, it cannot be modified.

Please make sure your product selection, delivery address, and contact details are correct before placing your order.`
},



{
question:"Can I cancel my order after placing it?",

answer:
`No. Once an order has been placed, it cannot be cancelled.

Please review your order carefully before completing your purchase.`
}

]

},




{
title:"Payments",

items:[

{
question:"What payment methods do you accept?",

answer:
`We accept a variety of secure payment methods, including:

✦ UPI

✦ Credit Cards

✦ Debit Cards

✦ Net Banking

✦ Wallets (if available)`
},


{
question:"Is Cash on Delivery (COD) available?",

answer:
`No. Cash on Delivery (COD) is currently not available.

All orders must be paid online at the time of checkout.`
},


{
question:"Is it safe to make an online payment?",

answer:
`Yes. All online payments are processed through secure and trusted payment gateways to ensure your payment information remains safe and protected.`
},


{
question:"Will I receive a payment confirmation?",

answer:
`Yes. Once your payment is successfully completed, you’ll receive a payment confirmation along with your order confirmation.`
},


{
question:"What should I do if my payment fails but the amount is deducted?",

answer:
`If your payment is deducted but your order is not confirmed, please don’t worry.

Contact our support team with your payment details. We’ll verify the transaction and assist you as quickly as possible.`
}

]

},
{
title:"Shipping & Delivery",

items:[

{
question:"How long does delivery take?",

answer:
`Orders are usually delivered within 5–7 business days in most metro cities.

For non-metro locations, delivery may take 7–15 business days, depending on your location.`
},



{
question:"Do you ship across India?",

answer:
`Yes, we deliver across all states in India.`
},



{
question:"How much does shipping cost?",

answer:
`Shipping charges are calculated at checkout based on your delivery location and order value.

Enjoy FREE Shipping on orders above ₹2,000.`
},



{
question:"What if my order is delayed?",

answer:
`While we always try to deliver your order on time, delays may occasionally occur due to courier or unforeseen circumstances.

If your order is delayed, you can contact our support team, and we’ll be happy to assist you with the latest update.`
},



{
question:"Can I change my delivery address after placing an order?",

answer:
`No. Once an order has been placed, the delivery address cannot be changed.

Please make sure your address is correct before completing your purchase.`
},



{
question:"Do you ship internationally?",

answer:
`Currently, we primarily ship across India.

International shipping may be available for selected countries in the future.

Shipping charges and delivery timelines for international orders will vary based on the destination.`
}

]

},

{
title:"Returns, Refunds & Exchange",

items:[

{
question:"What is your return policy?",

answer:
`We do not accept returns for products that have been delivered successfully.

Returns or exchanges are only considered if you receive a damaged, defective, or incorrect product, and a clear, uninterrupted unboxing video is provided.`
},



{
question:"Do you offer exchanges?",

answer:
`Yes, but only if you receive a damaged, defective, or incorrect product.

To request an exchange, you must provide a clear, uninterrupted unboxing video showing the package being opened from start to finish, without any cuts, pauses, or edits.

Without a valid unboxing video, we will not be able to process any exchange request.`
},



{
question:"What if I receive a damaged, defective, or incorrect product?",

answer:
`We’re sorry for the inconvenience.

If you receive a damaged, defective, or incorrect product, please contact our support team within 24–48 hours of delivery and share:

✦ Your order details

✦ A clear, uninterrupted unboxing video recorded from start to finish, without any cuts, pauses, or edits

✦ The issue must be clearly visible in the video

Once the issue is verified, we’ll arrange an exchange for your product.`
},



{
question:"How do I request an exchange?",

answer:
`If you receive a damaged, defective, or incorrect product:

1. Contact our support team within 24–48 hours of delivery.

2. Share your order details.

3. Submit a clear, uninterrupted unboxing video showing the complete unboxing process from start to finish, without any cuts, pauses, or edits.

4. The issue must be clearly visible in the video.

5. Once the issue is verified, we’ll guide you through the exchange process.`
}

]

},
{
title:"Membership & Rewards",

items:[

{
question:"What is the T&M Jewels Membership Program?",

answer:
`The T&M Jewels Membership Program is designed to reward you every time you shop with us.

As you shop more, you’ll unlock higher membership tiers and enjoy exclusive benefits, rewards, and special offers.`
},



{
question:"What are the membership tiers?",

answer:
`We currently offer three membership tiers:

✦ Silver – Every registered customer

✦ Gold – Lifetime shopping of ₹5,000+

✦ Platinum – Lifetime shopping of ₹15,000+

Your membership tier is automatically upgraded once you reach the required lifetime purchase value.`
},



{
question:"How do I earn Reward Points?",

answer:
`You can earn Reward Points in multiple ways:

✦ ₹1 Spent = 1 Reward Point

✦ Text Review = 50 Reward Points

✦ Photo Review = 150 Reward Points

✦ Video Review = 300 Reward Points

✦ Refer a Friend = 500 Reward Points

✦ Referred Friend’s First Successful Order = 250 Reward Points

✦ Spin & Win = Earn exciting Reward Points

Reward Points are credited only after the qualifying action is successfully completed.`
},



{
question:"How much is 1 Reward Point worth?",

answer:
`You earn 1 Reward Point for every ₹1 spent.

When redeeming:

1,000 Reward Points = ₹10 OFF

Reward Points can be redeemed only on the product value and cannot be used towards shipping charges.`
},



{
question:"How do I redeem my Reward Points?",

answer:
`You can redeem your available Reward Points during checkout.

The eligible discount will be automatically applied to your product value based on your available Reward Points.`
},



{
question:"Do Reward Points expire?",

answer:
`Yes. All Reward Points are valid for 12 months from the date they are earned.

Any unused Reward Points will automatically expire after the validity period.`
},



{
question:"Can I earn points for multiple reviews of the same product?",

answer:
`No. Only one reward will be given per review.

✦ A Text Review earns 50 Reward Points.

✦ A Photo Review (with text) earns 150 Reward Points.

✦ A Video Review (with photo/text if included) earns 300 Reward Points.

Reward Points are not cumulative. You’ll receive points only for the highest eligible review type.`
},



{
question:"Can I use Reward Points with coupons or other offers?",

answer:
`Eligible Reward Points can be redeemed during checkout according to the offers and promotions available at that time.

Any applicable redemption limits or promotional conditions will be shown during checkout.`
},



{
question:"How does Refer & Earn work?",

answer:
`Invite your friends using your referral link or code.

✦ You’ll receive 500 Reward Points after your friend’s first successful order.

✦ Your friend will receive 250 Reward Points after completing their first successful order.`
},



{
question:"Who can play Spin & Win?",

answer:
`All Silver, Gold, and Platinum members are eligible to participate in Spin & Win and earn exciting Reward Points and other eligible rewards, subject to the campaign rules.`
}

]

}

];





export default function FAQ(){


const [open,setOpen]=useState<string | null>(null);



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

Frequently Asked Questions

</motion.h1>



<p

className="
mx-auto
mt-5
max-w-xl
text-neutral-400
"

>

Find answers to common questions about our jewellery,
orders and services.

</p>


</section>









{/* FAQ Sections */}

<section

className="
mx-auto
mt-14
max-w-4xl
space-y-12
"

>


{

faqSections.map((section)=>(


<div key={section.title}>


<h2

className="
mb-5

text-2xl

font-semibold

text-[#D4AF37]

md:text-3xl

"

>

{section.title}

</h2>





<div className="space-y-4">


{

section.items.map((item)=>(


<div

key={item.question}

className="
rounded-2xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

overflow-hidden

"

>


<button

onClick={()=>setOpen(

open===item.question

?

null

:

item.question

)}

className="
flex

w-full

items-center

justify-between

p-5

text-left

"

>


<span

className="
font-medium

text-[#F7E3A3]

"

>

{item.question}

</span>



<ChevronDown

size={20}

className={

open===item.question

?

"rotate-180 text-[#D4AF37] transition"

:

"text-[#D4AF37] transition"

}

/>


</button>






{

open===item.question &&

<motion.div

initial={{
opacity:0,
height:0
}}

animate={{
opacity:1,
height:"auto"
}}

className="
border-t

border-[#D4AF37]/20

px-5

py-5

whitespace-pre-line

text-sm

leading-relaxed

text-neutral-400

"

>

{item.answer}

</motion.div>

}



</div>


))


}



</div>


</div>


))


}


</section>








{/* Note */}

<section

className="
mx-auto

mt-16

max-w-3xl

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-6

text-center

"

>


<p

className="
text-sm

leading-relaxed

text-neutral-400

"

>

Please refer to the product description for complete
product details, including material, size,
anti-tarnish information, and care instructions.

</p>




</section>




</main>

);

}