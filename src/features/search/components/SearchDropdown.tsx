import RecentSearches from "./RecentSearches";
import TrendingSearches from "./TrendingSearches";
interface SearchDropdownProps {
  open: boolean;
  query: string;
  recentSearches: string[];

  onSelectRecent: (value: string) => void;
  onRemoveRecent: (value: string) => void;
  onClearRecent: () => void;
}

export default function SearchDropdown({
  open,
  query,
  recentSearches,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
}: SearchDropdownProps) {
  if (!open) return null;
const trendingSearches = [
  "Snake Pendant",
  "Kashmiri Watch",
  "Anti Tarnish Ring",
  "Minimal Necklace",
  "Bracelet",
  "Gold Earrings",
];
  return (
    <div className="absolute left-0 right-0 top-[calc(100%+12px)] z-50 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl">

      <div className="max-h-[420px] overflow-y-auto p-5">

  {!query.trim() && recentSearches.length > 0 && (
    <RecentSearches
      searches={recentSearches}
      onSelect={onSelectRecent}
      onRemove={onRemoveRecent}
      onClear={onClearRecent}
    />
  )}

  {!query.trim() && recentSearches.length === 0 && (
    <TrendingSearches
      searches={trendingSearches}
      onSelect={onSelectRecent}
    />
  )}

  {query.trim() && (
    <div className="py-10 text-center text-sm text-neutral-500">
      Product suggestions will appear here...
    </div>
  )}

</div>

    </div>
  );
}