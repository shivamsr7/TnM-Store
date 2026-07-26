import {
  createContext,
  useContext,
  useState,
} from "react";
import GlobalAuthDialog from "@/features/Auth/components/GlobalAuthDialog";
import type { ReactNode } from "react";
interface AuthDialogContextType {

  openAuth: () => void;

  closeAuth: () => void;

}



const AuthDialogContext =
createContext<AuthDialogContextType | null>(null);





export function AuthDialogProvider({

  children,

}:{

  children: ReactNode;

}){


  const [
    open,
    setOpen,
  ] = useState(false);




  return (

    <AuthDialogContext.Provider

      value={{

        openAuth: () =>
          setOpen(true),


        closeAuth: () =>
          setOpen(false),

      }}

    >

      {children}


      <GlobalAuthDialog

        open={open}

        setOpen={setOpen}

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