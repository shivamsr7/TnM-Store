export interface Coupon {

id:string;

code:string;

title:string;

description?:string;

discount_type:
"percentage"
|
"fixed"
|
"free_shipping"
|
"free_gift";


discount_value:number;

minimum_order_amount:number;

maximum_discount?:number;

starts_at?:string;

expires_at?:string;

is_active:boolean;

}