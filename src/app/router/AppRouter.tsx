import {
  Routes,
  Route,
} from "react-router-dom";


import App
  from "@/App";

import CollaboratePage
  from "@/features/collaborators/pages/CollaboratePage";
import ScrollToTop
  from "@/shared/components/ScrollToTop";
import PageTransitionLoader
  from "@/shared/components/PageTransitionLoader";
import WalletPage
  from "@/features/customers/pages/WalletPage";

import AccountPage
  from "@/features/customers/pages/AccountPage";


import AboutUs
  from "@/pages/static/AboutUs";

import ContactUs
  from "@/features/contact/pages/ContactUs";

import FAQ
  from "@/pages/static/FAQ";

import JewelleryCare
  from "@/pages/static/JewelleryCare";

import ShippingDelivery
  from "@/pages/static/ShippingDelivery";

import ReturnsExchange
  from "@/pages/static/ReturnsExchange";

import PrivacyPolicy
  from "@/pages/static/PrivacyPolicy";

import TermsConditions
  from "@/pages/static/TermsConditions";


import MainLayout
  from "@/layouts/MainLayout";


import Shop
  from "@/features/shop/pages/Shop";

import ProductDetails
  from "@/features/shop/pages/ProductDetails";


import MyOrders
  from "@/features/orders/components/MyOrders";

import OrderDetails
  from "@/features/orders/components/OrderDetails";


import NotificationsPage
  from "@/features/notifications/pages/NotificationsPage";
import PlayEarnPage
  from "@/features/playEarn/pages/PlayEarnPage";

import Wishlist
  from "@/features/wishlist/pages/Wishlist";
import OrderTrackingPage from "@/features/orders/pages/OrderTrackingPage";

import ReviewProductPage
  from "@/features/reviews/pages/ReviewProductPage";

import ReviewEarnPage
  from "@/features/reviews/pages/ReviewEarnPage";

  import ThreeNumbersGame
  from "@/features/playEarn/components/ThreeNumbersGame";

  import MemberOnlyRoute
  from "@/features/Auth/components/MemberOnlyRoute";

import MomentPage
  from "@/features/moments/pages/MomentPage";

  import MomentTestCreator from "@/features/moments/pages/MomentTestCreator";

export default function AppRouter() {

  return (

    <>

      <ScrollToTop />
      <PageTransitionLoader />


      <Routes>


        {/* ===================================================
            MAIN WEBSITE LAYOUT
        ==================================================== */}

        <Route
          element={
            <MainLayout />
          }
        >


          {/* =================================================
              HOME
          ================================================== */}

          <Route
            path="/"
            element={
              <App />
            }
          />


          {/* =================================================
              STATIC PAGES
          ================================================== */}

          <Route
            path="/about-us"
            element={
              <AboutUs />
            }
          />


          <Route
            path="/contact-us"
            element={
              <ContactUs />
            }
          />


          <Route
            path="/faq"
            element={
              <FAQ />
            }
          />


          <Route
            path="/jewellery-care"
            element={
              <JewelleryCare />
            }
          />


          <Route
            path="/shipping"
            element={
              <ShippingDelivery />
            }
          />


          <Route
            path="/returns"
            element={
              <ReturnsExchange />
            }
          />


          <Route
            path="/privacy-policy"
            element={
              <PrivacyPolicy />
            }
          />


          <Route
            path="/terms"
            element={
              <TermsConditions />
            }
          />

<Route
  path="/collaborate"
  element={
    <CollaboratePage />
  }
/>
          {/* =================================================
              WISHLIST
          ================================================== */}

          <Route
            path="/wishlist"
            element={
              <Wishlist />
            }
          />


          {/* =================================================
              SHOP
          ================================================== */}

          <Route
            path="/shop"
            element={
              <Shop />
            }
          />


          {/* =================================================
              PRODUCT
          ================================================== */}

          <Route
            path="/product/:slug"
            element={
              <ProductDetails />
            }
          />


          {/* =================================================
              ACCOUNT
          ================================================== */}

          <Route
            path="/account"
            element={
              <AccountPage />
            }
          />
<Route
  path="/account/wallet"
  element={
    <WalletPage />
  }
/>
{/* =================================================
    PLAY & EARN
================================================== */}

<Route
  path="/play-and-earn"
  element={
    <MemberOnlyRoute>
      <PlayEarnPage />
    </MemberOnlyRoute>
  }
/>

<Route
  path="/play-and-earn/three-numbers"
  element={
    <MemberOnlyRoute>
      <ThreeNumbersGame />
    </MemberOnlyRoute>
  }
/>
          {/* =================================================
              ORDERS
          ================================================== */}

          <Route
            path="/account/orders"
            element={
              <MyOrders />
            }
          />


          <Route
            path="/account/orders/:id"
            element={
              <OrderDetails />
            }
          />

<Route
  path="/review/:productSlug"
  element={
    <ReviewProductPage />
  }
/>

<Route
  path="/account/review-earn"
  element={
    <ReviewEarnPage />
  }
/>
          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          <Route
            path="/account/notifications"
            element={
              <NotificationsPage />
            }
          />

        </Route>

        {/* =================================================
            PRIVATE T&M MOMENT
        ================================================== */}

        <Route
          path="/moments/:token"
          element={
            <MomentPage />
          }
        />
        <Route
  path="/moment-test"
  element={<MomentTestCreator />}
/>
<Route
  path="/track-order"
  element={<OrderTrackingPage />}
/>
      </Routes>

    </>

  );

}