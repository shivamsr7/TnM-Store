import {
  useMutation,
} from "@tanstack/react-query";


import {
  updateCustomerProfile,
} from "../services/customer-profile.service";


import {
  useCustomerStore,
} from "../store/customer.store";







export function useCustomerProfileMutation(

customerId?:string

){



const setCustomer =

useCustomerStore(

(state)=>state.setCustomer

);







const updateMutation =

useMutation({

mutationFn:(data:any)=>


updateCustomerProfile(

customerId!,

data

),





onSuccess:(updatedCustomer)=>{


setCustomer(

updatedCustomer

);


}

});







return {

updateMutation

};


}