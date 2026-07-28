import ProductActionsMenu from "./ProductActionsMenu";
import ProductStatusBadge from "./ProductStatusBadge";

export interface ProductTableItem {
  id: string;

  name: string;

  sku: string;

  image?: string;

  category?: string;

  brand?: string;

  price: number;

  stock: number;

  status:
    | "active"
    | "draft"
    | "hidden"
    | "archived"
    | "out_of_stock";
}

interface ProductTableProps {
  products: ProductTableItem[];

  selectedProducts: string[];
  onSelectionChange: (ids: string[]) => void;

  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ProductTable({
  products,
  selectedProducts,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
}: ProductTableProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border bg-white py-16 text-center">
        <h3 className="text-lg font-semibold">
          No products found
        </h3>

        <p className="mt-2 text-gray-500">
          Start by creating your first product.
        </p>
      </div>
    );
  }

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map((product) => product.id));
    }
  };

  const handleSelectProduct = (id: string) => {
    if (selectedProducts.includes(id)) {
      onSelectionChange(
        selectedProducts.filter((productId) => productId !== id)
      );
    } else {
      onSelectionChange([...selectedProducts, id]);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-gray-50">
            <tr className="border-b">
              <th className="w-12 px-4">
                <input
                  type="checkbox"
                  checked={
                    products.length > 0 &&
                    selectedProducts.length === products.length
                  }
                  onChange={handleSelectAll}
                />
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Product
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                SKU
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Category
              </th>

              <th className="px-5 py-4 text-left text-sm font-semibold">
                Brand
              </th>

              <th className="px-5 py-4 text-right text-sm font-semibold">
                Price
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                Stock
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                Status
              </th>

              <th className="px-5 py-4 text-center text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b last:border-0 hover:bg-gray-50"
              >
                <td className="px-4">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                </td>

                <td className="min-w-[300px] px-6 py-4">
  <div className="flex items-center gap-4">
    <img
  src={product.image || "https://placehold.co/100x100"}
  alt={product.name}
  className="h-14 w-14 flex-shrink-0 rounded-xl border bg-gray-100 object-cover"
/>

    <div className="min-w-0">
      <h3 className="truncate text-sm font-semibold text-gray-900">
        {product.name}
      </h3>

      <p className="mt-1 text-xs text-gray-500">
        ID: {product.id}
      </p>
    </div>
  </div>
</td>

                <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-700">
  {product.sku}
</td>

<td className="whitespace-nowrap px-6 py-4 text-sm">
  {product.category || "-"}
</td>

<td className="whitespace-nowrap px-6 py-4 text-sm">
  {product.brand || "-"}
</td>

<td className="whitespace-nowrap px-6 py-4 text-right font-semibold">
  ₹{product.price.toLocaleString()}
</td>

<td className="px-6 py-4 text-center">
  <span
    className={`rounded-md px-3 py-1 text-sm font-medium ${
      product.stock <= 0
        ? "bg-red-100 text-red-700"
        : product.stock <= 5
        ? "bg-yellow-100 text-yellow-700"
        : "bg-green-100 text-green-700"
    }`}
  >
    {product.stock}
  </span>
</td>

                <td className="px-5 py-4 text-center">
                  <ProductStatusBadge
                    status={product.status}
                  />
                </td>

                <td className="px-5 py-4">
                  <ProductActionsMenu
  productId={product.id}
  onView={onView}
  onEdit={onEdit}
  onDelete={onDelete}
/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}