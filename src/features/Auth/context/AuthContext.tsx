import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  getCustomerByPhone,
} from "@/features/customers/services/customer.service";



interface Customer {

  id:string;

  first_name:string;

  last_name?:string | null;

  email?:string | null;

  phone?:string | null;

}



interface AuthContextType {

  customer:Customer | null;

  loading:boolean;

  logout:()=>Promise<void>;

}



const AuthContext =
createContext<AuthContextType | undefined>(
  undefined
);





export function AuthProvider({

children,

}:{

children:React.ReactNode;

}){


const [customer,setCustomer] =
useState<Customer | null>(null);


const [loading,setLoading] =
useState(true);





useEffect(()=>{


loadSession();



const {

data:{
subscription

}

}=supabase.auth.onAuthStateChange(

async(
_session,
session
)=>{



if(session){





const phone =
session.user.phone
?.replace("+91","")
.slice(-10);


const { data } = await supabase.auth.getSession();
if(!data.session){

const testPhone =
localStorage.getItem(
"tnm_test_phone"
);


if(testPhone){

const customerData =
await getCustomerByPhone(testPhone);


if(customerData){

localStorage.setItem(
"tnm_customer",
JSON.stringify(customerData)
);

setCustomer(customerData);

}


setLoading(false);

return;

}

}


if(phone){


const customerData =
await getCustomerByPhone(phone);



setCustomer(customerData);


}


}
else{


setCustomer(null);


}


}

);




return ()=>{

subscription.unsubscribe();

};


},[]);







async function loadSession(){


const {

data

}=await supabase.auth.getSession();



if(data.session){


const phone =
data.session.user.phone
?.replace("+91","")
.slice(-10);



if(phone){


const customerData =
await getCustomerByPhone(phone);



setCustomer(customerData);


}


}
else{


const testPhone =
localStorage.getItem(
"tnm_test_phone"
);



if(testPhone){


const customerData =
await getCustomerByPhone(testPhone);



if(customerData){

localStorage.setItem(
"tnm_customer",
JSON.stringify(customerData)
);


setCustomer(customerData);

}


}


}



setLoading(false);


}






async function logout(){


await supabase.auth.signOut();


setCustomer(null);


}





return (

<AuthContext.Provider

value={{

customer,

loading,

logout

}}

>

{children}

</AuthContext.Provider>

);


}







export function useAuth(){


const context =
useContext(AuthContext);



if(!context){

throw new Error(
"useAuth must be used inside AuthProvider"
);

}


return context;


}