import {
  useMutation
} from "@tanstack/react-query";


import {
  createOrder
} from "../services/order.service";


import type {
  CreateOrderPayload
} from "../types/order.types";





export function useCreateOrder(){



return useMutation({



mutationFn:(

payload:CreateOrderPayload

)=>createOrder(payload),





onSuccess:(data)=>{


console.log(

"Order created:",

data

);


},






onError:(error)=>{


console.error(

"Order creation failed:",

error

);


}



});


}