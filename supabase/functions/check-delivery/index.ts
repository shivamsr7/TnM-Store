import { serve } from "https://deno.land/std@0.224.0/http/server.ts";


const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

};



serve(async (req)=>{


// Handle browser preflight

if(req.method === "OPTIONS"){

return new Response(
"ok",
{
headers:corsHeaders
}
);

}



try{


const {
customer_pincode,
weight = 0.25
}=await req.json();





if(!customer_pincode){

return new Response(

JSON.stringify({

error:"Pincode is required"

}),

{

status:400,

headers:{
...corsHeaders,
"Content-Type":"application/json"
}

}

);

}







// 1. Shiprocket Login


const loginResponse = await fetch(

"https://apiv2.shiprocket.in/v1/external/auth/login",

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

email:Deno.env.get(
"SHIPROCKET_EMAIL"
),

password:Deno.env.get(
"SHIPROCKET_PASSWORD"
)

})

}

);





const loginData = await loginResponse.json();





if(!loginData.token){


return new Response(

JSON.stringify({

error:"Shiprocket authentication failed",

details:loginData

}),

{

status:401,

headers:{
...corsHeaders,
"Content-Type":"application/json"
}

}

);


}






const token = loginData.token;









// 2. Check delivery serviceability


const serviceabilityResponse = await fetch(

`https://apiv2.shiprocket.in/v1/external/courier/serviceability/?pickup_postcode=${Deno.env.get(
"SHIPROCKET_PICKUP_PINCODE"
)}&delivery_postcode=${customer_pincode}&weight=${weight}&cod=0`,

{

headers:{

Authorization:`Bearer ${token}`

}

}

);







const serviceabilityData =
await serviceabilityResponse.json();






return new Response(

JSON.stringify(serviceabilityData),

{

status:200,

headers:{

...corsHeaders,

"Content-Type":"application/json"

}

}

);





}

catch(error){


return new Response(

JSON.stringify({

error:error.message

}),

{

status:500,

headers:{

...corsHeaders,

"Content-Type":"application/json"

}

}

);


}



});