import {
  supabase
} from "@/shared/lib/supabase";

import type {
  CreateOrderPayload
} from "../types/order.types";

import {
  notificationService
} from "@/features/notifications/services/notification.service";





function generateOrderNumber() {

  return `TNM-${Date.now()}`;

}







async function createOrderActivity({

  orderId,

  eventType,

  title,

  description,

  metadata

}: {

  orderId: string;

  eventType: string;

  title: string;

  description?: string;

  metadata?: Record<string, unknown>;

}) {





  const {

    data: {

      user

    }

  } = await supabase.auth.getUser();





  const {

    error

  } = await supabase

    .from("order_activity")

    .insert({

      order_id:
        orderId,

      event_type:
        eventType,

      title,

      description:
        description ?? null,

      metadata:
        metadata ?? {},

      created_by:
        user?.id ?? null

    });





  if (error) {

    console.error(

      "Create activity failed:",

      error

    );

  }

}







export async function createOrder(
  payload: CreateOrderPayload
) {

  /*
   * A checkout quote is required for the secure order transaction.
   */
  if (!payload.checkoutQuoteId) {

    throw new Error(
      "Checkout quote is missing. Please return to the address step and try again."
    );

  }


  const paymentTransactionId =
    payload.paymentTransactionId ??
    null;


  /*
   * =========================================================
   * PAYMENT IDEMPOTENCY PRE-CHECK
   * =========================================================
   *
   * If Razorpay payment succeeded but the previous frontend
   * request failed after the database created the order, a
   * retry must return the existing order without repeating
   * activities, notifications or emails.
   */

  if (paymentTransactionId) {

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase
      .from("orders")
      .select("id, order_number")
      .eq(
        "payment_transaction_id",
        paymentTransactionId
      )
      .maybeSingle();


    if (existingOrderError) {

      console.error(
        "Existing payment order lookup failed:",
        existingOrderError
      );

      throw existingOrderError;

    }


    if (existingOrder) {

      return {

        orderId:
          existingOrder.id,

        orderNumber:
          existingOrder.order_number,

        alreadyExisted:
          true,

      };

    }

  }


  const orderNumber =
    generateOrderNumber();


  const orderData = {

    // Order

    order_number:
      orderNumber,

    /*
     * Secure checkout quote.
     *
     * create_order_transaction() recalculates the authoritative
     * pricing server-side.
     */

    checkout_quote_id:
      payload.checkoutQuoteId,


    // Customer

    customer_id:
      payload.customerId ?? null,

    customer_name:
      payload.customer.name,

    customer_email:
      payload.customer.email ?? null,

    customer_phone:
      payload.customer.phone,


    // Amounts
    //
    // Retained for backwards compatibility. The secure RPC
    // remains the source of truth.

    subtotal:
      payload.subtotal,

    discount:
      payload.discount,

    shipping_charge:
      payload.shippingCharge,

    tax:
      payload.tax,

    total_amount:
      payload.totalAmount,


    // Payment

    advance_amount:
      payload.advanceAmount,

    remaining_amount:
      payload.totalAmount -
      payload.advanceAmount,

    payment_method:
      payload.paymentMethod,

    payment_transaction_id:
      paymentTransactionId,


    // Coupon

    coupon_id:
      payload.coupon?.id ??
      null,

    coupon_code:
      payload.coupon?.code ??
      null,


    // Shipping

    shipping_full_name:
      payload.shipping.fullName,

    shipping_phone:
      payload.shipping.phone,

    shipping_address:
      payload.shipping.address,

    shipping_city:
      payload.shipping.city,

    shipping_state:
      payload.shipping.state,

    shipping_pincode:
      payload.shipping.pincode,

    shipping_landmark:
      payload.shipping.landmark ??
      null,


    // Items

    items:

      payload.items.map(
        item => ({

          product_id:
            item.productId,

          product_name:
            item.productName,

          product_image:
            item.productImage ??
            null,

          price:
            item.price,

          quantity:
            item.quantity,

          total:
            item.total,

        })
      )

  };


  const {
    data,
    error,
  } = await supabase.rpc(
    "create_order_transaction",
    {
      order_data:
        orderData,
    }
  );


  if (error) {

    console.error(
      "Create order transaction failed:",
      error
    );

    /*
     * One final lookup protects the frontend from treating a
     * successful database insert as a failed payment/order when
     * the RPC response itself was interrupted.
     */
    if (paymentTransactionId) {

      const {
        data: recoveredOrder,
        error: recoveryLookupError,
      } = await supabase
        .from("orders")
        .select("id, order_number")
        .eq(
          "payment_transaction_id",
          paymentTransactionId
        )
        .maybeSingle();


      if (
        !recoveryLookupError &&
        recoveredOrder
      ) {

        return {

          orderId:
            recoveredOrder.id,

          orderNumber:
            recoveredOrder.order_number,

          alreadyExisted:
            true,

        };

      }

    }


    throw error;

  }


  const orderId =
    data;


  /*
   * Fetch the authoritative order number returned/stored by the
   * database. For a brand-new order this normally matches the
   * generated value above. This also keeps the service resilient
   * if the RPC returns an already-existing order.
   */

  const {
    data: createdOrder,
    error: createdOrderLookupError,
  } = await supabase
    .from("orders")
    .select("id, order_number")
    .eq(
      "id",
      orderId
    )
    .single();


  if (createdOrderLookupError) {

    console.error(
      "Created order lookup failed:",
      createdOrderLookupError
    );

    throw createdOrderLookupError;

  }


  const finalOrderNumber =
    createdOrder.order_number ??
    orderNumber;


  // Activity 1: Order Created

  await createOrderActivity({

    orderId,

    eventType:
      "order_created",

    title:
      "Order Created",

    description:
      `Order #${finalOrderNumber} was placed successfully.`,

    metadata: {

      order_number:
        finalOrderNumber

    }

  });


  // Notification 1: Order Placed

  if (payload.customerId) {

    await notificationService.createNotification({

      customerId:
        payload.customerId,

      title:
        "Order Placed",

      message:
        `Your order #${finalOrderNumber} has been placed successfully.`,

      type:
        "order",

      referenceId:
        orderId,

    });

  }


  // Email: Complete Order Confirmation

  if (payload.customer.email) {

    await notificationService.sendOrderConfirmationEmail({

      to:
        payload.customer.email,

      customerName:
        payload.customer.name,

      orderNumber:
        finalOrderNumber,

      orderDate:
        new Date().toISOString(),

      orderStatus:
        "Order Confirmed",

      items:

        payload.items.map(
          item => ({

            productName:
              item.productName,

            productImage:
              item.productImage ??
              null,

            price:
              item.price,

            quantity:
              item.quantity,

            total:
              item.total,

          })
        ),

      subtotal:
        payload.subtotal,

      discount:
        payload.discount,

      shippingCharge:
        payload.shippingCharge,

      tax:
        payload.tax,

      totalAmount:
        payload.totalAmount,

      paymentMethod:
        payload.paymentMethod,

      advanceAmount:
        payload.advanceAmount,

      remainingAmount:
        payload.totalAmount -
        payload.advanceAmount,

      paymentTransactionId:
        paymentTransactionId,

      couponCode:
        payload.coupon?.code ??
        null,

      shipping: {

        fullName:
          payload.shipping.fullName,

        phone:
          payload.shipping.phone,

        address:
          payload.shipping.address,

        city:
          payload.shipping.city,

        state:
          payload.shipping.state,

        pincode:
          payload.shipping.pincode,

        landmark:
          payload.shipping.landmark ??
          null,

      },

    });

  }


  // Activity 2: Payment Received

  if (
    payload.paymentMethod ===
    "prepaid"
  ) {

    await createOrderActivity({

      orderId,

      eventType:
        "payment_received",

      title:
        "Payment Received",

      description:
        `Payment received for order #${finalOrderNumber}.`,

      metadata: {

        payment_method:
          "prepaid",

        transaction_id:
          paymentTransactionId

      }

    });


    // Notification 2: Payment Received

    if (payload.customerId) {

      await notificationService.createNotification({

        customerId:
          payload.customerId,

        title:
          "Payment Received",

        message:
          `Payment received for order #${finalOrderNumber}.`,

        type:
          "payment",

        referenceId:
          orderId,

      });

    }

  }


  return {

    orderId,

    orderNumber:
      finalOrderNumber,

    alreadyExisted:
      false,

  };

}

