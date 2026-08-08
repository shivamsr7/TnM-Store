import LoungeDashboard from "../components/lounge/LoungeDashboard";

import MobileLounge from "../components/lounge/mobile/MobileLounge";



export default function AccountPage(){


return (

<>


{/* Desktop */}

<div className="
hidden
lg:block
">

<LoungeDashboard />

</div>







{/* Mobile */}

<div className="
block
lg:hidden
">

<MobileLounge />

</div>




</>

);

}