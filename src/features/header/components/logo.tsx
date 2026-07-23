import { Link } from "react-router-dom";
import mainLogo from "@/assets/logo/mainLogo.png";

interface LogoProps {
  className?: string;
}

export default function Logo({ className = "" }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center ${className}`}
      aria-label="TnM Jewels"
    >
      <img
  src={mainLogo}
  alt="T&M Jewels"
  className="h-10 w-auto object-contain lg:h-35"
/>
    </Link>
  );
}