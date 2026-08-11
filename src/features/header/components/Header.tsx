import {
  useState,
} from "react";

import AnnouncementBar from "@/features/home/components/AnnouncementBar/AnnouncementBar";

import TopSection from "./TopSection";
import Navigation from "./Navigation";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import MobileNavigation from "./MobileNavigation";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useWishlist,
} from "@/features/wishlist/hooks/useWishlist";


interface HeaderProps {

  mobileOpen: boolean;

  onMobileMenuOpen: () => void;

  onMobileMenuClose: () => void;

}


export default function Header({

  mobileOpen,

  onMobileMenuOpen,

  onMobileMenuClose,

}: HeaderProps) {


  /*
   * =========================================================
   * SEARCH
   * =========================================================
   */

  const [
    search,
    setSearch,
  ] = useState("");


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

      {/* ===================================================
          ANNOUNCEMENT BAR
      ==================================================== */}

      <AnnouncementBar />


      {/* ===================================================
          DESKTOP HEADER
      ==================================================== */}

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


      {/* ===================================================
          MOBILE HEADER
      ==================================================== */}

      <div
        className="
          lg:hidden
        "
      >

        <MobileHeader

          onMenuOpen={
            onMobileMenuOpen
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

          onClose={
            onMobileMenuClose
          }

        >

          <MobileNavigation

            onClose={
              onMobileMenuClose
            }

            customer={
              customer
            }

            onLogout={
              logout
            }

          />

        </MobileDrawer>

      </div>

    </header>

  );

}