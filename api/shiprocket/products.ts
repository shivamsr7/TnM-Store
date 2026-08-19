const SUPABASE_PRODUCTS_API =
  "https://wzphyyoftwxvpqxtfgtb.supabase.co/functions/v1/shiprocket-products";


export default async function handler(
  req: any,
  res: any
) {

  if (req.method === "OPTIONS") {

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


  if (req.method !== "GET") {

    return res
      .status(405)
      .json({
        error: "Method not allowed",
      });

  }


  try {

    const params =
      new URLSearchParams();


    if (
      req.query?.page !== undefined
    ) {

      params.set(
        "page",
        String(req.query.page)
      );

    }


    if (
      req.query?.limit !== undefined
    ) {

      params.set(
        "limit",
        String(req.query.limit)
      );

    }


    const query =
      params.toString();


    const upstreamUrl =
      query
        ? `${SUPABASE_PRODUCTS_API}?${query}`
        : SUPABASE_PRODUCTS_API;


    const response =
      await fetch(
        upstreamUrl,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
        }
      );


    const text =
      await response.text();


    let data;

    try {

      data =
        JSON.parse(text);

    } catch {

      return res
        .status(502)
        .json({
          error:
            "Supabase returned an invalid response.",
          status:
            response.status,
          response:
            text,
        });

    }


    res.setHeader(
      "Access-Control-Allow-Origin",
      "*"
    );


    res.setHeader(
      "Cache-Control",
      "s-maxage=60, stale-while-revalidate=300"
    );


    return res
      .status(response.status)
      .json(data);

  } catch (error) {

    console.error(
      "Shiprocket products proxy error:",
      error
    );


    return res
      .status(502)
      .json({
        error:
          "Unable to reach Supabase Shiprocket products API.",
        details:
          error instanceof Error
            ? error.message
            : String(error),
      });

  }

}