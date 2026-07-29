import {
  Routes,
  Route,
} from "react-router-dom";


import App from "@/App";
import ScrollToTop from "@/shared/components/ScrollToTop";
import AccountPage from "@/features/customers/pages/AccountPage";
import AboutUs from "@/pages/static/AboutUs";
import ContactUs from "@/pages/static/ContactUs";
import MainLayout from "@/layouts/MainLayout";
import FAQ from "@/pages/static/FAQ";
import JewelleryCare from "@/pages/static/JewelleryCare";
import ShippingDelivery from "@/pages/static/ShippingDelivery";
import ReturnsExchange from "@/pages/static/ReturnsExchange";
import PrivacyPolicy from "@/pages/static/PrivacyPolicy";
import TermsConditions from "@/pages/static/TermsConditions";
import Shop from "@/features/shop/pages/Shop";
import ProductDetails from "@/features/shop/pages/ProductDetails";
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
<Route 
path="/faq" 
element={<FAQ />} 
/>
<Route
path="/jewellery-care"
element={<JewelleryCare />}
/>
<Route 
path="/shipping" 
element={<ShippingDelivery />}
/>
<Route
path="/returns"
element={<ReturnsExchange />}
/>
<Route
path="/privacy-policy"
element={<PrivacyPolicy />}
/>
<Route
path="/terms"
element={<TermsConditions />}
/>
<Route
path="/shop"
element={<Shop />}
/>
<Route

path="/product/:slug"

element={<ProductDetails />}

/>
</Route>



<Route
path="/account"
element={<AccountPage />}
/>





</Routes>
</>
);

}