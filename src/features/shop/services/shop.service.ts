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
   * CATEGORIES
   * =======================================================
   *
   * Fetches active TOP-LEVEL categories.
   *
   * Subcategories are fetched separately and attached
   * to their parent category.
   *
   * This keeps the Shop completely database-driven.
   *
   * =======================================================
   */

  async getCategories(): Promise<
    ShopCategory[]
  > {

    /*
     * -------------------------------------------------------
     * Fetch categories
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

      /*
       * Only main/top-level categories.
       *
       * Your current structure uses:
       *
       * Bracelets & Bangles
       *      ↓
       * subcategories
       *
       * So we don't want nested categories appearing
       * as main Shop categories.
       */

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
     * Fetch all active subcategories
     * -------------------------------------------------------
     */

    const categoryIds =
      categories.map(
        (category) =>
          category.id
      );


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
     * Attach subcategories to categories
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