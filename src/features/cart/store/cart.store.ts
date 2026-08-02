import {
  create
} from "zustand";

import {
  persist
} from "zustand/middleware";




export interface CartItem {

  id:string;

  productId:string;

  name:string;

  price:number;

  image?:string;

  quantity:number;

}





export interface AppliedCoupon {

id:string;

code:string;

title?:string;

discount:number;

freeShipping:boolean;

freeGift:boolean;

minimumOrderAmount:number;

}






interface CartStore {


items:CartItem[];

isCartOpen:boolean;



// Coupon

appliedCoupon:AppliedCoupon | null;

discount:number;

couponErrorMessage:string;





addItem:(item:CartItem)=>void;


removeItem:(id:string)=>void;


updateQuantity:(id:string,quantity:number)=>void;


clearCart:()=>void;



openCart:()=>void;


closeCart:()=>void;




getTotal:()=>number;


getFinalTotal:()=>number;


getCartCount:()=>number;




applyCoupon:(coupon:AppliedCoupon)=>void;


removeCoupon:()=>void;


clearCouponMessage:()=>void;


}







export const useCartStore = create<CartStore>()(

persist(

(set,get)=>({



items:[],


isCartOpen:false,



appliedCoupon:null,


discount:0,


couponErrorMessage:"",







/*
  Check coupon validity after cart changes
*/

checkCouponValidity:undefined,









addItem:(item)=>{


const existingItem = get().items.find(

(cartItem)=>

cartItem.productId===item.productId

);




if(existingItem){


set({

items:get().items.map((cartItem)=>

cartItem.productId===item.productId

?

{

...cartItem,

quantity:cartItem.quantity + item.quantity

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


const updatedItems = get().items.filter(

(item)=>

item.id!==id

);




const coupon = get().appliedCoupon;



const newTotal = updatedItems.reduce(

(total,item)=>

total + item.price * item.quantity,

0

);





if(

coupon &&

coupon.minimumOrderAmount &&

newTotal < coupon.minimumOrderAmount

){


set({

items:updatedItems,

appliedCoupon:null,

discount:0,

couponErrorMessage:

"Coupon removed because minimum order value is not met"

});


return;

}





set({

items:updatedItems

});


},







updateQuantity:(id,quantity)=>{


if(quantity<=0)

return;





const updatedItems = get().items.map((item)=>

item.id===id

?

{

...item,

quantity

}

:

item

);





const coupon = get().appliedCoupon;



const newTotal = updatedItems.reduce(

(total,item)=>

total + item.price * item.quantity,

0

);







if(

coupon &&

coupon.minimumOrderAmount &&

newTotal < coupon.minimumOrderAmount

){



set({

items:updatedItems,

appliedCoupon:null,

discount:0,

couponErrorMessage:

"Coupon removed because minimum order value is not met"

});


return;


}






set({

items:updatedItems

});


},







clearCart:()=>{


set({

items:[],

appliedCoupon:null,

discount:0,

couponErrorMessage:""

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

total + item.price * item.quantity,

0

);


},







getFinalTotal:()=>{


return Math.max(

get().getTotal() - get().discount,

0

);


},







getCartCount:()=>{


return get().items.reduce(

(total,item)=>

total + item.quantity,

0

);


},







applyCoupon:(coupon)=>{


set({

appliedCoupon:coupon,

discount:coupon.discount,

couponErrorMessage:""

});


},







removeCoupon:()=>{


set({

appliedCoupon:null,

discount:0,

couponErrorMessage:""

});


},







clearCouponMessage:()=>{


set({

couponErrorMessage:""

});


}





}),


{

name:"tnm-cart"

}


)

);