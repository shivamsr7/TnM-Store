import {
  supabase
} from "@/shared/lib/supabase";





export async function getCustomerAddresses(

  customerId: string

) {


  const {

    data,

    error

  } = await supabase

    .from("customer_addresses")

    .select("*")

    .eq(

      "customer_id",

      customerId

    )

    .order(

      "is_default",

      {

        ascending: false

      }

    )

    .order(

      "created_at",

      {

        ascending: false

      }

    );





  if (error)

    throw error;



  return data ?? [];

}








export async function createCustomerAddress(

  address: any

) {


  const {

    data,

    error

  } = await supabase.rpc(

    "create_customer_address",

    {

      p_customer_id:
        address.customer_id,

      p_type:
        address.type ?? "home",

      p_full_name:
        address.full_name,

      p_phone:
        address.phone,

      p_address_line_1:
        address.address_line_1,

      p_address_line_2:
        address.address_line_2 ?? null,

      p_city:
        address.city,

      p_state:
        address.state,

      p_postal_code:
        address.postal_code,

      p_country:
        address.country ?? "India",

      p_is_default:
        address.is_default ?? false,

    }

  );





  if (error)

    throw error;



  if (!data)

    throw new Error(
      "Could not save the address. Please try again."
    );



  return data;


}