import {
  Outlet,
} from "react-router-dom";

import Header from "@/features/header/components/Header";

import Footer from "@/shared/components/footer/Footer";

import ScrollToTopButton from "@/shared/components/ScrollToTopButton";

import CartDrawer from "@/features/cart/components/CartDrawer";

import MobileBottomNav from "@/features/header/components/MobileBottomNav";


export default function MainLayout() {

  return (

    <>

      <CartDrawer />

      <Header />


      {/* =================================================
          MAIN CUSTOMER CONTENT
          
          Extra bottom padding is only for mobile so the
          fixed MobileBottomNav does not cover the last
          part of the page.
      ================================================== */}

      <div
        className="
          pb-20
          lg:pb-0
        "
      >

        <Outlet />

        <Footer />

      </div>


      <ScrollToTopButton />


      {/* =================================================
          MOBILE BOTTOM NAVIGATION
          
          Component itself is hidden on desktop using
          lg:hidden.
      ================================================== */}

      <MobileBottomNav />

    </>

  );

}