import {
useParams
} from "react-router-dom";

import ProductGallery from "../components/ProductGallery";
import {
useProductDetails
} from "../hooks/useProductDetails";
import ProductInfo from "../components/ProductInfo";

import ProductActions from "../components/ProductActions";
export default function ProductDetails(){


const {
slug
}=useParams();


const {

data:product,

isLoading,

isError

}=useProductDetails(
slug || ""
);




if(isLoading){

return(

<div

className="
min-h-screen
bg-black
flex
items-center
justify-center
text-white

"

>

Loading product...

</div>

)

}





if(isError || !product){

return(

<div

className="
min-h-screen
bg-black
flex
items-center
justify-center
text-red-400

"

>

Product not found.

</div>

)

}





return (

<main

className="
min-h-screen

bg-black

text-white

px-5

py-10

"

>


<div

className="
mx-auto

max-w-7xl

"

>


<div

className="
grid

grid-cols-1

gap-10


lg:grid-cols-2

"

>



{/* Product Gallery */}

<div>

<ProductGallery

images={product.product_images || []}

productName={product.name}

/>

</div>







{/* Product Info Placeholder */}

<div

className="
flex

items-start

justify-center

"

>


<ProductInfo

product={product}

/>


<ProductActions

product={product}

/>

</div>






</div>


</div>


</main>

);


}