import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  ChevronDown,
} from "lucide-react";

import {
  useState,
} from "react";


import {
  navigationItems,
} from "../constants/navigation";


import {
  useCategories,
} from "@/features/categories";


import {
  useSubcategories,
} from "@/features/categories/hooks/useSubcategories";



interface Props {
  onClose: () => void;
}



export default function MobileNavigation({
  onClose,
}: Props) {


  const {
    data: categories = [],
  } = useCategories();



  const {
    data: subcategories = [],
  } = useSubcategories();



  const [
    openCategory,
    setOpenCategory,
  ] = useState<string | null>(null);




  return (

    <nav className="space-y-6 p-6 pb-10">


      {/* Main Links */}

      <div className="space-y-1">

        {navigationItems.map(
          (item) => (

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

          )
        )}

      </div>





      {/* Categories */}

      <div>


        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A44D]">

          Shop By Category

        </h3>



        <div className="space-y-2">


          {
            categories.map(
              (category) => {


                const children =
                  subcategories.filter(
                    (sub) =>
                      sub.category_id ===
                      category.id
                  );


                const opened =
                  openCategory ===
                  category.id;



                return (

                  <div
                    key={category.id}
                  >


                    <button

                      type="button"

                      onClick={() =>
                        setOpenCategory(
                          opened
                            ? null
                            : category.id
                        )
                      }

                      className="flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm font-medium text-neutral-900 hover:bg-[#F8F6F1]"

                    >

                      {category.name}


                      <ChevronDown

                        size={18}

                        className={`transition-transform ${
                          opened
                            ? "rotate-180 text-[#C8A44D]"
                            : ""
                        }`}

                      />


                    </button>





                    {
                      opened && (

                        <div className="ml-4 mt-1 space-y-1 border-l border-neutral-200 pl-3">


                          <Link

                            to={`/shop?category=${category.slug}`}

                            onClick={onClose}

                            className="block py-2 text-sm text-neutral-600"

                          >

                            View All {category.name}

                          </Link>



                          {
                            children.map(
                              (sub) => (

                                <Link

                                  key={sub.id}

                                  to={`/shop?subcategory=${sub.slug}`}

                                  onClick={onClose}

                                  className="block py-2 text-sm text-neutral-600 hover:text-[#C8A44D]"

                                >

                                  {sub.name}

                                </Link>

                              )
                            )
                          }


                        </div>

                      )
                    }


                  </div>

                );

              }
            )
          }


        </div>


      </div>


    </nav>

  );

}