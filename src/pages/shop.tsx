import CategoryTabs from "@/features/shop/components/CategoryTabs";


export default function Shop(){

return (

<main
className="
min-h-screen
bg-black
text-white
"
>


{/* Heading */}

<section

className="
px-5
pb-8
pt-12
text-center

md:px-10
md:pt-16
"

>


<h1

className="
text-3xl
font-semibold
tracking-wide
text-[#C8A44D]

md:text-5xl
"

>

Explore Our Collection

</h1>



<p

className="
mx-auto
mt-3
max-w-xl
text-sm
text-neutral-400

md:text-base
"

>

Discover timeless jewellery pieces crafted
for every occasion ✨

</p>


</section>







{/* Category Tabs */}

<section

className="
px-5

md:px-10

"

>

<CategoryTabs />

</section>







{/* Products */}

<section

className="
px-5
py-12

md:px-10

"

>


<h2

className="
mb-6
text-xl
font-semibold
"

>

All Jewellery

</h2>



<div

className="
flex
h-80
items-center
justify-center
rounded-3xl
border
border-white/10
text-neutral-500
"

>

Product Grid Coming Next

</div>



</section>





</main>

);

}