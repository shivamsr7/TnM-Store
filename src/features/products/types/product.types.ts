export type ProductStatus =
  | "draft"
  | "active"
  | "hidden"
  | "archived"
  | "out_of_stock";

export interface Product {
  id: string;

  name: string;
  slug: string;

  sku: string | null;
  barcode: string | null;

  short_description: string | null;
  description: string | null;
  care_instructions: string | null;

  category_id: string;
  subcategory_id: string | null;
  brand_id: string | null;

  cost_price: number | null;
  price: number;
  compare_price: number | null;

  stock: number;
  low_stock_threshold: number;

  track_inventory: boolean;
  allow_backorders: boolean;

  status: ProductStatus;

  featured: boolean;
  best_seller: boolean;
  new_arrival: boolean;
  trending: boolean;
  editors_pick: boolean;

  rating: number;
  review_count: number;

  sales_count: number;
  wishlist_count: number;
  view_count: number;

  weight: number | null;
  length: number | null;
  width: number | null;
  height: number | null;

  seo_title: string | null;
  seo_description: string | null;
  meta_keywords: string | null;

  published_at: string | null;

  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  slug: string;

  short_description?: string;
  description?: string;
  care_instructions?: string;

  category_id: string;
subcategory_id: string | null;
  brand_id?: string | null;

  cost_price?: number | null;
  price: number;
  compare_price?: number | null;

  sku?: string;
  barcode?: string;

  stock?: number;
  low_stock_threshold?: number;

  track_inventory?: boolean;
  allow_backorders?: boolean;

  status?: ProductStatus;

  featured?: boolean;
  best_seller?: boolean;
  new_arrival?: boolean;
  trending?: boolean;
  editors_pick?: boolean;

  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;

  /**
   * These are used by the form only.
   * They are NOT inserted into the products table.
   */
  collection_ids?: string[];
  tag_ids?: string[];
}