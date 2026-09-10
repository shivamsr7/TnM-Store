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







/**
 * Securely attach an email address to an existing order so the customer
 * can receive transactional order updates.
 *
 * The database RPC is responsible for authorization:
 * - authenticated customers are verified against auth.uid()
 * - guests must provide the phone number associated with the order
 *
 * Do not update `orders.customer_email` directly from the browser.
 */
export async function saveOrderEmail({
  orderNumber,
  email,
  phone,
  updateCustomerEmail = false,
}: {
  orderNumber: string;
  email: string;
  phone?: string | null;
  updateCustomerEmail?: boolean;
}) {
  const normalizedOrderNumber =
    orderNumber.trim();

  const normalizedEmail =
    email.trim().toLowerCase();

  const normalizedPhone =
    phone?.replace(/\D/g, "") || null;

  if (!normalizedOrderNumber) {
    throw new Error(
      "Order number is required."
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail
    )
  ) {
    throw new Error(
      "Please enter a valid email address."
    );
  }

  if (
    normalizedPhone !== null &&
    normalizedPhone.length > 0 &&
    normalizedPhone.length !== 10
  ) {
    throw new Error(
      "Please enter a valid 10-digit phone number."
    );
  }

  const {
    data,
    error,
  } = await supabase.rpc(
    "save_order_email",
    {
      p_order_number:
        normalizedOrderNumber,
      p_email:
        normalizedEmail,
      p_phone:
        normalizedPhone,
      p_update_customer_email:
        Boolean(updateCustomerEmail),
    }
  );

  if (error) {
    console.error(
      "Save order email failed:",
      error
    );

    throw new Error(
      error.message ||
      "We couldn't save your email. Please try again."
    );
  }

  return data;
}



async function getWalletPaymentAmount(
  orderId: string
): Promise<number> {
  try {
    const {
      data,
      error,
    } = await supabase.rpc(
      "get_order_wallet_payment",
      {
        p_order_id:
          orderId,
      }
    );

    if (error) {
      console.error(
        "⚠️ Failed to fetch wallet payment amount:",
        error
      );
      return 0;
    }

    const row =
      Array.isArray(data)
        ? data[0]
        : data;

    return Math.max(
      0,
      Number(
        row?.wallet_amount ??
        0
      )
    );
  } catch (error) {
    console.error(
      "⚠️ Wallet payment lookup failed:",
      error
    );
    return 0;
  }
}


