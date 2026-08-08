import {
  useMutation,
  useQuery,
  useQueryClient
} from "@tanstack/react-query";


import {
  notificationService
} from "../services/notification.service";





export function useCustomerNotifications(
  customerId?:string
){


return useQuery({

queryKey:[
"notifications",
customerId
],


queryFn:()=>


notificationService
.getCustomerNotifications(
customerId!
),


enabled:
!!customerId


});


}








export function useUnreadNotificationsCount(
customerId?:string
){


return useQuery({

queryKey:[
"notifications-count",
customerId
],


queryFn:()=>


notificationService
.getUnreadCount(
customerId!
),


enabled:
!!customerId


});


}









export function useMarkNotificationRead(){


const queryClient =
useQueryClient();



return useMutation({


mutationFn:
(id:string)=>

notificationService
.markAsRead(id),



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"notifications"

]

});


queryClient.invalidateQueries({

queryKey:[
"notifications-count"

]

});


}



});


}








export function useMarkAllNotificationsRead(){


const queryClient =
useQueryClient();



return useMutation({


mutationFn:
(customerId:string)=>

notificationService
.markAllAsRead(customerId),



onSuccess:()=>{


queryClient.invalidateQueries({

queryKey:[
"notifications"

]

});


queryClient.invalidateQueries({

queryKey:[
"notifications-count"

]

});


}



});


}