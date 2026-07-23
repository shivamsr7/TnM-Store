import { useState } from "react";

import Wheel from "./Wheel";
import WheelPointer from "./WheelPointer";
import Founder from "./Founder";

import founderRight from "@/assets/founders/tanishq2.png";

export default function SpinWheel() {
  const [isPushing, setIsPushing] = useState(false);

  const handleSpin = () => {
    setIsPushing(true);

    setTimeout(() => {
      setIsPushing(false);
    }, 250);

    // Your spin logic
  };

  return (
    <div className="relative w-full py-6 overflow-visible">

  <div className="relative flex justify-center items-center">

    {/* Wheel */}
    <div className="relative z-20">

      <WheelPointer />

      <Wheel onSpin={handleSpin} />

    </div>

    {/* Founder */}
    <Founder
      image={founderRight}
      isPushing={isPushing}
    />

  </div>

</div>
  );
}