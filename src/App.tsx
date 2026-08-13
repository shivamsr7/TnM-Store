import HeroSection from "@/features/home/hero/components/HeroSection";
import HangingCategories from "@/features/categories/components/HangingCategories";
import InstagramReels from "@/features/instagram/components/InstagramReels";

export default function App() {
  return (
    <main>
      <HeroSection />

      <HangingCategories />
      <InstagramReels />
    </main>
  );
}