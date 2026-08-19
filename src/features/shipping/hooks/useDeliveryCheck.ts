import {
  useMutation
} from "@tanstack/react-query";


import {
  shippingService
} from "../services/shipping.service";


interface DeliveryCheckItem {

  productId: string;

  quantity: number;

}


interface DeliveryCheckParams {

  pincode: string;

  weight?: number;

  customerId?: string | null;

  paymentMethod?: string;

  items?: DeliveryCheckItem[];

}



export function useDeliveryCheck(){



  return useMutation({



    mutationFn: ({

      pincode,

      weight,

      customerId,

      paymentMethod,

      items,

    }: DeliveryCheckParams) =>


      shippingService.checkDelivery({

        pincode,

        weight,

        customerId,

        paymentMethod,

        items,

      }),



  });


}
