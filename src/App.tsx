import HeroSection from "@/features/home/hero/components/HeroSection";

import HangingCategories from "@/features/categories/components/HangingCategories";

import TMJewelsDivider from "@/features/home/components/TMJewelsDivider";

import HomeProductSection from "@/features/home/components/HomeProductSection";

import PriceProductSection from "@/features/home/components/PriceProductSection";

import InstagramReels from "@/features/instagram/components/InstagramReels";

import CustomerLove from "@/features/reviews/components/CustomerLove";

export default function App() {
  return (
    <main>

      {/* =================================================
          HERO
      ================================================== */}

      <HeroSection />


      {/* =================================================
          EXPLORE OUR COLLECTION
      ================================================== */}

      <HangingCategories />


      {/* =================================================
          T&M JEWELS DIVIDER
      ================================================== */}

      <TMJewelsDivider />


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
          UNDER ₹299
      ================================================== */}

      <PriceProductSection
        maxPrice={299}
        title="Jewellery Under ₹299"
        subtitle="Beautiful pieces that don't break the budget."
      />


      {/* =================================================
          UNDER ₹499
      ================================================== */}

      <PriceProductSection
        maxPrice={499}
        title="Luxe Picks Under ₹499"
        subtitle="A little extra luxe, still at an easy price."
      />


      {/* =================================================
          CUSTOMER LOVE
      ================================================== */}

      <CustomerLove />


      {/* =================================================
          INSTAGRAM
      ================================================== */}

      <InstagramReels />

    </main>
  );
}