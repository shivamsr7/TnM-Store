import {
  useQuery,
} from "@tanstack/react-query";

import {
  getSubcategories,
} from "../services/subcategory.service";


export function useSubcategories() {

  return useQuery({

    queryKey:[
      "subcategories",
    ],


    queryFn:
      getSubcategories,


    staleTime:
      1000 * 60 * 10,

  });

}