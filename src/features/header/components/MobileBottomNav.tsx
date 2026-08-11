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
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";

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
   */

  function handleAccountClick() {

    /*
     * Logged-in customer
     * → Open existing Account page
     * → Same browser tab
     * → No full page reload
     */

    if (
      customer
    ) {

      navigate(
        "/account"
      );

      return;

    }


    /*
     * Logged-out customer
     * → Open existing login dialog
     */

    openAuth();

  }


  /*
   * =========================================================
   * CART COUNT
   * =========================================================
   */

  const cartCount =
    getCartCount();


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
        z-[60]

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
          h-16
          grid-cols-4
          items-stretch
        "
      >

        {/* =================================================
            HOME
        ================================================== */}

        <NavLink
          to="/"

          className={({
            isActive,
          }) => `
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

          {({
            isActive,
          }) => (

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

          className={({
            isActive,
          }) => `
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

          {({
            isActive,
          }) => (

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


            {cartCount > 0 && (

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
                  text-black
                "
              >

                {
                  cartCount > 99
                    ? "99+"
                    : cartCount
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