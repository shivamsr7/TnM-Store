export interface Category {
  id: string;

  name: string;

  slug: string;

  parent_id: string | null;

  description: string | null;

  image_url: string | null;

  sort_order: number;

  is_active: boolean;

  created_at: string;

  updated_at: string;

  meta_title?: string | null;

  meta_description?: string | null;
}