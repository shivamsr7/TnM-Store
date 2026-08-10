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
   * Normalize incoming phone.
   */

  const normalizedPhone =
    normalizePhone(
      phone
    );


  console.log(
    "[AUTH TEST] Normalized phone:",
    normalizedPhone
  );


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
   * ALL POSSIBLE DATABASE FORMATS
   * =======================================================
   */

  const phoneVariants = [

    normalizedPhone,

    `+91${normalizedPhone}`,

    `91${normalizedPhone}`,

  ];


  console.log(
    "[AUTH TEST] Phone variants:",
    phoneVariants
  );


  /*
   * =======================================================
   * SUPABASE QUERY
   * =======================================================
   */

  console.log(
    "[AUTH TEST] Sending Supabase query..."
  );


  const {
    data,
    error,
  } =
    await supabase
      .from("customers")
      .select("*")
      .is(
        "deleted_at",
        null
      )
      .in(
        "phone",
        phoneVariants
      )
      .limit(1)
      .maybeSingle();


  /*
   * =======================================================
   * QUERY ERROR
   * =======================================================
   */

  if (
    error
  ) {

    console.error(
      "[AUTH TEST] SUPABASE ERROR:",
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


    console.log(
      "=========================================="
    );


    throw error;

  }


  /*
   * =======================================================
   * QUERY RESULT
   * =======================================================
   */

  console.log(
    "[AUTH TEST] Supabase customer result:",
    data
  );


  if (
    data
  ) {

    console.log(
      "[AUTH TEST] EXISTING CUSTOMER FOUND ✅"
    );


    console.log(
      "[AUTH TEST] Customer ID:",
      data.id
    );


    console.log(
      "[AUTH TEST] Customer phone stored in DB:",
      data.phone
    );


    console.log(
      "[AUTH TEST] Customer name:",
      data.first_name,
      data.last_name
    );

  } else {

    console.warn(
      "[AUTH TEST] NO CUSTOMER FOUND ❌"
    );

  }


  console.log(
    "[AUTH TEST] getCustomerByPhone END"
  );


  console.log(
    "=========================================="
  );


  return data;

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


  const normalizedPhone =
    normalizePhone(
      customer.phone
    );


  console.log(
    "[AUTH TEST] createCustomer normalized phone:",
    normalizedPhone
  );


  if (
    normalizedPhone.length !== 10
  ) {

    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );

  }


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
      "[AUTH TEST] createCustomer error:",
      error
    );


    throw error;

  }


  console.log(
    "[AUTH TEST] Customer created:",
    data
  );


  return data;

}