import {
  supabase
} from "@/shared/lib/supabase";





export type NotificationType =
  | "order"
  | "payment"
  | "reward"
  | "shipping"
  | "system";





export interface CreateNotificationPayload {


  customerId:string;


  title:string;


  message:string;


  type:NotificationType;


  referenceId?:string | null;


}









class NotificationService {






  async createNotification({

    customerId,

    title,

    message,

    type,

    referenceId=null,

  }:CreateNotificationPayload){



    const {

      error

    } = await supabase

      .from("notifications")

      .insert({


        customer_id:
        customerId,


        title,


        message,


        type,


        reference_id:
        referenceId,


      });





    if(error)

      throw error;



  }









  async getCustomerNotifications(

    customerId:string

  ){



    const {

      data,

      error

    } = await supabase

      .from("notifications")

      .select("*")

      .eq(

        "customer_id",

        customerId

      )

      .order(

        "created_at",

        {

          ascending:false

        }

      );





    if(error)

      throw error;



    return data ?? [];



  }









  async getUnreadCount(

    customerId:string

  ){



    const {

      count,

      error

    } = await supabase

      .from("notifications")

      .select(

        "id",

        {

          count:"exact",

          head:true

        }

      )

      .eq(

        "customer_id",

        customerId

      )

      .eq(

        "is_read",

        false

      );





    if(error)

      throw error;



    return count ?? 0;



  }









  async markAsRead(

    notificationId:string

  ){



    const {

      error

    } = await supabase

      .from("notifications")

      .update({

        is_read:true

      })

      .eq(

        "id",

        notificationId

      );





    if(error)

      throw error;



  }









  async markAllAsRead(

    customerId:string

  ){



    const {

      error

    } = await supabase

      .from("notifications")

      .update({

        is_read:true

      })

      .eq(

        "customer_id",

        customerId

      )

      .eq(

        "is_read",

        false

      );





    if(error)

      throw error;



  }







}



export const notificationService =
new NotificationService();