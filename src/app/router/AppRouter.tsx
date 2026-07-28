import {
  Routes,
  Route,
} from "react-router-dom";


import App from "@/App";
import ScrollToTop from "@/shared/components/ScrollToTop";
import AccountPage from "@/features/customers/pages/AccountPage";
import Shop from "@/pages/shop";
import AboutUs from "@/pages/static/AboutUs";
import ContactUs from "@/pages/static/ContactUs"
import MainLayout from "@/layouts/MainLayout";


export default function AppRouter(){

return (

  <>
  <ScrollToTop />
  

<Routes>


<Route
path="/"
element={<App />}
/>


<Route element={<MainLayout />}>


<Route
path="/about-us"
element={<AboutUs />}
/>
<Route
path="/contact-us"
element={<ContactUs />}
/>

</Route>



<Route
path="/account"
element={<AccountPage />}
/>


<Route
path="/shop"
element={<Shop />}
/>


</Routes>
</>
);

}