import HeroSlider from "./HeroSlider";
import SpinCard from "@/features/home/spin/components/SpinCard";
import InfoCard from "@/features/home/spin/components/InfoCard";

export default function HeroSection() {
  return (
    <section className="w-full">
      <div className="grid min-h-[620px] lg:grid-cols-[3fr_1fr]">

        <HeroSlider />

        <div
  className="
    flex
    h-[620px]
    flex-col
    border-l
    border-[#E7D8B4]
    bg-gradient-to-b
    from-[#FFFDF8]
    via-[#F8F1E4]
    to-[#EFE2C6]
  "
>

  {/* Spin Section */}

  <div className="flex h-[75%] items-center justify-center border-b border-[#E7D8B4]">

    <SpinCard />

  </div>

  {/* Info */}

  <div className="flex h-[40%] items-center justify-center bg-white">

    <InfoCard />

  </div>

</div>

      </div>
    </section>
  );
}