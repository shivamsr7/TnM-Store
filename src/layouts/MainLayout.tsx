import { Outlet } from "react-router-dom";

import Header from "@/features/header/components/Header";
import Footer from "@/shared/components/footer/Footer";
import ScrollToTopButton from "@/shared/components/ScrollToTopButton";

export default function MainLayout(){

return (

<>

<Header />

<Outlet />

<Footer />

<ScrollToTopButton />

</>

);

}