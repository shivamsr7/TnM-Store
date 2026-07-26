import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";


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
    selectedCategory,
    setSelectedCategory,
  ] = useState<any>(null);




  const categorySubs =
    selectedCategory
      ? subcategories.filter(
          (sub) =>
            sub.category_id ===
            selectedCategory.id
        )
      : [];




  return (

    <div className="relative overflow-hidden">


      <AnimatePresence mode="wait">


        {!selectedCategory ? (

          <motion.div

            key="main"

            initial={{
              x:-30,
              opacity:0,
            }}

            animate={{
              x:0,
              opacity:1,
            }}

            exit={{
              x:-30,
              opacity:0,
            }}

            transition={{
              duration:0.25,
            }}

            className="space-y-6 p-6"

          >



            {/* Main Links */}

            <div className="space-y-1">


              {navigationItems.map(
                (item)=>(
                  
                  <NavLink

                    key={item.href}

                    to={item.href}

                    onClick={onClose}

                    className={({isActive})=>
                      `
                      block
                      border-b
                      border-neutral-100
                      py-3
                      text-base
                      font-medium
                      ${
                        isActive
                        ? "text-[#C8A44D]"
                        : "text-neutral-900"
                      }
                      `
                    }

                  >

                    {item.label}

                  </NavLink>

                )
              )}


            </div>





            {/* Categories */}

            <div>


              <p className="
                mb-3
                text-xs
                font-semibold
                uppercase
                tracking-[0.25em]
                text-[#C8A44D]
              ">

                Shop By Category

              </p>




              <div className="space-y-2">


                {categories.map(
                  (category)=>(


                    <button

                      key={category.id}

                      onClick={() =>
                        setSelectedCategory(
                          category
                        )
                      }


                      className="
                      flex
                      w-full
                      items-center
                      justify-between
                      rounded-xl
                      bg-[#F8F6F1]
                      px-4
                      py-4
                      text-left
                      text-sm
                      font-medium
                      text-neutral-900
                      "

                    >

                      {category.name}


                      <ChevronRight
                        size={18}
                        className="text-[#C8A44D]"
                      />


                    </button>


                  )
                )}


              </div>


            </div>


          </motion.div>



        ) : (



          <motion.div

            key="category"

            initial={{
              x:30,
              opacity:0,
            }}

            animate={{
              x:0,
              opacity:1,
            }}

            exit={{
              x:30,
              opacity:0,
            }}

            transition={{
              duration:0.25,
            }}

            className="p-6"

          >




            {/* Back */}

            <button

              onClick={() =>
                setSelectedCategory(null)
              }

              className="
              mb-6
              flex
              items-center
              gap-2
              text-sm
              font-medium
              text-neutral-700
              "

            >

              <ArrowLeft size={18}/>

              {selectedCategory.name}

            </button>





            <Link

              to={`/shop?category=${selectedCategory.slug}`}

              onClick={onClose}

              className="
              mb-4
              block
              rounded-xl
              bg-black
              px-4
              py-4
              text-sm
              font-medium
              text-white
              "

            >

              View All {selectedCategory.name}


            </Link>






            <div className="space-y-2">


              {categorySubs.map(
                (sub)=>(


                  <Link

                    key={sub.id}

                    to={`/shop?subcategory=${sub.slug}`}

                    onClick={onClose}

                    className="
                    block
                    rounded-xl
                    border
                    border-neutral-200
                    px-4
                    py-3
                    text-sm
                    font-medium
                    text-neutral-800
                    transition
                    hover:border-[#C8A44D]
                    hover:text-[#C8A44D]
                    "

                  >

                    {sub.name}


                  </Link>


                )
              )}


            </div>



          </motion.div>


        )}


      </AnimatePresence>


    </div>

  );

}