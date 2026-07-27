import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";


import {
  cartService,
} from "../services/cart.service";



export function useAddToCart(){


const queryClient =
useQueryClient();



return useMutation({


mutationFn:
cartService.addItem,



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"cart"
]

});


}



});


}