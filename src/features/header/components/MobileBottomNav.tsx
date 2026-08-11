import {
  Home,
  ShoppingBag,
  UserRound,
} from "lucide-react";

import {
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useCartStore,
} from "@/features/cart/store/cart.store";


export default function MobileBottomNav() {


  /*
   * =========================================================
   * NAVIGATION
   * =========================================================
   */

  const navigate =
    useNavigate();


  /*
   * =========================================================
   * CART
   * =========================================================
   */

  const {
    openCart,
    getCartCount,
  } = useCartStore();


  /*
   * =========================================================
   * ACCOUNT
   * =========================================================
   *
   * Account opens the actual Account page.
   *
   * It does NOT open MobileDrawer.
   *
   * =========================================================
   */

  function handleAccountClick() {

    navigate(
      "/account"
    );

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-50

        border-t
        border-neutral-200

        bg-white

        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]

        lg:hidden

        pb-[env(safe-area-inset-bottom)]
      "
    >

      <div
        className="
          grid
          min-h-16
          grid-cols-4
          items-stretch
        "
      >

        {/* =================================================
            HOME
        ================================================== */}

        <NavLink
          to="/"

          end

          className={({ isActive }) => `
            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium

            transition-colors

            ${
              isActive
                ? "text-[#C8A44D]"
                : "text-neutral-400"
            }
          `}
        >

          {({ isActive }) => (

            <>

              <Home
                size={21}

                strokeWidth={
                  isActive
                    ? 2.2
                    : 1.8
                }
              />

              <span>
                Home
              </span>

            </>

          )}

        </NavLink>


        {/* =================================================
            SHOP
        ================================================== */}

        <NavLink
          to="/shop"

          className={({ isActive }) => `
            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium

            transition-colors

            ${
              isActive
                ? "text-[#C8A44D]"
                : "text-neutral-400"
            }
          `}
        >

          {({ isActive }) => (

            <>

              <ShoppingBag
                size={21}

                strokeWidth={
                  isActive
                    ? 2.2
                    : 1.8
                }
              />

              <span>
                Shop
              </span>

            </>

          )}

        </NavLink>


        {/* =================================================
            ACCOUNT
        ================================================== */}

        <button
          type="button"

          onClick={
            handleAccountClick
          }

          aria-label="Open account page"

          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium
            text-neutral-400

            transition-colors

            hover:text-[#C8A44D]

            active:scale-95
          "
        >

          <UserRound
            size={21}
            strokeWidth={1.8}
          />

          <span>
            Account
          </span>

        </button>


        {/* =================================================
            CART
        ================================================== */}

        <button
          type="button"

          onClick={
            openCart
          }

          aria-label="Open cart"

          className="
            relative

            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium
            text-neutral-400

            transition-colors

            hover:text-[#C8A44D]

            active:scale-95
          "
        >

          <div
            className="
              relative
            "
          >

            <ShoppingBag
              size={21}
              strokeWidth={1.8}
            />


            {getCartCount() > 0 && (

              <span
                className="
                  absolute
                  -right-2
                  -top-2

                  flex
                  h-4
                  min-w-4

                  items-center
                  justify-center

                  rounded-full

                  bg-[#C8A44D]

                  px-1

                  text-[8px]
                  font-bold
                  leading-none
                  text-black
                "
              >

                {
                  getCartCount() > 99
                    ? "99+"
                    : getCartCount()
                }

              </span>

            )}

          </div>


          <span>
            Cart
          </span>

        </button>

      </div>

    </nav>

  );

}