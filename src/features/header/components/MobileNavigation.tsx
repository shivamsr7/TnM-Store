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
  useAuthDialog,
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
  } = useAuthDialog();




  const categorySubs =
    selectedCategory
      ? subcategories.filter(
          (sub) =>
            sub.category_id === selectedCategory.id
        )
      : [];





  return (

    <div className="relative overflow-hidden">


      <AnimatePresence mode="wait">


        {!selectedCategory ? (


          <motion.div

            key="main"

            initial={{
              x:-25,
              opacity:0,
            }}

            animate={{
              x:0,
              opacity:1,
            }}

            exit={{
              x:-25,
              opacity:0,
            }}

            transition={{
              duration:0.25,
              ease:"easeOut",
            }}

            className="
              space-y-6
              p-6
            "

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

                (item)=>(


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

                  (category)=>(


                    <button

                      key={category.id}

                      onClick={()=>
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



                      <div

                        className="
                          flex
                          items-center
                          gap-4
                        "

                      >


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



          <motion.div

            key="category"

            initial={{
              x:25,
              opacity:0,
            }}

            animate={{
              x:0,
              opacity:1,
            }}

            exit={{
              x:25,
              opacity:0,
            }}

            transition={{
              duration:0.25,
            }}

            className="p-6"

          >



            <button

              onClick={()=>
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






            <Link

              to={`/shop?category=${selectedCategory.slug}`}

              onClick={onClose}

              className="
                mt-5
                block
                rounded-xl
                border
                border-[#C8A44D]
                bg-[#F8F6F1]
                px-4
                py-4
                text-sm
                font-medium
              "

            >

              ✨ Shop All {selectedCategory.name}

            </Link>






            <div className="mt-4 space-y-3">


              {categorySubs.map(

                (sub)=>(


                  <Link

                    key={sub.id}

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
                    "

                  >



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


                      {sub.image_url && (

                        <img

                          src={sub.image_url}

                          alt={sub.name}

                          className="
                            h-full
                            w-full
                            object-cover
                          "

                        />

                      )}


                    </div>




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


                )

              )}


            </div>



          </motion.div>


        )}



      </AnimatePresence>


    </div>

  );

}