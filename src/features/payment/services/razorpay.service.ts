import {
  supabase,
} from "@/shared/lib/supabase";


async function getFunctionErrorMessage(
  error: any
): Promise<string> {

  /*
   * Supabase FunctionsHttpError keeps the actual Edge Function
   * Response in error.context. Read it so the UI can show the
   * real server-side error instead of only:
   *
   * "Edge Function returned a non-2xx status code"
   */

  try {

    const response =
      error?.context;

    if (
      response &&
      typeof response.json === "function"
    ) {

      const body =
        await response.json();

      if (
        typeof body?.error === "string"
      ) {

        return body.error;

      }

      if (
        typeof body?.message === "string"
      ) {

        return body.message;

      }

      if (
        body?.error?.description
      ) {

        return String(
          body.error.description
        );

      }

      if (
        body?.error?.message
      ) {

        return String(
          body.error.message
        );

      }

      return JSON.stringify(body);

    }

  } catch (
    parseError
  ) {

    console.error(
      "Could not parse Edge Function error response:",
      parseError
    );

  }


  return (
    error?.message ||
    "Edge Function request failed."
  );

}


export async function createRazorpayOrder(
  checkoutQuoteId: string
) {

  if (!checkoutQuoteId) {

    throw new Error(
      "Secure checkout quote is required."
    );

  }


  const {
    data,
    error,
  } = await supabase.functions.invoke(

    "create-razorpay-order",

    {
      body: {
        checkoutQuoteId,
      },
    }

  );


  if (error) {

    console.error(
      "create-razorpay-order Edge Function error:",
      error
    );

    throw new Error(
      await getFunctionErrorMessage(
        error
      )
    );

  }


  if (data?.error) {

    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Unable to create Razorpay order."
    );

  }


  if (
    !data?.id ||
    !data?.amount
  ) {

    throw new Error(
      "Invalid Razorpay order response."
    );

  }


  return data;

}


export async function verifyRazorpayPayment(
  paymentData: any
) {

  const {
    data,
    error,
  } = await supabase.functions.invoke(

    "verify-razorpay-payment",

    {
      body: paymentData,
    }

  );


  if (error) {

    console.error(
      "verify-razorpay-payment Edge Function error:",
      error
    );

    throw new Error(
      await getFunctionErrorMessage(
        error
      )
    );

  }


  if (data?.error) {

    throw new Error(
      typeof data.error === "string"
        ? data.error
        : "Payment verification failed."
    );

  }


  return data;

}
