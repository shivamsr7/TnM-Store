import { Search } from "lucide-react";


interface Props{

search:string;

setSearch:(value:string)=>void;

productCount:number;

categories:string[];

activeCategory:string;

setCategory:(value:string)=>void;

}




export default function ShopHeader({

search,

setSearch,

productCount,

categories,

activeCategory,

setCategory

}:Props){



return (

<section className="mt-[-40px] mb-8 md:mt-0 md:mb-14">



<div

className="
text-center
"

>





<h1

className="
mt-0

text-3xl

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

Shop Collection

</h1>




<p

className="
mx-auto

mt-3

max-w-2xl

text-sm

text-neutral-400

md:mt-5

md:text-base

"

>

Luxury inspired Jewellery you'll love to wear.
Crafted for every occasion.

</p>


</div>








{/* Categories */}

<div

className="
mt-6

flex

gap-2

overflow-x-auto

pb-1

scrollbar-hide

"

>


{

categories.map((item)=>(


<button

key={item}

onClick={()=>setCategory(item)}

className={

`

whitespace-nowrap

rounded-full

px-4

py-1.5

text-xs

transition-all

duration-200


md:px-6

md:py-2

md:text-sm


${

activeCategory===item

?

"bg-[#D4AF37] text-black"

:

"border border-[#D4AF37]/30 text-neutral-300"

}

`

}

>

{item}

</button>


))


}


</div>









{/* Search */}

<div

className="
mx-auto

mt-5

max-w-xl

md:mt-8

"

>


<div

className="
flex

items-center

gap-3

rounded-full

border

border-[#D4AF37]/30

bg-[#0d0d0d]

px-4

py-2.5

md:px-5

md:py-3

"

>


<Search

size={18}

className="text-[#D4AF37] md:size-5"

/>



<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Search jewellery..."

className="
w-full

bg-transparent

text-sm

text-white

outline-none

placeholder:text-neutral-500

"

/>


</div>

</div>









<div

className="
mt-5

flex

items-center

justify-between

text-xs

text-neutral-400

md:mt-8

md:text-sm

"

>


<span>

{productCount} pieces

</span>



<button

className="
rounded-full

border

border-[#D4AFG37]/30

px-4

py-1.5

text-xs

text-white

md:px-5

md:py-2

md:text-sm

"

>

Sort

</button>



</div>




</section>

);

}