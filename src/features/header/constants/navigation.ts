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
    label: "Collections",
    href: "/shop",
  },
  {
    label: "Contact",
    href: "/contact-us",
  },
  {
    label: "About Us",
    href: "/about-us",
  },
];