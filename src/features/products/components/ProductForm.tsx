import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSubcategories } from "@/features/categories/hooks/useSubcategories";
import BasicInfoSection from "./sections/BasicInfoSection";
import PricingSection from "./sections/PricingSection";
import InventorySection from "./sections/InventorySection";
import OrganizationSection from "./sections/OrganizationSection";
import ImagesSection from "./sections/ImagesSection";
import SeoSection from "./sections/SeoSection";
import StatusSection from "./sections/StatusSection";
import type { ProductImage } from "@/shared/components/media/MediaUploader";
import {
  productSchema,
  type ProductSchema,
} from "../schemas/product.schema";

import { productService } from "../services/product.service";
import { productImageService } from "../services/productImage.service";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { useBrands } from "@/features/brands/hooks/useBrands";
import { useCollections } from "@/features/collections/hooks/useCollections";
import { useTags } from "@/features/tags/hooks/useTags";
import type {
  MediaUploaderHandle,
} from "@/shared/components/media/MediaUploader";

import { useRef } from "react";
interface ProductFormProps {
  mode?: "create" | "edit";
  productId?: string;
}

export default function ProductForm({
  mode = "create",
  productId,
}: ProductFormProps) {
  const navigate = useNavigate();

  const [images, setImages] = useState<ProductImage[]>([]);
  const [saving, setSaving] = useState(false);
const mediaUploaderRef =
  useRef<MediaUploaderHandle>(null);


  const {
    data: categories = [],
    isLoading: loadingCategories,
  } = useCategories();

  const {
    data: brands = [],
    isLoading: loadingBrands,
  } = useBrands();

  const {
    data: collections = [],
    isLoading: loadingCollections,
  } = useCollections();

  const {
    data: tags = [],
    isLoading: loadingTags,
  } = useTags();

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),

    defaultValues: {
      name: "",

      slug: "",

      category_id: "",
subcategory_id: "",
      brand_id: null,

      short_description: "",

      description: "",

      care_instructions: "",

      cost_price: 0,

      price: 0,

      compare_price: 0,

      sku: "",

      barcode: "",

      stock: 0,

      low_stock_threshold: 5,

      track_inventory: true,

      allow_backorders: false,

      status: "draft",

      collection_ids: [],

      tag_ids: [],

      featured: false,

      new_arrival: false,

      best_seller: false,

      trending: false,

      editors_pick: false,

      seo_title: "",

      seo_description: "",

      meta_keywords: "",
    },
  });
const selectedCategory = form.watch("category_id");
useEffect(() => {
  form.setValue("subcategory_id", "");
}, [selectedCategory]);
const {
  data: subcategories = [],
  isLoading: loadingSubcategories,
} = useSubcategories(selectedCategory || undefined);
  const isLoading = useMemo(() => {
    return (
  loadingCategories ||
  loadingBrands ||
  loadingCollections ||
  loadingTags ||
  loadingSubcategories
);
  }, [
    loadingCategories,
    loadingBrands,
    loadingCollections,
    loadingTags,
    loadingSubcategories
  ]);
useEffect(() => {
  if (mode !== "edit" || !productId) return;

  const id = productId;

  async function loadProduct() {
    try {
      const product = await productService.getById(id);

      form.reset({
        ...product,
        collection_ids:
          product.product_collections?.map(
            (item: { collection_id: string }) => item.collection_id
          ) ?? [],
        tag_ids:
          product.product_tags?.map(
            (item: { tag_id: string }) => item.tag_id
          ) ?? [],
      });

      const productImages =
        await productImageService.getByProduct(id);

      setImages(
        productImages.map((image) => ({
          id: image.id,
          url: image.image_url,
          path: image.storage_path ?? "",
          isCover: image.is_primary,
          sortOrder: image.sort_order,
        }))
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to load product.");
    }
  }

  loadProduct();
}, [mode, productId, form]);
async function onSubmit(values: ProductSchema) {
  try {
    setSaving(true);

    const {
      collection_ids = [],
      tag_ids = [],
      ...productData
    } = values;
    const payload = {
  ...productData,
  subcategory_id: productData.subcategory_id || null,
};

if (!payload.sku?.trim()) {
  delete payload.sku;
}

    let product;

if (mode === "create") {
  product = await productService.create(payload);
} else {
  if (!productId) {
    throw new Error("Product ID is missing.");
  }

  product = await productService.update(productId, payload);
}
console.log("Created product:", product);
console.log("Images:", images);
  // Save product images
if (mode === "create") {
  if (images.length > 0) {
    await productImageService.saveMany(
      product.id,
      images
    );
  }
} else {
  await productImageService.deleteByProduct(
    product.id
  );

  if (images.length > 0) {
    await productImageService.saveMany(
      product.id,
      images
    );
  }
}

   if (mode === "create") {
  if (collection_ids.length > 0) {
    await productService.createProductCollections(
      product.id,
      collection_ids
    );
  }

  if (tag_ids.length > 0) {
    await productService.createProductTags(
      product.id,
      tag_ids
    );
  }
} else {
  await productService.replaceProductCollections(
    product.id,
    collection_ids
  );

  await productService.replaceProductTags(
    product.id,
    tag_ids
  );
}

toast.success(
  mode === "create"
    ? "Product created successfully."
    : "Product updated successfully."
);
// Tell MediaUploader these files are now permanent
mediaUploaderRef.current?.markAsSaved();
// Reset form
form.reset();

// Clear uploaded images
setImages([]);

// Go back to Products page
navigate("/products");
  } catch (error) {
  console.error("Product creation failed:", error);

  toast.error(
    error instanceof Error
      ? error.message
      : "Failed to create product"
  );
}finally {
    setSaving(false);
  }
}

  if (isLoading) {
    return (
      <div className="flex h-80 items-center justify-center">
        Loading...
      </div>
    );
  }
    return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-xl border bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
  {mode === "create" ? "Add Product" : "Edit Product"}
</h1>

<p className="mt-1 text-sm text-muted-foreground">
  {mode === "create"
    ? "Create a new product for your store."
    : "Update your product details."}
</p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Cancel
          </Button>

<Button
  type="submit"
  disabled={saving || isLoading}
>
  {saving
  ? mode === "create"
    ? "Saving Product..."
    : "Updating Product..."
  : mode === "create"
    ? "Save Product"
    : "Update Product"}
</Button>
        </div>
      </div>

      {/* Basic Information */}
      <BasicInfoSection
        form={form}
      />

      {/* Pricing + Inventory */}
      <div className="grid gap-6 xl:grid-cols-2">
        <PricingSection
          form={form}
        />

        <InventorySection
          form={form}
        />
      </div>

      {/* Organization + Status */}
      <div className="grid gap-6 xl:grid-cols-2">
        <OrganizationSection
  form={form}
  categories={categories}
  subcategories={subcategories}
  brands={brands}
  collections={collections}
  tags={tags}
/>

        <StatusSection
          form={form}
        />
      </div>

      {/* Images */}
      <ImagesSection
    images={images}
    setImages={setImages}
    uploaderRef={mediaUploaderRef}
/>

      {/* SEO */}
      <SeoSection
        form={form}
      />

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-20 flex flex-col gap-3 rounded-xl border bg-background/95 p-4 backdrop-blur md:flex-row md:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={saving}
        >
          {saving ? "Saving Product..." : "Save Product"}
        </Button>
      </div>
    </form>
  );
}