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
   *
   * IMPORTANT:
   * A product object can remain in the page after its
   * Special Price has expired. In that case
   * getEffectiveProductPrice() may still be based on the
   * stale Special Price snapshot.
   *
   * For Add To Cart, an expired Special Price must therefore
   * immediately fall back to the current regular product
   * price. Active Special Prices continue to use the existing
   * pricing utility unchanged.
   */
  const specialOfferExpired =
    Boolean(
      product?.special_discount_enabled
    ) &&
    Number(
      product?.special_discount_value ?? 0
    ) > 0 &&
    Boolean(
      product?.special_discount_ends_at
    ) &&
    new Date(
      product.special_discount_ends_at
    ).getTime() <= Date.now();

  const effectivePrice =
    specialOfferExpired
      ? Number(product.price)
      : getEffectiveProductPrice(product);

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