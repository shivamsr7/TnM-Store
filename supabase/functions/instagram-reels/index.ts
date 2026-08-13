const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
};


const INSTAGRAM_GRAPH_URL =
  "https://graph.instagram.com";


type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_product_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
  username?: string;
};


type InstagramResponse = {
  data?: InstagramMedia[];

  paging?: {
    next?: string;
  };

  error?: {
    message?: string;
    type?: string;
    code?: number;
  };
};


Deno.serve(
  async (
    req: Request
  ) => {

    /*
     * =====================================================
     * CORS
     * =====================================================
     */

    if (
      req.method ===
      "OPTIONS"
    ) {

      return new Response(
        "ok",
        {
          status: 200,

          headers:
            corsHeaders,
        }
      );

    }


    /*
     * =====================================================
     * ALLOW GET + POST
     * =====================================================
     *
     * supabase.functions.invoke()
     * sends POST by default.
     *
     * We therefore support both GET and POST.
     * =====================================================
     */

    if (
      req.method !== "GET" &&
      req.method !== "POST"
    ) {

      return new Response(

        JSON.stringify({
          success: false,
          error:
            "Method not allowed",
        }),

        {
          status: 405,

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
       * ===================================================
       * GET ACCESS TOKEN
       * ===================================================
       */

      const accessToken =
        Deno.env.get(
          "INSTAGRAM_ACCESS_TOKEN"
        );


      if (
        !accessToken
      ) {

        console.error(
          "INSTAGRAM_ACCESS_TOKEN is not configured."
        );


        return new Response(

          JSON.stringify({
            success: false,
            error:
              "Instagram integration is not configured.",
          }),

          {
            status: 500,

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
       * INSTAGRAM API FIELDS
       * ===================================================
       */

      const fields = [

        "id",

        "caption",

        "media_type",

        "media_product_type",

        "media_url",

        "thumbnail_url",

        "permalink",

        "timestamp",

        "username",

      ].join(",");


      /*
       * ===================================================
       * BUILD INSTAGRAM API URL
       * ===================================================
       */

      const url =
        new URL(
          `${INSTAGRAM_GRAPH_URL}/me/media`
        );


      url.searchParams.set(
        "fields",
        fields
      );


      url.searchParams.set(
        "limit",
        "25"
      );


      url.searchParams.set(
        "access_token",
        accessToken
      );


      /*
       * ===================================================
       * FETCH INSTAGRAM
       * ===================================================
       */

      const instagramResponse =
        await fetch(
          url.toString()
        );


      const instagramData:
        InstagramResponse =
        await instagramResponse.json();


      /*
       * ===================================================
       * INSTAGRAM API ERROR
       * ===================================================
       */

      if (
        !instagramResponse.ok ||
        instagramData.error
      ) {

        console.error(
          "Instagram API error:",
          instagramData.error
        );


        return new Response(

          JSON.stringify({
            success: false,
            error:
              "Unable to fetch Instagram media.",
          }),

          {
            status: 502,

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
       * FILTER REELS
       * ===================================================
       *
       * VIDEO alone isn't enough.
       *
       * We specifically check:
       *
       * media_type = VIDEO
       * media_product_type = REELS
       * ===================================================
       */

      const reels =
        (
          instagramData.data ??
          []
        )

          .filter(
            (
              media
            ) => {

              const isVideo =
                media.media_type ===
                "VIDEO";


              const isReel =
                media.media_product_type ===
                "REELS";


              return (
                isVideo &&
                isReel
              );

            }
          )

          .map(
            (
              media
            ) => ({

              id:
                media.id,

              caption:
                media.caption ??
                "",

              mediaType:
                media.media_type ??
                "VIDEO",

              mediaProductType:
                media.media_product_type ??
                "REELS",

              mediaUrl:
                media.media_url ??
                null,

              thumbnailUrl:
                media.thumbnail_url ??
                null,

              permalink:
                media.permalink ??
                null,

              timestamp:
                media.timestamp ??
                null,

              username:
                media.username ??
                "tnm_jewels",

            })
          )

          .filter(
            (
              reel
            ) =>
              Boolean(
                reel.permalink
              )
          );


      /*
       * ===================================================
       * RESPONSE
       * ===================================================
       */

      return new Response(

        JSON.stringify({

          success:
            true,

          reels,

          count:
            reels.length,

        }),

        {
          status: 200,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

            "Cache-Control":
              "public, max-age=300, s-maxage=300",

          },

        }

      );

    }

    catch (
      error
    ) {

      console.error(
        "Instagram reels function error:",
        error
      );


      return new Response(

        JSON.stringify({

          success:
            false,

          error:
            "Something went wrong while fetching Instagram reels.",

        }),

        {
          status: 500,

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