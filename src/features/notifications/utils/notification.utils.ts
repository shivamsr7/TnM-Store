import {
  Package,
  CreditCard,
  Gift,
  Truck,
  Bell
} from "lucide-react";


export function getNotificationIcon(type:string){


switch(type){


case "payment":

return CreditCard;


case "reward":

return Gift;


case "shipping":

return Truck;


case "order":

return Package;


default:

return Bell;


}


}



export function getNotificationColor(type:string){


switch(type){


case "payment":

return "bg-emerald-100 text-emerald-700";


case "reward":

return "bg-purple-100 text-purple-700";


case "shipping":

return "bg-blue-100 text-blue-700";


case "order":

return "bg-[#C8A44D]/20 text-[#C8A44D]";


default:

return "bg-neutral-100 text-neutral-700";


}


}