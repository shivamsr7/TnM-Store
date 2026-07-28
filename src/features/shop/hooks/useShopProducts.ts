import {
useQuery
} from "@tanstack/react-query";


import {
shopService
} from "../services/shop.service";


export function useShopProducts(){

return useQuery({

queryKey:["shop-products"],

queryFn:
shopService.getProducts

});

}