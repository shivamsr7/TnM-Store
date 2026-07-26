import {
  Routes,
  Route,
} from "react-router-dom";


import App from "@/App";

import AccountPage from "@/features/customers/pages/AccountPage";



export default function AppRouter(){

return (

<Routes>


<Route
path="/"
element={<App />}
/>


<Route
path="/account"
element={<AccountPage />}
/>


</Routes>

);

}