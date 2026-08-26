import type { Product } from "@/features/products/types/product.types";

export interface ShopCategory {
  id: string;
  name: string;
}

export interface ShopSubcategory {
  id: string;
  name: string;
}

export interface ShopBrand {
  id: string;
  name: string;
}

export interface ShopProductImage {
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface ShopProduct extends Product {
  categories: ShopCategory | null;
  subcategories: ShopSubcategory | null;
  brands: ShopBrand | null;
  product_images: ShopProductImage[];

  /**
   * Product specifications stored in the
   * products.specifications JSONB column.
   *
   * Supports nested objects and arrays.
   */
  specifications?: Record<string, unknown> | null;
}