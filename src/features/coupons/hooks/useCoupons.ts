import {
  useQuery
} from "@tanstack/react-query";

import {
  supabase
} from "@/shared/lib/supabase";



export function useCoupons(){


return useQuery({

queryKey:["active-coupons"],


queryFn:async()=>{


const {
data,
error
}=await supabase

.from("coupons")

.select("*")

.eq(
"is_active",
true
)

.order(
"created_at",
{
ascending:false
}
);



if(error){

throw error;

}



return data ?? [];


}


});


}