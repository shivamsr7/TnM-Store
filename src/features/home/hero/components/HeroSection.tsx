import HeroSlider from "./HeroSlider";
import SpinCard from "@/features/home/spin/components/SpinCard";
import InfoCard from "@/features/home/spin/components/InfoCard";
import { useStoreSettings } from "@/features/settings/hooks/useStoreSettings";
export default function HeroSection() {

    const { data: settings } = useStoreSettings();

const showSpinPanel =
  settings?.spinEnabled &&
  settings?.showSpinCard;
  return (
    <section className="w-full">
      <div
  className={`grid min-h-[620px] ${
    showSpinPanel
      ? "lg:grid-cols-[3fr_1fr]"
      : "grid-cols-1"
  }`}
>

        <HeroSlider
    variant={
        showSpinPanel
            ? "default"
            : "expanded"
    }
/>

        {showSpinPanel && (
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
    <div className="flex h-[75%] items-center justify-center border-b border-[#E7D8B4]">
      <SpinCard />
    </div>

    <div className="flex h-[40%] items-center justify-center bg-white">
      <InfoCard />
    </div>
  </div>
)}

      </div>
    </section>
  );
}