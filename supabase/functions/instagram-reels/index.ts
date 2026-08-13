const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "GET, POST, OPTIONS",
};

const INSTAGRAM_GRAPH_URL =
  "https://graph.instagram.com";


/*
 * =========================================================
 * TYPES
 * =========================================================
 */

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


/*
 * =========================================================
 * HELPER
 * =========================================================
 *
 * Fetch complete details for an individual Instagram
 * media item.
 *
 * This is especially important for Reels because the
 * /me/media response may not always give us the playable
 * media_url reliably.
 * =========================================================
 */

async function fetchMediaDetails(
  mediaId: string,
  accessToken: string
): Promise<InstagramMedia | null> {

  try {

    const url =
      new URL(
        `${INSTAGRAM_GRAPH_URL}/${mediaId}`
      );


    url.searchParams.set(
      "fields",
      [
        "id",
        "caption",
        "media_type",
        "media_product_type",
        "media_url",
        "thumbnail_url",
        "permalink",
        "timestamp",
        "username",
      ].join(",")
    );


    url.searchParams.set(
      "access_token",
      accessToken
    );


    const response =
      await fetch(
        url.toString()
      );


    const data:
      InstagramMedia &
      InstagramResponse =
      await response.json();


    if (
      !response.ok ||
      data.error
    ) {

      console.error(
        `Instagram media details error for ${mediaId}:`,
        data.error
      );

      return null;

    }


    return data;

  } catch (error) {

    console.error(
      `Failed to fetch Instagram media details for ${mediaId}:`,
      error
    );

    return null;

  }

}


/*
 * =========================================================
 * EDGE FUNCTION
 * =========================================================
 */

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
       * ACCESS TOKEN
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
       * FETCH INSTAGRAM MEDIA
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
              instagramData.error?.message ??
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
       * FIND REELS
       * ===================================================
       */

      const reelCandidates =
        (
          instagramData.data ??
          []
        ).filter(
          (
            media
          ) => {

            return (
              media.media_type ===
                "VIDEO" &&
              media.media_product_type ===
                "REELS"
            );

          }
        );


      /*
       * ===================================================
       * GET FULL DETAILS FOR EACH REEL
       * =====================================================
       *
       * If media_url is already present, we keep it.
       *
       * If it is missing, we make a direct request using
       * the Reel ID to retrieve the full media object.
       * =====================================================
       */

      const reels =
        await Promise.all(

          reelCandidates.map(
            async (
              media
            ) => {

              let fullMedia =
                media;


              /*
               * Fetch individual media details when
               * media_url is missing.
               */

              if (
                !media.media_url
              ) {

                const details =
                  await fetchMediaDetails(
                    media.id,
                    accessToken
                  );


                if (
                  details
                ) {

                  fullMedia = {
                    ...media,
                    ...details,
                  };

                }

              }


              /*
               * Return the format expected by
               * useInstagramReels.ts
               */

              return {

                id:
                  fullMedia.id,

                caption:
                  fullMedia.caption ??
                  "",

                mediaType:
                  fullMedia.media_type ??
                  "VIDEO",

                mediaProductType:
                  fullMedia.media_product_type ??
                  "REELS",

                mediaUrl:
                  fullMedia.media_url ??
                  null,

                thumbnailUrl:
                  fullMedia.thumbnail_url ??
                  null,

                permalink:
                  fullMedia.permalink ??
                  null,

                timestamp:
                  fullMedia.timestamp ??
                  null,

                username:
                  fullMedia.username ??
                  "tnm_jewels",

              };

            }
          )

        );


      /*
       * ===================================================
       * ONLY KEEP VALID REELS
       * ===================================================
       *
       * A Reel needs a permalink.
       *
       * We do NOT filter out a Reel just because
       * mediaUrl is temporarily unavailable, because
       * the thumbnail/caption can still be displayed.
       * ===================================================
       */

      const validReels =
        reels.filter(
          (
            reel
          ) =>
            Boolean(
              reel.permalink
            )
        );


      /*
       * ===================================================
       * LOG MEDIA URL STATUS
       * ===================================================
       *
       * This will help us debug Meta API responses from
       * Supabase logs if required.
       * ===================================================
       */

      console.log(
        "Instagram reels:",
        validReels.map(
          (
            reel
          ) => ({
            id:
              reel.id,

            hasMediaUrl:
              Boolean(
                reel.mediaUrl
              ),

            hasThumbnail:
              Boolean(
                reel.thumbnailUrl
              ),

            permalink:
              reel.permalink,
          })
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

          reels:
            validReels,

          count:
            validReels.length,

        }),

        {
          status: 200,

          headers: {

            ...corsHeaders,

            "Content-Type":
              "application/json",

            /*
             * Cache for 5 minutes.
             */

            "Cache-Control":
              "public, max-age=300, s-maxage=300",

          },

        }

      );

    }


    /*
     * =====================================================
     * UNEXPECTED ERROR
     * =====================================================
     */

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