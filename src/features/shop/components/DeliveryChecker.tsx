import {
  MapPin,
  Truck,
  PackageCheck
} from "lucide-react";

import {
  useState
} from "react";



export default function DeliveryChecker(){


const [pincode,setPincode] = useState("");

const [checked,setChecked] = useState(false);





const handleCheck=()=>{


if(!pincode || pincode.length < 6)
return;


setChecked(true);


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





{/* Header */}

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

</h3>



<button

className="
text-sm

font-medium

text-[#D4AF37]

"

>

Change

</button>


</div>









{/* Pincode Box */}

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

py-4

"

>


<MapPin

size={19}

className="
text-[#D4AF37]

"

/>



<input

value={pincode}

onChange={(e)=>
setPincode(e.target.value.replace(/\D/g,""))
}

placeholder="Enter pincode"

maxLength={6}

className="
w-full

bg-transparent

text-sm

text-white

outline-none

placeholder:text-neutral-500

"

/>


</div>








<button

onClick={handleCheck}

className="
bg-[#D4AF37]

px-6

text-sm

font-medium

text-black

transition

hover:bg-[#e5c45a]

"

>

Check

</button>



</div>









{/* Delivery Info Card */}

<div

className="
mt-6

space-y-4

rounded-xl

border

border-neutral-800

bg-neutral-900/60

p-5

"

>





<div

className="
flex

items-center

gap-3

text-sm

text-neutral-300

"

>

<div

className="
flex

h-8

w-8

items-center

justify-center

rounded-full

bg-[#D4AF37]/10

"

>

<Truck

size={16}

className="
text-[#D4AF37]

"

/>


</div>


<span>

Free delivery above ₹2000

</span>


</div>









<div

className="
flex

items-center

gap-3

text-sm

text-neutral-300

"

>


<div

className="
flex

h-8

w-8

items-center

justify-center

rounded-full

bg-[#D4AF37]/10

"

>


<PackageCheck

size={16}

className="
text-[#D4AF37]

"

/>


</div>



<span>

Estimated delivery: 3-5 business days

</span>


</div>







{

checked &&

<div

className="
border-t

border-neutral-800

pt-4

text-sm

text-green-400

"

>

✓ Delivery available for {pincode}

</div>

}



</div>









</div>

);

}