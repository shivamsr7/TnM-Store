import AuthDialog from "./AuthDialog";

import {
useAuthDialog
} from "../context/AuthDialogContext";


export default function AuthDialogGlobal(){


const {
openAuth,
closeAuth,
}=useAuthDialog();



return (

<AuthDialog

open={openAuth}

onOpenChange={(value)=>{

if(!value){

closeAuth();

}

}}

/>

);


}