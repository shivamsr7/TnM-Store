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
useAuthDialog
} from "@/features/Auth/context/AuthDialogContext";
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

const {
openAuth,
}=useAuthDialog();


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


        {/* MAIN MENU */}

        {!selectedCategory ? (


          <motion.div


            key="main"


            initial={{
              x: -25,
              opacity: 0,
            }}


            animate={{
              x: 0,
              opacity: 1,
            }}


            exit={{
              x: -25,
              opacity: 0,
            }}


            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}


            className="space-y-6 p-6"


          >
{/* Account Card */}

<div
  className="
    rounded-2xl
    border
    border-[#C8A44D]
    bg-[#F8F6F1]
    p-4
  "
>


<div className="
flex
items-center
justify-between
">


<div>

<p
className="
text-sm
font-semibold
text-neutral-900
"
>

Join T&M Family

</p>


<p
className="
mt-1
text-xs
text-neutral-500
"
>

Rewards • Wishlist • Orders

</p>


</div>


</div>



<button

onClick={openAuth}

className="
mt-4
w-full
rounded-xl
bg-black
py-3
text-sm
font-medium
text-white
"

>

Login / Register

</button>


</div>


            {/* Navigation Links */}


            <div className="space-y-1">


              {navigationItems.map(

                (item) => (

                  <NavLink

                    key={item.href}

                    to={item.href}

                    onClick={onClose}


                    className={({isActive}) =>

                      `
                      block
                      border-b
                      border-neutral-100
                      py-3
                      text-base
                      font-medium
                      transition-colors

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


  <p
    className="
      mb-4
      text-xs
      font-semibold
      uppercase
      tracking-[0.25em]
      text-[#C8A44D]
    "
  >
    Shop By Category
  </p>



  <div className="space-y-3">


    {categories.map(

      (category) => (

        <button

          key={category.id}

          onClick={() =>
            setSelectedCategory(category)
          }


          className="
            flex
            w-full
            items-center
            justify-between
            rounded-xl
            border
            border-neutral-200
            bg-white
            p-3
            text-left
            transition-all
            duration-300
            hover:border-[#C8A44D]
            hover:bg-[#F8F6F1]
          "

        >


          {/* Left Content */}

          <div className="flex items-center gap-4">


            {/* Category Image */}

            <div
              className="
                h-14
                w-14
                shrink-0
                overflow-hidden
                rounded-full
                bg-[#F8F6F1]
              "
            >

              {category.image_url ? (

                <img

                  src={category.image_url}

                  alt={category.name}

                  className="
                    h-full
                    w-full
                    object-cover
                    transition-transform
                    duration-300
                    hover:scale-110
                  "

                />

              ) : (

                <div
                  className="
                    flex
                    h-full
                    w-full
                    items-center
                    justify-center
                    text-[10px]
                    text-neutral-400
                  "
                >
                  No Image
                </div>

              )}

            </div>





            {/* Category Name */}

            <span
              className="
                text-sm
                font-medium
                text-neutral-900
              "
            >

              {category.name}

            </span>


          </div>





          {/* Arrow */}

          <ChevronRight

            size={18}

            className="
              text-[#C8A44D]
            "

          />


        </button>

      )

    )}


  </div>


</div>



          </motion.div>





        ) : (




          /* CATEGORY DETAIL */


          <motion.div


            key="category"


            initial={{
              x: 25,
              opacity: 0,
            }}


            animate={{
              x: 0,
              opacity: 1,
            }}


            exit={{
              x: 25,
              opacity: 0,
            }}


            transition={{
              duration: 0.25,
              ease: "easeOut",
            }}


            className="p-6"


          >





            {/* Header */}


            <div className="mb-6">


              <button


                onClick={() =>
                  setSelectedCategory(null)
                }


                className="
                  flex
                  items-center
                  gap-2
                  text-sm
                  font-medium
                  text-neutral-700
                "


              >

                <ArrowLeft size={18}/>


                Back


              </button>





              <h2


                className="
                  mt-4
                  text-2xl
                  font-semibold
                  text-neutral-900
                "


              >

                {selectedCategory.name}


              </h2>



            </div>








            {/* View All */}


            <Link


              to={`/shop?category=${selectedCategory.slug}`}


              onClick={onClose}


              className="
                mb-4
                block
                rounded-xl
                border
                border-[#C8A44D]
                bg-[#F8F6F1]
                px-4
                py-4
                text-sm
                font-medium
                text-neutral-900
                transition-all
                duration-300
                hover:bg-[#C8A44D]
                hover:text-white
              "


            >


              ✨ Shop All {selectedCategory.name}


            </Link>







            {/* Subcategories */}



<motion.div

  className="space-y-3"

  initial="hidden"

  animate="show"

  variants={{
    hidden: {},

    show: {

      transition: {

        staggerChildren: 0.08,

      },

    },

  }}

>


  {categorySubs.map(

    (sub) => (

      <motion.div

        key={sub.id}

        variants={{

          hidden: {

            opacity:0,

            y:15,

          },

          show: {

            opacity:1,

            y:0,

          },

        }}

        transition={{

          duration:0.25,

        }}

      >

        <Link

          to={`/shop?subcategory=${sub.slug}`}

          onClick={onClose}

          className="
            flex
            items-center
            gap-4
            rounded-xl
            border
            border-neutral-200
            bg-white
            p-3
            transition-all
            duration-300
            hover:border-[#C8A44D]
            hover:bg-[#F8F6F1]
          "

        >


          {/* Image */}

          <div

            className="
              h-16
              w-16
              shrink-0
              overflow-hidden
              rounded-lg
              bg-[#F8F6F1]
            "

          >

            {sub.image_url ? (

              <img

                src={sub.image_url}

                alt={sub.name}

                className="
                  h-full
                  w-full
                  object-cover
                  transition-transform
                  duration-300
                  hover:scale-110
                "

              />

            ) : (

              <div

                className="
                  flex
                  h-full
                  items-center
                  justify-center
                  text-[10px]
                  text-neutral-400
                "

              >

                No Image

              </div>

            )}

          </div>





          {/* Name */}

          <span

            className="
              text-sm
              font-medium
              text-neutral-900
            "

          >

            {sub.name}

          </span>



        </Link>


      </motion.div>

    )

  )}


</motion.div>




          </motion.div>



        )}


      </AnimatePresence>

    </div>

  );

}