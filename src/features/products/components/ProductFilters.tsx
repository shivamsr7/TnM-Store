import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductFiltersProps {
  category: string;
  brand: string;
  status: string;
  sort: string;

  onCategoryChange: (value: string) => void;
  onBrandChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function ProductFilters({
  category,
  brand,
  status,
  sort,
  onCategoryChange,
  onBrandChange,
  onStatusChange,
  onSortChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">

      <Select
        value={category}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Category" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Ring">Ring</SelectItem>
          <SelectItem value="Pendant">Pendant</SelectItem>
          <SelectItem value="Earrings">Earrings</SelectItem>
          <SelectItem value="Bracelet">Bracelet</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={brand}
        onValueChange={onBrandChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Brand" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">
            All Brands
          </SelectItem>

          <SelectItem value="T&M Jewels">
            T&M Jewels
          </SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={status}
        onValueChange={onStatusChange}
      >
        <SelectTrigger className="w-[170px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="archived">Archived</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={sort}
        onValueChange={onSortChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="newest">
            Newest
          </SelectItem>

          <SelectItem value="oldest">
            Oldest
          </SelectItem>

          <SelectItem value="price-low">
            Price Low → High
          </SelectItem>

          <SelectItem value="price-high">
            Price High → Low
          </SelectItem>

          <SelectItem value="stock">
            Stock
          </SelectItem>
        </SelectContent>
      </Select>

    </div>
  );
}