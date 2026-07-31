import {
  ShoppingBag
} from "lucide-react";

import {
  useEffect,
  useState
} from "react";

import { useCartActions } from "@/features/cart/hooks/useCartActions";
interface Props{

product:any;

}



export default function MobileStickyCart({

product

}:Props){


const [visible,setVisible] = useState(false);

const {
 addToCart
}=useCartActions();


useEffect(()=>{


const handleScroll = ()=>{


if(window.scrollY > 400){

setVisible(true);

}

else{

setVisible(false);

}

};



window.addEventListener(
"scroll",
handleScroll,
{
passive:true
}
);



return ()=>{

window.removeEventListener(
"scroll",
handleScroll
);

};


},[]);






return (

<div

className={`

fixed

bottom-0

left-0

right-0

z-[90]

border-t

border-[#D4AF37]/20

bg-[#080808]/95

px-4

py-3

backdrop-blur-md

transition-transform

duration-300

md:hidden


${

visible

?

"translate-y-0"

:

"translate-y-full"

}

`

}

>


<div

className="
flex

items-center

gap-3

"

>


<div

className="
flex-1

"

>


<p

className="
text-xs

text-neutral-400

"

>

{product.name}

</p>


<p

className="
font-semibold

text-white

"

>

₹{product.price}

</p>


</div>






<button
onClick={()=>addToCart(product)}
className="
flex

items-center

justify-center

gap-2

rounded-xl

bg-[#D4AF37]

px-5

py-3

text-sm

font-semibold

text-black

"

>


<ShoppingBag size={16}/>

ADD

</button>



</div>


</div>

);

}