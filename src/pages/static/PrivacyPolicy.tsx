import { motion } from "framer-motion";


const privacySections = [

{
title:"1. Information We Collect",

text:
`When you use our website, we may collect the following information:

✦ Full Name

✦ Mobile Number

✦ Email Address (if provided)

✦ Date of Birth (to verify your birthday month and provide eligible birthday benefits under our Membership Program)

✦ Shipping & Billing Address

✦ PIN Code

✦ Order Details

✦ Payment Information (processed securely through our trusted payment partners)

✦ Reward Points & Membership Information

✦ Wishlist and Shopping Activity

✦ Device and browser information for improving website performance`
},


{
title:"2. How We Use Your Information",

text:
`We use your information to:

✦ Process and deliver your orders.

✦ Verify your account using OTP.

✦ Provide customer support.

✦ Send order confirmations, shipping updates, and delivery notifications.

✦ Manage your Reward Points and Membership status.

✦ Verify your birthday month and provide eligible Birthday Gifts and Birthday Bonus Reward Points under our Membership Program.

✦ Notify you when a product is back in stock if you use the Notify Me feature.

✦ Improve your shopping experience and website performance.

✦ Prevent fraud, misuse, and unauthorized activities.

✦ Comply with applicable legal and regulatory requirements.`
},


{
title:"3. Payment Security",

text:
`Your payment security is important to us.

We do not store your complete debit card, credit card, UPI, or other payment credentials on our servers.

All online payments are securely processed through trusted payment gateway partners using industry-standard security measures.`
},


{
title:"4. Sharing Your Information",

text:
`We respect your privacy.

We do not sell, rent, or share your personal information with third parties for marketing purposes.

Your information may only be shared with trusted service providers when necessary to:

✦ Deliver your order.

✦ Process your payment.

✦ Provide customer support.

✦ Manage shipping and logistics.

✦ Comply with legal obligations.`
},

{
title:"5. Marketing & Promotional Communication",

text:
`We may occasionally send you updates regarding:

✦ New Arrivals

✦ Exclusive Offers

✦ Sale Announcements

✦ Reward Points & Membership Updates

✦ Birthday Benefits

✦ Product Restock Notifications

✦ Order-related Updates

You may opt out of promotional communications at any time.

However, important order and account-related notifications will continue to be sent when required.`
},



{
title:"6. Cookies",

text:
`Our website may use cookies and similar technologies to:

✦ Keep you logged in.

✦ Remember your cart and wishlist.

✦ Save your shopping preferences.

✦ Improve website performance.

✦ Analyze website traffic.

✦ Provide a better shopping experience.

You can manage or disable cookies through your browser settings.

Please note that some website features may not function properly if cookies are disabled.`
},



{
title:"7. Data Security",

text:
`We take appropriate technical and organizational measures to protect your personal information against unauthorized access, loss, misuse, alteration, or disclosure.

Although we strive to protect your information, no method of online transmission or electronic storage is completely secure.

Therefore, we cannot guarantee absolute security.`
},



{
title:"8. Your Rights",

text:
`You may contact us if you wish to:

✦ Update or correct your personal information.

✦ Request changes to your account details.

✦ Request deletion of your account, where applicable.

✦ Ask questions about how your personal information is used.

Certain information may be retained where required by law or for legitimate business purposes.`
},



{
title:"9. Third-Party Services",

text:
`Our website may use trusted third-party service providers for:

✦ Payment Processing

✦ Shipping & Logistics

✦ Website Analytics

✦ Customer Communication

✦ OTP Verification

These service providers operate under their own privacy policies and are responsible for protecting the information they process.`
},



{
title:"10. Children’s Privacy",

text:
`T&M Jewels is intended for general users.

If you are under the age of 18, you should use our website with the involvement or consent of a parent or legal guardian when required.

If we become aware that personal information has been collected in a manner that does not comply with applicable laws, we may take appropriate steps to remove or update such information.`
},



{
title:"11. Changes to This Privacy Policy",

text:
`T&M Jewels reserves the right to update or modify this Privacy Policy at any time.

Any changes will be published on this page along with the updated revision date.

Continued use of our website after any changes constitutes your acceptance of the revised Privacy Policy.`
},



{
title:"12. Contact Us",

text:
`If you have any questions about this Privacy Policy or the way we handle your personal information, please contact us:

T&M Jewels

Email:
shop.tnm@gmail.com

Instagram:
@tnm_jewels

WhatsApp:
Available through our website`
}

];

export default function PrivacyPolicy(){


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

Privacy Policy

</motion.h1>



<p

className="
mx-auto
mt-5
max-w-xl
text-neutral-400

"

>

Your privacy is important to us.
We are committed to protecting your personal information.

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

privacySections.map((section,index)=>(


<motion.div

key={section.title}

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

viewport={{
once:true
}}

transition={{
delay:index*.05
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







</main>

);

}