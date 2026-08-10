import {
  supabase,
} from "@/shared/lib/supabase";


/*
 * =========================================================
 * NORMALIZE PHONE
 * =========================================================
 */

export function normalizePhone(
  phone?: string | null
) {

  if (!phone) {
    return "";
  }

  const digits =
    phone.replace(
      /\D/g,
      ""
    );

  return digits.slice(-10);
}


/*
 * =========================================================
 * GET CUSTOMER BY PHONE
 * =========================================================
 */

export async function getCustomerByPhone(
  phone: string
) {

  const normalizedPhone =
    normalizePhone(phone);


  console.log(
    "[T&M AUTH] Phone:",
    normalizedPhone
  );


  if (
    normalizedPhone.length !== 10
  ) {

    console.log(
      "[T&M AUTH] Invalid phone"
    );

    return null;

  }


  /*
   * ---------------------------------------------------------
   * DIRECT ACTIVE CUSTOMER QUERY
   * ---------------------------------------------------------
   */

  const {
    data,
    error,
  } =
    await supabase
      .from("customers")
      .select("*")
      .eq(
        "phone",
        normalizedPhone
      )
      .is(
        "deleted_at",
        null
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      )
      .limit(1);


  /*
   * ---------------------------------------------------------
   * REAL DATABASE ERROR
   * ---------------------------------------------------------
   */

  if (
    error
  ) {

    console.error(
      "[T&M AUTH] Customer query error:",
      error
    );

    throw error;

  }


  /*
   * ---------------------------------------------------------
   * CUSTOMER NOT FOUND
   * ---------------------------------------------------------
   */

  if (
    !data ||
    data.length === 0
  ) {

    console.log(
      "[T&M AUTH] No active customer found"
    );

    return null;

  }


  /*
   * ---------------------------------------------------------
   * CUSTOMER FOUND
   * ---------------------------------------------------------
   */

  const customer =
    data[0];


  console.log(
    "[T&M AUTH] Customer found:",
    customer.id
  );


  console.log(
    "[T&M AUTH] Customer phone:",
    customer.phone
  );


  console.log(
    "[T&M AUTH] Deleted at:",
    customer.deleted_at
  );


  return customer;

}


/*
 * =========================================================
 * CREATE CUSTOMER
 * =========================================================
 */

export async function createCustomer(
  customer: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone: string;
  }
) {

  const normalizedPhone =
    normalizePhone(
      customer.phone
    );


  if (
    normalizedPhone.length !== 10
  ) {

    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );

  }


  /*
   * Check whether an active customer already exists.
   */

  const existingCustomer =
    await getCustomerByPhone(
      normalizedPhone
    );


  if (
    existingCustomer
  ) {

    return existingCustomer;

  }


  /*
   * Create new customer.
   */

  const {
    data,
    error,
  } =
    await supabase
      .from("customers")
      .insert({

        first_name:
          customer.first_name,

        last_name:
          customer.last_name ||
          null,

        email:
          customer.email ||
          null,

        phone:
          normalizedPhone,

        phone_verified:
          true,

        last_login_at:
          new Date().toISOString(),

      })
      .select()
      .single();


  if (
    error
  ) {

    console.error(
      "[T&M AUTH] Create customer error:",
      error
    );

    throw error;

  }


  return data;

}