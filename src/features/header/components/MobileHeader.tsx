import {
  Menu,
  Heart,
  ShoppingBag,
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import Logo from "./logo";

import SearchBar from "./SearchBar";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useCartStore,
} from "@/features/cart/store/cart.store";

import {
  useUnreadNotificationsCount,
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/features/notifications/hooks/useNotifications";

import {
  timeAgo,
} from "@/features/notifications/utils/timeAgo";


interface MobileHeaderProps {

  onMenuOpen: () => void;

  search?: string;

  onSearchChange?: (
    value: string
  ) => void;

  onSearch?: () => void;

  wishlistCount?: number;

}


function getNotificationIcon(
  type: string
) {

  switch (type) {

    case "payment":

      return CreditCard;

    case "reward":

      return Gift;

    case "shipping":

      return Truck;

    case "order":

      return Package;

    default:

      return Bell;

  }

}


function getNotificationColor(
  type: string
) {

  switch (type) {

    case "payment":

      return "bg-emerald-100 text-emerald-700";

    case "reward":

      return "bg-purple-100 text-purple-700";

    case "shipping":

      return "bg-blue-100 text-blue-700";

    default:

      return "bg-[#C8A44D]/20 text-[#C8A44D]";

  }

}


export default function MobileHeader({

  onMenuOpen,

  search = "",

  onSearchChange,

  onSearch,

  wishlistCount = 0,

}: MobileHeaderProps) {


  const navigate =
    useNavigate();


  /*
   * =========================================================
   * NOTIFICATIONS
   * =========================================================
   */

  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);


  const notificationRef =
    useRef<HTMLDivElement>(
      null
    );


  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer,
  } = useAuth();


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
   * NOTIFICATION DATA
   * =========================================================
   */

  const {
    data: notificationCount = 0,
  } =
    useUnreadNotificationsCount(
      customer?.id
    );


  const {
    data: notifications = [],
  } =
    useCustomerNotifications(
      customer?.id
    );


  const {
    mutate: markRead,
  } =
    useMarkNotificationRead();


  const {
    mutate: markAllRead,
  } =
    useMarkAllNotificationsRead();


  /*
   * =========================================================
   * CLOSE NOTIFICATIONS WHEN CLICKING OUTSIDE
   * =========================================================
   */

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target as Node
        )
      ) {

        setNotificationOpen(
          false
        );

      }

    }


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  /*
   * =========================================================
   * NOTIFICATION CLICK
   * =========================================================
   */

  function handleNotificationClick(
    item: any
  ) {

    markRead(
      item.id
    );


    setNotificationOpen(
      false
    );


    if (
      item.reference_id
    ) {

      navigate(
        `/account/orders/${item.reference_id}`
      );

    }

  }


  return (

    <div
      className="
        bg-black
        lg:hidden
      "
    >


      {/* =====================================================
          TOP ROW
      ====================================================== */}

      <div
        className="
          relative
          flex
          h-16
          items-center
          justify-between
          px-4
        "
      >


        {/* ===================================================
            MENU
        ==================================================== */}

        <button
          type="button"

          onClick={
            onMenuOpen
          }

          aria-label="Open menu"

          className="
            rounded-md
            p-2
            text-white
            transition
            hover:bg-neutral-800
          "
        >

          <Menu
            size={24}
          />

        </button>


        {/* ===================================================
            LOGO
            FIX:
            Absolutely centered so its position is independent
            of the width of the left/right icon groups.
        ==================================================== */}

        <div
          className="
            pointer-events-none
            absolute
            left-1/2
            top-1/2
            flex
            -translate-x-1/2
            -translate-y-1/2
            items-center
            justify-center
          "
        >

          <Logo />

        </div>


        {/* ===================================================
            ICONS
        ==================================================== */}

        <div
          className="
            ml-auto
            flex
            items-center
            gap-1
          "
        >


          {/* =================================================
              WISHLIST
          ================================================== */}

          <Link
            to="/wishlist"

            aria-label="Wishlist"

            className="
              relative
              rounded-md
              p-2
              text-white
              transition
              hover:bg-neutral-800
            "
          >

            <Heart
              size={22}
            />


            {wishlistCount > 0 && (

              <span
                className="
                  absolute
                  -right-1
                  -top-1

                  flex
                  h-5
                  w-5

                  items-center
                  justify-center

                  rounded-full

                  bg-[#C8A44D]

                  text-[10px]
                  font-semibold

                  text-black
                "
              >

                {
                  wishlistCount > 99
                    ? "99+"
                    : wishlistCount
                }

              </span>

            )}

          </Link>


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
              rounded-md
              p-2
              text-white
              transition
              hover:bg-neutral-800
            "
          >

            <ShoppingBag
              size={22}
            />


            {getCartCount() > 0 && (

              <span
                className="
                  absolute
                  -right-1
                  -top-1

                  flex
                  h-5
                  w-5

                  items-center
                  justify-center

                  rounded-full

                  bg-[#C8A44D]

                  text-[10px]
                  font-semibold

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

          </button>


          {/* =================================================
              NOTIFICATIONS
          ================================================== */}

          {customer && (

            <div
              ref={
                notificationRef
              }

              className="
                relative
              "
            >


              <button
                type="button"

                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }

                aria-label="Notifications"

                aria-expanded={
                  notificationOpen
                }

                className="
                  relative
                  rounded-md
                  p-2
                  text-white
                  transition
                  hover:bg-neutral-800
                "
              >

                <Bell
                  size={22}
                />


                {notificationCount > 0 && (

                  <span
                    className="
                      absolute
                      -right-1
                      -top-1

                      flex
                      h-5
                      w-5

                      items-center
                      justify-center

                      rounded-full

                      bg-[#C8A44D]

                      text-[10px]
                      font-semibold

                      text-black
                    "
                  >

                    {
                      notificationCount > 99
                        ? "99+"
                        : notificationCount
                    }

                  </span>

                )}

              </button>


              {/* =================================================
                  NOTIFICATION DROPDOWN
              ================================================== */}

              <div
                className={`
                  absolute
                  right-0
                  top-12
                  z-50

                  w-80

                  rounded-2xl

                  border
                  border-neutral-800

                  bg-black

                  p-4

                  shadow-2xl

                  transition-all
                  duration-200

                  ${
                    notificationOpen
                      ? `
                        visible
                        translate-y-0
                        opacity-100
                      `
                      : `
                        invisible
                        -translate-y-2
                        opacity-0
                      `
                  }
                `}
              >


                {/* Header */}

                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                  "
                >

                  <h3
                    className="
                      text-sm
                      font-semibold
                      text-white
                    "
                  >

                    Notifications

                  </h3>


                  <button
                    type="button"

                    onClick={() => {

                      markAllRead(
                        customer.id
                      );

                      setNotificationOpen(
                        false
                      );

                    }}

                    className="
                      text-xs
                      text-[#C8A44D]
                      transition
                      hover:text-white
                    "
                  >

                    Mark all read

                  </button>

                </div>


                {/* Notification list */}

                <div
                  className="
                    max-h-80
                    space-y-2
                    overflow-y-auto
                  "
                >

                  {notifications
                    .filter(
                      (item: any) =>
                        !item.is_read
                    )
                    .slice(
                      0,
                      5
                    )
                    .map(
                      (
                        item: any
                      ) => {

                        const Icon =
                          getNotificationIcon(
                            item.type
                          );


                        return (

                          <button
                            key={
                              item.id
                            }

                            type="button"

                            onClick={() =>
                              handleNotificationClick(
                                item
                              )
                            }

                            className="
                              flex
                              w-full
                              gap-3
                              rounded-xl
                              bg-neutral-900
                              p-3
                              text-left
                              transition
                              hover:bg-neutral-800
                            "
                          >


                            <div
                              className={`
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-full

                                ${getNotificationColor(
                                  item.type
                                )}
                              `}
                            >

                              <Icon
                                size={16}
                              />

                            </div>


                            <div
                              className="
                                flex-1
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-medium
                                  text-white
                                "
                              >

                                {
                                  item.title
                                }

                              </p>


                              <p
                                className="
                                  mt-1
                                  line-clamp-2
                                  text-xs
                                  text-neutral-400
                                "
                              >

                                {
                                  item.message
                                }

                              </p>


                              <p
                                className="
                                  mt-2
                                  text-[11px]
                                  text-neutral-500
                                "
                              >

                                {timeAgo(
                                  item.created_at
                                )}

                              </p>

                            </div>


                            <span
                              className="
                                mt-2
                                h-2
                                w-2
                                rounded-full
                                bg-[#C8A44D]
                              "
                            />

                          </button>

                        );

                      }
                    )
                  }


                  {/* Empty state */}

                  {
                    notifications.filter(
                      (item: any) =>
                        !item.is_read
                    ).length ===
                      0 && (

                      <div
                        className="
                          py-8
                          text-center
                        "
                      >

                        <Bell
                          className="
                            mx-auto
                            mb-3
                            text-neutral-600
                          "
                        />


                        <p
                          className="
                            text-sm
                            text-neutral-400
                          "
                        >

                          No new notifications

                        </p>


                        <p
                          className="
                            mt-1
                            text-xs
                            text-neutral-600
                          "
                        >

                          We'll notify you about
                          orders and updates.

                        </p>

                      </div>

                    )
                  }

                </div>


                {/* View all */}

                <Link
                  to="/account/notifications"

                  onClick={() =>
                    setNotificationOpen(
                      false
                    )
                  }

                  className="
                    mt-4
                    block
                    text-center
                    text-sm
                    text-[#C8A44D]
                    transition
                    hover:text-white
                  "
                >

                  View all notifications

                </Link>

              </div>

            </div>

          )}

        </div>

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div
        className="
          px-4
          pb-4
        "
      >

        <SearchBar
          value={
            search
          }

          onChange={
            onSearchChange
          }

          onSearch={
            onSearch
          }
        />

      </div>

    </div>

  );

}