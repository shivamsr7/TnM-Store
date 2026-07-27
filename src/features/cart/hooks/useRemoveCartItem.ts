import {
useMutation,
useQueryClient,
} from "@tanstack/react-query";


import {
cartService,
} from "../services/cart.service";



export function useRemoveCartItem(){


const queryClient =
useQueryClient();



return useMutation({


mutationFn:
cartService.removeItem,



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"cart"
]

});


}


});


}