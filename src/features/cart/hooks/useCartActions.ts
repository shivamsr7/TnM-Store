import {
  useCartStore
} from "../store/cart.store";




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


addItem({
  id: crypto.randomUUID(),
  productId: product.id,
  name: product.name,
  price: product.price,
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