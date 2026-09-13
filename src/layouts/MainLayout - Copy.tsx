import {
  Outlet,
  useLocation,
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

import GuestSignupPrompt
  from "@/features/Auth/components/GuestSignupPrompt";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import ProfileCompletionModal, {
  shouldShowProfileCompletionPrompt,
  type BirthdayCouponForModal,
} from "@/features/profile/components/ProfileCompletionModal";

import {
  getOrCreateBirthdayCoupon,
} from "@/features/coupons/services/birthdayCoupon.service";

import {
  notificationService,
} from "@/features/notifications/services/notification.service";

import {
  analyticsService,
} from "@/features/analytics/services/analytics.service";


const BIRTHDAY_PROMPT_KEY =
  "tnm_birthday_coupon_prompt_date";


function getTodayKey() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


export default function MainLayout() {

  const {
    customer,
    loading: authLoading,
  } = useAuth();


  /*
   * =========================================================
   * ROUTER LOCATION
   * =========================================================
   *
   * Used for global website analytics.
   *
   * Every time the user navigates to another route,
   * the analytics service records a page view.
   */

  const location = useLocation();


  const [
    profilePromptOpen,
    setProfilePromptOpen,
  ] = useState(false);


  const [
    birthdayCoupon,
    setBirthdayCoupon,
  ] =
    useState<BirthdayCouponForModal | null>(
      null
    );


  /*
   * =========================================================
   * WEBSITE ANALYTICS
   * =========================================================
   *
   * Records every storefront page navigation.
   *
   * The analytics service handles:
   *
   * - Unique visitor ID
   * - Session ID
   * - Device type
   * - Referrer
   * - Page path
   *
   * This runs automatically for all routes rendered inside
   * MainLayout.
   */

  useEffect(() => {

    const pagePath =
      `${location.pathname}${location.search}`;

    /*
     * Record the page view immediately when the route changes.
     */
    void analyticsService.trackPageView(
      pagePath
    );

    /*
     * =======================================================
     * LIVE VISITOR HEARTBEAT
     * =======================================================
     *
     * The presence table is separate from historical
     * analytics events.
     *
     * A visitor is considered live when the last heartbeat
     * is within 2 minutes. We refresh it every 30 seconds.
     *
     * This also updates automatically whenever the visitor
     * changes route.
     */
    void analyticsService.trackPresence(
      pagePath
    );

    const heartbeat =
      window.setInterval(() => {

        void analyticsService.trackPresence(
          pagePath
        );

      }, 30_000);

    return () => {

      window.clearInterval(
        heartbeat
      );

    };

  }, [
    location.pathname,
    location.search,
  ]);


  /*
   * =========================================================
   * BIRTHDAY COUPON GENERATION GUARD
   * =========================================================
   *
   * Prevents repeated RPC calls while the same customer
   * remains mounted in the application.
   *
   * The database RPC also prevents duplicate birthday
   * coupons for the same customer/year.
   */

  const birthdayCouponAttemptedForCustomer =
    useRef<string | null>(null);


  /*
   * =========================================================
   * PROFILE COMPLETION REMINDER
   * =========================================================
   */

  useEffect(() => {

    if (
      authLoading ||
      !customer
    ) {

      setProfilePromptOpen(false);
      setBirthdayCoupon(null);

      return;

    }


    /*
     * This runs whenever a customer becomes available.
     *
     * It covers:
     *
     * - Fresh login
     * - Existing authenticated session
     * - Persisted session restored on page load
     *
     * The page loads normally first, then the profile
     * completion reminder waits 2.5 seconds.
     */

    const timer =
      window.setTimeout(() => {

        if (
          shouldShowProfileCompletionPrompt(
            customer
          )
        ) {

          setProfilePromptOpen(true);

        }

      }, 2500);


    return () => {

      window.clearTimeout(
        timer
      );

    };

  }, [
    customer,
    authLoading,
  ]);


  /*
   * =========================================================
   * BIRTHDAY COUPON GENERATION
   * =========================================================
   *
   * Once an authenticated customer is available, call the
   * secure Supabase RPC.
   *
   * The database decides whether the customer is eligible.
   *
   * The RPC checks:
   *
   * - authenticated customer
   * - DOB availability
   * - birthday month
   * - birthday reward settings
   * - current birthday year
   * - existing birthday coupon
   *
   * The frontend does not decide eligibility.
   */

  useEffect(() => {

    if (
      authLoading ||
      !customer
    ) {

      setBirthdayCoupon(null);

      return;

    }


    const currentCustomer =
      customer;


    if (
      birthdayCouponAttemptedForCustomer.current ===
      currentCustomer.id
    ) {

      return;

    }


    birthdayCouponAttemptedForCustomer.current =
      currentCustomer.id;


    let cancelled = false;


    async function generateBirthdayCoupon() {

      try {

        const coupon =
          await getOrCreateBirthdayCoupon(
            currentCustomer.id
          );


        if (
          cancelled ||
          !coupon
        ) {

          return;

        }


        /*
         * The birthday popup is only for customers whose
         * profile is already complete. If a profile field is
         * missing, the profile-completion reminder remains
         * the priority.
         */

        const profileComplete =
          !!currentCustomer.email?.trim() &&
          !!currentCustomer.date_of_birth;


        if (!profileComplete) {

          return;

        }


        /*
         * =====================================================
         * DAILY BIRTHDAY EMAIL
         * =====================================================
         *
         * Email delivery is tracked in Supabase.
         *
         * This is intentionally separate from the popup's
         * localStorage key. A customer can therefore switch
         * devices/browsers without receiving a duplicate email.
         */

        if (
          currentCustomer.email?.trim()
        ) {

          void notificationService
            .sendBirthdayCouponEmailOnceDaily({
              customerId:
                currentCustomer.id,

              coupon,

              email:
                currentCustomer.email.trim(),

              customerName:
                [
                  currentCustomer.first_name,
                  currentCustomer.last_name,
                ]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || null,
            })
            .catch((error) => {

              console.error(
                "Birthday coupon email trigger failed:",
                error
              );

            });

        }


        /*
         * A birthday reward is shown at most once per local
         * calendar day. The coupon itself remains safely
         * stored in Supabase and can still be applied from
         * the normal coupon flow.
         */

        if (
          localStorage.getItem(
            BIRTHDAY_PROMPT_KEY
          ) === getTodayKey()
        ) {

          return;

        }


        setBirthdayCoupon(
          coupon as BirthdayCouponForModal
        );


        setProfilePromptOpen(
          true
        );


        localStorage.setItem(
          BIRTHDAY_PROMPT_KEY,
          getTodayKey()
        );

      } catch (error) {

        /*
         * Birthday coupon generation/prompting must never
         * interrupt the normal website experience.
         */

        console.error(
          "Birthday coupon generation failed:",
          error
        );

      }

    }


    void generateBirthdayCoupon();


    return () => {

      cancelled = true;

    };

  }, [
    customer,
    authLoading,
  ]);


  /*
   * =========================================================
   * RESET BIRTHDAY ATTEMPT WHEN CUSTOMER LOGS OUT
   * =========================================================
   *
   * Allows a different customer to trigger their own
   * birthday-coupon generation after logout/login.
   */

  useEffect(() => {

    if (
      !customer
    ) {

      birthdayCouponAttemptedForCustomer.current =
        null;

    }

  }, [
    customer,
  ]);


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      <style>{`
        @keyframes tnmGuestPromptUp {
          from {
            opacity: 0;
            transform: translateY(28px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>


      {/* =====================================================
          PROFILE COMPLETION REMINDER
      ====================================================== */}

      <ProfileCompletionModal
        open={
          profilePromptOpen
        }

        birthdayCoupon={
          birthdayCoupon
        }

        onClose={() => {

          setProfilePromptOpen(
            false
          );

          setBirthdayCoupon(
            null
          );

        }}
      />


      {/* =====================================================
          GUEST SIGN-UP / LOGIN PROMPT
      ====================================================== */}

      <GuestSignupPrompt />


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