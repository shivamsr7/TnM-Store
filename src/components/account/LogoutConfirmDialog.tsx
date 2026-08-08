import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


import {
  X,
  LogOut,
} from "lucide-react";





interface Props {

open:boolean;

onClose:()=>void;

onConfirm:()=>void;

loading?:boolean;

}





export default function LogoutConfirmDialog({

open,

onClose,

onConfirm,

loading=false,

}:Props){



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
w-[95vw]
rounded-3xl
border-neutral-200
bg-white
p-0
text-black
shadow-xl
sm:max-w-md

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
text-lg
font-semibold
"

>

Logout

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
hover:bg-neutral-100
"

>

<X size={18}/>

</button>


</div>








<div

className="
space-y-5
p-6
text-center
"

>


<div

className="
mx-auto
flex
h-14
w-14
items-center
justify-center
rounded-full
bg-red-50
text-red-500
"

>

<LogOut size={24}/>

</div>






<p

className="
text-sm
text-neutral-600
"

>

Are you sure you want to logout?

</p>







<div

className="
flex
gap-3
"

>


<button

onClick={onClose}

disabled={loading}

className="
flex-1
rounded-xl
border
border-neutral-200
py-3
text-sm
font-medium
"

>

Cancel

</button>






<button

onClick={onConfirm}

disabled={loading}

className="
flex-1
rounded-xl
bg-red-500
py-3
text-sm
font-medium
text-white
disabled:opacity-70
"

>

{

loading
?
"Logging out..."
:
"Logout"

}

</button>



</div>





</div>






</DialogContent>







</Dialog>

);

}