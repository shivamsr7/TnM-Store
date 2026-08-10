import {
  Heart,
  ShoppingBag,
  User,
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
  LogOut,
  ChevronRight,
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

import {
  useAuthDialog,
} from "@/features/Auth/context/AuthDialogContext";

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



interface HeaderIconsProps {
  wishlistCount?: number;
}



function IconBadge({
  count,
}: {
  count?: number;
}) {

  if (!count || count <= 0) {
    return null;
  }

  return (
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
      {count > 99 ? "99+" : count}
    </span>
  );
}



function getNotificationIcon(type: string) {

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



function getNotificationColor(type: string) {

  switch (type) {

    case "payment":
      return "bg-emerald-100 text-emerald-700";

    case "reward":
      return "bg-purple-100 text-purple-700";

    case "shipping":
      return "bg-blue-100 text-blue-700";

    case "order":
      return "bg-[#C8A44D]/20 text-[#C8A44D]";

    default:
      return "bg-neutral-100 text-neutral-700";
  }
}



interface IconButtonProps {

  to?: string;

  onClick?: () => void;

  children: React.ReactNode;

  label: string;
}



function IconButton({

  to,

  onClick,

  children,

  label,

}: IconButtonProps) {

  const className = `
    relative
    flex
    h-11
    w-11
    items-center
    justify-center
    rounded-full
    text-white
    transition-all
    duration-200
    hover:bg-neutral-800
    hover:text-[#C8A44D]
  `;



  if (to) {

    return (

      <Link
        to={to}
        aria-label={label}
        className={className}
      >

        {children}

      </Link>

    );

  }



  return (

    <button
      onClick={onClick}
      aria-label={label}
      className={className}
      type="button"
    >

      {children}

    </button>

  );
}



interface AccountMenuItemProps {

  to: string;

  icon: React.ReactNode;

  label: string;

  onClick?: () => void;
}



function AccountMenuItem({

  to,

  icon,

  label,

  onClick,

}: AccountMenuItemProps) {

  return (

    <Link
      to={to}
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        px-3
        py-2.5
        text-sm
        text-neutral-300
        transition
        hover:bg-neutral-800
        hover:text-white
      "
    >

      <span
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-neutral-900
          text-neutral-400
        "
      >

        {icon}

      </span>



      <span className="flex-1">
        {label}
      </span>



      <ChevronRight
        size={14}
        className="text-neutral-600"
      />

    </Link>

  );
}



export default function HeaderIcons({

  wishlistCount = 0,

}: HeaderIconsProps) {


  const navigate = useNavigate();



  const [
    notificationOpen,
    setNotificationOpen,
  ] = useState(false);



  const [
    accountOpen,
    setAccountOpen,
  ] = useState(false);



  const notificationRef =
    useRef<HTMLDivElement>(null);



  const accountRef =
    useRef<HTMLDivElement>(null);





  const {
    openCart,
    getCartCount,
  } = useCartStore();





  const {
    openAuth,
  } = useAuthDialog();





  const {
    customer,
    logout,
  } = useAuth();





  const {
    data: notificationCount = 0,
  } = useUnreadNotificationsCount(
    customer?.id
  );





  const {
    data: notifications = [],
  } = useCustomerNotifications(
    customer?.id
  );





  const {
    mutate: markRead,
  } = useMarkNotificationRead();





  const {
    mutate: markAllRead,
  } = useMarkAllNotificationsRead();





  /*
   * Close dropdowns when clicking outside.
   */

  useEffect(() => {

    function handleClickOutside(
      event: MouseEvent
    ) {

      const target =
        event.target as Node;



      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {

        setNotificationOpen(false);

      }



      if (
        accountRef.current &&
        !accountRef.current.contains(target)
      ) {

        setAccountOpen(false);

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
   * Account button behaviour:
   *
   * Logged out → Auth dialog
   * Logged in  → Account dropdown
   */

  function handleAccount() {

    if (!customer) {

      openAuth();

      return;

    }



    setAccountOpen(
      (previous) => !previous
    );



    setNotificationOpen(false);

  }





  /*
   * Logout
   */

  function handleLogout() {

    setAccountOpen(false);

    logout();

  }





  function handleNotificationClick(
    item: any
  ) {

    markRead(item.id);

    setNotificationOpen(false);



    if (item.reference_id) {

      navigate(
        `/account/orders/${item.reference_id}`
      );

    }

  }





  return (

    <div className="flex items-center gap-2">



      {/* =====================================================
          Wishlist
      ====================================================== */}

      <IconButton
        to="/wishlist"
        label="Wishlist"
      >

        <Heart className="h-5 w-5" />

        <IconBadge
          count={wishlistCount}
        />

      </IconButton>





      {/* =====================================================
          Cart
      ====================================================== */}

      <IconButton
        onClick={openCart}
        label="Cart"
      >

        <ShoppingBag className="h-5 w-5" />

        <IconBadge
          count={getCartCount()}
        />

      </IconButton>





      {/* =====================================================
          Notifications
      ====================================================== */}

      {customer && (

        <div
          ref={notificationRef}
          className="relative"
        >

          <IconButton
            onClick={() => {

              setNotificationOpen(
                (previous) => !previous
              );

              setAccountOpen(false);

            }}
            label="Notifications"
          >

            <Bell className="h-5 w-5" />

            <IconBadge
              count={notificationCount}
            />

          </IconButton>





          {/* Notification Dropdown */}

          <div
            className={`
              absolute
              right-0
              top-12
              z-50
              w-[calc(100vw-2rem)]
              max-w-96
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
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }
            `}
          >

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

                  setNotificationOpen(false);

                }}
                className="
                  text-xs
                  text-[#C8A44D]
                  hover:text-white
                "
              >

                Mark all read

              </button>

            </div>





            <div
              className="
                max-h-96
                space-y-2
                overflow-y-auto
              "
            >

              {notifications
                .filter(
                  (item: any) =>
                    !item.is_read
                )
                .slice(0, 5)
                .map((item: any) => {

                  const Icon =
                    getNotificationIcon(
                      item.type
                    );



                  return (

                    <button
                      key={item.id}
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
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          ${getNotificationColor(
                            item.type
                          )}
                        `}
                      >

                        <Icon size={18} />

                      </div>





                      <div className="min-w-0 flex-1">

                        <p
                          className="
                            text-sm
                            font-medium
                            text-white
                          "
                        >

                          {item.title}

                        </p>



                        <p
                          className="
                            mt-1
                            line-clamp-2
                            text-xs
                            text-neutral-400
                          "
                        >

                          {item.message}

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
                          shrink-0
                          rounded-full
                          bg-[#C8A44D]
                        "
                      />

                    </button>

                  );

                })}





              {notifications.filter(
                (item: any) =>
                  !item.is_read
              ).length === 0 && (

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

                    We'll notify you about orders and rewards.

                  </p>

                </div>

              )}

            </div>





            <Link
              to="/account/notifications"
              onClick={() =>
                setNotificationOpen(false)
              }
              className="
                mt-4
                block
                text-center
                text-sm
                text-[#C8A44D]
                hover:text-white
              "
            >

              View all notifications

            </Link>

          </div>

        </div>

      )}





      {/* =====================================================
          Account
      ====================================================== */}

      <div
        ref={accountRef}
        className="relative"
      >

        <div
          className="
            flex
            items-center
            gap-2
          "
        >

          {/* Desktop Greeting */}

          {customer && (

            <span
              className="
                hidden
                text-sm
                font-medium
                text-white
                lg:block
              "
            >

              Hi, {customer.first_name} ✨

            </span>

          )}





          {/* Account Button */}

          <IconButton
            onClick={handleAccount}
            label="My Account"
          >

            <User className="h-5 w-5" />

          </IconButton>

        </div>





        {/* =================================================
            Account Dropdown
        ================================================== */}

        {customer && (

          <div
            className={`
              absolute
              right-0
              top-12
              z-50
              w-64
              overflow-hidden
              rounded-2xl
              border
              border-neutral-800
              bg-black
              shadow-2xl
              transition-all
              duration-200

              ${
                accountOpen
                  ? "visible translate-y-0 opacity-100"
                  : "invisible -translate-y-2 opacity-0"
              }
            `}
          >

            {/* Account Header */}

            <div
              className="
                border-b
                border-neutral-800
                bg-gradient-to-br
                from-[#C8A44D]/10
                to-transparent
                px-4
                py-4
              "
            >

              <p
                className="
                  text-xs
                  text-neutral-500
                "
              >

                Welcome back

              </p>



              <p
                className="
                  mt-1
                  text-sm
                  font-semibold
                  text-[#F5E6B8]
                "
              >

                {customer.first_name} ✨

              </p>

            </div>





            {/* Account Menu */}

            <div className="p-2">

              {/* My Account */}

              <AccountMenuItem
                to="/account"
                label="My Account"
                onClick={() =>
                  setAccountOpen(false)
                }
                icon={
                  <User size={16} />
                }
              />



              {/* My Orders */}

              <AccountMenuItem
                to="/account/orders"
                label="My Orders"
                onClick={() =>
                  setAccountOpen(false)
                }
                icon={
                  <Package size={16} />
                }
              />

            </div>





            {/* Logout */}

            <div
              className="
                border-t
                border-neutral-800
                p-2
              "
            >

              <button
                type="button"
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-xl
                  px-3
                  py-2.5
                  text-sm
                  text-neutral-400
                  transition
                  hover:bg-red-500/10
                  hover:text-red-400
                "
              >

                <span
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    bg-neutral-900
                  "
                >

                  <LogOut size={16} />

                </span>



                <span>
                  Logout
                </span>

              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}