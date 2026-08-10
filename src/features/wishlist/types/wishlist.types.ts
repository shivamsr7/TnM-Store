export interface WishlistItem {
  id: string;
  customer_id: string;
  product_id: string;
  created_at: string;
}


export interface WishlistProductImage {
  image_url: string;
  is_primary: boolean;
  sort_order: number;
}


export interface WishlistProduct {
  id: string;

  name: string;

  slug: string;

  sku?: string | null;

  short_description?: string | null;

  price: number;

  compare_price: number | null;

  stock: number;

  track_inventory?: boolean;

  allow_backorders?: boolean;

  status: string;

  featured?: boolean;

  rating: number;

  review_count: number;

  sales_count?: number;

  best_seller?: boolean;

  new_arrival?: boolean;

  trending?: boolean;

  editors_pick?: boolean;

  product_images?: WishlistProductImage[];
}


export interface WishlistWithProduct
  extends WishlistItem {
  products: WishlistProduct;
}