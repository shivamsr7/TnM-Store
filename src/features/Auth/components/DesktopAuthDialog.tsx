import {
 Dialog,
 DialogContent,
} from "@/components/ui/dialog";

import AuthContent from "./AuthContent";


interface Props{

open:boolean;

onOpenChange:(open:boolean)=>void;

}


export default function DesktopAuthDialog({

open,

onOpenChange,

}:Props){


return (

<Dialog

open={open}

onOpenChange={onOpenChange}

>


<DialogContent

className="
max-w-md
rounded-3xl
p-0
overflow-hidden
"

>

<AuthContent/>

</DialogContent>


</Dialog>

);

}