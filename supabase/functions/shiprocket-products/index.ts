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


/*
 * =========================================================
 * SUPABASE
 * =========================================================
 *
 * The service-role key is used only inside this Edge
 * Function so Shiprocket can read the catalog even though
 * the public website tables are protected by RLS.
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 * =========================================================
 */

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


  const primary =
    images.find(
      (
        image
      ) =>
        image?.is_primary === true
    );


  return String(
    (
      primary ??
      images[0]
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


  /*
   * Shiprocket's example uses "active".
   *
   * We expose active products only from the catalog query,
   * so this is primarily a defensive mapping.
   */

  return value === "active"
    ? "active"
    : value;

}


/*
 * =========================================================
 * GET /shiprocket-products
 * =========================================================
 *
 * Shiprocket calls this endpoint in the form:
 *
 * ?page=1&limit=100
 *
 * Response:
 *
 * {
 *   "data": {
 *     "total": 1,
 *     "products": [...]
 *   }
 * }
 * =========================================================
 */

serve(
  async (
    request
  ) => {

    /*
     * =======================================================
     * CORS
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

      /*
       * =====================================================
       * PAGINATION
       * =====================================================
       */

      const url =
        new URL(
          request.url
        );


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


      /*
       * Keep the endpoint bounded.
       */

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
       * TOTAL + PRODUCTS
       * =====================================================
       *
       * Only active products are exposed to Shiprocket.
       * This prevents draft/hidden/archived products from
       * appearing in the checkout catalog.
       * =====================================================
       */

      const {

        data: products,

        error: productsError,

        count,

      } = await supabase

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
        )

        .range(
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
       * BUILD SHIPROCKET PRODUCTS
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
         * FIND EXISTING MAPPING
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
         * ===================================================
         * CREATE MAPPING
         * ===================================================
         *
         * The SQL defaults we created earlier generate the
         * permanent bigint Shiprocket IDs.
         * ===================================================
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


          /*
           * Another request could have created the mapping
           * between our SELECT and INSERT. If that happens,
           * read the already-created mapping.
           */

          if (
            mappingInsertError
          ) {

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
                  ) -
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
          product.track_inventory === false
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
         *
         * Your products.weight has no unit column.
         *
         * We therefore return the numeric value as kg,
         * which is the safest explicit unit for the catalog
         * response instead of silently converting it.
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
         * PRODUCT
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
                product.compare_price == null
                  ? ""
                  : numberOrZero(
                      product.compare_price
                    ).toFixed(2),

              sku:
                nullableString(
                  product.sku
                ),

              quantity,

              created_at:
                product.created_at ??
                "",

              updated_at:
                product.updated_at ??
                "",

              taxable:
                true,

              option_values:
                {},

              grams:
                Math.round(
                  weight *
                  1000
                ),

              image: {

                src:
                  imageUrl,

              },

              weight,

              weight_unit:
                "kg",

            },

          ],

          image: {

            src:
              imageUrl,

          },

          options:
            [],

        });

      }


      /*
       * =====================================================
       * RESPONSE
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
        "Shiprocket catalog error:",
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
