import { supabase } from "@/shared/lib/supabase";


/*
 * =========================================================
 * CUSTOMER NOTIFY REQUEST TYPE
 * =========================================================
 */

export interface CreateNotifyRequest {

  product_id: string;

  customer_id: string | null;

  name: string;

  email: string | null;

  phone: string;

}


/*
 * =========================================================
 * NOTIFY SERVICE
 * =========================================================
 */

class NotifyService {


  /*
   * =======================================================
   * CREATE NOTIFY REQUEST
   * =======================================================
   */

  async create(
    values: CreateNotifyRequest
  ) {

    const {
      data,
      error,
    } = await supabase

      .from("notify_requests")

      .insert({

        product_id:
          values.product_id,

        customer_id:
          values.customer_id,

        name:
          values.name,

        email:
          values.email,

        phone:
          values.phone,

        status:
          "pending",

      })

      .select()

      .single();


    if (error) {

      throw error;

    }


    return data;

  }


  /*
   * =======================================================
   * CHECK LOGGED-IN CUSTOMER
   * =======================================================
   *
   * Checks:
   *
   * product_id
   * +
   * customer_id
   * +
   * status = pending
   *
   * =======================================================
   */

  async hasPendingNotify(
    productId: string,
    customerId: string
  ): Promise<boolean> {

    if (
      !productId ||
      !customerId
    ) {

      return false;

    }


    const {
      data,
      error,
    } = await supabase

      .from("notify_requests")

      .select("id")

      .eq(
        "product_id",
        productId
      )

      .eq(
        "customer_id",
        customerId
      )

      .eq(
        "status",
        "pending"
      )

      .maybeSingle();


    if (error) {

      throw error;

    }


    return Boolean(
      data
    );

  }


  /*
   * =======================================================
   * CHECK GUEST
   * =======================================================
   *
   * Guests don't have customer_id.
   *
   * Therefore we use:
   *
   * product_id
   * +
   * phone
   * +
   * status = pending
   *
   * =======================================================
   */

  async hasPendingGuestRequest(
    productId: string,
    phone: string
  ): Promise<boolean> {

    const normalizedPhone =
      phone.trim();


    if (
      !productId ||
      !normalizedPhone
    ) {

      return false;

    }


    const {
      data,
      error,
    } = await supabase

      .from("notify_requests")

      .select("id")

      .eq(
        "product_id",
        productId
      )

      .eq(
        "phone",
        normalizedPhone
      )

      .eq(
        "status",
        "pending"
      )

      .maybeSingle();


    if (error) {

      throw error;

    }


    return Boolean(
      data
    );

  }

}


/*
 * =========================================================
 * EXPORT
 * =========================================================
 */

export const notifyService =
  new NotifyService();