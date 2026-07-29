import {
useQuery
} from "@tanstack/react-query";


import {
shopService
} from "../services/shop.service";



export function useProductDetails(
slug:string
){


return useQuery({

queryKey:[
"product-details",
slug
],


queryFn:()=>shopService.getProductBySlug(slug),


enabled:!!slug


});


}