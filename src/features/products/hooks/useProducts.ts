import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { toast } from "sonner";

import { productService } from "../services/product.service";
import type { ProductFormData } from "../types/product.types";

const QUERY_KEY = ["products"];

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: productService.getAll,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProductFormData) =>
      productService.create(data),

    onSuccess: () => {
      toast.success("Product created");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ProductFormData;
    }) =>
      productService.update(id, data),

    onSuccess: () => {
      toast.success("Product updated");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productService.delete,

    onSuccess: () => {
      toast.success("Product deleted");

      queryClient.invalidateQueries({
        queryKey: QUERY_KEY,
      });
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}