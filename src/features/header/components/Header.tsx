import { useState } from "react";

import AnnouncementBar from "@/features/home/components/AnnouncementBar/AnnouncementBar";

import TopSection from "./TopSection";
import Navigation from "./Navigation";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";
import MobileNavigation from "./MobileNavigation";


import {
  useAuth
} from "@/features/Auth/context/AuthContext";



export default function Header() {


  const [search, setSearch] = useState("");

  const [mobileOpen, setMobileOpen] = useState(false);



  const {
    customer,
    logout
  } = useAuth();





  const handleSearch = () => {

    console.log(
      "Searching:",
      search
    );

    // Later:
    // navigate(`/shop?search=${search}`);

  };





  return (

    <header className="sticky top-0 z-50 bg-black">


      {/* Announcement Bar */}

      <AnnouncementBar />





      {/* Desktop Header */}

      <div className="hidden lg:block">


        <TopSection

          search={search}

          onSearchChange={setSearch}

          onSearch={handleSearch}

          wishlistCount={0}

          cartCount={0}

        />


        <Navigation />


      </div>







      {/* Mobile Header */}


      <div className="lg:hidden">


        <MobileHeader

          onMenuOpen={() =>
            setMobileOpen(true)
          }

          search={search}

          onSearchChange={setSearch}

          onSearch={handleSearch}

          wishlistCount={0}


        />






        <MobileDrawer

          open={mobileOpen}

          onClose={() =>
            setMobileOpen(false)
          }

        >



          <MobileNavigation

            onClose={() =>
              setMobileOpen(false)
            }

            customer={customer}

            onLogout={logout}

          />



        </MobileDrawer>



      </div>


    </header>

  );

}