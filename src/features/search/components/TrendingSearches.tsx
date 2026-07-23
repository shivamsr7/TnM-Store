import { Flame } from "lucide-react";

interface TrendingSearchesProps {
  searches: string[];
  onSelect: (value: string) => void;
}

export default function TrendingSearches({
  searches,
  onSelect,
}: TrendingSearchesProps) {
  if (!searches.length) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Flame className="h-4 w-4 text-orange-500" />

        <h3 className="text-sm font-semibold text-neutral-800">
          Trending Searches
        </h3>
      </div>

      <div className="space-y-1">
        {searches.map((item) => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-neutral-100"
          >
            <Flame className="h-4 w-4 text-orange-500" />

            <span className="text-sm text-neutral-700">
              {item}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}