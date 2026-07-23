export interface NavigationItem {
  label: string;
  href: string;
}

export const navigationItems: NavigationItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "New Arrivals",
    href: "/new-arrivals",
  },
  {
    label: "Collections",
    href: "/collections",
  },
  {
    label: "Contact",
    href: "/contact",
  },
  {
    label: "About Us",
    href: "/aboutUs",
  },
];