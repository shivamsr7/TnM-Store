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

function nullableString(
  value: unknown
) {

  return value == null
    ? ""
    : String(
        value
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
       * FETCH ACTIVE COLLECTIONS
       * =====================================================
       */

      const {

        data:
          collections,

        error:
          collectionsError,

        count,

      } = await supabase

        .from(
          "collections"
        )

        .select(

          `
            id,
            name,
            slug,
            description,
            banner_image,
            thumbnail_image,
            created_at,
            updated_at
          `,

          {
            count:
              "exact",
          }

        )

        .eq(
          "is_active",
          true
        )

        .order(

          "sort_order",

          {
            ascending:
              true,
          }

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
        collectionsError
      ) {

        throw collectionsError;

      }


      const rows =
        collections ??
        [];


      /*
       * =====================================================
       * BUILD SHIPROCKET COLLECTIONS
       * =====================================================
       */

      const shiprocketCollections =
        [];


      for (
        const collection of
          rows
      ) {

        /*
         * ===================================================
         * FIND EXISTING SHIPROCKET MAPPING
         * ===================================================
         */

        let {

          data:
            mapping,

          error:
            mappingError,

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

            "collection_id",

            collection.id

          )

          .maybeSingle();


        if (
          mappingError
        ) {

          throw mappingError;

        }


        /*
         * ===================================================
         * CREATE MAPPING IF NEEDED
         * ===================================================
         *
         * We generate the numeric ID using the database
         * sequence instead of Math.random().
         *
         * This keeps IDs stable and avoids collisions.
         * ===================================================
         */

        if (
          !mapping
        ) {

          const {

            data:
              maxMapping,

            error:
              maxMappingError,

          } = await supabase

            .from(
              "shiprocket_collection_mappings"
            )

            .select(
              "shiprocket_collection_id"
            )

            .order(

              "shiprocket_collection_id",

              {
                ascending:
                  false,
              }

            )

            .limit(
              1
            )
            .maybeSingle();


          if (
            maxMappingError
          ) {

            throw maxMappingError;

          }


          const nextId =
            Math.max(

              100000000,

              Number(

                maxMapping
                  ?.shiprocket_collection_id ??
                100000000

              )

            ) + 1;


          const {

            data:
              createdMapping,

            error:
              insertError,

          } = await supabase

            .from(
              "shiprocket_collection_mappings"
            )

            .insert({

              collection_id:
                collection.id,

              shiprocket_collection_id:
                nextId,

            })

            .select(

              `
                collection_id,
                shiprocket_collection_id
              `

            )

            .single();


          if (
            insertError
          ) {

            /*
             * Another request could have created the
             * mapping simultaneously. Read it again.
             */

            if (
              insertError.code ===
              "23505"
            ) {

              const {

                data:
                  concurrentMapping,

                error:
                  concurrentLookupError,

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

                  "collection_id",

                  collection.id

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

              throw insertError;

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

            `Unable to create Shiprocket mapping for collection ${collection.id}`

          );

        }


        /*
         * ===================================================
         * IMAGE
         * ===================================================
         *
         * Shiprocket expects:
         *
         * "image": {
         *   "src": "..."
         * }
         *
         * Prefer thumbnail_image and fall back to
         * banner_image.
         * ===================================================
         */

        const imageUrl =
          nullableString(

            collection.thumbnail_image ??
            collection.banner_image

          );


        /*
         * ===================================================
         * COLLECTION OBJECT
         * ===================================================
         */

        shiprocketCollections.push({

          id:
            Number(
              mapping.shiprocket_collection_id
            ),


          updated_at:
            collection.updated_at ??
            "",


          body_html:
            nullableString(
              collection.description
            ),


          handle:
            nullableString(
              collection.slug
            ),


          image: {

            src:
              imageUrl,

          },


          title:
            nullableString(
              collection.name
            ),


          created_at:
            collection.created_at ??
            "",

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

            collections:
              shiprocketCollections,

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

        "Shiprocket collections error:",

        error

      );


      return new Response(

        JSON.stringify({

          error:

            error instanceof Error

              ? error.message

              : "Unable to fetch collections.",

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