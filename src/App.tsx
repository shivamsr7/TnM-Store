import Header from "@/features/header/components/Header";
import HeroSection from "@/features/home/hero/components/HeroSection";
import HangingCategories from "@/features/categories/components/HangingCategories";
import Footer from "@/shared/components/footer/Footer";
import CartDrawer from "@/features/cart/components/CartDrawer";
export default function App() {

  return (

    <>
      <Header />

      <main>

        <HeroSection />

        <HangingCategories />

      </main>
<Footer />
    </>

  );

}