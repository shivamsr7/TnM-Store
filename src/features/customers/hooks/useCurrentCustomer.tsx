import {
useCustomerStore
} from "../store/customer.store";



export function useCurrentCustomer(){

const customer = useCustomerStore(

(state)=>state.customer

);


return {

data:customer,

isLoading:false

};


}