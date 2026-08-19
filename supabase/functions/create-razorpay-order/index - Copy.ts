import {
  serve
} from "https://deno.land/std/http/server.ts";

import {
  createClient
} from "https://esm.sh/@supabase/supabase-js@2";



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


const checkoutQuoteId =
String(
  body?.checkoutQuoteId ??
  ""
).trim();


if(!checkoutQuoteId){

return new Response(

JSON.stringify({

error:
"Secure checkout quote is required."

}),

{

status:400,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





const supabaseUrl =
Deno.env.get(
"SUPABASE_URL"
);



const serviceRoleKey =
Deno.env.get(
"SUPABASE_SERVICE_ROLE_KEY"
);



const keyId =
Deno.env.get(
"RAZORPAY_KEY_ID"
);



const keySecret =
Deno.env.get(
"RAZORPAY_KEY_SECRET"
);





if(
!supabaseUrl ||
!serviceRoleKey
){

throw new Error(
"Supabase server credentials missing"
);

}



if(!keyId || !keySecret){

throw new Error(
"Razorpay credentials missing"
);

}





const supabaseAdmin =
createClient(

supabaseUrl,

serviceRoleKey,

{

auth:{

persistSession:false,

autoRefreshToken:false,

},

}

);





// Read the authoritative amount from the server-side quote.
// Never accept amount from the browser.

const {

data:quote,

error:quoteError

} = await supabaseAdmin

.from("checkout_quotes")

.select(
"id, total_amount, expires_at, used_at"
)

.eq(
"id",
checkoutQuoteId
)

.maybeSingle();





if(quoteError){

throw quoteError;

}





if(!quote){

return new Response(

JSON.stringify({

error:
"Checkout quote not found."

}),

{

status:404,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





if(quote.used_at){

return new Response(

JSON.stringify({

error:
"This checkout quote has already been used."

}),

{

status:409,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





if(
new Date(
quote.expires_at
).getTime() <= Date.now()
){

return new Response(

JSON.stringify({

error:
"Checkout quote has expired. Please return to the address step."

}),

{

status:410,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





const amount =
Number(
quote.total_amount
);





if(
!Number.isFinite(amount) ||
amount <= 0
){

return new Response(

JSON.stringify({

error:
"Invalid checkout amount."

}),

{

status:400,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





const razorpayAmount =
Math.round(
amount * 100
);





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
razorpayAmount,

currency:"INR",

receipt:
`tnm_${quote.id}`

})

}

);





const data =
await response.json();





if(!response.ok){

return new Response(

JSON.stringify(data),

{

status:
response.status,

headers:{

...corsHeaders,

"Content-Type":
"application/json"

}

}

);

}





return new Response(

JSON.stringify({

...data,

secure_quote_id:
quote.id,

verified_amount:
amount

}),

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

error:
error instanceof Error
? error.message
: "Unable to create payment order."

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