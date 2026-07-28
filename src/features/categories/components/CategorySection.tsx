import {
  useCategories,
} from "../hooks/useCategories";


import {
  Link,
} from "react-router-dom";



export default function CategorySection(){


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
py-8
"

>


<div

className="
mb-5
flex
items-end
justify-between
"

>

<div>

<h2

className="
text-2xl
font-semibold
text-neutral-900
"

>

Shop By Category ✨

</h2>


<p

className="
mt-1
text-sm
text-neutral-500
"

>

Find your perfect style

</p>


</div>


</div>






{/* Mobile Scroll */}

<div

className="
flex
gap-4
overflow-x-auto
pb-3
md:hidden
"

>


{

categories.map((category)=>(


<Link

key={category.id}

to={`/category/${category.slug}`}

className="
min-w-[150px]
overflow-hidden
rounded-2xl
border
bg-white
"

>


<div

className="
aspect-square
overflow-hidden
"

>


<img

src={category.image_url ?? "/placeholder-category.png"}

alt={category.name}

className="
h-full
w-full
object-cover
transition-transform
duration-300
hover:scale-105
"

/>


</div>



<p

className="
p-3
text-center
text-sm
font-medium
"

>

{category.name}

</p>



</Link>


))

}



</div>







{/* Desktop Grid */}

<div

className="
hidden
grid-cols-3
gap-5
md:grid
lg:grid-cols-6
"

>


{

categories.map((category)=>(


<Link

key={category.id}

to={`/category/${category.slug}`}

className="
group
overflow-hidden
rounded-2xl
border
bg-white
shadow-sm
"

>


<div

className="
aspect-square
overflow-hidden
"

>


<img

src={category.image_url ?? "/placeholder-category.png"}

alt={category.name}

className="
h-full
w-full
object-cover
transition-transform
duration-300
group-hover:scale-105
"

/>


</div>




<p

className="
p-3
text-center
text-sm
font-medium
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