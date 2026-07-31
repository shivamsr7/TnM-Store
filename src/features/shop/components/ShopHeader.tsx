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

<section className="mb-14">



<div

className="
text-center
"

>






<h1

className="
mt-0

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

Shop Collection

</h1>



<p

className="
mx-auto

mt-5

max-w-2xl

text-neutral-400

"

>

Luxury inspired Jewellery you'll love to wear.
Crafted for every occassion.

</p>


</div>








{/* Categories */}

<div

className="
mt-10

flex

gap-3

overflow-x-auto

pb-3

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

px-6

py-2

text-sm

transition

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

mt-8

max-w-xl

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

px-5

py-3

"

>


<Search

size={20}

className="text-[#D4AF37]"

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

text-white

outline-none

placeholder:text-neutral-500

"

/>


</div>


</div>









<div

className="
mt-8

flex

justify-between

items-center

text-sm

text-neutral-400

"

>


<span>

{productCount} pieces

</span>



<button

className="
rounded-full

border

border-[#D4AF37]/30

px-5

py-2

text-white

"

>

Sort

</button>



</div>




</section>

);

}