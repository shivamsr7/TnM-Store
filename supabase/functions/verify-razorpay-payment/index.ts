// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "@supabase/functions-js/edge-runtime.d.ts";
import { withSupabase } from "@supabase/server";

console.log("Hello from Functions!");

// This endpoint uses 'publishable' | 'secret' access, apiKey is required.
// Use publishable for Client-facing, key-validated endpoints
// Use secret for Server-to-server, internal calls
export default {
  fetch: withSupabase({ auth: ["publishable", "secret"] }, async (req, ctx) => {
    // Called by another service with a secret key
    // ctx.supabaseAdmin bypasses RLS — use for privileged operations
    /*
    if (ctx.authMode === "secret") {
      const { user_id } = await req.json();
      const { data } = await ctx.supabaseAdmin.auth.admin.getUserById(user_id);

      return Response.json({
        email: data?.user?.email,
      });
    }
    */

    const { name } = await req.json();

    return Response.json({
      message: `Hello ${name}!`,
    });
  }),
};

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/verify-razorpay-payment' \
    --header 'apiKey: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH' \
    --data '{"name":"Functions"}'

*/
import {
  serve
} from "https://deno.land/std/http/server.ts";

import {
  createHmac
} from "node:crypto";



const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",

};





serve(async(req)=>{


if(req.method==="OPTIONS"){

return new Response(

"ok",

{

headers:corsHeaders

}

);

}



try{


const body = await req.json();


const {

razorpay_order_id,

razorpay_payment_id,

razorpay_signature

}=body;





const secret = Deno.env.get(

"RAZORPAY_KEY_SECRET"

);




if(!secret){

throw new Error(

"Razorpay secret missing"

);

}







const generatedSignature =

createHmac(

"sha256",

secret

)

.update(

`${razorpay_order_id}|${razorpay_payment_id}`

)

.digest("hex");








const verified =

generatedSignature === razorpay_signature;







return new Response(

JSON.stringify({

success:verified

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