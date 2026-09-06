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
   * GET CURRENT AUTH USER
   * ---------------------------------------------------------
   */

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();


  if (
    authError
  ) {

    console.error(
      "[T&M AUTH] Auth user query error:",
      authError
    );

    throw authError;

  }


  const authUser =
    authData.user;


  /*
   * A customer record is identified by the
   * authenticated Supabase Auth user.
   */

  if (
    !authUser
  ) {

    console.log(
      "[T&M AUTH] No authenticated user"
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
    error
  } =
    await supabase
      .from("customers")
      .select("*")
      .eq(
        "auth_user_id",
        authUser.id
      )
      .eq(
        "phone",
        normalizedPhone
      )
      .is(
        "deleted_at",
        null
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
   * ---------------------------------------------------------
   * GET CURRENT AUTH USER
   * ---------------------------------------------------------
   */

  const {
    data: authData,
    error: authError,
  } =
    await supabase.auth.getUser();


  if (
    authError
  ) {

    console.error(
      "[T&M AUTH] Auth user query error:",
      authError
    );

    throw authError;

  }


  const authUser =
    authData.user;


  if (
    !authUser
  ) {

    throw new Error(
      "Please complete login before creating your customer profile."
    );

  }


  /*
   * Create new customer and bind it to the
   * authenticated Supabase Auth user.
   */

  const {
    data,
    error
  } =
    await supabase
      .from("customers")
      .insert({

        auth_user_id:
          authUser.id,

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


/*
 * =========================================================
 * CREATE GUEST CUSTOMER
 * =========================================================
 *
 * Guest customers are stored in the existing customers table
 * through the secure create_guest_customer RPC.
 *
 * Unlike createCustomer(), this function does not require
 * a Supabase Auth user.
 */

export async function createGuestCustomer(
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


  const firstName =
    customer.first_name?.trim();


  if (
    !firstName
  ) {

    throw new Error(
      "Please enter your full name."
    );

  }


  const lastName =
    customer.last_name?.trim() ||
    null;


  const email =
    customer.email?.trim().toLowerCase() ||
    null;


  if (
    email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {

    throw new Error(
      "Please enter a valid email address."
    );

  }


  /*
   * Guest customers are created through the secure
   * SECURITY DEFINER RPC because unauthenticated users
   * cannot directly insert into the customers table.
   */

  const {
    data,
    error
  } =
    await supabase.rpc(
      "create_guest_customer",
      {
        p_first_name:
          firstName,

        p_phone:
          normalizedPhone,

        p_last_name:
          lastName,

        p_email:
          email,
      }
    );


  if (
    error
  ) {

    console.error(
      "[T&M GUEST] Create guest customer error:",
      error
    );

    throw new Error(
      error.message ||
      "Unable to continue as guest. Please try again."
    );

  }


  if (
    !data
  ) {

    throw new Error(
      "Unable to create guest customer. Please try again."
    );

  }


  console.log(
    "[T&M GUEST] Guest customer created:",
    data.id
  );


  return data;

}


/*
 * =========================================================
 * SEND GUEST OTP
 * =========================================================
 *
 * Uses Supabase Phone OTP only for verification.
 * The guest is NOT made a T&M Member by this flow.
 */

export async function sendGuestOtp(
  phone: string
) {

  const normalizedPhone =
    normalizePhone(phone);

  if (
    normalizedPhone.length !== 10
  ) {
    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );
  }

  const phoneWithCountryCode =
    `+91${normalizedPhone}`;

  const {
    error
  } =
    await supabase.auth.signInWithOtp({
      phone: phoneWithCountryCode,
    });

  if (
    error
  ) {
    console.error(
      "[T&M GUEST] Send OTP failed:",
      error
    );

    throw new Error(
      error.message ||
      "Unable to send OTP. Please try again."
    );
  }

  return {
    phone: normalizedPhone,
    sent: true,
  };

}


/*
 * =========================================================
 * VERIFY GUEST OTP
 * =========================================================
 *
 * Supabase verifies the OTP first. Once verified, the secure
 * RPC marks the existing guest customer as phone_verified.
 *
 * IMPORTANT:
 * We intentionally DO NOT sign out the Supabase Auth session
 * here.
 *
 * The verified session must remain alive for the entire
 * checkout flow so the customer can:
 *
 *   Guest OTP verification
 *        ↓
 *   Continue as Guest OR become a Member
 *        ↓
 *   Address
 *        ↓
 *   Payment
 *        ↓
 *   Order completion
 *
 * CheckoutDialog is responsible for signing the session out
 * when the checkout is closed while the customer is still a
 * Guest. The session must never be signed out immediately
 * after OTP verification.
 */

export async function verifyGuestOtp(
  phone: string,
  otp: string,
  _options?: {
    keepSession?: boolean;
  }
) {

  const normalizedPhone =
    normalizePhone(phone);

  const normalizedOtp =
    String(otp || "")
      .replace(/\D/g, "")
      .slice(0, 6);

  if (
    normalizedPhone.length !== 10
  ) {
    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );
  }

  if (
    normalizedOtp.length !== 6
  ) {
    throw new Error(
      "Please enter the 6-digit OTP."
    );
  }

  const {
    data,
    error
  } =
    await supabase.auth.verifyOtp({
      phone: `+91${normalizedPhone}`,
      token: normalizedOtp,
      type: "sms",
    });

  if (
    error
  ) {
    console.error(
      "[T&M GUEST] OTP verification failed:",
      error
    );

    throw new Error(
      error.message ||
      "Invalid OTP. Please try again."
    );
  }

  if (
    !data.user
  ) {
    throw new Error(
      "Phone verification could not be completed. Please try again."
    );
  }

  const {
    data: verificationData,
    error: verificationError,
  } =
    await supabase.rpc(
      "verify_guest_customer_phone",
      {
        p_phone:
          normalizedPhone,
      }
    );

  if (
    verificationError
  ) {
    console.error(
      "[T&M GUEST] Guest phone verification RPC failed:",
      verificationError
    );

    throw new Error(
      verificationError.message ||
      "Unable to verify your guest checkout phone number."
    );
  }

  if (
    !verificationData?.verified
  ) {
    throw new Error(
      "Unable to verify your guest checkout phone number."
    );
  }

  /*
   * IMPORTANT:
   * Never sign out here.
   *
   * The verified Supabase Auth session stays active until
   * CheckoutDialog explicitly signs it out after the checkout
   * is closed or after the order/payment flow has completed.
   *
   * This is required because upgrade_guest_to_member uses
   * auth.uid() to securely convert the verified Guest into a
   * Member.
   */

  return verificationData;

}

/*
 * =========================================================
 * UPGRADE GUEST TO T&M MEMBER
 * =========================================================
 *
 * Converts the already-created guest customer record into a
 * T&M Member after the guest has successfully verified their
 * phone through OTP.
 *
 * IMPORTANT:
 * This does NOT create another customer record.
 * The existing guest customer is linked to the verified
 * Supabase Auth user through the secure RPC.
 */

export async function upgradeGuestToMember(
  phone: string
) {

  const normalizedPhone =
    normalizePhone(phone);

  if (
    normalizedPhone.length !== 10
  ) {
    throw new Error(
      "Please enter a valid 10-digit mobile number."
    );
  }

  /*
   * The OTP verification must have just authenticated the
   * Supabase Auth user. The RPC itself verifies that the Auth
   * user's phone matches this checkout phone.
   */

  const {
    data,
    error
  } =
    await supabase.rpc(
      "upgrade_guest_to_member",
      {
        p_phone:
          normalizedPhone,
      }
    );

  if (
    error
  ) {

    console.error(
      "[T&M MEMBER] Guest upgrade failed:",
      error
    );

    throw new Error(
      error.message ||
      "Unable to activate your T&M Member account. Please try again."
    );

  }

  if (
    !data?.success ||
    !data?.customer_id
  ) {

    throw new Error(
      "Unable to activate your T&M Member account. Please try again."
    );

  }

  console.log(
    "[T&M MEMBER] Guest upgraded successfully:",
    data.customer_id
  );

  return data;

}

