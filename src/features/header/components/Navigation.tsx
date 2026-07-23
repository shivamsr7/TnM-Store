import { NavLink } from "react-router-dom";
import { navigationItems } from "../constants/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import CategoryMegaMenu from "@/features/header/components/MegaMenu";
export default function Navigation() {

  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  return (
    <nav className="hidden border-b border-neutral-800 bg-black lg:block">
      <div className="mx-auto max-w-7xl px-6">
        <ul className="flex items-center justify-center gap-10">
  <li>
    <NavLink
      to="/"
      className={({ isActive }) =>
        `group relative inline-flex h-14 items-center text-[15px] font-medium transition-colors duration-300 ${
          isActive
            ? "text-[#C8A44D]"
            : "text-white hover:text-[#C8A44D]"
        }`
      }
    >
      {({ isActive }) => (
        <>
          Home
          <span
            className={`absolute bottom-0 left-0 h-[2px] bg-[#C8A44D] transition-all duration-300 ${
              isActive ? "w-full" : "w-0 group-hover:w-full"
            }`}
          />
        </>
      )}
    </NavLink>
  </li>

 <li
  className="relative"
  onMouseEnter={() => setMegaMenuOpen(true)}
  onMouseLeave={() => setMegaMenuOpen(false)}
>
  <button
    type="button"
    className="group inline-flex h-14 items-center gap-2 text-[15px] font-medium text-white transition-colors duration-300 hover:text-[#C8A44D]"
  >
    Shop by Category

    <ChevronDown
      className={`h-4 w-4 transition-transform duration-300 ${
        megaMenuOpen ? "rotate-180 text-[#C8A44D]" : ""
      }`}
    />
  </button>

  <CategoryMegaMenu
    open={megaMenuOpen}
    onClose={() => setMegaMenuOpen(false)}
  />
</li>

  {navigationItems
    .filter((item) => item.href !== "/")
    .map((item) => (
      <li key={item.href}>
        <NavLink
          to={item.href}
          className={({ isActive }) =>
            `group relative inline-flex h-14 items-center text-[15px] font-medium transition-colors duration-300 ${
              isActive
                ? "text-[#C8A44D]"
                : "text-white hover:text-[#C8A44D]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {item.label}
              <span
                className={`absolute bottom-0 left-0 h-[2px] bg-[#C8A44D] transition-all duration-300 ${
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </>
          )}
        </NavLink>
      </li>
    ))}
</ul>
      </div>
    </nav>
  );
}