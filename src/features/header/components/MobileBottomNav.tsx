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

            active:scale-95
          "
        >

          <UserRound
            size={21}

            strokeWidth={
              customer
                ? 2
                : 1.8
            }

            className={
              customer
                ? "text-[#C8A44D]"
                : "text-neutral-400"
            }
          />

          <span
            className={
              customer
                ? "text-[#C8A44D]"
                : "text-neutral-400"
            }
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