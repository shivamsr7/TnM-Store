import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo/mainLogo.png";
import {
  FaInstagram,
  FaYoutube
} from "react-icons/fa";

export default function AboutUs() {

  const navigate = useNavigate();

  return (

<main

className="
min-h-screen

bg-black

px-5

py-14

"

>



{/* Hero */}

<section

className="
text-center

"

>


<motion.img

initial={{
opacity:0,
scale:.9
}}

animate={{
opacity:1,
scale:1
}}

transition={{
duration:.6
}}

src={logo}

alt="T&M Jewels"

className="
mx-auto

w-36

object-contain

md:w-44

"

/>




<motion.h1

initial={{
opacity:0,
y:15
}}

animate={{
opacity:1,
y:0
}}

transition={{
duration:.6
}}

className="
mt-5

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

About T&M Jewels

</motion.h1>




<p

className="
mt-3

text-base

text-neutral-400

md:text-lg

"

>

Create your own style,
create your own trend.

</p>


</section>







{/* Quote */}

<section

className="
mx-auto

mt-10

max-w-3xl

text-center

"

>


<div

className="
relative

px-8

"

>


<span

className="
absolute

left-2

top-[-20px]

font-serif

text-6xl

text-[#D4AF37]

"

>

“

</span>




<p

className="
font-serif

text-xl

italic

leading-relaxed

text-[#F5E6C8]

md:text-3xl

"

>

We believe trends inspire you,
but your style should define you.

</p>




<span

className="
absolute

right-2

bottom-[-25px]

font-serif

text-6xl

text-[#D4AF37]

"

>

”

</span>


</div>


</section>










{/* Story Box */}

<section

className="
mx-auto

mt-14

max-w-4xl

"

>


<motion.div

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
duration:.7
}}

className="

relative

rounded-3xl

border

border-[#D4AF37]/40

bg-[#fffdf8]

p-7

shadow-[0_20px_80px_rgba(212,175,55,0.18)]

md:p-12

"

>



{/* Pin */}

<div

className="
absolute

left-1/2

top-0

h-3

w-3

-translate-x-1/2

-translate-y-1/2

rounded-full

bg-[#D4AF37]

"

/>





<h2

className="
text-center

text-3xl

font-semibold

text-[#B8862E]

"

>

Our Story

</h2>







<p

className="
mt-6

text-center

text-lg

font-medium

leading-relaxed

text-[#5c4630]

"

>

Jewellery is more than an accessory.

<br/>

It is a reflection of who you are.

</p>







<div

className="
my-8

h-px

bg-[#D4AF37]/30

"

/>









<h3

className="
text-xl

font-semibold

text-[#B8862E]

"

>

The Beginning of T&M Jewels

</h3>



<p

className="
mt-4

leading-relaxed

text-neutral-600

"

>

At T&M Jewels, we believe your style should
always feel like you.

Trends inspire us, and we love exploring them —
but the most beautiful style is the one that
truly represents your personality.

T&M Jewels was founded by two sisters,
<strong> Tanishq Singh and Muskan Singh</strong>,
both content creators and influencers, who
turned a shared dream into a jewellery brand
built with passion, purpose, and love.

</p>









<div

className="
my-8

h-px

bg-[#D4AF37]/30

"

/>









<h3

className="
text-xl

font-semibold

text-[#B8862E]

"

>

Why We Started

</h3>



<p

className="
mt-4

leading-relaxed

text-neutral-600

"

>

Before starting T&M Jewels, we were customers
ourselves.

Like many others, we experienced jewellery
that didn't always live up to its promised
quality and often lost its shine sooner than
expected.

That inspired us to build a brand focused on
thoughtfully curated collections, better quality,
and jewellery that can be enjoyed for a long time
with proper care.

</p>









<div

className="
my-8

h-px

bg-[#D4AF37]/30

"

/>









<h3

className="
text-xl

font-semibold

text-[#B8862E]

"

>

What We Create

</h3>



<p

className="
mt-4

leading-relaxed

text-neutral-600

"

>

Today, our collections include:

</p>



<ul

className="
mt-4

space-y-2

text-neutral-700

"

>

<li>✦ Premium anti-tarnish jewellery</li>

<li>✦ Timeless traditional jewellery</li>

<li>✦ Elegant brass pieces</li>

<li>✦ Stylish watches</li>

</ul>



<p

className="
mt-5

leading-relaxed

text-neutral-600

"

>

Every piece is carefully selected to bring
together quality, affordability, and style.

</p>









<div

className="
my-8

h-px

bg-[#D4AF37]/30

"

/>









<h3

className="
text-xl

font-semibold

text-[#B8862E]

"

>

Our Belief

</h3>



<p

className="
mt-4

leading-relaxed

text-neutral-600

"

>

We believe that even the smallest piece of
jewellery can completely transform your look.

The right jewellery doesn't just complete an
outfit — it adds confidence, reflects your
personality, and helps you express your unique
style.

</p>




<p

className="
mt-6

text-center

font-serif

italic

text-xl

text-[#B8862E]

"

>

"Sometimes, the smallest piece of jewellery
makes the biggest difference." ✨

</p>









<div

className="
my-8

h-px

bg-[#D4AF37]/30

"

/>









<h3

className="
text-xl

font-semibold

text-[#B8862E]

"

>

Our Promise

</h3>



<p

className="
mt-4

leading-relaxed

text-neutral-600

"

>

T&M Jewels is more than just a jewellery brand —
it's a dream built by two sisters and brought
to life with the love and trust of every customer
who chooses us.

Every order brings us one step closer to building
the brand we've always dreamed of creating.

Thank you for believing in T&M Jewels.

We can't wait to be a part of your style journey. 🤍

</p>




</motion.div>


</section>

{/* Meet The Founders */}

<section

className="
mx-auto

mt-20

max-w-5xl

px-2

"

>


<motion.h2

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

className="
text-center

text-3xl

font-semibold

text-[#D4AF37]

md:text-4xl

"

>

Meet The Founders

</motion.h2>





<p

className="
mx-auto

mt-4

max-w-2xl

text-center

text-neutral-400

"

>

Two sisters, one dream, and a vision to
create jewellery that helps everyone express
their own unique style.

</p>







<div

className="
mt-12

grid

gap-8

md:grid-cols-2

"

>





{/* Founder 1 */}

<motion.div

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

className="
group

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-6

text-center

transition-all

duration-300

hover:-translate-y-2

hover:border-[#D4AF37]/70

"

>


<div

className="
mx-auto

flex

h-56

w-56

items-center

justify-center

rounded-full

border

border-[#D4AF37]/40

bg-neutral-900

text-neutral-500

shadow-[0_15px_40px_rgba(212,175,55,0.15)]

"

>

Founder Image

</div>




<h3

className="
mt-6

text-2xl

font-semibold

text-[#F7E3A3]

"

>

Tanishq Singh

</h3>



<p

className="
mt-2

text-sm

text-[#D4AF37]

"

>

Co-Founder

</p>

<div

className="
mt-5

flex

justify-center

gap-4

"

>


<a

href="https://www.instagram.com/__singh__tanishq?igsh=d3QzdWp6eGY3cm1i"

target="_blank"

rel="noopener noreferrer"

className="
flex

items-center

gap-2

rounded-full

border

border-[#D4AF37]/40

px-4

py-2

text-sm

text-[#D4AF37]

transition-all

duration-300

hover:bg-[#D4AF37]

hover:text-black

"

>

<FaInstagram size={16}/>

Instagram

</a>





<a

href="https://youtube.com/@singh__tanishq?si=ZlnZ1JfZ0rVU7xm2"

target="_blank"

rel="noopener noreferrer"

className="
flex

items-center

gap-2

rounded-full

border

border-[#D4AF37]/40

px-4

py-2

text-sm

text-[#D4AF37]

transition-all

duration-300

hover:bg-[#D4AF37]

hover:text-black

"

>

<FaYoutube size={16}/>

YouTube

</a>


</div>

<p

className="
mt-4

text-sm

leading-relaxed

text-neutral-400

"

>

Building T&M Jewels with creativity,
passion and a vision to make premium
jewellery accessible for everyone.

</p>



</motion.div>









{/* Founder 2 */}

<motion.div

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
delay:.1
}}

className="
group

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

p-6

text-center

transition-all

duration-300

hover:-translate-y-2

hover:border-[#D4AF37]/70

"

>


<div

className="
mx-auto

flex

h-56

w-56

items-center

justify-center

rounded-full

border

border-[#D4AF37]/40

bg-neutral-900

text-neutral-500

shadow-[0_15px_40px_rgba(212,175,55,0.15)]

"

>

Founder Image

</div>




<h3

className="
mt-6

text-2xl

font-semibold

text-[#F7E3A3]

"

>

Muskan Singh

</h3>



<p

className="
mt-2

text-sm

text-[#D4AF37]

"

>

Co-Founder

</p>
<div

className="
mt-5

flex

justify-center

gap-4

"

>


<a

href="https://www.instagram.com/muskan_singh23m?igsh=MW5odXNvamR1bGZpbQ=="

target="_blank"

rel="noopener noreferrer"

className="
flex

items-center

gap-2

rounded-full

border

border-[#D4AF37]/40

px-4

py-2

text-sm

text-[#D4AF37]

transition-all

duration-300

hover:bg-[#D4AF37]

hover:text-black

"

>

<FaInstagram size={16}/>

Instagram

</a>





<a

href="https://youtube.com/@therealmuskansingh?si=5OW181uD5m3BzcXR"

target="_blank"

rel="noopener noreferrer"

className="
flex

items-center

gap-2

rounded-full

border

border-[#D4AF37]/40

px-4

py-2

text-sm

text-[#D4AF37]

transition-all

duration-300

hover:bg-[#D4AF37]

hover:text-black

"

>

<FaYoutube size={16}/>

YouTube

</a>


</div>


<p

className="
mt-4

text-sm

leading-relaxed

text-neutral-400

"

>

Turning a shared dream into reality
through thoughtful designs, creativity
and customer trust.

</p>



</motion.div>





</div>






</section>

<section

className="
mx-auto

mt-14

max-w-3xl

text-center

"

>

<p

className="
font-serif

text-2xl

italic

leading-relaxed

text-[#F7E3A3]

"

>

"Two sisters, one dream, and a vision to make
every piece of jewellery tell a story."

</p>


<p

className="
mt-4

text-sm

tracking-wider

text-neutral-400

"

>

— T&M Jewels

</p>


</section>

{/* Why Choose T&M Jewels */}

<section

className="
mx-auto

mt-20

max-w-6xl

px-2

"

>


<motion.h2

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

className="
text-center

text-3xl

font-semibold

text-[#D4AF37]

md:text-4xl

"

>

Why Choose T&M Jewels

</motion.h2>





<p

className="
mx-auto

mt-4

max-w-2xl

text-center

text-neutral-400

"

>

Jewellery designed to bring together
quality, confidence and timeless style.

</p>







<div

className="
mt-12

grid

gap-6

md:grid-cols-4

"

>



{[

{
title:"Premium Quality",
text:"Every piece is carefully selected to deliver a premium look and feel."
},

{
title:"Anti-Tarnish Jewellery",
text:"Designed for everyday elegance with lasting shine and proper care."
},

{
title:"Affordable Luxury",
text:"Beautiful designs that make premium jewellery accessible for everyone."
},

{
title:"Customer Trust",
text:"Built with honest service, quality products and lasting relationships."
}

].map((item,index)=>(


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
group

rounded-3xl

border

border-[#D4AF37]/20

bg-[#0d0d0d]

p-6

text-center

transition-all

duration-300

hover:-translate-y-2

hover:border-[#D4AF37]/60

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

✦

</div>




<h3

className="
mt-5

text-lg

font-semibold

text-[#F7E3A3]

"

>

{item.title}

</h3>



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


</div>



</section>

{/* Explore Collection CTA */}

<section

className="
mx-auto

mt-24

max-w-4xl

px-5

pb-10

text-center

"

>


<motion.div

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

className="
relative

rounded-3xl

border

border-[#D4AF37]/30

bg-[#0d0d0d]

px-8

py-14

shadow-[0_20px_80px_rgba(212,175,55,0.12)]

md:px-14

"

>


<div

className="
absolute

left-1/2

top-0

h-3

w-3

-translate-x-1/2

-translate-y-1/2

rounded-full

bg-[#D4AF37]

"

/>





<p

className="
text-sm

tracking-[0.3em]

text-[#D4AF37]

"

>

T&M JEWELS

</p>





<h2

className="
mt-5

text-3xl

font-semibold

text-[#F7E3A3]

md:text-4xl

"

>

Ready to Find Your Signature Style?

</h2>





<p

className="
mx-auto

mt-5

max-w-xl

leading-relaxed

text-neutral-400

"

>

Discover jewellery that reflects your personality
and adds confidence to every look.

Create your own style,
create your own trend.

</p>





<button

type="button"

onClick={() => navigate("/shop")}

className="
mt-8

rounded-full

bg-white

px-10

py-3

font-medium

text-black

transition-all

duration-300

hover:bg-gradient-to-r

hover:from-[#B8862E]

hover:via-[#D4AF37]

hover:to-[#F7E3A3]

hover:scale-105

"

>

Explore Collection

</button>



</motion.div>


</section>

</main>

);

}