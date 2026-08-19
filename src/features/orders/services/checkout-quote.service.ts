import {
  supabase
} from "@/shared/lib/supabase";



export interface FinalizedCheckoutQuote {

  quote_id:string;

  subtotal:number;

  discount:number;

  shipping_charge:number;

  tax:number;

  total_amount:number;

  coupon_id:string | null;

  coupon_code:string | null;

  free_shipping:boolean;

  free_gift:boolean;

  expires_at:string;

}



export async function finalizeCheckoutQuote({

  quoteId,

  customerId,

  couponId = null,

}:{

  quoteId:string;

  customerId:string;

  couponId?:string | null;

}):Promise<FinalizedCheckoutQuote>{

  if(!quoteId){

    throw new Error(
      "Checkout quote is missing."
    );

  }

  if(!customerId){

    throw new Error(
      "Customer is required."
    );

  }



  const {

    data,

    error

  } = await supabase.rpc(

    "finalize_checkout_quote",

    {

      p_quote_id:
        quoteId,

      p_customer_id:
        customerId,

      p_coupon_id:
        couponId,

    }

  );



  if(error)

    throw error;



  if(!data)

    throw new Error(
      "Unable to finalize checkout total."
    );



  return {

    quote_id:
      String(data.quote_id),

    subtotal:
      Number(data.subtotal ?? 0),

    discount:
      Number(data.discount ?? 0),

    shipping_charge:
      Number(data.shipping_charge ?? 0),

    tax:
      Number(data.tax ?? 0),

    total_amount:
      Number(data.total_amount ?? 0),

    coupon_id:
      data.coupon_id
        ? String(data.coupon_id)
        : null,

    coupon_code:
      data.coupon_code
        ? String(data.coupon_code)
        : null,

    free_shipping:
      Boolean(data.free_shipping),

    free_gift:
      Boolean(data.free_gift),

    expires_at:
      String(data.expires_at),

  };

}