async function getWalletBalanceRemaining(
  customerId: string | null
): Promise<number | null> {
  if (!customerId) {
    return null;
  }

  try {
    const {
      data,
      error,
    } = await supabase.rpc(
      "admin_get_customer_wallet",
      {
        p_customer_id:
          customerId,
      }
    );

    if (error) {
      console.error(
        "⚠️ Failed to fetch wallet balance remaining:",
        error
      );
      return null;
    }

    const wallet =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!wallet) {
      return null;
    }

    return Math.max(
      0,
      Number(
        wallet.balance_paise ??
        0
      ) / 100
    );
  } catch (error) {
    console.error(
      "⚠️ Wallet balance lookup failed:",
      error
    );
    return null;
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

    const normalizedPhone =
      payload.customer.phone?.replace(/\D/g, "") || null;

    const {
      data: existingOrder,
      error: existingOrderError,
    } = await supabase.rpc(
      "get_checkout_order_by_payment_transaction",
      {
        p_payment_transaction_id:
          paymentTransactionId,
        p_customer_id:
          payload.customerId ?? null,
        p_phone:
          normalizedPhone,
      }
    );


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


    /*
     * Wallet payment split.
     *
     * create_order_transaction() validates the hold against
     * the checkout quote and consumes it atomically with the
     * order transaction.
     */
    wallet_hold_id:
      payload.wallet_hold_id ??
      null,

    wallet_amount_paise:
      payload.wallet_amount_paise ??
      0,


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

          ring_size:
            item.ringSize ??
            null,

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

      const normalizedPhone =
        payload.customer.phone?.replace(/\D/g, "") || null;

      const {
        data: recoveredOrder,
        error: recoveryLookupError,
      } = await supabase.rpc(
        "get_checkout_order_by_payment_transaction",
        {
          p_payment_transaction_id:
            paymentTransactionId,
          p_customer_id:
            payload.customerId ?? null,
          p_phone:
            normalizedPhone,
        }
      );


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

  const normalizedPhone =
    payload.customer.phone?.replace(/\D/g, "") || null;

  const {
    data: createdOrder,
    error: createdOrderLookupError,
  } = await supabase.rpc(
    "get_checkout_order",
    {
      p_order_id:
        orderId,
      p_customer_id:
        payload.customerId ?? null,
      p_phone:
        normalizedPhone,
    }
  );


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


  /*
   * Gift Wrap values come from the created order so the
   * first customer email uses the server-authoritative amount.
   */
  const finalGiftWrapAmount =
    Number(
      createdOrder.gift_wrap_amount ??
      0
    );

  const finalGiftMessage =
    createdOrder.gift_wrap
      ? (
          createdOrder.gift_message ??
          null
        )
      : null;


  /*
   * First customer email after checkout.
   *
   * This intentionally uses the unified order-status email with
   * status = "placed", so the first email is "Order Placed".
   *
   * The later admin lifecycle transition to "confirmed" sends the
   * separate Order Confirmed email.
   */
  if (payload.customer.email) {

    const walletPaymentAmount =
      await getWalletPaymentAmount(
        orderId
      );

    const walletBalanceRemaining =
      await getWalletBalanceRemaining(
        payload.customerId ??
        null
      );

    const finalSubtotal =
      Number(
        createdOrder.subtotal ??
        payload.subtotal
      );

    const finalDiscount =
      Number(
        createdOrder.discount ??
        payload.discount
      );

    const finalShippingCharge =
      Number(
        createdOrder.shipping_charge ??
        payload.shippingCharge
      );

    const finalTax =
      Number(
        createdOrder.tax ??
        payload.tax
      );

    const finalTotalAmount =
      Number(
        createdOrder.total_amount ??
        payload.totalAmount
      );

    /*
     * For prepaid orders:
     *   Total Paid = actual Razorpay amount
     *              = Order Total - Wallet Used
     *
     * For partial COD:
     *   Total Paid = advance amount
     *
     * The notification service handles this calculation while
     * displaying Wallet Used separately.
     */
    const finalAdvanceAmount =
      Number(
        payload.advanceAmount ??
        0
      );

    const finalRemainingAmount =
      Math.max(
        0,
        finalTotalAmount -
        finalAdvanceAmount
      );

    const finalCustomerEmail =
      payload.customer.email.trim();

    const finalCustomerName =
      payload.customer.name;

    const finalOrderDate =
      createdOrder.created_at ??
      new Date().toISOString();

    const finalPaymentMethod =
      payload.paymentMethod;

    const finalCouponCode =
      payload.coupon?.code ??
      null;

    const finalShipping = {
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
    };

    const finalItems =
      payload.items.map(
        item => ({
          productName:
            item.productName,

          productImage:
            item.productImage ??
            null,

          price:
            Number(
              item.price
            ),

          quantity:
            item.quantity,

          total:
            Number(
              item.total
            ),
        })
      );

    try {

      const result =
        await notificationService.sendOrderStatusEmail({

          to:
            finalCustomerEmail,

          customerName:
            finalCustomerName,

          orderNumber:
            finalOrderNumber,

          orderDate:
            finalOrderDate,

          status:
            "placed",

          items:
            finalItems,

          subtotal:
            finalSubtotal,

          discount:
            finalDiscount,

          shippingCharge:
            finalShippingCharge,

          giftWrapAmount:
            finalGiftWrapAmount,

          giftMessage:
            finalGiftMessage,

          tax:
            finalTax,

          totalAmount:
            finalTotalAmount,

          paymentMethod:
            finalPaymentMethod,

          advanceAmount:
            finalAdvanceAmount,

          remainingAmount:
            finalRemainingAmount,

          paymentTransactionId:
            paymentTransactionId,

          couponCode:
            finalCouponCode,

          walletAmount:
            walletPaymentAmount,

          walletBalanceRemaining:
            walletBalanceRemaining,

          shipping:
            finalShipping,

          courierName:
            null,

          trackingNumber:
            null,

          reviewLinks:
            [],

        });

      console.log(
        "✅ Order placed email request completed:",
        result
      );

    } catch (error) {

      /*
       * The order has already been created successfully.
       * Do not fail checkout because the transactional email
       * provider/service is temporarily unavailable.
       */
      console.error(
        "❌ Order placed email failed:",
        error
      );

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