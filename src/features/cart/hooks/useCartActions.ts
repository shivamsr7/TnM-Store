import {
  useCartStore
} from "../store/cart.store";

import {
  getEffectiveProductPrice,
} from "@/features/products/utils/specialDiscount";




export function useCartActions(){


const addItem =

useCartStore(

(state)=>state.addItem

);



const openCart =

useCartStore(

(state)=>state.openCart

);






const addToCart = (product:any)=>{

  /*
   * Store the effective price as the cart price snapshot.
   * This ensures the special price shown on the product
   * follows the item into the cart instead of reverting
   * to product.price.
   */
  const effectivePrice =
    getEffectiveProductPrice(product);

addItem({
  id: crypto.randomUUID(),
  productId: product.id,
  name: product.name,
  price: effectivePrice,
  image: product.product_images?.[0]?.image_url,
  quantity: 1,
  ringSize:
    product.ringSize ??
    null,
  stock: null,
});



openCart();



};





return {

addToCart

};


}