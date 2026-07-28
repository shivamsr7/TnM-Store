import {
  Truck,
  ShieldCheck,
  Gift,
} from "lucide-react";

import { motion } from "framer-motion";


const benefits = [

{
icon:Truck,
text:"FREE SHIPPING ON ORDERS ABOVE ₹2000"
},

{
icon:ShieldCheck,
text:"ANTI-TARNISH • PREMIUM QUALITY"
},

{
icon:Gift,
text:"FREE GIFT ON ORDERS ABOVE ₹1000"
}

];



export default function FooterBenefits(){


return (

<div

className="
overflow-hidden

py-4

"
style={{
  background:
    "linear-gradient(90deg, #B8862E 0%, #D4AF37 30%, #E8C768 55%, #F7E3A3 80%, #FFF8E7 100%)",
  borderColor: "#C79A2F",
}}
>


<motion.div

animate={{

x:["0%","-50%"]

}}

transition={{

duration:45,

repeat:Infinity,

ease:"linear"

}}

className="
flex

w-max

"

>


{

[...benefits,...benefits].map((item,index)=>{


const Icon=item.icon;


return (

<div

key={index}

className="
flex

items-center

gap-3

px-10

whitespace-nowrap

text-xs

tracking-wider

font-medium

text-black

md:text-sm

"

>


<Icon

size={18}

/>


<span>

{item.text}

</span>


<span>

✦

</span>


</div>


)


})

}


</motion.div>


</div>

);

}