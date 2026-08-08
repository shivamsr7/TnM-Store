import {
create
} from "zustand";

import {
persist
} from "zustand/middleware";



interface CustomerStore {

customer:any;

setCustomer:(customer:any)=>void;

clearCustomer:()=>void;

}



export const useCustomerStore = create<CustomerStore>()(

persist(

(set)=>(

{

customer:null,


setCustomer:(customer)=>
set({

customer

}),


clearCustomer:()=>
set({

customer:null

})

}

),

{

name:"tnm-customer"

}

)

);