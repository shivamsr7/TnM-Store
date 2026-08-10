import { supabase } from "@/shared/lib/supabase";

import {
  productService,
} from "@/features/products/services/product.service";


/*
 * =========================================================
 * TYPES
 * =========================================================
 */

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  subcategories: ShopSubcategory[];
}


export interface ShopSubcategory {
  id: string;
  category_id: string;
  name: string;
  slug: string | null;
  sort_order: number;
}


/*
 * =========================================================
 * SHOP SERVICE
 * =========================================================
 */

export const shopService = {


  /*
   * =======================================================
   * PRODUCTS
   * =======================================================
   */

  async getProducts() {

    const products =
      await productService.getAll();


    return products.filter(
      (product) =>
        product.status ===
        "active"
    );

  },


  /*
   * =======================================================
   * PRODUCT DETAILS
   * =======================================================
   *
   * Used by:
   *
   * useProductDetails()
   *
   * This was already part of the Shop service and must
   * remain here.
   * =======================================================
   */

  async getProductBySlug(
    slug: string
  ) {

    const product =
      await productService.getBySlug(
        slug
      );


    /*
     * Don't expose inactive products
     * on the customer side.
     */

    if (
      !product ||
      product.status !==
        "active"
    ) {

      return null;

    }


    return product;

  },


  /*
   * =======================================================
   * CATEGORIES
   * =======================================================
   *
   * Fetches active TOP-LEVEL categories.
   *
   * Their active subcategories are attached to them.
   * =======================================================
   */

  async getCategories(): Promise<
    ShopCategory[]
  > {

    /*
     * -------------------------------------------------------
     * Fetch active top-level categories
     * -------------------------------------------------------
     */

    const {
      data: categories,
      error: categoriesError,
    } = await supabase

      .from("categories")

      .select(`
        id,
        name,
        slug,
        parent_id,
        sort_order
      `)

      .eq(
        "is_active",
        true
      )

      .is(
        "parent_id",
        null
      )

      .order(
        "sort_order",
        {
          ascending: true,
        }
      )

      .order(
        "name",
        {
          ascending: true,
        }
      );


    if (
      categoriesError
    ) {

      throw categoriesError;

    }


    if (
      !categories ||
      categories.length === 0
    ) {

      return [];

    }


    /*
     * -------------------------------------------------------
     * Get category IDs
     * -------------------------------------------------------
     */

    const categoryIds =
      categories.map(
        (category) =>
          category.id
      );


    /*
     * -------------------------------------------------------
     * Fetch active subcategories
     * -------------------------------------------------------
     */

    const {
      data: subcategories,
      error: subcategoriesError,
    } = await supabase

      .from(
        "subcategories"
      )

      .select(`
        id,
        category_id,
        name,
        slug,
        sort_order
      `)

      .eq(
        "is_active",
        true
      )

      .in(
        "category_id",
        categoryIds
      )

      .order(
        "sort_order",
        {
          ascending: true,
        }
      )

      .order(
        "name",
        {
          ascending: true,
        }
      );


    if (
      subcategoriesError
    ) {

      throw subcategoriesError;

    }


    /*
     * -------------------------------------------------------
     * Attach subcategories
     * -------------------------------------------------------
     */

    return categories.map(
      (category) => ({

        id:
          category.id,

        name:
          category.name,

        slug:
          category.slug,

        parent_id:
          category.parent_id,

        sort_order:
          category.sort_order ?? 0,

        subcategories:
          (
            subcategories ??
            []
          ).filter(
            (subcategory) =>
              subcategory.category_id ===
              category.id
          ),

      })
    );

  },

};