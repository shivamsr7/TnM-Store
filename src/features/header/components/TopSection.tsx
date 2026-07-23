import Logo from "./logo";
import SearchBar from "./SearchBar";
import HeaderIcons from "./HeaderIcons";

interface TopSectionProps {
  wishlistCount?: number;
  cartCount?: number;

  search?: string;
  onSearchChange?: (value: string) => void;
  onSearch?: () => void;
}

export default function TopSection({
  wishlistCount = 0,
  cartCount = 0,
  search = "",
  onSearchChange,
  onSearch,
}: TopSectionProps) {
  return (
    <div className="border-b border-neutral-800 bg-black">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 md:h-24 md:px-6 lg:gap-8 lg:px-8">
        {/* Logo */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* Search */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar
            value={search}
            onChange={onSearchChange}
            onSearch={onSearch}
          />
        </div>

        {/* Icons */}
        <div className="shrink-0">
          <HeaderIcons
            wishlistCount={wishlistCount}
            cartCount={cartCount}
          />
        </div>
      </div>

      {/* Mobile Search */}
      <div className="border-t border-neutral-800 bg-black px-4 py-4 md:hidden">
        <SearchBar
          value={search}
          onChange={onSearchChange}
          onSearch={onSearch}
        />
      </div>
    </div>
  );
}