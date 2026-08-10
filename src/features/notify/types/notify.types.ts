export type NotifyStatus =
  | "pending"
  | "notified"
  | "purchased"
  | "cancelled";


export interface CreateNotifyRequestInput {
  product_id: string;

  customer_id?: string | null;

  name: string;

  phone: string;

  email?: string | null;
}


export interface NotifyRequest {
  id: string;

  product_id: string;

  customer_id: string | null;

  name: string;

  phone: string;

  email: string | null;

  status: NotifyStatus;

  requested_at: string;

  notified_at: string | null;

  created_at: string;

  updated_at: string;

  product?: {
    id: string;

    name: string;

    slug: string;

    product_images?: {
      id: string;

      image_url: string;

      is_primary: boolean;

      sort_order: number;
    }[];
  };

  customer?: {
    id: string;

    first_name: string;

    last_name: string | null;
  };
}


export interface NotifyStats {
  totalRequests: number;

  pendingRequests: number;

  notifiedRequests: number;

  purchasedRequests: number;

  cancelledRequests: number;
}