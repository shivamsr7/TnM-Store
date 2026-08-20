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

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";


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
   * AUTH
   * =========================================================
   */

  const {
    customer,
  } = useAuth();


  const {
    openAuth,
  } = useAuthDialog();


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
   * Logged in:
   *     /account
   *
   * Logged out:
   *     Login / Register dialog
   *
   * =========================================================
   */

  function handleAccountClick() {

    if (customer) {

      navigate(
        "/account"
      );

      return;

    }


    /*
     * Customer is logged out.
     *
     * Do NOT navigate to /account.
     * Open the existing authentication dialog.
     */

    openAuth();

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
        border-[#2A2418]

        bg-[#0A0A0A]

        shadow-[0_-4px_20px_rgba(0,0,0,0.35)]

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
            duration-200
            ease-out

            motion-reduce:transition-none

            ${
              isActive
                ? "text-[#D4AF5A]"
                : "text-[#8F7840]"
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

                className={`
                  transition-[transform]
                  duration-200
                  ease-out

                  motion-reduce:transition-none

                  ${
                    isActive
                      ? "scale-[1.06]"
                      : "scale-100"
                  }
                `}
              />

              <span
                className="
                  transition-[transform,opacity]
                  duration-200
                  ease-out

                  motion-reduce:transition-none
                "
              >
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
            duration-200
            ease-out

            motion-reduce:transition-none

            ${
              isActive
                ? "text-[#D4AF5A]"
                : "text-[#8F7840]"
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

                className={`
                  transition-[transform]
                  duration-200
                  ease-out

                  motion-reduce:transition-none

                  ${
                    isActive
                      ? "scale-[1.06]"
                      : "scale-100"
                  }
                `}
              />

              <span
                className="
                  transition-[transform,opacity]
                  duration-200
                  ease-out

                  motion-reduce:transition-none
                "
              >
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

          aria-label="Account"

          className="
            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium

            transition-colors
            duration-200
            ease-out

            motion-reduce:transition-none

            active:scale-95
            motion-reduce:active:scale-100
          "
        >

          <UserRound
            size={21}

            strokeWidth={
              customer
                ? 2
                : 1.8
            }

            className={`
              transition-[transform]
              duration-200
              ease-out

              motion-reduce:transition-none

              ${
                customer
                  ? "scale-[1.06] text-[#D4AF5A]"
                  : "scale-100 text-[#8F7840]"
              }
            `}
          />

          <span
            className={`
              transition-[transform,opacity,color]
              duration-200
              ease-out

              motion-reduce:transition-none

              ${
                customer
                  ? "text-[#D4AF5A]"
                  : "text-[#8F7840]"
              }
            `}
          >
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

          aria-label="Cart"

          className="
            relative

            flex
            flex-col
            items-center
            justify-center
            gap-1

            text-[10px]
            font-medium
            text-[#8F7840]

            transition-colors
            duration-200
            ease-out

            motion-reduce:transition-none

            hover:text-[#D4AF5A]

            active:scale-95
            motion-reduce:active:scale-100
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

              className="
                transition-[transform]
                duration-200
                ease-out

                motion-reduce:transition-none
              "
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

                  bg-[#D4AF5A]

                  px-1

                  text-[8px]
                  font-bold
                  leading-none
                  text-black

                  transition-[transform]
                  duration-200
                  ease-out

                  motion-reduce:transition-none
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


          <span
            className="
              transition-[transform,opacity]
              duration-200
              ease-out

              motion-reduce:transition-none
            "
          >
            Cart
          </span>

        </button>

      </div>

    </nav>

  );

}