import { supabase } from "@/shared/lib/supabase";

import type {
  Cart,
  CartItem,
} from "../types/cart.types";



class CartService {



async getCustomerCart(
customerId:string
){

const {
data:cart,
error
}=await supabase
.from("carts")
.select(`
*,
items:cart_items(*)
`)
.eq(
"customer_id",
customerId
)
.single();



if(error){

if(error.code==="PGRST116"){

return null;

}

throw error;

}



return cart as Cart & {
items:CartItem[]
};

}







async createCart(
customerId:string
){

const {
data,
error
}=await supabase
.from("carts")
.insert({

customer_id:
customerId

})
.select()
.single();



if(error)
throw error;


return data as Cart;

}








async getOrCreateCart(
customerId:string
){


const existing =
await this.getCustomerCart(
customerId
);



if(existing)
return existing;



return await this.createCart(
customerId
);


}







async addItem({

cartId,

productId,

productName,

productImage,

price,

quantity=1

}:{

cartId:string;

productId:string;

productName:string;

productImage?:string|null;

price:number;

quantity?:number;

}){


const {
data:existing
}=await supabase
.from("cart_items")
.select("*")
.eq(
"cart_id",
cartId
)
.eq(
"product_id",
productId
)
.maybeSingle();





if(existing){


const {
data,
error
}=await supabase
.from("cart_items")
.update({

quantity:
existing.quantity + quantity

})
.eq(
"id",
existing.id
)
.select()
.single();



if(error)
throw error;


return data;

}





const {
data,
error
}=await supabase
.from("cart_items")
.insert({

cart_id:cartId,

product_id:productId,

product_name:productName,

product_image:productImage,

price,

quantity

})
.select()
.single();



if(error)
throw error;


return data;

}







async removeItem(
itemId:string
){


const {
error
}=await supabase
.from("cart_items")
.delete()
.eq(
"id",
itemId
);



if(error)
throw error;


}







async updateQuantity(
itemId:string,
quantity:number
){


const {
data,
error
}=await supabase
.from("cart_items")
.update({

quantity

})
.eq(
"id",
itemId
)
.select()
.single();



if(error)
throw error;


return data;

}





}



export const cartService =
new CartService();