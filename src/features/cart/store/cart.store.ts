import { create } from "zustand";
import { persist } from "zustand/middleware";


export interface CartItem {

  id: string;

  productId: string;

  name: string;

  price: number;

  image?: string;

  quantity: number;

}





interface CartStore {


items: CartItem[];

isCartOpen: boolean;



addItem: (item: CartItem) => void;

removeItem: (id: string) => void;

updateQuantity: (id: string, quantity: number) => void;

clearCart: () => void;



openCart: () => void;

closeCart: () => void;



getTotal: () => number;

getCartCount: () => number;


}





export const useCartStore = create<CartStore>()(

persist(

(set, get) => ({


items: [],

isCartOpen: false,





addItem: (item) => {


const existingItem = get().items.find(

(cartItem) =>

cartItem.productId === item.productId

);



if(existingItem){


set({

items:

get().items.map((cartItem)=>

cartItem.productId === item.productId

?

{

...cartItem,

quantity:

cartItem.quantity + item.quantity

}

:

cartItem

)

});


return;

}





set({

items:[

...get().items,

item

]

});


},







removeItem:(id)=>{


set({

items:

get().items.filter(

(item)=>

item.id !== id

)

});


},







updateQuantity:(id,quantity)=>{


if(quantity<=0){

return;

}



set({

items:

get().items.map((item)=>

item.id===id

?

{

...item,

quantity

}

:

item

)

});


},







clearCart:()=>{


set({

items:[]

});


},







openCart:()=>{


set({

isCartOpen:true

});


},







closeCart:()=>{


set({

isCartOpen:false

});


},







getTotal:()=>{


return get().items.reduce(

(total,item)=>

total +

(item.price * item.quantity),

0

);


},







getCartCount:()=>{


return get().items.reduce(

(total,item)=>

total + item.quantity,

0

);


}



}),



{

name:"tnm-cart"

}

)

);