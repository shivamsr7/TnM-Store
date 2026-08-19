import { supabase } from "@/shared/lib/supabase";


interface CheckDeliveryItem {

  productId: string;

  quantity: number;

}


interface CheckDeliveryPayload {

  pincode: string;

  weight?: number;

  customerId?: string | null;

  paymentMethod?: string;

  items?: CheckDeliveryItem[];

}



export const shippingService = {

  async checkDelivery({

    pincode,

    weight = 0.25,

    customerId = null,

    paymentMethod = "prepaid",

    items = [],

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

          customer_id: customerId,

          payment_method:
            paymentMethod,

          items:

            items.map(
              item => ({
                product_id:
                  item.productId,

                quantity:
                  item.quantity,

              })
            ),

        },

      }

    );





    if (error) {

      throw error;

    }





    return data;

  },


};
