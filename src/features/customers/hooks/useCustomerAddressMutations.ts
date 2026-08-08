import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";


import {
  createCustomerAddress,
  updateCustomerAddress,
  deleteCustomerAddress,
  setDefaultAddress,
} from "../services/customer-address.service";








export function useCustomerAddressMutations(
customerId?:string
){



const queryClient =
useQueryClient();







function invalidate(){


if(!customerId)

return;



queryClient.invalidateQueries({

queryKey:[
"customer-addresses",
customerId
]

});


}








const createMutation =

useMutation({

mutationFn:
createCustomerAddress,


onSuccess:
invalidate,

});









const updateMutation =

useMutation({

mutationFn:({

id,

data,

}:{

id:string;

data:any;

})=>


updateCustomerAddress(

id,

data

),



onSuccess:
invalidate,


});









const deleteMutation =

useMutation({

mutationFn:
deleteCustomerAddress,


onSuccess:
invalidate,


});









const defaultMutation =

useMutation({

mutationFn:({

addressId,

}:{

addressId:string;

})=>


setDefaultAddress(

customerId!,

addressId

),



onSuccess:
invalidate,


});









return {

createMutation,

updateMutation,

deleteMutation,

defaultMutation,

};

}