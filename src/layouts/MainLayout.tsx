import { Outlet } from "react-router-dom";

import Header from "@/features/header/components/Header";
import Footer from "@/shared/components/footer/Footer";


export default function MainLayout(){

return (

<>

<Header />

<Outlet />

<Footer />

</>

);

}