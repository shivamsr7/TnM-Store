import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std/http/server.ts";


/*
 * =========================================================
 * CORS
 * =========================================================
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods":
    "POST, OPTIONS",
};


/*
 * =========================================================
 * SUPABASE
 * =========================================================
 */

const supabaseUrl =
  Deno.env.get("SUPABASE_URL");

const supabaseServiceRoleKey =
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");


if (
  !supabaseUrl ||
  !supabaseServiceRoleKey
) {
  console.error(
    "Supabase environment variables are missing."
  );
}


const supabase = createClient(
  supabaseUrl ?? "",
  supabaseServiceRoleKey ?? "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


/*
 * =========================================================
 * JSON RESPONSE
 * =========================================================
 */

function jsonResponse(
  data: unknown,
  status = 200
): Response {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    }
  );
}


/*
 * =========================================================
 * WEBHOOK
 * =========================================================
 */

serve(async (req: Request): Promise<Response> => {

  /*
   * -------------------------------------------------------
   * OPTIONS
   * -------------------------------------------------------
   */

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }


  /*
   * -------------------------------------------------------
   * ONLY POST
   * -------------------------------------------------------
   */

  if (req.method !== "POST") {
    return jsonResponse(
      {
        success: false,
        error: "Method not allowed.",
      },
      405
    );
  }


  /*
   * -------------------------------------------------------
   * MAIN PROCESS
   * -------------------------------------------------------
   */

  try {

    /*
     * =====================================================
     * READ FASTRR PAYLOAD
     * =====================================================
     */

    const payload = await req.json();


    console.log(
      "================================================="
    );

    console.log(
      "FASTRR ORDER WEBHOOK RECEIVED"
    );

    console.log(
      JSON.stringify(
        payload,
        null,
        2
      )
    );

    console.log(
      "================================================="
    );


    /*
     * =====================================================
     * CART ID
     * =====================================================
     */

    const cartId = String(
      payload?.cart_id ?? ""
    ).trim();


    if (!cartId) {

      console.error(
        "Webhook rejected: cart_id is missing."
      );

      return jsonResponse(
        {
          success: false,
          error: "cart_id is required.",
        },
        400
      );

    }


    /*
     * =====================================================
     * STAGE
     * =====================================================
     */

    const stage = String(
      payload?.latest_stage ?? ""
    ).trim();


    if (!stage) {

      console.error(
        "Webhook rejected: latest_stage is missing.",
        {
          cart_id: cartId,
        }
      );

      return jsonResponse(
        {
          success: false,
          error: "latest_stage is required.",
        },
        400
      );

    }


    /*
     * =====================================================
     * ONLY PROCESS ORDER_PLACED
     * =====================================================
     */

    if (
      stage.toUpperCase() !==
      "ORDER_PLACED"
    ) {

      console.log(
        `Ignoring FASTRR stage: ${stage}`
      );

      return jsonResponse(
        {
          success: true,
          received: true,
          cart_id: cartId,
          stage,
          ignored: true,
          reason:
            "Only ORDER_PLACED is processed.",
        },
        200
      );

    }


    /*
     * =====================================================
     * VALIDATE ITEMS
     * =====================================================
     */

    const items =
      Array.isArray(payload?.items)
        ? payload.items
        : [];


    if (items.length === 0) {

      console.error(
        "Webhook rejected: no items found.",
        {
          cart_id: cartId,
        }
      );

      return jsonResponse(
        {
          success: false,
          error:
            "At least one checkout item is required.",
          cart_id: cartId,
        },
        400
      );

    }


    /*
     * =====================================================
     * CHECK EXISTING FASTRR STAGING RECORD
     * =====================================================
     */

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("fastrr_orders")
      .select(
        "id, cart_id, stage, processed, processed_at"
      )
      .eq("cart_id", cartId)
      .maybeSingle();


    if (existingOrderError) {

      console.error(
        "Unable to check existing FASTRR order:",
        existingOrderError
      );

      return jsonResponse(
        {
          success: false,
          error:
            "Unable to check existing FASTRR order.",
        },
        500
      );

    }


    /*
     * =====================================================
     * IF ALREADY PROCESSED
     * =====================================================
     */

    if (
      existingOrder?.processed === true
    ) {

      console.log(
        "FASTRR order already processed.",
        {
          cart_id: cartId,
          staging_id: existingOrder.id,
        }
      );


      /*
       * Ask the processor for the existing T&M order.
       *
       * The database function has its own idempotency check.
       */

      const {
        data: existingProcessedOrderId,
        error:
          existingProcessedOrderError,
      } = await supabase.rpc(
        "process_fastrr_order",
        {
          p_fastrr_order_id:
            existingOrder.id,
        }
      );


      if (
        existingProcessedOrderError
      ) {

        console.error(
          "Unable to retrieve processed FASTRR order:",
          existingProcessedOrderError
        );

        return jsonResponse(
          {
            success: false,
            received: true,
            duplicate: true,
            cart_id: cartId,
            staging_id:
              existingOrder.id,
            processed: true,
            error:
              existingProcessedOrderError.message,
          },
          500
        );

      }


      return jsonResponse(
        {
          success: true,
          received: true,
          duplicate: true,
          cart_id: cartId,
          staging_id:
            existingOrder.id,
          processed: true,
          order_id:
            existingProcessedOrderId,
          message:
            "FASTRR order was already processed.",
        },
        200
      );

    }


    /*
     * =====================================================
     * INSERT / UPDATE STAGING ORDER
     * =====================================================
     */

    let stagingId =
      existingOrder?.id ?? null;


    if (!stagingId) {

      const {
        data: stagedOrder,
        error: insertError,
      } = await supabase
        .from("fastrr_orders")
        .insert({
          cart_id: cartId,

          stage,

          source_name:
            String(
              payload?.source_name ??
              "fastrr"
            ).trim(),

          currency:
            String(
              payload?.currency ??
              "INR"
            ).trim(),

          item_count:
            Number(
              payload?.item_count ??
              items.length
            ),

          subtotal:
            Number(
              payload?.subtotal ??
              payload?.total_price ??
              0
            ),

          shipping_price:
            Number(
              payload?.shipping_price ??
              0
            ),

          total_discount:
            Number(
              payload?.total_discount ??
              0
            ),

          tax:
            Number(
              payload?.tax ??
              0
            ),

          total_price:
            Number(
              payload?.total_price ??
              0
            ),

          rto_prediction:
            payload?.rtoPrediction != null
              ? String(
                  payload.rtoPrediction
                ).trim()
              : null,

          billing_address:
            payload?.billing_address ??
            null,

          shipping_address:
            payload?.shipping_address ??
            null,

          items,

          cart_attributes:
            payload?.cart_attributes ??
            null,

          raw_payload:
            payload,

          processed:
            false,

        })
        .select("id")
        .single();


      /*
       * ---------------------------------------------------
       * HANDLE INSERT ERROR
       * ---------------------------------------------------
       */

      if (insertError) {

        /*
         * Another webhook request may have inserted the
         * same cart_id simultaneously.
         */

        if (
          insertError.code ===
          "23505"
        ) {

          const {
            data: duplicateOrder,
            error:
              duplicateLookupError,
          } = await supabase
            .from("fastrr_orders")
            .select(
              "id, processed"
            )
            .eq(
              "cart_id",
              cartId
            )
            .maybeSingle();


          if (
            duplicateLookupError ||
            !duplicateOrder
          ) {

            console.error(
              "Duplicate FASTRR order could not be retrieved.",
              {
                insertError,
                duplicateLookupError,
              }
            );

            return jsonResponse(
              {
                success: false,
                error:
                  "Unable to retrieve duplicate FASTRR order.",
              },
              500
            );

          }


          stagingId =
            duplicateOrder.id;

        } else {

          console.error(
            "Failed to stage FASTRR order:",
            insertError
          );

          return jsonResponse(
            {
              success: false,
              received: true,
              cart_id: cartId,
              error:
                "Unable to store FASTRR order.",
              details:
                insertError.message,
            },
            500
          );

        }

      } else {

        stagingId =
          stagedOrder.id;

      }

    }


    /*
     * =====================================================
     * PROCESS THE FASTRR ORDER
     * =====================================================
     */

    console.log(
      "Processing FASTRR order...",
      {
        cart_id: cartId,
        staging_id: stagingId,
      }
    );


    const {
      data: orderId,
      error: processError,
    } = await supabase.rpc(
      "process_fastrr_order",
      {
        p_fastrr_order_id:
          stagingId,
      }
    );


    /*
     * =====================================================
     * PROCESSING FAILURE
     * =====================================================
     */

    if (processError) {

      console.error(
        "FASTRR order processing failed:",
        processError
      );


      /*
       * Save the processing error on the staging row.
       *
       * We do NOT mark processed=true.
       */

      const {
        error:
          updateError,
      } = await supabase
        .from("fastrr_orders")
        .update({
          processing_error:
            processError.message,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          stagingId
        );


      if (updateError) {

        console.error(
          "Unable to save FASTRR processing error:",
          updateError
        );

      }


      return jsonResponse(
        {
          success: false,
          received: true,
          staged: true,
          processed: false,
          cart_id: cartId,
          staging_id: stagingId,
          error:
            "FASTRR order was received but could not be processed.",
          details:
            processError.message,
        },
        500
      );

    }


    /*
     * =====================================================
     * VERIFY PROCESSED STATE
     * =====================================================
     */

    const {
      data: processedRecord,
      error:
        processedRecordError,
    } = await supabase
      .from("fastrr_orders")
      .select(
        "processed, processed_at, processing_error"
      )
      .eq(
        "id",
        stagingId
      )
      .single();


    if (
      processedRecordError
    ) {

      console.error(
        "Unable to verify FASTRR processing state:",
        processedRecordError
      );

      return jsonResponse(
        {
          success: false,
          received: true,
          cart_id: cartId,
          staging_id: stagingId,
          processed: false,
          order_id: orderId,
          error:
            "Order was processed but processing state could not be verified.",
        },
        500
      );

    }


    /*
     * =====================================================
     * FINAL SUCCESS
     * =====================================================
     */

    console.log(
      "================================================="
    );

    console.log(
      "FASTRR ORDER PROCESSED SUCCESSFULLY"
    );

    console.log(
      JSON.stringify(
        {
          cart_id: cartId,
          staging_id: stagingId,
          order_id: orderId,
          processed:
            processedRecord.processed,
        },
        null,
        2
      )
    );

    console.log(
      "================================================="
    );


    return jsonResponse(
      {
        success: true,
        received: true,
        staged: true,
        processed:
          processedRecord.processed,
        cart_id: cartId,
        staging_id: stagingId,
        order_id: orderId,
        processed_at:
          processedRecord.processed_at,
        message:
          "FASTRR order received and T&M order created successfully.",
      },
      200
    );

  }

  catch (error) {

    console.error(
      "FASTRR webhook error:",
      error
    );


    return jsonResponse(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to process FASTRR webhook.",
      },
      500
    );

  }

});