import { Plus, RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onAddProduct: () => void;
  onRefresh: () => void;
  totalProducts?: number;
}

export default function ProductToolbar({
  search,
  onSearchChange,
  onAddProduct,
  onRefresh,
  totalProducts = 0,
}: ProductToolbarProps) {
  return (
    <div className="mb-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Products
          </h1>

          <p className="mt-1 text-gray-500">
            Manage all your products
          </p>
        </div>

        <Button
          onClick={onAddProduct}
          className="h-11 px-6"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Toolbar */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search products..."
              className="pl-10"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              {totalProducts} Products
            </span>

            <Button
              variant="outline"
              onClick={onRefresh}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}