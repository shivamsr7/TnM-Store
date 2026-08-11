import {
  Outlet,
} from "react-router-dom";

import {
  useState,
} from "react";

import Header from "@/features/header/components/Header";

import Footer from "@/shared/components/footer/Footer";

import ScrollToTopButton from "@/shared/components/ScrollToTopButton";

import CartDrawer from "@/features/cart/components/CartDrawer";

import MobileBottomNav from "@/features/header/components/MobileBottomNav";


export default function MainLayout() {


  /*
   * =========================================================
   * MOBILE DRAWER STATE
   * =========================================================
   *
   * Shared by:
   *
   * • Hamburger menu
   * • Bottom Account button
   *
   * Both open the SAME MobileDrawer.
   *
   * =========================================================
   */

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  function openMobileMenu() {

    setMobileOpen(
      true
    );

  }


  function closeMobileMenu() {

    setMobileOpen(
      false
    );

  }


  return (

    <>

      <CartDrawer />


      {/* =================================================
          HEADER
      ================================================== */}

      <Header

        mobileOpen={
          mobileOpen
        }

        onMobileMenuOpen={
          openMobileMenu
        }

        onMobileMenuClose={
          closeMobileMenu
        }

      />


      {/* =================================================
          MAIN CUSTOMER CONTENT
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


      {/* =================================================
          SCROLL TO TOP
      ================================================== */}

      <ScrollToTopButton />


      {/* =================================================
          MOBILE BOTTOM NAVIGATION
      ================================================== */}

      <MobileBottomNav

        onAccountClick={
          openMobileMenu
        }

      />

    </>

  );

}