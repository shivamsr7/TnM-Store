import {
  supabase,
} from "@/shared/lib/supabase";

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

  subcategories:
    ShopSubcategory[];

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
   * Only active subcategories that have at least
   * one ACTIVE product mapped to them are returned.
   *
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

      .from(
        "categories"
      )

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
     * If there are no active subcategories,
     * return categories with empty subcategory arrays.
     * -------------------------------------------------------
     */

    if (
      !subcategories ||
      subcategories.length === 0
    ) {

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
            [],

        })
      );

    }


    /*
     * -------------------------------------------------------
     * Fetch ACTIVE products mapped to subcategories
     * -------------------------------------------------------
     *
     * We only need the subcategory_id here.
     *
     * Example:
     *
     * Product A → subcategory_id = abc
     * Product B → subcategory_id = abc
     * Product C → subcategory_id = xyz
     *
     * Result:
     *
     * abc → has products
     * xyz → has products
     *
     * Any subcategory not present here has no active
     * product and therefore should NOT appear in Shop.
     *
     * -------------------------------------------------------
     */

    const {
      data: mappedProducts,
      error: productsError,
    } = await supabase

      .from(
        "products"
      )

      .select(`
        subcategory_id
      `)

      .eq(
        "status",
        "active"
      )

      .in(
        "subcategory_id",
        subcategories.map(
          (subcategory) =>
            subcategory.id
        )
      );


    if (
      productsError
    ) {

      throw productsError;

    }


    /*
     * -------------------------------------------------------
     * Build a Set of subcategory IDs that actually
     * contain at least one active product.
     * -------------------------------------------------------
     */

    const subcategoryIdsWithProducts =
      new Set(
        (
          mappedProducts ??
          []
        )

          .map(
            (product) =>
              product.subcategory_id
          )

          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          )
      );


    /*
     * -------------------------------------------------------
     * Attach ONLY subcategories that have products
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
          )

            .filter(
              (subcategory) =>

                /*
                 * Must belong to this parent category
                 */

                subcategory.category_id ===
                  category.id &&

                /*
                 * Must have at least one
                 * active product
                 */

                subcategoryIdsWithProducts.has(
                  subcategory.id
                )
            ),

      })
    );

  },

};