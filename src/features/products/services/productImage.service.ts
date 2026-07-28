import { supabase } from "@/lib/supabase";
import type { ProductImage } from "@/shared/components/media/MediaUploader";

const TABLE = "product_images";

export const productImageService = {
  async save(
    productId: string,
    imageUrl: string,
    storagePath = "",
    sortOrder = 0,
    isPrimary = false
  ) {
    const { error } = await supabase
      .from(TABLE)
      .insert({
        product_id: productId,
        image_url: imageUrl,
        storage_path: storagePath,
        sort_order: sortOrder,
        is_primary: isPrimary,
      });

    if (error) throw error;
  },

  async saveMany(
    productId: string,
    images: ProductImage[]
  ) {
    if (!images.length) return;

    const payload = images.map((image) => ({
      product_id: productId,
      image_url: image.url,
      storage_path: image.path ?? "",
      sort_order: image.sortOrder,
      is_primary: image.isCover,
    }));

    const { error } = await supabase
      .from(TABLE)
      .insert(payload);

    if (error) throw error;
  },

  async getByProduct(productId: string) {
    const { data, error } = await supabase
      .from(TABLE)
      .select("*")
      .eq("product_id", productId)
      .order("sort_order", {
        ascending: true,
      });

    if (error) throw error;

    return data;
  },

  async updateOrder(
    id: string,
    sortOrder: number
  ) {
    const { error } = await supabase
      .from(TABLE)
      .update({
        sort_order: sortOrder,
      })
      .eq("id", id);

    if (error) throw error;
  },

  async setPrimary(
    productId: string,
    imageId: string
  ) {
    const { error: resetError } = await supabase
      .from(TABLE)
      .update({
        is_primary: false,
      })
      .eq("product_id", productId);

    if (resetError) throw resetError;

    const { error } = await supabase
      .from(TABLE)
      .update({
        is_primary: true,
      })
      .eq("id", imageId);

    if (error) throw error;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  async deleteByProduct(productId: string) {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("product_id", productId);

    if (error) throw error;
  },
};