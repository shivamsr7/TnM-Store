import {
  useState,
} from "react";


import {
  Camera,
} from "lucide-react";


import {
  uploadCustomerAvatar,
} from "@/features/customers/services/customer-avatar.service";


import {
  toast,
} from "sonner";







interface Props {

customerId:string;

avatar?:string | null;

onUpload:(url:string)=>void;

}








export default function AvatarUpload({

customerId,

avatar,

onUpload,

}:Props){



const [
uploading,
setUploading
]=useState(false);






async function handleChange(

e:React.ChangeEvent<HTMLInputElement>

){



const file =
e.target.files?.[0];



if(!file)

return;






if(!file.type.startsWith("image/")){


toast.error(
"Please select an image file"
);


return;


}






try{


setUploading(true);




const url =

await uploadCustomerAvatar(

customerId,

file

);





onUpload(url);





toast.success(

"Profile photo updated"

);


}

catch(error){


toast.error(

"Unable to upload image"

);


}

finally{


setUploading(false);


}


}









return (

<div

className="
flex
flex-col
items-center
gap-3
"

>







<div

className="
relative
"

>


<img

src={

avatar ||

"/default-avatar.png"

}

className="
h-24
w-24
rounded-full
border
border-neutral-200
object-cover
"

/>






<label

className="
absolute
bottom-0
right-0
flex
h-8
w-8
cursor-pointer
items-center
justify-center
rounded-full
bg-[#C8A44D]
text-black
shadow
"

>

<Camera size={16}/>


<input

type="file"

accept="image/*"

className="
hidden
"

onChange={handleChange}

/>


</label>





</div>








<p

className="
text-sm
text-neutral-500
"

>

{

uploading

?

"Uploading..."

:

"Change Photo"

}

</p>







</div>

);

}