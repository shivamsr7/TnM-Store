import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),

  slug: z.string().min(2),

  category_id: z.string().min(1, "Category is required"),

  subcategory_id: z.string().optional(),

  brand_id: z.string().nullable().optional(),

  short_description: z.string().optional(),

  description: z.string().optional(),

  care_instructions: z.string().optional(),

  cost_price: z.number().nullable().optional(),

  price: z.number().min(1, "Price is required"),

  compare_price: z.number().nullable().optional(),

  sku: z.string().optional(),

  barcode: z.string().optional(),

stock: z.number(),

low_stock_threshold: z.number(),

track_inventory: z.boolean(),

allow_backorders: z.boolean(),

status: z.enum([
  "draft",
  "active",
  "hidden",
  "archived",
  "out_of_stock",
]),

trending: z.boolean(),

editors_pick: z.boolean(),

collection_ids: z.array(z.string()),

tag_ids: z.array(z.string()),

featured: z.boolean(),

new_arrival: z.boolean(),

best_seller: z.boolean(),

seo_title: z.string().optional(),

seo_description: z.string().optional(),

meta_keywords: z.string().optional(),
});

export type ProductSchema = z.infer<typeof productSchema>;