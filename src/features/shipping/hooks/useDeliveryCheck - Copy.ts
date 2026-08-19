import {
  useMutation

} from "@tanstack/react-query";


import {
  shippingService

} from "../services/shipping.service";





export function useDeliveryCheck(){



  return useMutation({



    mutationFn: ({

      pincode,

      weight,

    }:{

      pincode:string;

      weight?:number;


    }) =>


      shippingService.checkDelivery({

        pincode,

        weight,

      }),



  });


}