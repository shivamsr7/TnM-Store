import {
  createClient,
} from "https://esm.sh/@supabase/supabase-js@2";

import {
  serve,
} from "https://deno.land/std/http/server.ts";


const corsHeaders = {

  "Access-Control-Allow-Origin":
    "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "GET, OPTIONS",

};


const supabaseUrl =
  Deno.env.get(
    "SUPABASE_URL"
  );

const supabaseServiceRoleKey =
  Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  );


if (
  !supabaseUrl ||
  !supabaseServiceRoleKey
) {

  throw new Error(
    "Supabase Edge Function environment variables are missing."
  );

}


const supabase =
  createClient(

    supabaseUrl,

    supabaseServiceRoleKey,

    {
      auth: {

        autoRefreshToken:
          false,

        persistSession:
          false,

      },
    }

  );


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function numberOrZero(
  value: unknown
) {

  const number =
    Number(
      value
    );


  return Number.isFinite(
    number
  )
    ? number
    : 0;

}


function nullableString(
  value: unknown
) {

  return value == null
    ? ""
    : String(
        value
      );

}


function getImageUrl(
  images: any[]
) {

  if (
    !Array.isArray(
      images
    ) ||
    images.length === 0
  ) {

    return "";

  }


  const sortedImages =
    [
      ...images,
    ].sort(

      (
        a,
        b
      ) =>

        Number(
          a?.sort_order ??
          0
        )

        -

        Number(
          b?.sort_order ??
          0
        )

    );


  const primary =
    sortedImages.find(
      (
        image
      ) =>
        image?.is_primary === true
    );


  return String(

    (
      primary ??
      sortedImages[0]
    )?.image_url ??

    ""

  );

}


function mapStatus(
  status: unknown
) {

  const value =
    String(
      status ??
      ""
    ).toLowerCase();


  return value ===
    "active"

    ? "active"

    : value;

}


/*
 * =========================================================
 * SHIPROCKET COLLECTION ID GENERATOR
 * =========================================================
 *
 * We keep a separate numeric ID for Shiprocket.
 *
 * Your actual T&M collection ID remains a UUID.
 *
 * Example:
 *
 * T&M UUID
 *      ↓
 * shiprocket_collection_mappings
 *      ↓
 * 100000001
 *
 * =========================================================
 */

function generateShiprocketCollectionId() {

  return Math.floor(

    100000000 +

    Math.random() *
      900000000

  );

}


/*
 * =========================================================
 * HANDLER
 * =========================================================
 */

