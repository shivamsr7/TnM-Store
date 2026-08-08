export const ORDER_STEPS = [

{
key:"pending",
label:"Order Placed"
},

{
key:"confirmed",
label:"Confirmed"
},

{
key:"shipped",
label:"Shipped"
},

{
key:"delivered",
label:"Delivered"
}

];




export function getStatusIndex(

status:string

){

return ORDER_STEPS.findIndex(

step=>step.key===status

);

}