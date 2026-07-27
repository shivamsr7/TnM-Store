import { useSearchParams } from "react-router-dom";

import {
  useCategories,
} from "@/features/categories";



export default function CategoryTabs(){


const {
data:categories = [],
isLoading,
}=useCategories();



const [
searchParams,
setSearchParams
]=useSearchParams();



const activeCategory =
searchParams.get("category") || "all";




function selectCategory(
slug:string
){

if(slug==="all"){

setSearchParams({});

return;

}


setSearchParams({
category:slug
});

}




if(isLoading){

return (

<div className="
flex
gap-3
overflow-hidden
">

{
[1,2,3,4].map((item)=>(

<div

key={item}

className="
h-9
w-24
animate-pulse
rounded-full
bg-white/10
"

/>

))
}

</div>

);

}





return (

<div

className="
w-full
overflow-x-auto
scrollbar-hide
"

>


<div

className="
flex
min-w-max
items-center
gap-6
border-b
border-white/10
"

>


<button

onClick={()=>selectCategory("all")}

className={`
relative
pb-3
text-sm
font-medium
transition-all

${
activeCategory==="all"

?

"text-[#C8A44D]"

:

"text-neutral-400 hover:text-white"

}

`}

>

All



{

activeCategory==="all" && (

<span

className="
absolute
bottom-0
left-0
h-[2px]
w-full
bg-[#C8A44D]
"

/>

)

}

</button>







{

categories.map((category)=>(


<button

key={category.id}

onClick={()=>selectCategory(category.slug)}

className={`
relative
pb-3
text-sm
font-medium
transition-all

${
activeCategory===category.slug

?

"text-[#C8A44D]"

:

"text-neutral-400 hover:text-white"

}

`}

>


{category.name}



{

activeCategory===category.slug && (

<span

className="
absolute
bottom-0
left-0
h-[2px]
w-full
bg-[#C8A44D]
"

/>

)

}



</button>



))

}





</div>


</div>

);

}