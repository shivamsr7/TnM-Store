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

import PageTransition
  from "@/shared/components/animations/PageTransition";

import WhatsAppSupportChat
  from "@/features/Support/components/WhatsAppSupportChat";

import {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import ProfileCompletionModal, {
  shouldShowProfileCompletionPrompt,
} from "@/features/profile/components/ProfileCompletionModal";


export default function MainLayout() {

  const {
    customer,
    loading: authLoading,
  } = useAuth();

  const [
    profilePromptOpen,
    setProfilePromptOpen,
  ] = useState(false);


  useEffect(() => {

    if (
      authLoading ||
      !customer
    ) {
      setProfilePromptOpen(false);
      return;
    }


    /*
     * This runs whenever a customer becomes available, so it
     * covers both fresh login and an already-authenticated
     * customer whose persisted session was restored on page load.
     *
     * The customer should first see the page normally.
     * Only after authentication/customer loading has completed
     * do we wait 2.5 seconds before showing the reminder.
     */
    const timer = window.setTimeout(() => {

      if (
        shouldShowProfileCompletionPrompt(
          customer
        )
      ) {
        setProfilePromptOpen(true);
      }

    }, 2500);


    return () => {
      window.clearTimeout(timer);
    };

  }, [
    customer,
    authLoading,
  ]);


  return (

    <>

      {/* =====================================================
          PROFILE COMPLETION REMINDER
      ====================================================== */}

      <ProfileCompletionModal
        open={profilePromptOpen}
        onClose={() =>
          setProfilePromptOpen(false)
        }
      />


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

        <PageTransition>

          <Outlet />

        </PageTransition>


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


      {/* =====================================================
          WHATSAPP SUPPORT
      ====================================================== */}

      <WhatsAppSupportChat />

    </>

  );

}
