import { useState } from "react";

import AnnouncementBar from "@/features/home/components/AnnouncementBar/AnnouncementBar";

import TopSection from "./TopSection";
import Navigation from "./Navigation";
import MobileHeader from "./MobileHeader";
import MobileDrawer from "./MobileDrawer";

export default function Header() {
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = () => {
    console.log("Searching:", search);

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
  onMenuOpen={() => setMobileOpen(true)}
  search={search}
  onSearchChange={setSearch}
  onSearch={handleSearch}
  wishlistCount={0}
  cartCount={0}
/>

        <MobileDrawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
        >
          {/* We'll add MobileNavigation here in the next step */}
          <div className="p-6 text-sm text-neutral-500">
            Mobile navigation coming soon...
          </div>
        </MobileDrawer>
      </div>
    </header>
  );
}