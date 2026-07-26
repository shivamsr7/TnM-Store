import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer";

import AuthContent from "./AuthContent";


interface Props {

  open:boolean;

  onOpenChange:(open:boolean)=>void;

}



export default function MobileAuthDrawer({

  open,

  onOpenChange,

}:Props){


return (

<Drawer

  open={open}

  onOpenChange={onOpenChange}

  shouldScaleBackground={false}

  dismissible={true}

>


<DrawerContent

className="
h-[70vh]
max-h-[70vh]
rounded-t-3xl
overflow-hidden
"

>


<AuthContent />


</DrawerContent>


</Drawer>


);

}