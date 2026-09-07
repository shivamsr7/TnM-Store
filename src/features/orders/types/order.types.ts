export interface OrderItemPayload {

  productId:string;

  productName:string;

  productImage?:string | null;

  price:number;

  quantity:number;

  ringSize?: string | null

  total:number;

}







export interface CustomerPayload {

  name:string;

  email?:string | null;

  phone:string;

}







export interface ShippingPayload {

  fullName:string;

  phone:string;

  address:string;

  city:string;

  state:string;

  pincode:string;

  landmark?:string | null;

}







export interface CouponPayload {


  id?:string | null;


  code?:string | null;


  discount:number;


  freeShipping?:boolean;


  freeGift?:boolean;


}







export interface CreateOrderPayload {

  customerId?: string;


  customer:CustomerPayload;


  shipping:ShippingPayload;



  items:OrderItemPayload[];





  /*
   * Server-generated checkout quote.
   *
   * The secure order RPC uses this quote as the
   * authoritative source for shipping and final
   * checkout calculations.
   */

  checkoutQuoteId?: string | null;





  /*
   * These amount fields are retained for the current
   * checkout/email UI contract, but the secure RPC
   * must not trust them for final pricing.
   */

  subtotal:number;


  discount:number;


  shippingCharge:number;


  tax:number;


  totalAmount:number;





  coupon?:CouponPayload | null;





  paymentMethod:

  "partial_cod" | "prepaid";



  paymentTransactionId?: string;


  /*
   * Wallet checkout split.
   *
   * wallet_hold_id identifies the server-created wallet hold
   * for this checkout quote. The secure order transaction
   * consumes the hold atomically with order creation.
   */
  wallet_hold_id?: string | null;


  /*
   * Exact wallet amount reserved for this order, in paise.
   * This is passed through to the secure RPC and is never
   * trusted as the final order total.
   */
  wallet_amount_paise?: number;


  advanceAmount:number;


}
