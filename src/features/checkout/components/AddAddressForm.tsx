import {
  useState
} from "react";


import {
  createCustomerAddress
} from "@/features/customers/services/address.service";



interface Props {

  customerId:string;

  onSaved:(address:any)=>void;

  onCancel:()=>void;

}





export default function AddAddressForm({

  customerId,

  onSaved,

  onCancel

}:Props){



const [loading,setLoading]=useState(false);



const [form,setForm]=useState({

full_name:"",

phone:"",

address_line_1:"",

address_line_2:"",

city:"",

state:"",

postal_code:"",

type:"home",

});






function updateField(

key:string,

value:string

){


setForm(prev=>({

...prev,

[key]:value

}));


}







async function saveAddress(){


try{


setLoading(true);



const address = await createCustomerAddress({

customer_id:customerId,

...form,

});





onSaved(address);



}

catch(error){


console.error(

"Address save failed",

error

);


}

finally{


setLoading(false);


}


}








const inputClass = `

w-full

rounded-xl

border

border-neutral-200

px-4

py-3

text-sm

outline-none

focus:border-black

`;








return (

<div

className="

space-y-4

rounded-2xl

border

bg-white

p-5

"

>


<h3 className="text-lg font-semibold">

Add New Address

</h3>





<input

className={inputClass}

placeholder="Full Name"

value={form.full_name}

onChange={(e)=>

updateField(

"full_name",

e.target.value

)

}

/>





<input

className={inputClass}

placeholder="Phone Number"

value={form.phone}

onChange={(e)=>

updateField(

"phone",

e.target.value

)

}

/>






<input

className={inputClass}

placeholder="Address Line 1"

value={form.address_line_1}

onChange={(e)=>

updateField(

"address_line_1",

e.target.value

)

}

/>






<input

className={inputClass}

placeholder="Address Line 2 (optional)"

value={form.address_line_2}

onChange={(e)=>

updateField(

"address_line_2",

e.target.value

)

}

/>







<div className="grid grid-cols-2 gap-3">


<input

className={inputClass}

placeholder="City"

value={form.city}

onChange={(e)=>

updateField(

"city",

e.target.value

)

}

/>




<input

className={inputClass}

placeholder="State"

value={form.state}

onChange={(e)=>

updateField(

"state",

e.target.value

)

}

/>


</div>







<input

className={inputClass}

placeholder="Pincode"

value={form.postal_code}

onChange={(e)=>

updateField(

"postal_code",

e.target.value

)

}

/>







<div className="flex gap-3">


<button

type="button"

onClick={onCancel}

className="

flex-1

rounded-xl

border

py-3

text-sm

"

>

Cancel

</button>






<button

type="button"

onClick={saveAddress}

disabled={loading}

className="

flex-1

rounded-xl

bg-black

py-3

text-sm

text-white

disabled:opacity-50

"

>

{

loading

?

"Saving..."

:

"Save Address"

}

</button>



</div>





</div>

);

}