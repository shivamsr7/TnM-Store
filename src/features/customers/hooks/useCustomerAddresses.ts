import {
  useQuery,
} from "@tanstack/react-query";


import {
  getCustomerAddresses,
} from "../services/customer-address.service";





export function useCustomerAddresses(
customerId?:string
){


return useQuery({

queryKey:[
"customer-addresses",
customerId
],


queryFn:()=>


getCustomerAddresses(
customerId!
),


enabled:
!!customerId,


});

}