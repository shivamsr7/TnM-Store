import { Outlet } from "react-router-dom";

import Header from "@/features/header/components/Header";
import Footer from "@/shared/components/footer/Footer";
import ScrollToTopButton from "@/shared/components/ScrollToTopButton";
import CartDrawer from "@/features/cart/components/CartDrawer";
export default function MainLayout(){

return (

<>
<CartDrawer />
<Header />

<Outlet />

<Footer />

<ScrollToTopButton />

</>

);

}