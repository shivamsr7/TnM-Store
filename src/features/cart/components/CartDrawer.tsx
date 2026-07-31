import {
  X,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";

import {
  useCartStore
} from "../store/cart.store";




const FREE_SHIPPING_AMOUNT = 2000;




export default function CartDrawer(){


const {

items,

isCartOpen,

closeCart,

removeItem,

updateQuantity,

getTotal

}=useCartStore();



const total = getTotal();


const remainingAmount =
Math.max(
FREE_SHIPPING_AMOUNT-total,
0
);



const progress =

Math.min(

(total/FREE_SHIPPING_AMOUNT)*100,

100

);





return (

<>


{/* Overlay */}

<div

onClick={closeCart}

className={`

fixed

inset-0

z-[999]

bg-black/60

transition-opacity

duration-300


${

isCartOpen

?

"opacity-100"

:

"pointer-events-none opacity-0"

}

`}

/>







{/* Drawer */}

<div

className={`

fixed

right-0

top-0

z-[1000]

h-full

w-full

max-w-md


bg-[#0b0b0b]

border-l

border-[#D4AF37]/20


p-6


transform-gpu

transition-transform

duration-300

ease-[cubic-bezier(.22,1,.36,1)]


${

isCartOpen

?

"translate-x-0"

:

"translate-x-full"

}

`

}

>




<div

className="
flex

items-center

justify-between

"

>

<h2

className="
text-xl

font-semibold

text-[#F7E3A3]

"

>

Your Cart

</h2>



<button

onClick={closeCart}

>

<X/>

</button>


</div>









{

items.length===0

?

<div

className="
flex

h-full

flex-col

items-center

justify-center

text-center

"

>


<ShoppingBag

size={40}

className="
text-[#D4AF37]

mb-4

"

/>


<p

className="
text-white

"

>

Your cart is empty

</p>


<p

className="
mt-2

text-sm

text-neutral-400

"

>

Discover our jewellery collection

</p>


</div>



:

<div

className="
mt-6

space-y-5

"

>


{

items.map(item=>(


<div

key={item.id}

className="
flex

gap-4

border-b

border-neutral-800

pb-4

"

>


<img

src={item.image}

className="
h-20

w-20

rounded-xl

object-cover

"

/>



<div

className="
flex-1

"

>


<p

className="
text-sm

text-white

"

>

{item.name}

</p>


<p

className="
mt-1

text-[#D4AF37]

"

>

₹{item.price}

</p>






<div

className="
mt-3

flex

items-center

gap-3

"

>


<button

onClick={()=>updateQuantity(
item.id,
item.quantity-1
)}

className="
h-7

w-7

rounded-full

border

border-neutral-700

"

>

<Minus size={12}/>

</button>



<span className="text-white">

{item.quantity}

</span>




<button

onClick={()=>updateQuantity(
item.id,
item.quantity+1
)}

className="
h-7

w-7

rounded-full

border

border-neutral-700

"

>

<Plus size={12}/>

</button>





<button

onClick={()=>removeItem(item.id)}

className="
ml-auto

text-neutral-500

hover:text-red-400

"

>

<Trash2 size={15}/>

</button>



</div>



</div>


</div>


))

}


</div>

}





{/* Bottom */}

{

items.length>0 &&

<div

className="
absolute

bottom-6

left-6

right-6

"

>



{

remainingAmount>0 &&

<div

className="
mb-4

"

>


<p

className="
mb-2

text-xs

text-neutral-400

"

>

✨ Add ₹{remainingAmount} more for FREE SHIPPING

</p>



<div

className="
h-1.5

overflow-hidden

rounded-full

bg-neutral-800

"

>

<div

className="
h-full

bg-[#D4AF37]

transition-all

duration-500

"

style={{

width:`${progress}%`

}}

/>

</div>


</div>

}





<div

className="
mb-4

flex

justify-between

text-white

"

>

<span>

Subtotal

</span>


<span>

₹{total}

</span>


</div>



<button

className="
w-full

rounded-xl

bg-[#D4AF37]

py-4

font-semibold

text-black

transition-transform

duration-200

active:scale-95

"

>

Proceed to Checkout

</button>


</div>

}




</div>


</>

);

}