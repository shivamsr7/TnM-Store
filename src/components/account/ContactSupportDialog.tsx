import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  X,
} from "lucide-react";


import {
  FaWhatsapp,
  FaInstagram,
  FaEnvelope,
} from "react-icons/fa";







interface Props {

open:boolean;

onClose:()=>void;

}








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








export default function ContactSupportDialog({

open,

onClose,

}:Props){



return (

<Dialog

open={open}

onOpenChange={(value)=>{

if(!value)

onClose();

}}

>







<DialogContent

className="
max-h-[90vh]
w-[95vw]
overflow-y-auto
rounded-3xl
border-neutral-200
bg-white
p-0
text-black
shadow-xl
sm:max-w-xl

[&>button]:hidden
"

>








<div

className="
flex
items-center
justify-between
border-b
border-neutral-200
px-6
py-5
"

>



<DialogHeader>


<DialogTitle

className="
text-xl
font-semibold
text-black
"

>

Contact Support

</DialogTitle>


</DialogHeader>







<button

onClick={onClose}

className="
flex
h-9
w-9
items-center
justify-center
rounded-full
border
border-neutral-300
transition
hover:bg-neutral-100
"

>

<X size={18}/>

</button>






</div>









<div

className="
space-y-6
p-6
"

>








<div

className="
text-center
"

>


<p

className="
text-sm
leading-relaxed
text-neutral-600
"

>

If you have any questions about our products,
your order, or need any assistance, feel free
to contact us.

We’re always happy to help.

</p>


</div>









<div

className="
space-y-4
"

>


{

contactCards.map((item)=>{


const Icon =
item.icon;



return (

<div

key={item.title}

className="
rounded-2xl
border
border-[#D4AF37]/30
bg-neutral-50
p-5
"

>







<div

className="
flex
items-center
gap-4
"

>


<div

className="
flex
h-12
w-12
shrink-0
items-center
justify-center
rounded-full
border
border-[#D4AF37]/40
text-xl
text-[#D4AF37]
"

>

<Icon/>

</div>







<div

className="
flex-1
"

>


<h3

className="
font-semibold
text-[#9A7A22]
"

>

{item.title}

</h3>





<p

className="
mt-1
text-sm
text-neutral-600
"

>

{item.description}

</p>





<p

className="
mt-2
text-sm
text-[#9A7A22]
"

>

{item.value}

</p>





</div>





</div>









<a

href={item.link}

className="
mt-4
inline-flex
rounded-full
bg-gradient-to-r
from-[#B8862E]
via-[#D4AF37]
to-[#F7E3A3]
px-5
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







</div>

)

})

}



</div>









<div

className="
rounded-2xl
border
border-[#D4AF37]/30
bg-neutral-50
p-6
text-center
"

>


<h3

className="
text-lg
font-semibold
text-[#9A7A22]
"

>

🕒 Customer Support

</h3>







<p

className="
mt-3
text-sm
leading-relaxed
text-neutral-600
"

>

Monday – Saturday

<br/>

10:00 AM – 7:00 PM (IST)

</p>







</div>









<div

className="
text-center
"

>


<h3

className="
text-xl
font-semibold
text-[#9A7A22]
"

>

Thank You 🤍

</h3>







<p

className="
mt-3
text-sm
leading-relaxed
text-neutral-600
"

>

Thank you for choosing T&M Jewels.

We truly appreciate your trust and support.

We’re always here to help and will get back
to you as soon as possible.

</p>







</div>









</div>







</DialogContent>







</Dialog>

);

}