import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";


import {
  useEffect,
  useState,
} from "react";


import {
  createPortal,
} from "react-dom";


import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
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
   * NAVIGATION
   * =========================================================
   */

  const navigate =
    useNavigate();


  /*
   * =========================================================
   * SHOP CATEGORIES
   * =========================================================
   *
   * Uses the same shop category source as desktop.
   *
   * Active categories/subcategories are supplied by
   * useShopCategories().
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
   * LOGOUT CONFIRMATION
   * =========================================================
   */

  const [
    showLogoutConfirmation,
    setShowLogoutConfirmation,
  ] = useState(false);


  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);


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
   * LOGOUT
   * =========================================================
   *
   * AuthContext also clears the authentication state.
   *
   * This navigation guarantees that the drawer cannot leave
   * the user sitting on /account after logout.
   *
   * =========================================================
   */

  function handleLogoutClick() {

    if (isLoggingOut) {
      return;
    }

    setShowLogoutConfirmation(true);

  }


  async function handleConfirmedLogout() {

    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {

      await onLogout();

    } catch (
      error
    ) {

      console.error(
        "Logout error:",
        error
      );

    } finally {

      setShowLogoutConfirmation(false);

      setIsLoggingOut(false);

      /*
       * Close drawer.
       */

      onClose();


      /*
       * Leave Account page.
       */

      navigate(
        "/",
        {
          replace: true,
        }
      );

    }

  }


  /*
   * =========================================================
   * LOCK PAGE SCROLL WHILE LOGOUT CONFIRMATION IS OPEN
   * =========================================================
   *
   * The confirmation is rendered into document.body so it is
   * not affected by the mobile drawer's own scroll container.
   * =========================================================
   */

  useEffect(() => {

    if (!showLogoutConfirmation) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    const previousTouchAction =
      document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {

      document.body.style.overflow =
        previousOverflow;

      document.body.style.touchAction =
        previousTouchAction;

    };

  }, [
    showLogoutConfirmation,
  ]);


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

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

              {/* =================================================
                  MY ACCOUNT
              ================================================== */}

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


              {/* =================================================
                  LOGOUT
              ================================================== */}

              <button
                type="button"

                onClick={
                  handleLogoutClick
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

                  transition

                  hover:bg-black
                  hover:text-white

                  disabled:cursor-not-allowed
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
          FEATURED
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

          Featured

        </p>


        <div
          className="
            overflow-hidden
            rounded-xl
            border
            border-neutral-200
            bg-white
          "
        >

          {/* =================================================
              NEW ARRIVALS
          ================================================== */}

          <Link
            to="/shop?newArrival=true"

            onClick={
              onClose
            }

            className="
              flex
              items-center
              justify-between
              border-b
              border-neutral-100
              px-4
              py-4
              text-sm
              font-medium
              text-neutral-900

              transition

              hover:bg-[#F8F6F1]
              hover:text-[#C8A44D]
            "
          >

            <span>

              ✨ New Arrivals

            </span>


            <span
              className="
                text-xs
                text-[#C8A44D]
              "
            >

              Explore →

            </span>

          </Link>


          {/* =================================================
              UNDER ₹299
          ================================================== */}

          <Link
            to="/shop?maxPrice=299"

            onClick={
              onClose
            }

            className="
              flex
              items-center
              justify-between
              border-b
              border-neutral-100
              px-4
              py-4
              text-sm
              font-medium
              text-neutral-900

              transition

              hover:bg-[#F8F6F1]
              hover:text-[#C8A44D]
            "
          >

            <span>

              Under ₹299

            </span>


            <span
              className="
                text-xs
                text-[#C8A44D]
              "
            >

              Explore →

            </span>

          </Link>


          {/* =================================================
              UNDER ₹499
          ================================================== */}

          <Link
            to="/shop?maxPrice=499"

            onClick={
              onClose
            }

            className="
              flex
              items-center
              justify-between
              px-4
              py-4
              text-sm
              font-medium
              text-neutral-900

              transition

              hover:bg-[#F8F6F1]
              hover:text-[#C8A44D]
            "
          >

            <span>

              Under ₹499

            </span>


            <span
              className="
                text-xs
                text-[#C8A44D]
              "
            >

              Explore →

            </span>

          </Link>

        </div>

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

                  {/* =========================================
                      CATEGORY HEADER
                  ========================================== */}

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


                  {/* =========================================
                      CATEGORY CONTENT
                  ========================================== */}

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

                        {/* =================================
                            SHOP ALL
                        ================================== */}

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


                        {/* =================================
                            SUBCATEGORIES
                        ================================== */}

                        {hasSubcategories && (

                          <div
                            className="
                              mt-1
                              space-y-1
                            "
                          >

                            {category.subcategories.map(
                              (subcategory) => {

                                const subcategoryValue =
                                  subcategory.slug ||
                                  subcategory.id;


                                /*
                                 * IMPORTANT:
                                 *
                                 * Keep this URL as a single
                                 * clean string.
                                 *
                                 * No accidental whitespace,
                                 * therefore no %20.
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

                                    {
                                      subcategory.name
                                    }

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


    {/* =====================================================
        LOGOUT CONFIRMATION
    ====================================================== */}

    {showLogoutConfirmation &&
      createPortal(
        <AnimatePresence>

      {showLogoutConfirmation && (

        <motion.div
          className="
            fixed
            inset-0
            z-[10000]
            flex
            min-h-[100dvh]
            items-center
            justify-center
            bg-black/55
            px-4
            py-5
            backdrop-blur-[5px]
          "
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          onClick={() => {

            if (!isLoggingOut) {
              setShowLogoutConfirmation(false);
            }

          }}
        >

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-logout-title"
            className="
              w-full
              max-w-[390px]
              max-h-[calc(100dvh-40px)]
              overflow-hidden
              rounded-[28px]
              border
              border-[#C8A44D]/30
              bg-white
              shadow-[0_24px_70px_rgba(0,0,0,0.25)]
            "
            initial={{
              y: 24,
              scale: 0.96,
              opacity: 0,
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              y: 18,
              scale: 0.97,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
              ease: "easeOut",
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className="
                px-5
                pb-5
                pt-6
                text-center
                sm:px-6
                sm:pb-6
                sm:pt-7
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[#F8F6F1]
                  text-[#B18A2E]
                  ring-1
                  ring-[#C8A44D]/25
                "
              >

                <AlertTriangle
                  size={25}
                  strokeWidth={1.8}
                />

              </div>


              <p
                className="
                  mt-4
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#B18A2E]
                "
              >
                T&M Family
              </p>


              <h3
                id="mobile-logout-title"
                className="
                  mt-1.5
                  text-xl
                  font-semibold
                  tracking-tight
                  text-neutral-900
                "
              >
                Ready to log out?
              </h3>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[290px]
                  text-sm
                  leading-5
                  text-neutral-500
                "
              >
                Are you sure you want to log out? Your
                account, orders and wishlist will stay safe.
                You can sign back in anytime.
              </p>

            </div>


            <div
              className="
                border-t
                border-neutral-100
                bg-[#FAFAF8]
                p-4
              "
            >

              <button
                type="button"
                onClick={
                  handleConfirmedLogout
                }
                disabled={
                  isLoggingOut
                }
                className="
                  flex
                  min-h-12
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  bg-black
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-neutral-800
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >

                {isLoggingOut
                  ? "Logging out..."
                  : "Yes, Log Me Out"}

              </button>


              <button
                type="button"
                onClick={() =>
                  setShowLogoutConfirmation(false)
                }
                disabled={
                  isLoggingOut
                }
                className="
                  mt-2
                  flex
                  min-h-11
                  w-full
                  items-center
                  justify-center
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-white
                  px-5
                  py-3
                  text-sm
                  font-medium
                  text-neutral-800
                  transition
                  hover:bg-neutral-50
                  active:scale-[0.98]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                Keep Me Logged In

              </button>


              <p
                className="
                  mt-3
                  text-center
                  text-[10px]
                  text-neutral-400
                "
              >
                Your saved account data will remain secure.
              </p>

            </div>

          </motion.div>

        </motion.div>

      )}

        </AnimatePresence>,
        document.body
      )}

    </>

  );

}