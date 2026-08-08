import {
  serve
} from "https://deno.land/std/http/server.ts";



const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

  "Access-Control-Allow-Methods":
    "POST, OPTIONS",

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


const body = await req.json();


const amount = body.amount;





const keyId =
Deno.env.get(
"RAZORPAY_KEY_ID"
);



const keySecret =
Deno.env.get(
"RAZORPAY_KEY_SECRET"
);





if(!keyId || !keySecret){


throw new Error(
"Razorpay credentials missing"
);


}







const response = await fetch(

"https://api.razorpay.com/v1/orders",

{

method:"POST",

headers:{


"Content-Type":
"application/json",


"Authorization":

"Basic " +

btoa(

`${keyId}:${keySecret}`

)


},


body:JSON.stringify({

amount:
Math.round(amount * 100),


currency:"INR",


receipt:

`tnm_${Date.now()}`


})

}

);






const data = await response.json();






return new Response(

JSON.stringify(data),

{

status:200,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

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

"Content-Type":
"application/json"

}

}

);


}


});