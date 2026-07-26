import {
  useEffect,
} from "react";

import AuthContent from "./AuthContent";


interface Props {

  open:boolean;

  onOpenChange:(open:boolean)=>void;

}



export default function MobileAuthSheet({

  open,

  onOpenChange,

}:Props){



useEffect(()=>{


if(open){

  document.body.style.overflow = "hidden";

}
else{

  document.body.style.overflow = "";

}



return ()=>{

  document.body.style.overflow = "";

};


},[open]);





if(!open) return null;



return (

<>


{/* Overlay */}

<div

className="
fixed
inset-0
z-40
bg-black/40
"

onClick={()=>{

onOpenChange(false);

}}

/>





{/* Sheet */}

<div

className="
fixed
bottom-0
left-0
right-0

z-50

max-h-[85dvh]

overflow-hidden

rounded-t-3xl

bg-white

shadow-2xl

animate-in

slide-in-from-bottom

duration-300

"

>



{/* Handle */}

<div

className="
mx-auto
mt-3
h-1.5
w-12
rounded-full
bg-neutral-300
"

/>




<div

className="
max-h-[80dvh]

overflow-y-auto

overscroll-contain

"

>

<AuthContent />


</div>



</div>


</>

);

}