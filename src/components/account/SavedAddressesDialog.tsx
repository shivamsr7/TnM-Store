import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import AddAddressDialog from "./AddAddressDialog";
import EditAddressDialog from "./EditAddressDialog";
import DeleteAddressDialog from "./DeleteAddressDialog";


import {
  X,
  Plus,
  Star,
  Pencil,
  Trash2,
  MapPin,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  useCurrentCustomer,
} from "@/features/customers/hooks/useCurrentCustomer";


import {
  useCustomerAddresses,
} from "@/features/customers/hooks/useCustomerAddresses";


import {
  useCustomerAddressMutations,
} from "@/features/customers/hooks/useCustomerAddressMutations";


import {
  toast,
} from "sonner";








interface Props {

open:boolean;

onClose:()=>void;

}









export default function SavedAddressesDialog({

open,

onClose,

}:Props){



const {
data:customer

}=useCurrentCustomer();







const {

data:addresses=[],

isLoading:loading

}=useCustomerAddresses(

customer?.id

);








const {

deleteMutation,

defaultMutation,

}=useCustomerAddressMutations(

customer?.id!

);









const [

showAddAddress,

setShowAddAddress

]=useState(false);






const [

showEditAddress,

setShowEditAddress

]=useState(false);






const [

selectedAddress,

setSelectedAddress

]=useState<any>(null);






const [

showDeleteDialog,

setShowDeleteDialog

]=useState(false);






const [

deleteAddressId,

setDeleteAddressId

]=useState<string|null>(null);







function handleDefault(

id:string

){



defaultMutation.mutate(

{

addressId:id

},

{

onSuccess:()=>{


toast.success(

"Default address updated"

);


}


}

);


}
return (

<>

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

Saved Addresses

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








<div

className="
space-y-4
p-6
"

>








{

loading && (

<p

className="
text-center
text-sm
text-neutral-500
"

>

Loading addresses...

</p>

)

}









{

!loading && addresses.length===0 && (

<div

className="
rounded-2xl
border
border-dashed
border-neutral-300
p-8
text-center
"

>


<MapPin

size={38}

className="
mx-auto
mb-3
text-[#C8A44D]
"

/>




<p

className="
font-medium
"

>

No saved addresses

</p>



<p

className="
mt-1
text-sm
text-neutral-500
"

>

Save your address for faster checkout

</p>



</div>

)

}









{

addresses.map((address:any)=>(


<div

key={address.id}

className="
rounded-2xl
border
border-neutral-200
bg-white
p-5
shadow-sm
"

>








<div

className="
flex
items-start
justify-between
gap-3
"

>





<div>


<div

className="
flex
items-center
gap-2
"

>


<h3

className="
font-semibold
capitalize
"

>

{address.type}

</h3>







{

address.is_default && (

<span

className="
flex
items-center
gap-1
rounded-full
bg-[#C8A44D]/10
px-2.5
py-1
text-xs
text-[#9A7A22]
"

>

<Star size={12}/>

Default

</span>

)

}



</div>








<p

className="
mt-3
font-medium
"

>

{address.full_name}

</p>








<p

className="
mt-1
text-sm
text-neutral-600
"

>

{address.phone}

</p>









<p

className="
mt-3
text-sm
leading-relaxed
text-neutral-600
"

>

{address.address_line_1}

<br/>

{

address.address_line_2 && (

<>

{address.address_line_2}

<br/>

</>

)

}



{address.city}, {address.state}

<br/>

{address.postal_code}, {address.country}

</p>







</div>






</div>









<div

className="
mt-5
flex
items-center
justify-between
border-t
border-neutral-200
pt-4
"

>



<div

className="
flex
gap-4
"

>




<button

onClick={()=>{

setSelectedAddress(address);

setShowEditAddress(true);

}}

className="
flex
items-center
gap-1
text-sm
text-neutral-600
hover:text-black
"

>

<Pencil size={15}/>

Edit

</button>









<button

onClick={()=>{

setDeleteAddressId(address.id);

setShowDeleteDialog(true);

}}

className="
flex
items-center
gap-1
text-sm
text-red-500
hover:text-red-700
"

>

<Trash2 size={15}/>

Delete

</button>







</div>








{

!address.is_default && (

<button

onClick={()=>handleDefault(address.id)}

className="
text-sm
text-[#9A7A22]
hover:underline
"

>

Set Default

</button>

)

}



</div>








</div>


))

}









<button

onClick={()=>setShowAddAddress(true)}

className="
flex
w-full
items-center
justify-center
gap-2
rounded-xl
bg-[#C8A44D]
py-3.5
font-semibold
text-black
transition
hover:bg-[#b8943f]
"

>

<Plus size={18}/>

Add New Address

</button>








</div>







</DialogContent>







</Dialog>
<AddAddressDialog

open={showAddAddress}

onClose={()=>setShowAddAddress(false)}

onSuccess={()=>{

toast.success(
"Address added successfully"
);

}}

/>







<EditAddressDialog

open={showEditAddress}

address={selectedAddress}

onClose={()=>{

setShowEditAddress(false);

setSelectedAddress(null);

}}

onSuccess={()=>{

toast.success(
"Address updated successfully"
);

}}

/>







<DeleteAddressDialog

open={showDeleteDialog}

onClose={()=>{

setShowDeleteDialog(false);

setDeleteAddressId(null);

}}

onConfirm={()=>{


if(!deleteAddressId)

return;




deleteMutation.mutate(

deleteAddressId,

{

onSuccess:()=>{


toast.success(
"Address deleted successfully"
);



setShowDeleteDialog(false);


setDeleteAddressId(null);


}


}

);



}}

/>







</>

);

}