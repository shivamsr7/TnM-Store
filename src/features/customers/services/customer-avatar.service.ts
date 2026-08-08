import {
  supabase,
} from "@/shared/lib/supabase";





export async function uploadCustomerAvatar(

customerId:string,

file:File

){



const extension =
file.name.split(".").pop() || "jpg";



const filePath =

`${customerId}/${crypto.randomUUID()}.${extension}`;





const {

error

}=await supabase

.storage

.from("customer-avatars")

.upload(

filePath,

file,

{

cacheControl:"3600",

upsert:false,

contentType:file.type

}

);






if(error){

console.error(
"Avatar upload error:",
error
);

throw error;

}





const {

data

}=supabase

.storage

.from("customer-avatars")

.getPublicUrl(

filePath

);






return data.publicUrl;

}