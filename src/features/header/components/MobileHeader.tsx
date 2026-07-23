import { Menu, Heart, ShoppingBag } from "lucide-react";
import Logo from "./logo";
import SearchBar from "./SearchBar";

interface MobileHeaderProps {
  onMenuOpen: () => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
  wishlistCount?: number;
  cartCount?: number;
}

export default function MobileHeader({
  onMenuOpen,
  search = "",
  onSearchChange,
  onSearch,
  wishlistCount = 0,
  cartCount = 0,
}: MobileHeaderProps) {
  return (
    <div className="bg-black lg:hidden">

      {/* Top Row */}
      <div className="flex h-16 items-center justify-between px-4">

        {/* Menu */}
        <button
          onClick={onMenuOpen}
          className="rounded-md p-2 text-white transition hover:bg-neutral-800"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <div className="flex justify-center">
          <Logo />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-1">

          <button className="relative rounded-md p-2 text-white hover:bg-neutral-800">
            <Heart size={22} />

            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8A44D] text-[10px] font-semibold text-black">
                {wishlistCount}
              </span>
            )}
          </button>

          <button className="relative rounded-md p-2 text-white hover:bg-neutral-800">
            <ShoppingBag size={22} />

            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#C8A44D] text-[10px] font-semibold text-black">
                {cartCount}
              </span>
            )}
          </button>

        </div>

      </div>

      {/* Search */}
      <div className="px-4 pb-4">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
      </div>

    </div>
  );
}