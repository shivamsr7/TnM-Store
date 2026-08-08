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
  useEffect,
  useState,
} from "react";


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
  toast,
} from "sonner";


import {
  useCurrentCustomer,
} from "@/features/customers/hooks/useCurrentCustomer";


import {
  useCustomerProfileMutation,
} from "@/features/customers/hooks/useCustomerProfileMutation";


import AvatarUpload from "./AvatarUpload";







const schema = z.object({

first_name:
z.string()
.min(2,"First name is required"),


last_name:
z.string()
.optional(),

});






type FormData =
z.infer<typeof schema>;








interface Props {

open:boolean;

onClose:()=>void;

}








export default function EditProfileDialog({

open,

onClose,

}:Props){





const {
data:customer
}=useCurrentCustomer();







const {

updateMutation

}=useCustomerProfileMutation(

customer?.id

);







const [
avatar,
setAvatar
]=useState<string | null>(null);









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

});









useEffect(()=>{


if(customer){


reset({

first_name:
customer.first_name,


last_name:
customer.last_name || "",


});


setAvatar(
customer.avatar || null
);


}


},[
customer,
reset
]);









function submit(
data:FormData
){



if(!customer?.id)

return;






updateMutation.mutate(

{

first_name:
data.first_name,


last_name:
data.last_name,


avatar,


},

{

onSuccess:()=>{


toast.success(

"Profile updated successfully"

);


onClose();


},


onError:()=>{


toast.error(

"Unable to update profile"

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

Edit Profile

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









<AvatarUpload

customerId={customer?.id || ""}

avatar={avatar}

onUpload={(url)=>{

setAvatar(url);

}}

/>









<div>


<label

className="
mb-2
block
text-sm
font-medium
text-neutral-700
"

>

First Name

</label>



<input

{...register("first_name")}

placeholder="First name"

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


<p

className="
mt-1
text-xs
text-red-500
"

>

{errors.first_name?.message}

</p>


</div>









<div>


<label

className="
mb-2
block
text-sm
font-medium
text-neutral-700
"

>

Last Name

</label>



<input

{...register("last_name")}

placeholder="Last name"

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


<label

className="
mb-2
block
text-sm
font-medium
text-neutral-700
"

>

Email

</label>



<input

value={customer?.email || ""}

readOnly

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-100
px-4
py-3
text-sm
text-neutral-500
outline-none
"

/>


</div>









<div>


<label

className="
mb-2
block
text-sm
font-medium
text-neutral-700
"

>

Phone Number

</label>



<input

value={customer?.phone || ""}

readOnly

className="
w-full
rounded-xl
border
border-neutral-200
bg-neutral-100
px-4
py-3
text-sm
text-neutral-500
outline-none
"

/>


</div>









<button

type="submit"

disabled={updateMutation.isPending}

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

updateMutation.isPending

?

"Saving..."

:

"Save Changes"

}

</button>









</form>







</DialogContent>







</Dialog>

);

}