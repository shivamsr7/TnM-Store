export interface Cart {
  id: string;
  customer_id: string;
  created_at: string;
  updated_at: string;
}



export interface CartItem {

  id: string;

  cart_id: string;

  product_id: string;

  product_name: string;

  product_image?: string | null;

  price: number;

  quantity: number;

  created_at: string;

  updated_at: string;

}



export interface CartWithItems extends Cart {

  items: CartItem[];

}