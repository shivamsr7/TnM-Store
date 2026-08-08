import {
  useEffect,
  useState
} from "react";


import {
  getCustomerAddresses
} from "@/features/customers/services/address.service";


import AddAddressForm from "./AddAddressForm";



interface Props {

  customer:any;

  onContinue:(address:any)=>void;

}





export default function AddressStep({

  customer,

  onContinue

}:Props){



const [addresses,setAddresses]=useState<any[]>([]);

const [selected,setSelected]=useState<any>(null);

const [loading,setLoading]=useState(true);

const [showAddForm,setShowAddForm]=useState(false);






async function loadAddresses(){


console.log(
"Customer passed to AddressStep:",
customer
);


const data = await getCustomerAddresses(

customer.id

);



setAddresses(data);



const defaultAddress =

data.find(

(item)=>item.is_default

);



setSelected(

defaultAddress ?? data[0] ?? null

);



setLoading(false);


}





useEffect(()=>{


loadAddresses();


},[customer]);







if(loading)

return (

<div className="py-10 text-center text-sm text-neutral-500">

Loading addresses...

</div>

);







return (

<div className="space-y-5">





<h3 className="text-lg font-semibold">

Select Delivery Address

</h3>







{
showAddForm &&

<AddAddressForm

customerId={customer.id}

onCancel={()=>setShowAddForm(false)}

onSaved={(address)=>{

setAddresses(prev=>[
address,
...prev
]);

setSelected(address);

setShowAddForm(false);

}}

/>

}








{

!showAddForm &&

<>





{
addresses.length===0 &&

<div

className="

rounded-2xl

border

border-dashed

p-5

text-center

text-sm

text-neutral-500

"

>

No saved address found.

Add your delivery address.

</div>

}








{
addresses.map((address)=>(


<div

key={address.id}

onClick={()=>setSelected(address)}

className={`

cursor-pointer

rounded-2xl

border

p-4

transition


${

selected?.id===address.id

?

"border-black bg-neutral-50"

:

"border-neutral-200"

}

`}

>





<div className="flex justify-between">


<p className="font-medium">

{address.full_name}

</p>




{

address.is_default &&

<span

className="
rounded-full
bg-neutral-100
px-2
py-1
text-xs
"

>

Default

</span>

}


</div>






<p className="mt-2 text-sm text-neutral-600">

{address.address_line_1}

</p>



{

address.address_line_2 &&

<p className="text-sm text-neutral-600">

{address.address_line_2}

</p>

}






<p className="text-sm text-neutral-600">

{address.city}, {address.state}

</p>




<p className="text-sm text-neutral-600">

{address.postal_code}

</p>





</div>



))

}







<button

onClick={()=>setShowAddForm(true)}

className="

w-full

rounded-xl

border

border-dashed

py-3

text-sm

font-medium

"

>

+ Add New Address

</button>




<button

disabled={!selected}

onClick={()=>onContinue(selected)}

className="

w-full

rounded-xl

bg-black

py-3

text-white

disabled:opacity-50

"

>

Continue

</button>



</>

}






</div>

);

}