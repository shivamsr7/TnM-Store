import {
useMutation,
useQueryClient,
} from "@tanstack/react-query";


import {
cartService,
} from "../services/cart.service";



export function useUpdateCartQuantity(){


const queryClient =
useQueryClient();



return useMutation({


mutationFn:
({
itemId,
quantity
}:{
itemId:string;
quantity:number;
})=>
cartService.updateQuantity(
itemId,
quantity
),



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"cart"
]

});


}


});


}