serve(

  async (
    request
  ) => {

    /*
     * =======================================================
     * OPTIONS
     * =======================================================
     */

    if (
      request.method ===
      "OPTIONS"
    ) {

      return new Response(

        "ok",

        {
          headers:
            corsHeaders,
        }

      );

    }


    /*
     * =======================================================
     * METHOD
     * =======================================================
     */

    if (
      request.method !==
      "GET"
    ) {

      return new Response(

        JSON.stringify({

          error:
            "Method not allowed",

        }),

        {

          status:
            405,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

          },

        }

      );

    }


    try {

      const url =
        new URL(
          request.url
        );


      /*
       * =====================================================
       * PAGINATION
       * =====================================================
       */

      const page =
        Math.max(

          1,

          Number(

            url.searchParams.get(
              "page"
            ) ??

            "1"

          ) || 1

        );


      const requestedLimit =
        Number(

          url.searchParams.get(
            "limit"
          ) ??

          "100"

        ) || 100;


      const limit =
        Math.min(

          Math.max(
            1,
            requestedLimit
          ),

          100

        );


      const from =
        (
          page - 1
        ) *
        limit;


      const to =
        from +
        limit -
        1;


      /*
       * =====================================================
       * COLLECTION FILTER
       * =====================================================
       */

      const collectionIdParam =
        url.searchParams.get(
          "collection_id"
        );


      let productIds:
        string[] | null =
          null;


      /*
       * =====================================================
       * IF collection_id IS PROVIDED
       * =====================================================
       *
       * Shiprocket sends its numeric collection ID.
       *
       * We translate that to our internal UUID using:
       *
       * shiprocket_collection_mappings
       *
       * Then find products through:
       *
       * product_collections
       * =====================================================
       */

      if (
        collectionIdParam !==
        null &&
        collectionIdParam !==
        ""
      ) {

        const shiprocketCollectionId =
          Number(
            collectionIdParam
          );


        if (
          !Number.isInteger(
            shiprocketCollectionId
          ) ||
          shiprocketCollectionId <=
            0
        ) {

          return new Response(

            JSON.stringify({

              error:
                "Invalid collection_id.",

            }),

            {

              status:
                400,

              headers: {

                ...corsHeaders,

                "Content-Type":
                  "application/json",

              },

            }

          );

        }


        /*
         * ===================================================
         * FIND COLLECTION MAPPING
         * ===================================================
         */

        let {
          data:
            collectionMapping,

          error:
            collectionMappingError,

        } = await supabase

          .from(
            "shiprocket_collection_mappings"
          )

          .select(

            `
              collection_id,
              shiprocket_collection_id
            `

          )

          .eq(

            "shiprocket_collection_id",

            shiprocketCollectionId

          )

          .maybeSingle();


        if (
          collectionMappingError
        ) {

          throw collectionMappingError;

        }


        /*
         * If Shiprocket sends a collection ID that we have
         * never mapped, return an empty collection rather
         * than accidentally returning ALL products.
         */

        if (
          !collectionMapping
        ) {

          return new Response(

            JSON.stringify({

              data: {

                total:
                  0,

                products:
                  [],

              },

            }),

            {

              status:
                200,

              headers: {

                ...corsHeaders,

                "Content-Type":
                  "application/json",

              },

            }

          );

        }


        /*
         * ===================================================
         * GET PRODUCT IDS FOR COLLECTION
         * ===================================================
         */

        const {

          data:
            collectionProducts,

          error:
            collectionProductsError,

        } = await supabase

          .from(
            "product_collections"
          )

          .select(
            "product_id"
          )

          .eq(

            "collection_id",

            collectionMapping.collection_id

          );


        if (
          collectionProductsError
        ) {

          throw collectionProductsError;

        }


        productIds =
          (
            collectionProducts ??
            []
          ).map(

            (
              row
            ) =>
              row.product_id

          );


        /*
         * No products in the collection.
         */

        if (
          productIds.length ===
          0
        ) {

          return new Response(

            JSON.stringify({

              data: {

                total:
                  0,

                products:
                  [],

              },

            }),

            {

              status:
                200,

              headers: {

                ...corsHeaders,

                "Content-Type":
                  "application/json",

              },

            }

          );

        }

      }


      /*
       * =====================================================
       * FETCH PRODUCTS
       * =====================================================
       *
       * Two modes:
       *
       * 1. No collection_id
       *    → all active products
       *
       * 2. collection_id provided
       *    → active products belonging to that collection
       * =====================================================
       */

      let productsQuery =
        supabase

          .from(
            "products"
          )

          .select(

            `
              id,
              name,
              slug,
              sku,
              short_description,
              description,
              brand_id,
              category_id,
              price,
              compare_price,
              stock,
              track_inventory,
              allow_backorders,
              status,
              weight,
              created_at,
              updated_at,
              product_images (
                id,
                image_url,
                is_primary,
                sort_order
              )
            `,

            {
              count:
                "exact",
            }

          )

          .eq(
            "status",
            "active"
          )

          .order(

            "created_at",

            {
              ascending:
                true,
            }

          );


      /*
       * Apply collection filtering only when requested.
       */

      if (
        productIds !==
        null
      ) {

        productsQuery =
          productsQuery.in(

            "id",

            productIds

          );

      }


      const {

        data:
          products,

        error:
          productsError,

        count,

      } =
        await productsQuery.range(

          from,

          to

        );


      if (
        productsError
      ) {

        throw productsError;

      }


      const productRows =
        products ??
        [];


      /*
       * =====================================================
       * BUILD SHIPROCKET RESPONSE
       * =====================================================
       */

      const shiprocketProducts =
        [];


      for (
        const product of
          productRows
      ) {

        /*
         * ===================================================
         * PRODUCT MAPPING
         * ===================================================
         */

        const {

          data:
            existingMapping,

          error:
            mappingLookupError,

        } = await supabase

          .from(
            "shiprocket_product_mappings"
          )

          .select(

            `
              product_id,
              shiprocket_product_id,
              shiprocket_variant_id
            `

          )

          .eq(

            "product_id",

            product.id

          )

          .maybeSingle();


        if (
          mappingLookupError
        ) {

          throw mappingLookupError;

        }


        let mapping =
          existingMapping;


        /*
         * Create permanent product mapping if necessary.
         */

        if (
          !mapping
        ) {

          const {

            data:
              createdMapping,

            error:
              mappingInsertError,

          } = await supabase

            .from(
              "shiprocket_product_mappings"
            )

            .insert({

              product_id:
                product.id,

            })

            .select(

              `
                product_id,
                shiprocket_product_id,
                shiprocket_variant_id
              `

            )

            .single();


          if (
            mappingInsertError
          ) {

            /*
             * Another request may have created the
             * mapping at the same time.
             */

            if (
              mappingInsertError.code ===
              "23505"
            ) {

              const {

                data:
                  concurrentMapping,

                error:
                  concurrentLookupError,

              } = await supabase

                .from(
                  "shiprocket_product_mappings"
                )

                .select(

                  `
                    product_id,
                    shiprocket_product_id,
                    shiprocket_variant_id
                  `

                )

                .eq(

                  "product_id",

                  product.id

                )

                .single();


              if (
                concurrentLookupError
              ) {

                throw concurrentLookupError;

              }


              mapping =
                concurrentMapping;

            } else {

              throw mappingInsertError;

            }

          } else {

            mapping =
              createdMapping;

          }

        }


        if (
          !mapping
        ) {

          throw new Error(

            `Unable to create Shiprocket mapping for product ${product.id}`

          );

        }


        /*
         * ===================================================
         * IMAGE
         * ===================================================
         */

        const images =
          Array.isArray(
            product.product_images
          )

            ? [

                ...product.product_images,

              ].sort(

                (
                  a,
                  b
                ) =>

                  Number(
                    a?.sort_order ??
                    0
                  )

                  -

                  Number(
                    b?.sort_order ??
                    0
                  )

              )

            : [];


        const imageUrl =
          getImageUrl(
            images
          );


        /*
         * ===================================================
         * QUANTITY
         * ===================================================
         */

        const quantity =
          product.track_inventory ===
          false

            ? 999999

            : Math.max(

                0,

                Math.floor(

                  numberOrZero(
                    product.stock
                  )

                )

              );


        /*
         * ===================================================
         * WEIGHT
         * ===================================================
         */

        const weight =
          Math.max(

            0,

            numberOrZero(
              product.weight
            )

          );


        /*
         * ===================================================
         * PRODUCT OBJECT
         * ===================================================
         */

        shiprocketProducts.push({

          id:
            Number(
              mapping.shiprocket_product_id
            ),


          title:
            nullableString(
              product.name
            ),


          body_html:
            nullableString(

              product.description ??
              product.short_description

            ),


          vendor:
            "T&M Jewels",


          product_type:
            "Jewellery",


          created_at:
            product.created_at ??
            "",


          handle:
            nullableString(
              product.slug
            ),


          updated_at:
            product.updated_at ??
            "",


          tags:
            "",


          status:
            mapStatus(
              product.status
            ),


          variants: [

            {

              id:
                Number(
                  mapping.shiprocket_variant_id
                ),


              title:
                "Default",


              price:
                numberOrZero(
                  product.price
                ).toFixed(2),


              compare_at_price:

                Number(
                  product.compare_price
                ) > 0

                  ? Number(
                      product.compare_price
                    ).toFixed(2)

                  : "",


              sku:
                nullableString(
                  product.sku
                ),


              created_at:
                product.created_at ??
                "",


              updated_at:
                product.updated_at ??
                "",


              taxable:
                true,


              quantity,


              grams:
                Math.round(

                  weight *
                  1000

                ),


              image: {

                src:
                  imageUrl,

              },


              option_values:
                {},


              weight,


              weight_unit:
                "kg",

            },

          ],


          options:
            [],


          image: {

            src:
              imageUrl,

          },

        });

      }


      /*
       * =====================================================
       * FINAL RESPONSE
       * =====================================================
       */

      return new Response(

        JSON.stringify({

          data: {

            total:
              count ??
              0,

            products:
              shiprocketProducts,

          },

        }),

        {

          status:
            200,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

          },

        }

      );

    }

    catch (
      error
    ) {

      console.error(

        "Shiprocket products error:",

        error

      );


      return new Response(

        JSON.stringify({

          error:

            error instanceof Error

              ? error.message

              : "Unable to fetch products.",

        }),

        {

          status:
            500,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

          },

        }

      );

    }

  }

);