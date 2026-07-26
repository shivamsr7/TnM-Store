import AuthDialog from "./AuthDialog";



interface Props {

  open:boolean;

  setOpen:(value:boolean)=>void;

}



export default function GlobalAuthDialog({

  open,

  setOpen,

}:Props){


return (

<AuthDialog

  open={open}

  onOpenChange={setOpen}

/>

);


}