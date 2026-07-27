import {
  useQuery,
} from "@tanstack/react-query";


import {
  cartService,
} from "../services/cart.service";



export function useCart(
customerId?:string
){


return useQuery({

queryKey:[
"cart",
customerId
],


queryFn:()=>{

if(!customerId)
return null;


return cartService.getCustomerCart(
customerId
);

},


enabled:
!!customerId,


});

}