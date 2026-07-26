import { Link, NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import {
  navigationItems,
} from "../constants/navigation";

import {
  useCategories,
} from "@/features/categories";


interface Props {
  onClose: () => void;
}


export default function MobileNavigation({
  onClose,
}: Props) {


  const {
    data: categories = [],
    isLoading,
  } = useCategories();



  return (

    <nav className="space-y-6 p-6">


      {/* Main Navigation */}

      <div className="space-y-2">

        {navigationItems.map((item) => (

          <NavLink

            key={item.href}

            to={item.href}

            onClick={onClose}

            className={({isActive}) =>
              `block border-b border-neutral-100 py-3 text-base font-medium ${
                isActive
                  ? "text-[#C8A44D]"
                  : "text-neutral-900"
              }`
            }

          >

            {item.label}

          </NavLink>

        ))}

      </div>





      {/* Categories */}

      <div>


        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A44D]">

          Shop By Category

        </h3>



        <div className="space-y-1">


          {isLoading ? (

            [...Array(5)].map((_, index) => (

              <div

                key={index}

                className="h-10 animate-pulse rounded bg-neutral-100"

              />

            ))

          ) : (

            categories.map((category) => (

              <Link

                key={category.id}

                to={`/shop?category=${category.slug}`}

                onClick={onClose}

                className="flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-[#F8F6F1] hover:text-[#C8A44D]"

              >

                {category.name}


                <ChevronRight size={16}/>


              </Link>

            ))

          )}


        </div>


      </div>


    </nav>

  );

}