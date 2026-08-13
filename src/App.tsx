import HeroSection from "@/features/home/hero/components/HeroSection";

import HangingCategories from "@/features/categories/components/HangingCategories";

import HomeProductSection from "@/features/home/components/HomeProductSection";

import InstagramReels from "@/features/instagram/components/InstagramReels";


export default function App() {

  return (

    <main>

      <HeroSection />

      <HangingCategories />


      {/* =================================================
          BEST SELLERS
      ================================================== */}

      <HomeProductSection
        type="best_sellers"
        title="Best Sellers"
        subtitle="The pieces our customers can't get enough of."
      />


      {/* =================================================
          NEW ARRIVALS
      ================================================== */}

      <HomeProductSection
        type="new_arrivals"
        title="New Arrivals"
        subtitle="Fresh pieces, made to become your next favourite."
      />


      {/* =================================================
          INSTAGRAM
      ================================================== */}

      <InstagramReels />

    </main>

  );

}