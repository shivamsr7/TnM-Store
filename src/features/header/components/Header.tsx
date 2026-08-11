import {
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";


import AnnouncementBar
  from "@/features/home/components/AnnouncementBar/AnnouncementBar";


import TopSection
  from "./TopSection";

import Navigation
  from "./Navigation";

import MobileHeader
  from "./MobileHeader";

import MobileDrawer
  from "./MobileDrawer";

import MobileNavigation
  from "./MobileNavigation";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useWishlist,
} from "@/features/wishlist/hooks/useWishlist";


export default function Header() {


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    search,
    setSearch,
  ] = useState("");


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


  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer,
    logout,
  } = useAuth();


  /*
   * =========================================================
   * WISHLIST
   * =========================================================
   */

  const {
    data: wishlist = [],
  } = useWishlist();


  const wishlistCount =
    wishlist.length;


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const handleSearch = () => {

    console.log(
      "Searching:",
      search
    );

  };


  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   *
   * IMPORTANT:
   *
   * After logout we must leave /account.
   *
   * Otherwise AccountPage remains visible with an empty
   * customer state.
   *
   * =========================================================
   */

  const handleLogout = async () => {

    try {

      await logout();

    } finally {

      /*
       * Close the drawer first.
       */

      setMobileOpen(
        false
      );


      /*
       * Redirect to homepage.
       */

      navigate(
        "/"
      );

    }

  };


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <header
      className="
        sticky
        top-0
        z-50
        bg-black
      "
    >


      {/* =====================================================
          ANNOUNCEMENT BAR
      ====================================================== */}

      <AnnouncementBar />


      {/* =====================================================
          DESKTOP HEADER
      ====================================================== */}

      <div
        className="
          hidden
          lg:block
        "
      >

        <TopSection

          search={
            search
          }

          onSearchChange={
            setSearch
          }

          onSearch={
            handleSearch
          }

          wishlistCount={
            wishlistCount
          }

          cartCount={
            0
          }

        />


        <Navigation />

      </div>


      {/* =====================================================
          MOBILE HEADER
      ====================================================== */}

      <div
        className="
          lg:hidden
        "
      >

        <MobileHeader

          onMenuOpen={() =>
            setMobileOpen(
              true
            )
          }

          search={
            search
          }

          onSearchChange={
            setSearch
          }

          onSearch={
            handleSearch
          }

          wishlistCount={
            wishlistCount
          }

        />


        {/* =================================================
            MOBILE DRAWER
        ================================================== */}

        <MobileDrawer

          open={
            mobileOpen
          }

          onClose={() =>
            setMobileOpen(
              false
            )
          }

        >

          <MobileNavigation

            onClose={() =>
              setMobileOpen(
                false
              )
            }

            customer={
              customer
            }

            onLogout={
              handleLogout
            }

          />

        </MobileDrawer>

      </div>

    </header>

  );

}