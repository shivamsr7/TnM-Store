import type { Banner } from "../types/banner.types";

export const bannerData: Banner[] = [
  {
    id: "1",
    title: "Timeless Elegance",
    subtitle: "Premium Anti-Tarnish Jewellery",
    description:
      "Crafted to shine every day with elegance and durability.",

    image: "/images/banner/banner1.webp",

    mobileImage: "/images/banner/mobile-banner1.webp",

    primaryButtonText: "Shop Collection",
    primaryButtonLink: "/shop",

    secondaryButtonText: "New Arrivals",
    secondaryButtonLink: "/new-arrivals",

    isActive: true,
    displayOrder: 1,
  },

  {
    id: "2",
    title: "Luxury That Lasts",
    subtitle: "Everyday Jewellery You'll Love",

    description:
      "Beautiful designs made for every occasion.",

    image: "/images/banner/banner2.webp",

    mobileImage: "/images/banner/mobile-banner2.webp",

    primaryButtonText: "Explore",
    primaryButtonLink: "/shop",

    secondaryButtonText: "Best Sellers",
    secondaryButtonLink: "/best-sellers",

    isActive: true,
    displayOrder: 2,
  },
];