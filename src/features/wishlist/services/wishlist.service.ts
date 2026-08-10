import {
  supabase,
} from "@/shared/lib/supabase";

import type {
  WishlistWithProduct,
} from "../types/wishlist.types";


export const wishlistService = {

  /*
   * =========================================================
   * Get Customer Wishlist
   * =========================================================
   */

  async getWishlist(
    customerId: string
  ): Promise<WishlistWithProduct[]> {

    const {
      data,
      error,
    } = await supabase

      .from("wishlists")

      .select(`
        id,
        customer_id,
        product_id,
        created_at,

        products (
          id,
          name,
          slug,
          sku,
          short_description,
          price,
          compare_price,
          stock,
          track_inventory,
          allow_backorders,
          status,
          featured,
          rating,
          review_count,
          sales_count,
          best_seller,
          new_arrival,
          trending,
          editors_pick,

          product_images (
            image_url,
            is_primary,
            sort_order
          )
        )
      `)

      .eq(
        "customer_id",
        customerId
      )

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


    if (error) {
      throw error;
    }


    const wishlist: WishlistWithProduct[] = [];


    for (const item of data ?? []) {

      const product =
        Array.isArray(item.products)
          ? item.products[0]
          : item.products;


      /*
       * Ignore wishlist records whose
       * product no longer exists.
       */

      if (!product) {
        continue;
      }


      wishlist.push({

        id:
          item.id,

        customer_id:
          item.customer_id,

        product_id:
          item.product_id,

        created_at:
          item.created_at,

        products:
          product,

      });

    }


    return wishlist;

  },


  /*
   * =========================================================
   * Add Product
   * =========================================================
   */

  async add(
    customerId: string,
    productId: string
  ) {

    const {
      data,
      error,
    } = await supabase

      .from("wishlists")

      .insert({
        customer_id:
          customerId,

        product_id:
          productId,
      })

      .select()

      .single();


    if (error) {
      throw error;
    }


    return data;

  },


  /*
   * =========================================================
   * Remove Product
   * =========================================================
   */

  async remove(
    customerId: string,
    productId: string
  ) {

    const {
      error,
    } = await supabase

      .from("wishlists")

      .delete()

      .eq(
        "customer_id",
        customerId
      )

      .eq(
        "product_id",
        productId
      );


    if (error) {
      throw error;
    }

  },


  /*
   * =========================================================
   * Check Wishlist Status
   * =========================================================
   */

  async isWishlisted(
    customerId: string,
    productId: string
  ): Promise<boolean> {

    const {
      data,
      error,
    } = await supabase

      .from("wishlists")

      .select("id")

      .eq(
        "customer_id",
        customerId
      )

      .eq(
        "product_id",
        productId
      )

      .maybeSingle();


    if (error) {
      throw error;
    }


    return Boolean(data);

  },

};