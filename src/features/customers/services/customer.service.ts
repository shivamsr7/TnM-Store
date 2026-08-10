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

  console.log(
    "[AUTH TEST] normalizePhone input:",
    phone
  );


  if (!phone) {

    console.log(
      "[AUTH TEST] normalizePhone result: EMPTY"
    );

    return "";

  }


  const digits =
    phone.replace(
      /\D/g,
      ""
    );


  const normalized =
    digits.length >= 10
      ? digits.slice(-10)
      : digits;


  console.log(
    "[AUTH TEST] normalizePhone result:",
    normalized
  );


  return normalized;

}


/*
 * =========================================================
 * GET CUSTOMER BY PHONE
 * =========================================================
 */

export async function getCustomerByPhone(
  phone: string
) {

  console.log(
    "=========================================="
  );

  console.log(
    "[AUTH TEST] getCustomerByPhone START"
  );

  console.log(
    "[AUTH TEST] Raw phone:",
    phone
  );


  /*
   * -------------------------------------------------------
   * Normalize phone
   * -------------------------------------------------------
   */

  const normalizedPhone =
    normalizePhone(
      phone
    );


  console.log(
    "[AUTH TEST] Normalized phone:",
    normalizedPhone
  );


  /*
   * -------------------------------------------------------
   * Validate phone
   * -------------------------------------------------------
   */

  if (
    normalizedPhone.length !== 10
  ) {

    console.warn(
      "[AUTH TEST] INVALID PHONE LENGTH:",
      normalizedPhone
    );


    return null;

  }


  /*
   * =======================================================
   * DIRECT ACTIVE CUSTOMER LOOKUP
   * =======================================================
   *
   * Active customer:
   *
   * phone = normalizedPhone
   * deleted_at IS NULL
   *
   * Soft-deleted customers are ignored.
   * =======================================================
   */

  console.log(
    "[AUTH TEST] Searching active customer..."
  );


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
   * =======================================================
   * QUERY ERROR
   * =======================================================
   */

  if (
    error
  ) {

    console.error(
      "[AUTH TEST] CUSTOMER QUERY ERROR:",
      error
    );


    console.error(
      "[AUTH TEST] Error code:",
      error.code
    );


    console.error(
      "[AUTH TEST] Error message:",
      error.message
    );


    console.error(
      "[AUTH TEST] Error details:",
      error.details
    );


    console.error(
      "[AUTH TEST] Error hint:",
      error.hint
    );


    throw error;

  }


  /*
   * =======================================================
   * NO ACTIVE CUSTOMER
   * =======================================================
   */

  if (
    !data ||
    data.length === 0
  ) {

    console.warn(
      "[AUTH TEST] NO ACTIVE CUSTOMER FOUND ❌"
    );


    console.warn(
      "[AUTH TEST] Searched phone:",
      normalizedPhone
    );


    return null;

  }


  /*
   * =======================================================
   * ACTIVE CUSTOMER FOUND
   * =======================================================
   */

  const customer =
    data[0];


  console.log(
    "[AUTH TEST] EXISTING CUSTOMER FOUND ✅"
  );


  console.log(
    "[AUTH TEST] Customer ID:",
    customer.id
  );


  console.log(
    "[AUTH TEST] Customer phone:",
    customer.phone
  );


  console.log(
    "[AUTH TEST] Customer name:",
    customer.first_name,
    customer.last_name
  );


  console.log(
    "[AUTH TEST] Customer deleted_at:",
    customer.deleted_at
  );


  console.log(
    "[AUTH TEST] getCustomerByPhone END"
  );


  console.log(
    "=========================================="
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

  console.log(
    "[AUTH TEST] createCustomer input:",
    customer
  );


  /*
   * -------------------------------------------------------
   * Normalize phone
   * -------------------------------------------------------
   */

  const normalizedPhone =
    normalizePhone(
      customer.phone
    );


  console.log(
    "[AUTH TEST] createCustomer normalized phone:",
    normalizedPhone
  );


  /*
   * -------------------------------------------------------
   * Validate phone
   * -------------------------------------------------------
   */

  if (
    normalizedPhone.length !== 10
  ) {

    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );

  }


  /*
   * =======================================================
   * CREATE CUSTOMER
   * =======================================================
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


  /*
   * =======================================================
   * INSERT ERROR
   * =======================================================
   */

  if (
    error
  ) {

    console.error(
      "[AUTH TEST] createCustomer error:",
      error
    );


    throw error;

  }


  /*
   * =======================================================
   * CUSTOMER CREATED
   * =======================================================
   */

  console.log(
    "[AUTH TEST] Customer created:",
    data
  );


  return data;

}