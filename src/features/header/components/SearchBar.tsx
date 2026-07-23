import { useEffect, useRef, useState } from "react";
import { Search, Mic } from "lucide-react";
import { useVoiceSearch } from "@/shared/hooks/useVoiceSearch";
import SearchDropdown from "@/features/search/components/SearchDropdown";
import { useRecentSearches } from "@/features/search/hooks/useRecentSearches";

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: () => void;
  placeholder?: string;
}

export default function SearchBar({
  value = "",
  onChange,
  onSearch,
  placeholder = "Search rings, earrings, watches...",
}: SearchBarProps) {
  const { isSupported, isListening, startListening } = useVoiceSearch({
    onResult: (text) => {
  onChange?.(text);

  saveSearch(text);

  setTimeout(() => {
    onSearch?.();
    setDropdownOpen(false);
  }, 300);
},
  });
const [isDropdownOpen, setDropdownOpen] = useState(false);
const searchRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  function handleClickOutside(event: MouseEvent) {
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);
const {
  recentSearches,
  saveSearch,
  removeSearch,
  clearHistory,
} = useRecentSearches();
  return (
    <div
  ref={searchRef}
  className="relative w-full max-w-[620px]"
>
      <div className="group flex h-14 items-center rounded-full border border-transparent bg-[#F8F6F1] px-5 transition-all duration-300 hover:shadow-md focus-within:border-[#C8A44D] focus-within:bg-white focus-within:shadow-lg">
        <input
  type="text"
  value={value}
  onFocus={() => setDropdownOpen(true)}
  onChange={(e) => {
    onChange?.(e.target.value);
    setDropdownOpen(true);
  }}
  onKeyDown={(e) => {
    if (e.key === "Enter") {
      saveSearch(value);
      onSearch?.();
      setDropdownOpen(false);
    }
  }}
  placeholder={placeholder}
  className="flex-1 bg-transparent text-[15px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
/>

        {/* Voice Search */}
        {isSupported && (
          <button
            type="button"
            onClick={startListening}
            aria-label="Voice Search"
            className="ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white hover:text-[#C8A44D]"
          >
            <Mic
              className={`h-5 w-5 transition-all ${
                isListening
                  ? "animate-pulse text-red-500"
                  : "text-neutral-700"
              }`}
            />
          </button>
        )}

        {/* Search */}
        <button
          type="button"
          onClick={() => {
  saveSearch(value);
  onSearch?.();
  setDropdownOpen(false);
}}
          aria-label="Search"
          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-white hover:text-[#C8A44D]"
        >
          <Search className="h-5 w-5 text-neutral-700" />
        </button>
      </div>
      <SearchDropdown
  open={isDropdownOpen}
  query={value}
  recentSearches={recentSearches}
  onSelectRecent={(text) => {
    onChange?.(text);
    saveSearch(text);
    onSearch?.();
    setDropdownOpen(false);
  }}
  onRemoveRecent={removeSearch}
  onClearRecent={clearHistory}
/>
    </div>
    
  );
}