import {
  Link,
  NavLink,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  ChevronDown,
  ChevronUp,
} from "lucide-react";

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
  useShopCategories,
} from "@/features/shop/hooks/useShopCategories";


interface Props {

  onClose: () => void;

  customer: any;

  onLogout: () => Promise<void>;

}


export default function MobileNavigation({

  onClose,

  customer,

  onLogout,

}: Props) {


  /*
   * =========================================================
   * SHOP CATEGORIES
   * =========================================================
   *
   * Uses the same shop category source as desktop.
   *
   * shopService.getCategories() returns:
   *
   * - active parent categories
   * - active subcategories
   * - only subcategories with active products
   *
   * This keeps mobile and desktop consistent.
   *
   * =========================================================
   */

  const {
    data: categories = [],
  } = useShopCategories();


  /*
   * =========================================================
   * EXPANDED CATEGORY
   * =========================================================
   */

  const [
    expandedCategory,
    setExpandedCategory,
  ] = useState<string | null>(
    null
  );


  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    openAuth,
  } = useAuthDialog();


  /*
   * =========================================================
   * CATEGORY TOGGLE
   * =========================================================
   */

  function toggleCategory(
    categoryId: string
  ) {

    setExpandedCategory(
      (previous) =>
        previous === categoryId
          ? null
          : categoryId
    );

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <div
      className="
        space-y-6
        p-6
      "
    >

      {/* =====================================================
          ACCOUNT CARD
      ====================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-[#C8A44D]
          bg-[#F8F6F1]
          p-4
        "
      >

        {customer ? (

          <>

            <p
              className="
                text-sm
                font-semibold
                text-neutral-900
              "
            >

              Hi, {customer.first_name} ✨

            </p>


            <p
              className="
                mt-1
                text-xs
                text-neutral-500
              "
            >

              Welcome back to T&M Family

            </p>


            <div
              className="
                mt-4
                space-y-2
              "
            >

              <Link
                to="/account"

                onClick={
                  onClose
                }

                className="
                  block
                  rounded-xl
                  bg-black
                  py-3
                  text-center
                  text-sm
                  font-medium
                  text-white
                "
              >

                My Account

              </Link>


              <button
                type="button"

                onClick={
                  onLogout
                }

                className="
                  w-full
                  rounded-xl
                  border
                  border-black
                  py-3
                  text-sm
                  font-medium
                  text-black
                "
              >

                Logout

              </button>

            </div>

          </>

        ) : (

          <>

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
              type="button"

              onClick={
                openAuth
              }

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

          </>

        )}

      </div>


      {/* =====================================================
          NAVIGATION LINKS
      ====================================================== */}

      <div
        className="
          space-y-1
        "
      >

        {navigationItems.map(
          (item) => (

            <NavLink
              key={
                item.href
              }

              to={
                item.href
              }

              onClick={
                onClose
              }

              className={({ isActive }) =>
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


      {/* =====================================================
          SHOP BY CATEGORY
      ====================================================== */}

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


        <div
          className="
            space-y-2
          "
        >

          {categories.map(
            (category) => {

              const isExpanded =
                expandedCategory ===
                category.id;


              const hasSubcategories =
                category.subcategories.length >
                0;


              return (

                <div
                  key={
                    category.id
                  }

                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-neutral-200
                    bg-white
                  "
                >

                  {/* =================================================
                      CATEGORY HEADER
                  ================================================== */}

                  <button
                    type="button"

                    onClick={() =>
                      toggleCategory(
                        category.id
                      )
                    }

                    className="
                      flex
                      w-full
                      items-center
                      justify-between
                      px-4
                      py-4
                    "
                  >

                    <span
                      className="
                        text-sm
                        font-medium
                        text-neutral-900
                      "
                    >

                      {category.name}

                    </span>


                    {isExpanded ? (

                      <ChevronUp
                        size={18}
                        className="
                          text-[#C8A44D]
                        "
                      />

                    ) : (

                      <ChevronDown
                        size={18}
                        className="
                          text-[#C8A44D]
                        "
                      />

                    )}

                  </button>


                  {/* =================================================
                      CATEGORY CONTENT
                  ================================================== */}

                  <AnimatePresence>

                    {isExpanded && (

                      <motion.div

                        initial={{
                          height: 0,
                          opacity: 0,
                        }}

                        animate={{
                          height: "auto",
                          opacity: 1,
                        }}

                        exit={{
                          height: 0,
                          opacity: 0,
                        }}

                        transition={{
                          duration: 0.25,
                        }}

                        className="
                          overflow-hidden
                          border-t
                          border-neutral-100
                          bg-[#F8F6F1]
                          px-4
                          py-3
                        "
                      >

                        {/* =================================================
                            SHOP ALL
                        ================================================== */}

                        <Link
                          to={`/shop?category=${category.slug}`}

                          onClick={
                            onClose
                          }

                          className="
                            block
                            rounded-lg
                            py-2
                            text-sm
                            font-medium
                            text-black
                            transition
                            hover:text-[#C8A44D]
                          "
                        >

                          ✨ Shop All{" "}
                          {category.name}

                        </Link>


                        {/* =================================================
                            SUBCATEGORIES
                        ================================================== */}

                        {hasSubcategories && (

                          <div
                            className="
                              mt-1
                              space-y-1
                            "
                          >

                            {category.subcategories.map(
                              (subcategory) => {

                                /*
                                 * Prefer slug when available.
                                 *
                                 * If slug is null, use the
                                 * database ID.
                                 *
                                 * This avoids ever generating
                                 * a multiline URL and therefore
                                 * prevents %20 from appearing.
                                 */

                                const subcategoryValue =
                                  subcategory.slug ||
                                  subcategory.id;


                                /*
                                 * IMPORTANT:
                                 *
                                 * Keep the entire URL on one
                                 * line. Do NOT use a multiline
                                 * template literal here.
                                 */

                                const subcategoryUrl =
                                  `/shop?category=${category.slug}&subcategory=${subcategoryValue}`;


                                return (

                                  <Link
                                    key={
                                      subcategory.id
                                    }

                                    to={
                                      subcategoryUrl
                                    }

                                    onClick={
                                      onClose
                                    }

                                    className="
                                      block
                                      rounded-lg
                                      py-2
                                      pl-2
                                      text-sm
                                      text-neutral-700
                                      transition
                                      hover:bg-white
                                      hover:text-[#C8A44D]
                                    "
                                  >

                                    {subcategory.name}

                                  </Link>

                                );

                              }
                            )}

                          </div>

                        )}

                      </motion.div>

                    )}

                  </AnimatePresence>

                </div>

              );

            }
          )}

        </div>

      </div>

    </div>

  );

}