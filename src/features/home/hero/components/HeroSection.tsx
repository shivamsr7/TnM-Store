import HeroSlider from "./HeroSlider";
import SpinCard from "@/features/home/spin/components/SpinCard";
import { useStoreSettings } from "@/features/settings/hooks/useStoreSettings";
import TMJewelsDivider from "@/features/home/components/TMJewelsDivider";

export default function HeroSection() {
  const { data: settings } = useStoreSettings();

  const showSpinPanel =
    settings?.spinEnabled &&
    settings?.showSpinCard;

  return (
    <section className="w-full bg-black">
      <div
        className={`grid ${
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
              h-[405px]
              items-center
              justify-center
              border-l
              border-[#E7D8B4]
              bg-gradient-to-b
              from-[#FFFDF8]
              via-[#F8F1E4]
              to-[#EFE2C6]
              overflow-hidden
            "
          >
            <SpinCard />
          </div>
        )}
      </div>

      {/* Divider directly between banner and collection */}
      <TMJewelsDivider />
    </section>
  );
}