import { useState, useMemo } from "react";

import ShopHeader from "../components/ShopHeader";
import ProductGrid from "../components/ProductGrid";

import { useShopProducts } from "../hooks/useShopProducts";



export default function Shop() {


const {
data: products = [],
isLoading,
isError
}=useShopProducts();



const [search,setSearch]=useState("");

const [category,setCategory]=useState("All");





const categories = [
"All",
"Rings",
"Earrings",
"Necklaces",
"Bracelets",
"Watches",
"Sets"
];







const filteredProducts = useMemo(()=>{


return products.filter((product:any)=>{


const searchMatch =

product.name
.toLowerCase()
.includes(
search.toLowerCase()
)

||

product.short_description
?.toLowerCase()
.includes(
search.toLowerCase()
);



const categoryMatch =

category==="All"

||

product.categories?.name===category;



return searchMatch && categoryMatch;



});


},[
products,
search,
category
]);








if(isLoading){

return(

<div

className="
min-h-screen

flex

items-center

justify-center

bg-black

text-white

"

>

Loading collection...

</div>

)

}





if(isError){

return(

<div

className="
min-h-screen

flex

items-center

justify-center

bg-black

text-red-400

"

>

Unable to load products.

</div>

)

}






return (

<main

className="
min-h-screen

bg-black

px-5

py-16

"

>


<div

className="
mx-auto

max-w-7xl

"

>


<ShopHeader

search={search}

setSearch={setSearch}

productCount={
filteredProducts.length
}

categories={categories}

activeCategory={category}

setCategory={setCategory}

/>





<ProductGrid

products={filteredProducts}

/>




</div>


</main>

);

}