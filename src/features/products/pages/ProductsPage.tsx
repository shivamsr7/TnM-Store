import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import type { ProductTableItem } from "../components/ProductTable";
import ProductBulkActions from "../components/ProductBulkActions";
import ProductFilters from "../components/ProductFilters";
import DeleteDialog from "@/shared/components/dialogs/DeleteDialog";
import { productService } from "../services/product.service";

export default function ProductsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");

  const [products, setProducts] = useState<ProductTableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
// Delete Product State
const [deleteId, setDeleteId] = useState<string | null>(null);
const [deleteName, setDeleteName] = useState("");
const [isDeleting, setIsDeleting] = useState(false);
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await productService.getAll();

      const mappedProducts: ProductTableItem[] = (data ?? []).map(
        (product: any) => ({
          id: product.id,

          name: product.name,

          sku: product.sku ?? "-",

          image:
            product.product_images?.find(
              (img: any) => img.is_primary
            )?.image_url ??
            product.product_images?.[0]?.image_url ??
            "",

          category: product.categories?.name ?? "-",

          brand: product.brands?.name ?? "-",

          price: product.price,

          stock: product.stock,

          status:
            product.stock <= 0
              ? "out_of_stock"
              : product.status,
        })
      );

      setProducts(mappedProducts);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      filtered = filtered.filter((product) => {
        return (
          product.name.toLowerCase().includes(keyword) ||
          product.sku.toLowerCase().includes(keyword) ||
          (product.category ?? "")
            .toLowerCase()
            .includes(keyword) ||
          (product.brand ?? "")
            .toLowerCase()
            .includes(keyword)
        );
      });
    }

    if (category !== "all") {
      filtered = filtered.filter(
        (p) => p.category === category
      );
    }

    if (brand !== "all") {
      filtered = filtered.filter(
        (p) => p.brand === brand
      );
    }

    if (status !== "all") {
      filtered = filtered.filter(
        (p) => p.status === status
      );
    }

    switch (sort) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;

      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;

      case "stock":
        filtered.sort((a, b) => b.stock - a.stock);
        break;

      case "oldest":
        filtered.reverse();
        break;

      default:
        break;
    }

    return filtered;
  }, [
    products,
    search,
    category,
    brand,
    status,
    sort,
  ]);

 const handleRefresh = async () => {
  await loadProducts();
};

  const handleView = (id: string) => {
    console.log("View", id);
  };

  const handleEdit = (id: string) => {
    navigate(`/products/${id}/edit`);
  };

  const handleDelete = (id: string) => {
  const product = products.find((p) => p.id === id);

  if (!product) return;

  setDeleteId(id);
  setDeleteName(product.name);
};
const confirmDelete = async () => {
  if (!deleteId) return;

  try {
    setIsDeleting(true);

    await productService.delete(deleteId);

    toast.success("Product deleted successfully.");

    await loadProducts();

    setDeleteId(null);
    setDeleteName("");
  } catch (error) {
    console.error(error);

    toast.error("Failed to delete product.");
  } finally {
    setIsDeleting(false);
  }
};
  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <p className="text-gray-500">
          Loading products...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-12 text-center">
        <h2 className="font-semibold text-red-600">
          {error}
        </h2>
      </div>
    );
  }
    return (
    <div className="space-y-6">
      <ProductToolbar
        search={search}
        onSearchChange={setSearch}
        onRefresh={handleRefresh}
        onAddProduct={() => navigate("/products/add")}
        totalProducts={filteredProducts.length}
      />

      <ProductFilters
        category={category}
        brand={brand}
        status={status}
        sort={sort}
        onCategoryChange={setCategory}
        onBrandChange={setBrand}
        onStatusChange={setStatus}
        onSortChange={setSort}
      />

      <ProductBulkActions
        selectedCount={selectedProducts.length}
        onPublish={() => console.log("Publish")}
        onDraft={() => console.log("Draft")}
        onDelete={() => console.log("Bulk Delete")}
        onClear={() => setSelectedProducts([])}
      />

      <ProductTable
        products={filteredProducts}
        selectedProducts={selectedProducts}
        onSelectionChange={setSelectedProducts}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <DeleteDialog
  open={deleteId !== null}
 onOpenChange={(open: boolean) => {
  if (!open) {
    setDeleteId(null);
    setDeleteName("");
  }
}}
  title="Delete Product"
  description={`Are you sure you want to delete "${deleteName}"? This action cannot be undone.`}
  onConfirm={confirmDelete}
  isLoading={isDeleting}
/>
    </div>
  );
}