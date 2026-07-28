import { supabase } from "@/shared/lib/supabase";


const TABLE = "products";


export const productService = {


  async getAll() {


    const { data, error } = await supabase

      .from(TABLE)

      .select(`

        *,

        categories(
          id,
          name
        ),

        subcategories(
          id,
          name
        ),

        brands(
          id,
          name
        ),

        product_images(
          image_url,
          is_primary,
          sort_order
        )

      `)


      .eq("status", "active")


      .order("created_at", {
        ascending:false
      });



    if(error){

      throw error;

    }


    return data;

  },





  async getBySlug(slug:string){


    const {data,error}=await supabase

    .from(TABLE)

    .select(`

      *,

      categories(
        id,
        name
      ),

      subcategories(
        id,
        name
      ),

      brands(
        id,
        name
      ),

      product_images(
        image_url,
        is_primary,
        sort_order
      )

    `)

    .eq("slug",slug)

    .eq("status","active")

    .single();



    if(error){

      throw error;

    }


    return data;


  }


};