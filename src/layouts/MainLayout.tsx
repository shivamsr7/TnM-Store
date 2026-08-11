import {
  Outlet,
  useNavigate,
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
   */

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navigate =
    useNavigate();


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


  /*
   * =========================================================
   * ACCOUNT NAVIGATION
   * =========================================================
   *
   * IMPORTANT:
   *
   * Account button should navigate to the Account page.
   *
   * It must NOT open MobileDrawer.
   *
   * =========================================================
   */

  function openAccountPage() {

    navigate(
      "/account"
    );

  }


  return (

    <>

      {/* =====================================================
          CART DRAWER
      ====================================================== */}

      <CartDrawer />


      {/* =====================================================
          HEADER
      ====================================================== */}

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


      {/* =====================================================
          MAIN CUSTOMER CONTENT
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

      <MobileBottomNav

        onAccountClick={
          openAccountPage
        }

      />

    </>

  );

}