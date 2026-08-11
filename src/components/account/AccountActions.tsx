import {
  Package,
  MapPin,
  Bell,
  Headphones,
  LogOut,
  ChevronRight,
} from "lucide-react";

import NotificationsDialog from "./NotificationsDialog";
import ContactSupportDialog from "./ContactSupportDialog";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

import {
  useNavigate,
} from "react-router-dom";

import {
  useState,
} from "react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


interface Props {

  onOpenAddresses: () => void;

}


export default function AccountActions({

  onOpenAddresses,

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
   * AUTH
   * =========================================================
   */

  const {
    logout,
  } = useAuth();


  /*
   * =========================================================
   * STATE
   * =========================================================
   */

  const [
    showLogout,
    setShowLogout,
  ] = useState(false);


  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);


  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);


  const [
    showSupport,
    setShowSupport,
  ] = useState(false);


  /*
   * =========================================================
   * ACCOUNT ACTIONS
   * =========================================================
   */

  const actions = [

    {
      title: "My Orders",

      description:
        "Track and manage your orders",

      icon: Package,

      action: () =>
        navigate(
          "/account/orders"
        ),

    },


    {
      title: "Saved Addresses",

      description:
        "Manage delivery addresses",

      icon: MapPin,

      action:
        onOpenAddresses,

    },


    {
      title: "Notifications",

      description:
        "View your updates",

      icon: Bell,

      action: () =>
        setShowNotifications(
          true
        ),

    },


    {
      title: "Contact Support",

      description:
        "Need help? Contact us",

      icon: Headphones,

      action: () =>
        setShowSupport(
          true
        ),

    },

  ];


  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   *
   * This is the important fix.
   *
   * AccountActions is used directly on the Account page.
   * After logout succeeds, we explicitly leave /account.
   *
   * =========================================================
   */

  async function handleLogout() {

    try {

      setLoggingOut(
        true
      );


      await logout();


      /*
       * Close confirmation dialog.
       */

      setShowLogout(
        false
      );


      /*
       * IMPORTANT:
       *
       * Leave the Account page after logout.
       *
       * replace() prevents the logged-out Account page
       * from remaining as the previous authenticated page.
       */

      navigate(
        "/",
        {
          replace: true,
        }
      );

    } catch (
      error
    ) {

      console.error(
        "Logout failed:",
        error
      );

    } finally {

      setLoggingOut(
        false
      );

    }

  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (

    <>

      {/* =====================================================
          ACCOUNT ACTIONS
      ====================================================== */}

      <div
        className="
          rounded-2xl
          border
          border-neutral-800
          bg-neutral-950
          p-5
          lg:sticky
          lg:top-5
        "
      >

        <h2
          className="
            mb-5
            text-lg
            font-semibold
            text-white
          "
        >

          Account

        </h2>


        {/* =================================================
            ACTION LIST
        ================================================== */}

        <div
          className="
            space-y-3
          "
        >

          {actions.map(
            (item) => {

              const Icon =
                item.icon;


              return (

                <button
                  key={
                    item.title
                  }

                  type="button"

                  onClick={
                    item.action
                  }

                  className="
                    group
                    flex
                    min-h-[70px]
                    w-full
                    items-center
                    justify-between
                    rounded-xl
                    border
                    border-neutral-800
                    p-4
                    text-left
                    transition
                    hover:border-[#C8A44D]/50
                    hover:bg-neutral-900
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
                        flex
                        h-11
                        w-11
                        items-center
                        justify-center
                        rounded-full
                        bg-[#C8A44D]/20
                        text-[#C8A44D]
                      "
                    >

                      <Icon
                        size={20}
                      />

                    </div>


                    <div>

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
                          text-xs
                          text-neutral-400
                        "
                      >

                        {item.description}

                      </p>

                    </div>

                  </div>


                  <ChevronRight
                    size={18}
                    className="
                      text-neutral-500
                      transition
                      group-hover:text-[#C8A44D]
                    "
                  />

                </button>

              );

            }
          )}

        </div>


        {/* =================================================
            LOGOUT BUTTON
        ================================================== */}

        <button
          type="button"

          onClick={() =>
            setShowLogout(
              true
            )
          }

          disabled={
            loggingOut
          }

          className="
            mt-5
            flex
            min-h-[50px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            border
            border-red-500/30
            text-sm
            text-red-400
            transition
            hover:bg-red-500/10
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >

          <LogOut
            size={18}
          />

          {loggingOut
            ? "Logging out..."
            : "Logout"}

        </button>

      </div>


      {/* =====================================================
          LOGOUT CONFIRMATION
      ====================================================== */}

      <LogoutConfirmDialog

        open={
          showLogout
        }

        loading={
          loggingOut
        }

        onClose={() =>
          setShowLogout(
            false
          )
        }

        onConfirm={
          handleLogout
        }

      />


      {/* =====================================================
          NOTIFICATIONS
      ====================================================== */}

      <NotificationsDialog

        open={
          showNotifications
        }

        onClose={() =>
          setShowNotifications(
            false
          )
        }

      />


      {/* =====================================================
          SUPPORT
      ====================================================== */}

      <ContactSupportDialog

        open={
          showSupport
        }

        onClose={() =>
          setShowSupport(
            false
          )
        }

      />

    </>

  );

}