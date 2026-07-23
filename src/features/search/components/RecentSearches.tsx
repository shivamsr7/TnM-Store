import { Clock3, Trash2, X } from "lucide-react";

interface Props {
  searches: string[];
  onSelect: (value: string) => void;
  onRemove: (value: string) => void;
  onClear: () => void;
}

export default function RecentSearches({
  searches,
  onSelect,
  onRemove,
  onClear,
}: Props) {
  if (!searches.length) return null;

  return (
    <div>

      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-800">
          Recent Searches
        </h3>

        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-red-500"
        >
          <Trash2 className="h-3 w-3" />
          Clear
        </button>
      </div>

      <div className="space-y-1">

        {searches.map((item) => (
          <div
            key={item}
            className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-neutral-100"
          >
            <button
              onClick={() => onSelect(item)}
              className="flex flex-1 items-center gap-3 text-left"
            >
              <Clock3 className="h-4 w-4 text-neutral-400" />

              <span className="text-sm">
                {item}
              </span>
            </button>

            <button
              onClick={() => onRemove(item)}
              className="opacity-0 transition group-hover:opacity-100"
            >
              <X className="h-4 w-4 text-neutral-500 hover:text-red-500" />
            </button>
          </div>
        ))}

      </div>
    </div>
  );
}