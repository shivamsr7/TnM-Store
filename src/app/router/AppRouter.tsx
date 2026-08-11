import {
  Routes,
  Route,
} from "react-router-dom";


import App
  from "@/App";


import ScrollToTop
  from "@/shared/components/ScrollToTop";


import AccountPage
  from "@/features/customers/pages/AccountPage";


import AboutUs
  from "@/pages/static/AboutUs";

import ContactUs
  from "@/pages/static/ContactUs";

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


import Wishlist
  from "@/features/wishlist/pages/Wishlist";


export default function AppRouter() {

  return (

    <>

      <ScrollToTop />


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

      </Routes>

    </>

  );

}