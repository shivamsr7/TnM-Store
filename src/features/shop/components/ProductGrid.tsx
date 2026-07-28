import ProductCard from "./ProductCard";

import type { Product } from "@/features/products/types/product.types";


interface ProductGridProps {

products: Product[];

}



export default function ProductGrid({
products
}:ProductGridProps){


if(!products.length){

return (

<div

className="
py-20

text-center

text-neutral-400

"

>

No products found.

</div>

);

}




return (

<div

className="
grid

grid-cols-2

gap-4

sm:gap-6

md:grid-cols-3

lg:grid-cols-4

"

>


{

products.map((product:any)=>(


<ProductCard

key={product.id}

product={product}

/>


))

}


</div>

);

}