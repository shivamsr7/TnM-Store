import { Star, Coins, Zap } from "lucide-react";


interface ProductInfoProps {

product:any;

}



export default function ProductInfo({

product

}:ProductInfoProps){



const discount =

product.compare_price

?

Math.round(

(

(product.compare_price - product.price)

/

product.compare_price

)

*100

)

:

0;





return (

<div

className="
w-full

"

>





{/* Product Name */}

<h1

className="
text-2xl

font-semibold

text-[#F7E3A3]

sm:text-3xl

"

>

{product.name}

</h1>









{/* Rating */}

{

product.rating > 0 &&

<div

className="
mt-3

flex

items-center

gap-2

text-sm

"

>

<div

className="
flex

items-center

gap-1

text-[#D4AF37]

"

>

<Star

size={16}

fill="currentColor"

/>

{product.rating}

</div>



{

product.review_count > 0 &&

<span

className="
text-neutral-400

"

>

({product.review_count} Reviews)

</span>

}



</div>

}









{/* Price */}

<div

className="
mt-5

"

>


<div

className="
flex

items-center

gap-3

"

>


<span

className="
text-3xl

font-bold

text-white

"

>

₹{product.price}

</span>





{

product.compare_price &&

<span

className="
text-base

text-neutral-500

line-through

"

>

₹{product.compare_price}

</span>

}




{

discount > 0 &&

<span

className="
rounded-full

bg-[#D4AF37]/20

px-3

py-1

text-xs

font-medium

text-[#D4AF37]

"

>

{discount}% OFF

</span>

}


</div>





<p

className="
mt-2

text-sm

text-neutral-400

"

>

Inclusive of all taxes

</p>



</div>









{/* Feature Chips */}

<div

className="
mt-6

flex

gap-3

overflow-x-auto

pb-2

"

>


{

[

"Anti Tarnish",

"Premium Quality",

"Gift Ready Packaging"

]

.map((item)=>(


<span

key={item}

className="
whitespace-nowrap

rounded-full

border

border-[#D4AF37]/30

px-4

py-2

text-xs

text-[#D4AF37]

"

>

{item}

</span>


))

}


</div>









{/* Sales Count */}

{

product.sales_count > 0 &&

<div

className="
mt-5

flex

items-center

gap-2

text-sm

text-neutral-300

"

>

<Zap

size={16}

className="
text-[#D4AF37]

"

/>


{product.sales_count}+ people bought this

</div>

}









{/* SKU */}

{

product.sku &&

<div

className="
mt-4

text-sm

text-neutral-400

"

>

SKU:

<span className="text-white">

{" "}

{product.sku}

</span>

</div>

}









{/* Rewards */}

<div

className="
mt-5

flex

items-center

gap-2

text-sm

text-yellow-400

"

>

<Coins size={17}/>

<span>

Earn {product.price} Reward Points

</span>


</div>









{/* Deals */}

<div

className="
mt-6

rounded-xl

border

border-[#D4AF37]/20

bg-[#D4AF37]/5

p-4

"

>


<h3

className="
text-sm

font-medium

text-[#D4AF37]

"

>

🏷 Deals

</h3>


<p

className="
mt-2

text-sm

text-neutral-300

"

>

Special offers available at checkout

</p>


</div>







</div>

);

}