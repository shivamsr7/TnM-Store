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


export default function Header() {


  /*
   * =========================================================
   * State
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
   * Auth
   * =========================================================
   */

  const {
    customer,
    logout,
  } = useAuth();


  /*
   * =========================================================
   * Wishlist
   * =========================================================
   *
   * We use the SAME wishlist query used by Wishlist.tsx.
   *
   * React Query keeps this data in sync when the wishlist
   * mutation invalidates/refetches the wishlist query.
   *
   * =========================================================
   */

  const {
    data: wishlist = [],
  } = useWishlist();


  const wishlistCount =
    wishlist.length;


  /*
   * =========================================================
   * Search
   * =========================================================
   */

  const handleSearch = () => {

    console.log(
      "Searching:",
      search
    );

    // Later:
    // navigate(`/shop?search=${search}`);

  };


  /*
   * =========================================================
   * Header
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
          Announcement Bar
      ==================================================== */}

      <AnnouncementBar />


      {/* ===================================================
          Desktop Header
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
          Mobile Header
      ==================================================== */}

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
            Mobile Drawer
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
              logout
            }

          />

        </MobileDrawer>

      </div>

    </header>

  );
}