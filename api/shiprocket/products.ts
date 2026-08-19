import type {
  VercelRequest,
  VercelResponse,
} from "@vercel/node";

import {
  createClient,
} from "@supabase/supabase-js";


const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;


if (
  !supabaseUrl ||
  !supabaseServiceRoleKey
) {
  throw new Error(
    "Supabase environment variables are missing."
  );
}


const supabase =
  createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );


function stringValue(
  value: unknown
) {
  return value == null
    ? ""
    : String(value);
}


function numberValue(
  value: unknown
) {

  const parsed =
    Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;

}


function getImageUrl(
  images: any[]
) {

  if (
    !Array.isArray(images) ||
    images.length === 0
  ) {
    return "";
  }


  const sorted =
    [...images].sort(
      (
        a,
        b
      ) =>
        Number(
          a?.sort_order ?? 0
        ) -
        Number(
          b?.sort_order ?? 0
        )
    );


  const primary =
    sorted.find(
      (image) =>
        image?.is_primary === true
    );


  return stringValue(
    (
      primary ??
      sorted[0]
    )?.image_url
  );

}


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {

  res.setHeader(
    "Cache-Control",
    "s-maxage=60, stale-while-revalidate=300"
  );


  if (
    req.method === "OPTIONS"
  ) {

    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );

    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, OPTIONS"
    );

    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type"
    );

    return res
      .status(200)
      .end();

  }


  if (
    req.method !== "GET"
  ) {

    return res
      .status(405)
      .json({
        error:
          "Method not allowed",
      });

  }


  try {

    const page =
      Math.max(
        1,
        Number(
          req.query.page ?? 1
        ) || 1
      );


    const requestedLimit =
      Number(
        req.query.limit ?? 100
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


    const {
      data: products,
      error: productsError,
      count,
    } =
      await supabase

        .from("products")

        .select(
          `
            id,
            name,
            slug,
            sku,
            short_description,
            description,
            price,
            compare_price,
            stock,
            track_inventory,
            status,
            weight,
            created_at,
            updated_at,
            product_images (
              id,
              image_url,
              storage_path,
              sort_order,
              is_primary
            )
          `,
          {
            count: "exact",
          }
        )

        .eq(
          "status",
          "active"
        )

        .order(
          "created_at",
          {
            ascending: true,
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


    const rows =
      products ?? [];


    const shiprocketProducts =
      [];


    for (
      const product of rows
    ) {

      const {
        data: mapping,
        error: mappingError,
      } =
        await supabase

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
        mappingError
      ) {
        throw mappingError;
      }


      let productMapping =
        mapping;


      if (
        !productMapping
      ) {

        const {
          data: createdMapping,
          error: insertError,
        } =
          await supabase

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
          insertError
        ) {

          if (
            insertError.code ===
            "23505"
          ) {

            const {
              data: concurrentMapping,
              error:
                concurrentLookupError,
            } =
              await supabase

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


            productMapping =
              concurrentMapping;

          } else {

            throw insertError;

          }

        } else {

          productMapping =
            createdMapping;

        }

      }


      if (
        !productMapping
      ) {
        throw new Error(
          `Unable to create Shiprocket mapping for product ${product.id}`
        );
      }


      const images =
        Array.isArray(
          product.product_images
        )
          ? product.product_images
          : [];


      const imageUrl =
        getImageUrl(
          images
        );


      const weight =
        Math.max(
          0,
          numberValue(
            product.weight
          )
        );


      const quantity =
        product.track_inventory === false
          ? 999999
          : Math.max(
              0,
              Math.floor(
                numberValue(
                  product.stock
                )
              )
            );


      shiprocketProducts.push({

        id:
          Number(
            productMapping.shiprocket_product_id
          ),

        title:
          stringValue(
            product.name
          ),

        body_html:
          stringValue(
            product.description ??
            product.short_description
          ),

        vendor:
          "T&M Jewels",

        product_type:
          "Jewellery",

        created_at:
          stringValue(
            product.created_at
          ),

        handle:
          stringValue(
            product.slug
          ),

        updated_at:
          stringValue(
            product.updated_at
          ),

        tags:
          "",

        status:
          stringValue(
            product.status
          ),

        variants: [

          {

            id:
              Number(
                productMapping.shiprocket_variant_id
              ),

            title:
              "Default",

            price:
              numberValue(
                product.price
              ).toFixed(2),

            compare_at_price:
              product.compare_price == null
                ? ""
                : numberValue(
                    product.compare_price
                  ).toFixed(2),

            sku:
              stringValue(
                product.sku
              ),

            quantity,

            created_at:
              stringValue(
                product.created_at
              ),

            updated_at:
              stringValue(
                product.updated_at
              ),

            taxable:
              true,

            option_values:
              {},

            grams:
              Math.round(
                weight * 1000
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


    return res
      .status(200)
      .json({

        data: {

          total:
            count ?? 0,

          products:
            shiprocketProducts,

        },

      });

  }

  catch (
    error
  ) {

    console.error(
      "Shiprocket products API error:",
      error
    );


    return res
      .status(500)
      .json({

        error:
          error instanceof Error
            ? error.message
            : "Unable to fetch products.",

      });

  }

}
