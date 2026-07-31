import Wheel from "./Wheel";
import WheelPointer from "./WheelPointer";


export default function SpinWheel() {


const handleSpin = () => {


  // Your spin logic


};



return (

<div

className="
relative

w-full

py-6

overflow-visible

"

>


<div

className="
relative

flex

justify-center

items-center

"

>


<div

className="
relative

z-20

"

>


<WheelPointer />


<Wheel

onSpin={handleSpin}

/>


</div>


</div>


</div>

);

}