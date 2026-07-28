export default function FooterBottom(){


return (

<div

className="
border-t

border-white/10

bg-black

px-5

py-6

"

>


<div

className="
mx-auto

flex

max-w-7xl

flex-col

items-center

justify-between

gap-5

text-xs

text-neutral-500


md:flex-row

"

>


<p>

© {new Date().getFullYear()} T&M Jewels. All rights reserved.

</p>





<p

className="
text-center

"

>

Designed with ♡ in India

</p>






<div

className="
flex

items-center

gap-3

"

>


<span>
Secure Payments
</span>



<div

className="
flex

gap-2

"

>

<span

className="
rounded

border

border-white/20

px-2

py-1

"

>

VISA

</span>


<span

className="
rounded

border

border-white/20

px-2

py-1

"

>

MC

</span>


<span

className="
rounded

border

border-white/20

px-2

py-1

"

>

UPI

</span>


<span

className="
rounded

border

border-white/20

px-2

py-1

"

>

Paytm

</span>


</div>


</div>






</div>





</div>

);

}