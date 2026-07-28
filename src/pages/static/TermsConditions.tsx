import { motion } from "framer-motion";


const termsSections = [

{
title:"1. Account Registration",

text:
`Customers can create an account using OTP verification.

You are responsible for providing accurate and up-to-date information.

T&M Jewels reserves the right to suspend or terminate any account involved in fraudulent, abusive, or suspicious activities.`
},


{
title:"2. Product Information",

text:
`We strive to display all products as accurately as possible.

However:

✦ Product colours may vary slightly due to screen settings and lighting.

✦ Product dimensions may have minor variations.

✦ Material, anti-tarnish details, size, and jewellery care instructions will be mentioned on the product page wherever applicable.`
},


{
title:"3. Pricing",

text:
`✦ All prices are displayed in Indian Rupees (₹).

✦ Prices may change without prior notice.

✦ Sale prices and promotional offers are valid only during the specified offer period.

✦ Shipping charges, where applicable, will be calculated during checkout.`
},


{
title:"4. Payments",

text:
`We currently accept secure online payment methods available on our website.

Orders are processed only after successful payment confirmation.`
},


{
title:"5. Order Confirmation & Acceptance",

text:
`After placing an order, you will receive an order confirmation.

Receiving an order confirmation does not guarantee final acceptance of your order.

T&M Jewels reserves the right to refuse or cancel any order due to:

✦ Product unavailability

✦ Pricing or technical errors

✦ Payment verification issues

✦ Suspected fraud

✦ Any other genuine business reason

If payment has already been received for an order cancelled by T&M Jewels, the applicable amount will be refunded through the original payment method unless otherwise agreed with the customer.`
},


{
title:"6. Order Cancellation",

text:
`Once an order has been successfully placed, it cannot be cancelled by the customer.

If T&M Jewels cancels an order due to exceptional circumstances, the applicable refund will be processed through the original payment method.`
},


{
title:"7. Shipping & Delivery",

text:
`Shipping timelines, delivery estimates, and shipping charges are governed by our Shipping Policy.

Customers are responsible for providing accurate shipping information.

Additional shipping charges may apply if an order needs to be re-shipped due to an incorrect or incomplete address provided by the customer.`
},


{
title:"8. Return, Exchange & Refund",

text:
`Returns and refunds are not accepted.

Exchanges are available only in eligible cases as described in our Return, Exchange & Refund Policy.`
},


{
title:"9. Membership Program",

text:
`T&M Jewels offers a Membership Program with Silver, Gold, and Platinum membership tiers.

Membership eligibility, validity, and benefits are determined according to the Membership Program available on our website.

Membership upgrades are automatic once the required lifetime shopping value is achieved.

If a Gold or Platinum member does not re-qualify after their membership validity expires, their membership will automatically revert to Silver Membership.

T&M Jewels reserves the right to modify membership benefits, eligibility criteria, and validity periods at any time.`
},


{
title:"10. Reward Points",

text:
`Reward Points are governed by the following rules:

✦ ₹1 Spent = 1 Reward Point

✦ 1,000 Reward Points = ₹10 OFF

✦ Reward Points can be redeemed only on the product value and cannot be used for shipping charges.

✦ Reward Points are valid for 12 months from the date they are earned.

✦ Reward Points cannot be exchanged for cash or transferred to another account.

If Reward Points need to be adjusted due to order cancellation by T&M Jewels or any other valid reason, the applicable Reward Points may be deducted or restored accordingly.`
},
{
title:"11. Reviews & Rewards",

text:
`Customers may earn Reward Points for eligible product reviews.

Reward Points are awarded according to the highest eligible review type only.

For example:

✦ Text Review = 50 Reward Points

✦ Photo Review (with text) = 150 Reward Points

✦ Video Review (with or without photo/text) = 300 Reward Points

Reward Points are not cumulative for multiple review formats submitted for the same review.

T&M Jewels reserves the right to reject inappropriate, misleading, fake, or abusive reviews.`
},



{
title:"12. Referral Program",

text:
`Referral Rewards are credited only after the referred customer successfully completes their first eligible order.

Creating fake accounts, self-referrals, or attempting to misuse the referral program may result in:

✦ Cancellation of Reward Points

✦ Removal of Membership Benefits

✦ Suspension or termination of the account`
},



{
title:"13. Spin & Win",

text:
`Spin & Win campaigns are available to eligible members as announced by T&M Jewels.

T&M Jewels reserves the right to modify, suspend, discontinue, or change the campaign, rewards, eligibility criteria, or terms at any time without prior notice.`
},



{
title:"14. Notify Me",

text:
`Customers may use the Notify Me feature for out-of-stock products.

Submitting a notification request does not guarantee that the product will be restocked.

Restocking depends on customer demand and product availability.`
},



{
title:"15. Intellectual Property",

text:
`All content available on the T&M Jewels website, including but not limited to:

✦ Logo

✦ Product Images

✦ Product Videos

✦ Product Descriptions

✦ Graphics

✦ Website Design

✦ Text Content

is the exclusive property of T&M Jewels.

No content may be copied, reproduced, distributed, or used without prior written permission.`
},



{
title:"16. Limitation of Liability",

text:
`T&M Jewels shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products, except where required by applicable law.`
},



{
title:"17. Changes to These Terms",

text:
`T&M Jewels reserves the right to update or modify these Terms & Conditions at any time.

Updated versions will be published on this page along with the revised date.

Continued use of the website after any updates constitutes acceptance of the revised Terms & Conditions.`
},



{
title:"18. Contact Us",

text:
`If you have any questions regarding these Terms & Conditions, please contact us:

T&M Jewels

Email:
shop.tnm@gmail.com

Instagram:
@tnmjewels

WhatsApp:
Available through our website`
}

];



export default function TermsConditions(){


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

Terms & Conditions

</motion.h1>


<p

className="
mt-4
text-sm
text-neutral-500
"

>

Last Updated: 28th July 2026

</p>



<p

className="
mx-auto
mt-6
max-w-2xl
leading-relaxed
text-neutral-400
"

>

Welcome to T&M Jewels.

These Terms & Conditions govern your use of our website
and purchase of products from T&M Jewels.

By accessing our website, creating an account, or placing
an order, you agree to these Terms & Conditions.

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

termsSections.map((section)=>(


<div

key={section.title}

className="
rounded-3xl

border

border-[#D4AFG37]/30

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


</div>


))


}


</section>





</main>

);

}