import {
  Outlet,
} from "react-router-dom";


import Header
  from "@/features/header/components/Header";


import Footer
  from "@/shared/components/footer/Footer";


import ScrollToTopButton
  from "@/shared/components/ScrollToTopButton";


import CartDrawer
  from "@/features/cart/components/CartDrawer";


import MobileBottomNav
  from "@/features/header/components/MobileBottomNav";


export default function MainLayout() {

  return (

    <>

      {/* =====================================================
          CART DRAWER
      ====================================================== */}

      <CartDrawer />


      {/* =====================================================
          HEADER
      ====================================================== */}

      <Header />


      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className="
          pb-20
          lg:pb-0
        "
      >

        <Outlet />

        <Footer />

      </div>


      {/* =====================================================
          SCROLL TO TOP
      ====================================================== */}

      <ScrollToTopButton />


      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ====================================================== */}

      <MobileBottomNav />

    </>

  );

}