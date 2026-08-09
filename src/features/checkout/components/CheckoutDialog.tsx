import {
  X,
  ShieldCheck,
  UserRound,
  MapPin,
  CreditCard,
} from "lucide-react";

import {
  useAuth
} from "@/features/Auth/context/AuthContext";
import {
  useState
} from "react";


import OrderSuccess from "./OrderSuccess";
import PaymentStep from "./PaymentStep";
import LoginStep from "./LoginStep";
import AddressStep from "./AddressStep";


import {
useCustomerStore
} from "@/features/customers/store/customer.store";


import {
  getCustomerByPhone,
  createCustomer
} from "@/features/customers/services/customer.service";


import {
  createOrder
} from "@/features/orders/services/order.service";


import {
  useCartStore
} from "@/features/cart/store/cart.store";




import {
useEffect
} from "react";


interface Props {

open:boolean;

onClose:()=>void;

}







const STEPS = [

{
key:"login",
label:"Login",
icon:UserRound
},

{
key:"address",
label:"Address",
icon:MapPin
},

{
key:"payment",
label:"Payment",
icon:CreditCard
}

];








export default function CheckoutDialog({

open,

onClose

}:Props){


const {
customer:authCustomer
}=useAuth();



const [step,setStep]=useState<
"login" | "address" | "payment"
>("login");


const [customer,setCustomer]=useState<any>(null);






const [selectedAddress,setSelectedAddress]=useState<any>(null);


const [orderSuccess,setOrderSuccess]=useState(false);


const [orderNumber,setOrderNumber]=useState("");





const {

items,

getTotal,

discount,

appliedCoupon,

clearCart

}=useCartStore();





const subtotal=getTotal();


const finalAmount =
Math.max(
subtotal - discount,
0
);


useEffect(()=>{


if(authCustomer){

setCustomer(authCustomer);

setStep("address");

}


},[authCustomer]);

useEffect(()=>{
  
if(open){

setOrderSuccess(false);

setOrderNumber("");

setStep(
authCustomer
?
"address"
:
"login"
);

}

},[open]);


if(!open)

return null;



async function handleLoginSuccess(

data:{
phone:string;
}

){


try{


const existingCustomer =

await getCustomerByPhone(

data.phone

);





if(existingCustomer){


setCustomer(existingCustomer);


useCustomerStore
.getState()
.setCustomer(existingCustomer);



setStep("address");

return;


}







const newCustomer = await createCustomer({

first_name:"Customer",

phone:data.phone

});





setCustomer(newCustomer);


useCustomerStore
.getState()
.setCustomer(newCustomer);



setStep("address");



}

catch(error){

console.error(
"Customer login failed",
error
);

}


}









async function handlePaymentSuccess(

payment:any

){


try{


const result = await createOrder({

customerId:
customer?.id ?? null,

customer:{


name:
`${customer.first_name ?? ""} ${customer.last_name ?? ""}`,



email:
customer.email ?? null,



phone:
customer.phone


},





shipping:{


fullName:
selectedAddress.full_name,


phone:
selectedAddress.phone,


address:
`${selectedAddress.address_line_1} ${selectedAddress.address_line_2 ?? ""}`,



city:
selectedAddress.city,


state:
selectedAddress.state,


pincode:
selectedAddress.postal_code,


landmark:null


},





items:

items.map(item=>(


{

productId:
item.productId,


productName:
item.name,


productImage:
item.image ?? null,


price:
item.price,


quantity:
item.quantity,


total:
item.price * item.quantity


}

)),





subtotal,


discount,


shippingCharge:0,


tax:0,


totalAmount:
finalAmount,





advanceAmount:
finalAmount,



paymentMethod:
"prepaid",



paymentTransactionId:
payment.razorpay_payment_id,



coupon:

appliedCoupon

?

{

id:
appliedCoupon.id,


code:
appliedCoupon.code,


discount:
appliedCoupon.discount


}

:

null



});






setOrderNumber(

result.orderNumber

);



clearCart();



setOrderSuccess(true);



}

catch(error){

console.error(

"Order creation failed",

error

);

}


}









const currentStepIndex =

STEPS.findIndex(

item=>item.key===step

);









return (

<>





<div

className="
fixed
inset-0
z-[1000]
bg-black/50
backdrop-blur-md
"

onClick={onClose}

/>





<div

className="
fixed
left-1/2
top-1/2
z-[1100]

flex
max-h-[90vh]
w-[calc(100%-32px)]
max-w-[560px]
-translate-x-1/2
-translate-y-1/2
flex-col

overflow-hidden

rounded-3xl

bg-white

shadow-2xl
"

>









{/* Header */}

<div

className="
shrink-0
border-b
bg-white
px-6
py-5
"

>


<div

className="
flex
items-center
justify-between
"

>


<h2

className="
text-2xl
font-semibold
"

>

{
orderSuccess

?

"Order Confirmed"

:

"Checkout"

}

</h2>







<button

onClick={onClose}

className="
rounded-full
p-2
transition
hover:bg-neutral-100
"

>

<X size={20}/>

</button>






</div>







{/* Progress */}

{

!orderSuccess && (

<div

className="
mt-6
flex
items-center
justify-between
"

>


{

STEPS.map((item,index)=>{


const Icon =
item.icon;


const active =
index <= currentStepIndex;





return (

<div

key={item.key}

className="
flex
flex-1
items-center
"

>





<div

className="
flex
flex-col
items-center
"

>
<button

type="button"

disabled={
  index > currentStepIndex ||
  (!!authCustomer && item.key==="login")
}

onClick={()=>{


if(index < currentStepIndex){


if(item.key==="address"){

setStep("address");

}


if(item.key==="login" && !authCustomer){

setStep("login");

}


}


}}

className={`

flex

h-9

w-9

items-center

justify-center

rounded-full

transition


${
active

?

"bg-[#C8A44D] text-black"

:

"bg-neutral-200 text-neutral-500"

}


${
index < currentStepIndex && !(authCustomer && item.key==="login")

?

"cursor-pointer hover:scale-105"

:

"cursor-default"

}

`}

>
<Icon size={17}/>
</button>






<p

className={`

mt-2

text-xs

${
authCustomer && item.key==="login"

?

"text-neutral-400"

:

active

?

"font-medium text-black"

:

"text-neutral-400"

}

`}

>

{item.label}

</p>






</div>








{

index !== STEPS.length-1 && (

<div

className={`

mx-2

h-px

flex-1


${

index < currentStepIndex

?

"bg-[#C8A44D]"

:

"bg-neutral-200"

}

`}

/>

)

}





</div>

)

})

}







</div>

)

}



</div>






<div

className="
flex-1
overflow-y-auto
px-6
py-7
"

>






{

!orderSuccess &&

<div

className="
mb-6
rounded-2xl
border
border-neutral-200
bg-neutral-50
p-4
"

>


<h3

className="
mb-3
text-sm
font-semibold
"

>

Order Summary

</h3>







<div

className="
space-y-2
text-sm
"

>





<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Items

</span>


<span>

{items.length}

</span>


</div>







<div

className="
flex
justify-between
"

>

<span

className="
text-neutral-500
"

>

Subtotal

</span>


<span>

₹{subtotal.toFixed(2)}

</span>


</div>







{

discount > 0 &&

<div

className="
flex
justify-between
text-green-600
"

>


<span>

Discount

</span>


<span>

- ₹{discount.toFixed(2)}

</span>


</div>

}







{

appliedCoupon &&

<div

className="
rounded-xl
bg-green-100
px-3
py-2
text-xs
text-green-700
"

>

Coupon Applied:

{" "}

<strong>

{appliedCoupon.code}

</strong>

</div>

}







<div

className="
border-t
pt-3
flex
justify-between
font-semibold
"

>

<span>

Total

</span>


<span

className="
text-[#9A7A22]
"

>

₹{finalAmount.toFixed(2)}

</span>


</div>






</div>







</div>

}









{

orderSuccess &&

<OrderSuccess

orderNumber={orderNumber}

onClose={onClose}

/>

}









{

!orderSuccess && step==="login" &&

<>


<div

className="
flex
justify-center
"

>


<div

className="
flex
h-20
w-20
items-center
justify-center
rounded-full
bg-neutral-100
"

>


<UserRound size={38}/>


</div>


</div>







<h3

className="
mt-6
text-center
text-2xl
font-semibold
"

>

Login to continue

</h3>







<LoginStep

onSuccess={handleLoginSuccess}

/>


</>

}









{

!orderSuccess && step==="address" &&

<AddressStep

customer={customer}

onContinue={(address)=>{


setSelectedAddress(address);


setStep("payment");


}}

/>

}









{

!orderSuccess && step==="payment" &&

<PaymentStep

totalAmount={finalAmount}

onSuccess={handlePaymentSuccess}

/>

}







</div>









{/* Security Footer */}

{

!orderSuccess &&

<div

className="
shrink-0
border-t
bg-neutral-50
px-6
py-4
"

>


<div

className="
flex
items-center
justify-center
gap-2
text-sm
text-neutral-600
"

>


<ShieldCheck size={18}/>


Your data is safe and secure with us



</div>





</div>

}









</div>







</>

);

}