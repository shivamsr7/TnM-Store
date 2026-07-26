import {
  createContext,
  useContext,
  useState,
} from "react";

import type { ReactNode } from "react";
import MobileAuthDrawer
from "../components/MobileAuthDrawer";


import DesktopAuthDialog
from "../components/DesktopAuthDialog";



interface AuthDialogContextType {

  openAuth:()=>void;

  closeAuth:()=>void;

}



const AuthDialogContext =
createContext<AuthDialogContextType | null>(null);





export function AuthDialogProvider({

children,

}:{

children:ReactNode;

}){


const [
open,
setOpen
]=useState(false);





return (

<AuthDialogContext.Provider


value={{

openAuth:()=>setOpen(true),

closeAuth:()=>setOpen(false),

}}


>


{children}




<AuthRenderer

open={open}

setOpen={setOpen}

/>


</AuthDialogContext.Provider>


);


}





function AuthRenderer({

open,

setOpen,

}:{

open:boolean;

setOpen:(value:boolean)=>void;

}){


const isMobile =
window.matchMedia(
"(max-width: 768px)"
).matches;



if(isMobile){


return (

<MobileAuthDrawer

open={open}

onOpenChange={setOpen}

/>

);


}



return (

<DesktopAuthDialog

open={open}

onOpenChange={setOpen}

/>

);


}







export function useAuthDialog(){


const context =
useContext(AuthDialogContext);



if(!context){

throw new Error(
"AuthDialog must be used inside AuthDialogProvider"
);

}



return context;


}