import {
  MapPin,
  Loader2
} from "lucide-react";

import {
  useState,
  useEffect
} from "react";

import {
  useDeliveryCheck
} from "@/features/shipping/hooks/useDeliveryCheck";



interface DeliveryCheckerProps {

  product:any;

}


export default function DeliveryChecker({

product

}:DeliveryCheckerProps){


const [pincode,setPincode] = useState("");

const [savedDelivery,setSavedDelivery] = useState<any>(null);

const [showInput,setShowInput] = useState(false);

const [deliveryError,setDeliveryError] = useState("");



const {
  mutate,
  isPending
} = useDeliveryCheck();






useEffect(()=>{


const saved =
localStorage.getItem(
"tnm_delivery_info"
);



if(saved){

const parsed =
JSON.parse(saved);


setSavedDelivery(parsed);

setPincode(
parsed.pincode
);

}


},[]);









const getDeliveryDate = (

days:number = 3

)=>{


const startDate = new Date();


startDate.setDate(
startDate.getDate() + days + 2
);



const endDate = new Date();


endDate.setDate(
endDate.getDate() + days + 3
);




return {


start:

startDate.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
),


end:

endDate.toLocaleDateString(
"en-IN",
{
day:"numeric",
month:"long",
year:"numeric"
}
)


};


};









const handleCheck = ()=>{


if(pincode.length !== 6)
return;


setDeliveryError("");



mutate(

{

pincode,

weight:

product?.weight || 0.500

},

{

onSuccess:(data)=>{



const courier =

data

?.data

?.available_courier_companies

?.[0];





// No courier available

if(!courier){


setDeliveryError(
"Sorry, delivery is not available for this pincode."
);


setSavedDelivery(null);


localStorage.removeItem(
"tnm_delivery_info"
);


return;

}







const deliveryDate =

getDeliveryDate(

Number(

courier?.estimated_delivery_days ||

courier?.etd ||

3

)

);







const deliveryInfo = {


pincode,


deliveryDate,


shippingCharge:

courier?.rate || 0,


courier:

courier?.courier_name || ""



};







localStorage.setItem(

"tnm_delivery_info",

JSON.stringify(
deliveryInfo
)

);






setSavedDelivery(
deliveryInfo
);


setShowInput(false);



},

onError:()=>{


setDeliveryError(
"Sorry, delivery is not available for this pincode."
);


}



}

);


};









const changePincode = ()=>{


setSavedDelivery(null);

setDeliveryError("");

localStorage.removeItem(
"tnm_delivery_info"
);


setShowInput(true);


};









return (

<div

className="
mt-10

border-t

border-neutral-800

pt-8

"

>







<div

className="
flex

items-center

justify-between

"

>


<h3

className="
text-lg

font-medium

text-white

"

>

Deliver To


{

savedDelivery &&

<span

className="
ml-2

text-[#D4AF37]

"

>

{savedDelivery.pincode}

</span>

}


</h3>





<button

onClick={changePincode}

className="
text-sm

font-medium

text-[#D4AF37]

"

>

Change

</button>


</div>









{/* Saved Delivery */}

{

savedDelivery && !showInput &&

<div

className="
mt-4

rounded-xl

border

border-neutral-700

px-5

py-4

text-sm

text-neutral-300

"

>

Delivery by

<span

className="
font-medium

text-white

"

>

{" "}

{savedDelivery.deliveryDate.start}

</span>


</div>

}









{/* Input */}

{

(!savedDelivery || showInput) &&


<div

className="
mt-5

flex

overflow-hidden

rounded-xl

border

border-neutral-700

bg-neutral-900

"

>


<div

className="
flex

flex-1

items-center

gap-3

px-4

"

>


<MapPin

size={18}

className="
text-[#D4AFG37]

"

/>




<input

value={pincode}

onChange={(e)=>

setPincode(

e.target.value.replace(
/\D/g,
""
)

)

}

placeholder="Enter pincode"

maxLength={6}

className="
w-full

bg-transparent

py-4

text-sm

text-white

outline-none

placeholder:text-neutral-500

"

/>


</div>







<button

onClick={handleCheck}

disabled={isPending}

className="
flex

items-center

gap-2

bg-[#D4AF37]

px-6

text-sm

font-medium

text-black

disabled:opacity-60

"

>


{

isPending

?

<Loader2

size={16}

className="
animate-spin

"

/>

:

"Check"

}


</button>


</div>

}









{

deliveryError &&

<div

className="
mt-4

text-sm

text-red-400

"

>

{deliveryError}

</div>

}








</div>

);

}