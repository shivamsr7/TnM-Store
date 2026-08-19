import { supabase } from "@/shared/lib/supabase";


interface CheckDeliveryPayload {

  pincode: string;

  weight?: number;

}



export const shippingService = {


  async checkDelivery({

    pincode,

    weight = 0.25,

  }: CheckDeliveryPayload) {



    const {
      data,
      error,

    } = await supabase.functions.invoke(

      "check-delivery",

      {

        body: {

          customer_pincode: pincode,

          weight,

        },

      }

    );





    if (error) {

      throw error;

    }





    return data;

  },


};