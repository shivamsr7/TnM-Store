import {
  createContext,
  useContext,
  useState,
} from "react";
import type { ReactNode } from "react";
import AuthDialog from "../components/AuthDialog";


interface AuthDialogContextType {

  openAuth: () => void;

  closeAuth: () => void;

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


<AuthDialog

open={open}

onOpenChange={setOpen}

/>


</AuthDialogContext.Provider>

);

}




export function useAuthDialog(){

const context =
useContext(AuthDialogContext);


if(!context){

throw new Error(
"useAuthDialog must be used inside AuthDialogProvider"
);

}


return context;

}