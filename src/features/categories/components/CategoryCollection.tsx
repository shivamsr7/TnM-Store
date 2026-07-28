import { Link } from "react-router-dom";

import {
  useCategories,
} from "../hooks/useCategories";



export default function CategoryCollection(){


const {
data:categories,
isLoading,
}=useCategories();





if(isLoading){

return null;

}





if(!categories?.length){

return null;

}







return (

<section

className="
bg-black
px-5
py-12

md:px-10
"

>


<div

className="
mb-8
text-center
"

>

<h2

className="
text-2xl
font-semibold
tracking-wide
text-[#C8A44D]

md:text-3xl
"

>

Category Collection ✨

</h2>



<p

className="
mt-2
text-sm
text-neutral-400
"

>

Explore jewellery crafted for every style

</p>


</div>







<div

className="
grid
grid-cols-3
gap-6

md:grid-cols-6
md:gap-8
"

>


{

categories.map((category)=>(


<Link

key={category.id}

to={`/category/${category.slug}`}

className="
group
flex
flex-col
items-center
"

>


<div

className="
relative
h-24
w-24
overflow-hidden
rounded-full
border
border-[#C8A44D]/40

transition-all
duration-300

group-hover:scale-110
group-hover:border-[#C8A44D]

md:h-36
md:w-36
"

>


<img

src={
category.image_url ??
"/placeholder-category.png"
}

alt={category.name}

className="
h-full
w-full
object-cover
transition-transform
duration-500
group-hover:scale-110
"

/>





<div

className="
absolute
inset-0
bg-black/20
"

 />




</div>







<p

className="
mt-3
text-center
text-xs
font-medium
uppercase
tracking-wide
text-white

md:text-sm
"

>

{category.name}

</p>



</Link>


))

}



</div>







</section>

);

}