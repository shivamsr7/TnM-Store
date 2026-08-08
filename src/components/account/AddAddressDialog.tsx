import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  X,
} from "lucide-react";


import {
  useForm,
} from "react-hook-form";


import {
  zodResolver,
} from "@hookform/resolvers/zod";


import {
  z,
} from "zod";


import {
  useCurrentCustomer,
} from "@/features/customers/hooks/useCurrentCustomer";


import {
  useCustomerAddressMutations,
} from "@/features/customers/hooks/useCustomerAddressMutations";


import {
  toast,
} from "sonner";








const schema = z.object({

  full_name:
  z.string().min(2,"Name is required"),


  phone:
  z.string().min(10,"Valid phone required"),


  address_line_1:
  z.string().min(5,"Address required"),


  address_line_2:
  z.string().optional(),


  city:
  z.string().min(2,"City required"),


  state:
  z.string().min(2,"State required"),


  postal_code:
  z.string().min(5,"Postal code required"),


  type:
  z.string(),

});





type FormData =
z.infer<typeof schema>;








interface Props {

open:boolean;

onClose:()=>void;

onSuccess:()=>void;

}









export default function AddAddressDialog({

open,

onClose,

onSuccess,

}:Props){





const {
data:customer
}=useCurrentCustomer();







const {

createMutation

}=useCustomerAddressMutations(

customer?.id!

);









const {

register,

handleSubmit,

reset,

formState:{
errors
}

}=useForm<FormData>({

resolver:
zodResolver(schema),

defaultValues:{
type:"home"
}

});









function submit(
data:FormData
){


if(!customer?.id)

return;





createMutation.mutate(

{

...data,

customer_id:
customer.id,

country:
"India",

is_default:false,

},

{

onSuccess:()=>{


toast.success(
"Address saved successfully"
);



reset();


onSuccess();


onClose();


},


onError:()=>{


toast.error(
"Unable to save address"
);


}

}

);


}









return (

<Dialog

open={open}

onOpenChange={(value)=>{

if(!value)

onClose();

}}

>








<DialogContent

className="
max-h-[90vh]
w-[95vw]
overflow-y-auto
rounded-3xl
border-neutral-200
bg-white
p-0
text-black
shadow-xl
sm:max-w-xl

[&>button]:hidden
"

>







<div

className="
flex
items-center
justify-between
border-b
border-neutral-200
px-6
py-5
"

>


<DialogHeader>


<DialogTitle

className="
text-xl
font-semibold
"

>

Add New Address

</DialogTitle>


</DialogHeader>








<button

onClick={onClose}

className="
flex
h-9
w-9
items-center
justify-center
rounded-full
border
border-neutral-300
transition
hover:bg-neutral-100
"

>

<X size={18}/>

</button>






</div>









<form

onSubmit={handleSubmit(submit)}

className="
space-y-5
p-6
"

>









<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Full Name

</label>



<input

{...register("full_name")}

placeholder="Enter your full name"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


<p className="
mt-1
text-xs
text-red-500
">

{errors.full_name?.message}

</p>


</div>









<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Phone Number

</label>



<input

{...register("phone")}

placeholder="Enter phone number"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>









<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Address Line 1

</label>



<input

{...register("address_line_1")}

placeholder="House no, Street, Area"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>








<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Address Line 2

</label>



<input

{...register("address_line_2")}

placeholder="Apartment, Landmark (optional)"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>









<div

className="
grid
grid-cols-1
gap-4
sm:grid-cols-2
"

>


<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

City

</label>


<input

{...register("city")}

placeholder="City"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>








<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

State

</label>


<input

{...register("state")}

placeholder="State"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>



</div>









<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Postal Code

</label>


<input

{...register("postal_code")}

placeholder="PIN Code"

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
transition
focus:border-[#C8A44D]
focus:bg-white
"

/>


</div>









<div>


<label className="
mb-2
block
text-sm
font-medium
text-neutral-700
">

Address Type

</label>


<select

{...register("type")}

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-50
px-4
py-3
text-sm
outline-none
focus:border-[#C8A44D]
"

>


<option value="home">
Home
</option>


<option value="work">
Work
</option>


<option value="other">
Other
</option>


</select>



</div>







<button

type="submit"

disabled={createMutation.isPending}

className="
w-full
rounded-xl
bg-[#C8A44D]
py-3.5
font-semibold
text-black
transition
hover:bg-[#b8943f]
disabled:cursor-not-allowed
disabled:opacity-70
"

>

{

createMutation.isPending

?

"Saving..."

:

"Save Address"

}

</button>









</form>







</DialogContent>







</Dialog>

);

}