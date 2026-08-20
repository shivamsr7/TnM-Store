import ProfileCard from "./ProfileCard";
import RecentOrders from "./RecentOrders";
import RecentNotifications from "./RecentNotifications";

import EditProfileDialog from "@/components/account/EditProfileDialog";
import SavedAddressesDialog from "./SavedAddressesDialog";
import ContactSupportDialog from "./ContactSupportDialog";
import LogoutConfirmDialog from "./LogoutConfirmDialog";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";





export default function AccountDashboard() {


  const {
    customer,
    logout,
  } = useAuth();


  const [
    showAddresses,
    setShowAddresses,
  ] = useState(false);


  const [
    showEditProfile,
    setShowEditProfile,
  ] = useState(false);


  const [
    showSupport,
    setShowSupport,
  ] = useState(false);


  const [
    showLogout,
    setShowLogout,
  ] = useState(false);


  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);




  async function handleLogout() {

    try {

      setLoggingOut(true);

      await logout();

      setShowLogout(false);

    }

    finally {

      setLoggingOut(false);

    }

  }





  return (

    <div
      className="
        min-h-screen
        bg-black
        px-4
        pb-8
        pt-5
        text-white
        sm:px-6
        lg:px-8
      "
    >


      <div
        className="
          mx-auto
          max-w-5xl
          space-y-6
        "
      >



        {/* =================================================
            BACK TO HOME
        ================================================== */}

        <Link
          to="/"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-neutral-400
            transition-colors
            hover:text-[#C8A44D]
          "
        >

          <ArrowLeft
            size={17}
            strokeWidth={1.8}
          />

          <span>
            Back to T&M Jewels
          </span>

        </Link>





        {/* =================================================
            ACCOUNT HEADER
        ================================================== */}

        <div
          className="
            space-y-1
          "
        >

          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
              text-[#C8A44D]
              sm:text-3xl
            "
          >
            My Account
          </h1>


          <p
            className="
              text-sm
              text-neutral-400
            "
          >
            Welcome back, {customer?.first_name}
          </p>

        </div>





        {/* =================================================
            PROFILE
        ================================================== */}

        <ProfileCard
          onEditProfile={() =>
            setShowEditProfile(true)
          }
        />





        {/* =================================================
            YOUR T&M
        ================================================== */}

        <section
          className="
            space-y-3
          "
        >

          <div
            className="
              flex
              items-end
              justify-between
              gap-3
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#C8A44D]
                "
              >
                Your T&M
              </p>

              <h2
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Quick access
              </h2>

            </div>

            <span
              className="
                text-[11px]
                text-neutral-500
              "
            >
              Everything in one place
            </span>

          </div>




          <div
            className="
              grid
              grid-cols-2
              gap-3
              lg:grid-cols-3
            "
          >


            {/* Orders */}

            <Link
              to="/account/orders"
              className="
                group
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
                transition-all
                duration-200
                hover:border-[#C8A44D]/50
                hover:bg-[#111111]
                active:scale-[0.98]
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-2
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8A44D]/10
                    text-[#C8A44D]
                  "
                >

                  <Package
                    size={19}
                  />

                </div>


                <ChevronRight
                  size={17}
                  className="
                    text-neutral-600
                    transition-colors
                    group-hover:text-[#C8A44D]
                  "
                />

              </div>


              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >
                My Orders
              </p>


              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Track and manage orders
              </p>

            </Link>




            {/* Wishlist */}

            <Link
              to="/wishlist"
              className="
                group
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
                transition-all
                duration-200
                hover:border-[#C8A44D]/50
                hover:bg-[#111111]
                active:scale-[0.98]
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-2
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8A44D]/10
                    text-[#C8A44D]
                  "
                >

                  <Heart
                    size={19}
                  />

                </div>


                <ChevronRight
                  size={17}
                  className="
                    text-neutral-600
                    transition-colors
                    group-hover:text-[#C8A44D]
                  "
                />

              </div>


              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Wishlist
              </p>


              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Your saved favourites
              </p>

            </Link>




            {/* Addresses */}

            <button
              type="button"
              onClick={() =>
                setShowAddresses(true)
              }
              className="
                group
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
                text-left
                transition-all
                duration-200
                hover:border-[#C8A44D]/50
                hover:bg-[#111111]
                active:scale-[0.98]
              "
            >

              <div
                className="
                  flex
                  items-start
                  justify-between
                  gap-2
                "
              >

                <div
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#C8A44D]/10
                    text-[#C8A44D]
                  "
                >

                  <MapPin
                    size={19}
                  />

                </div>


                <ChevronRight
                  size={17}
                  className="
                    text-neutral-600
                    transition-colors
                    group-hover:text-[#C8A44D]
                  "
                />

              </div>


              <p
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Addresses
              </p>


              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Manage delivery addresses
              </p>

            </button>

          </div>

        </section>





        {/* =================================================
            RECENT ORDERS
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-neutral-800
            bg-[#0D0D0D]
          "
        >

          <div
            className="
              border-b
              border-neutral-800
              px-4
              py-4
              sm:px-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#C8A44D]
                  "
                >
                  Your purchases
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Recent Orders
                </h2>

              </div>


              <Link
                to="/account/orders"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-[#C8A44D]
                  transition-colors
                  hover:text-white
                "
              >

                View all

                <ChevronRight
                  size={14}
                />

              </Link>

            </div>

          </div>


          <div
            className="
              p-0
            "
          >

            <RecentOrders />

          </div>

        </section>





        {/* =================================================
            RECENT ACTIVITY
        ================================================== */}

        <section
          className="
            overflow-hidden
            rounded-2xl
            border
            border-neutral-800
            bg-[#0D0D0D]
          "
        >

          <div
            className="
              border-b
              border-neutral-800
              px-4
              py-4
              sm:px-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.18em]
                    text-[#C8A44D]
                  "
                >
                  Stay updated
                </p>

                <h2
                  className="
                    mt-1
                    text-lg
                    font-semibold
                    text-white
                  "
                >
                  Recent Activity
                </h2>

              </div>


              <Link
                to="/account/notifications"
                className="
                  inline-flex
                  items-center
                  gap-1
                  text-xs
                  font-medium
                  text-[#C8A44D]
                  transition-colors
                  hover:text-white
                "
              >

                View all

                <ChevronRight
                  size={14}
                />

              </Link>

            </div>

          </div>


          <div
            className="
              p-0
            "
          >

            <RecentNotifications />

          </div>

        </section>





        {/* =================================================
            ACCOUNT & SUPPORT
        ================================================== */}

        <section
          className="
            space-y-3
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#C8A44D]
              "
            >
              Account & Support
            </p>

            <h2
              className="
                mt-1
                text-lg
                font-semibold
                text-white
              "
            >
              Manage your account
            </h2>

          </div>


          <div
            className="
              overflow-hidden
              rounded-2xl
              border
              border-neutral-800
              bg-[#0D0D0D]
            "
          >


            {/* Profile */}

            <button
              type="button"
              onClick={() =>
                setShowEditProfile(true)
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                border-b
                border-neutral-800
                px-4
                py-4
                text-left
                transition-colors
                hover:bg-[#111111]
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8A44D]/10
                  text-[#C8A44D]
                "
              >

                <UserRound
                  size={18}
                />

              </div>


              <div
                className="
                  min-w-0
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
                  Personal Information
                </p>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-neutral-500
                  "
                >
                  Edit your profile details
                </p>

              </div>


              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-neutral-600
                  transition-colors
                  group-hover:text-[#C8A44D]
                "
              />

            </button>




            {/* Notifications */}

            <Link
              to="/account/notifications"
              className="
                group
                flex
                w-full
                items-center
                gap-3
                border-b
                border-neutral-800
                px-4
                py-4
                text-left
                transition-colors
                hover:bg-[#111111]
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8A44D]/10
                  text-[#C8A44D]
                "
              >

                <Bell
                  size={18}
                />

              </div>


              <div
                className="
                  min-w-0
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
                  Notifications
                </p>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-neutral-500
                  "
                >
                  View all your updates
                </p>

              </div>


              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-neutral-600
                  transition-colors
                  group-hover:text-[#C8A44D]
                "
              />

            </Link>




            {/* Support */}

            <button
              type="button"
              onClick={() =>
                setShowSupport(true)
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                border-b
                border-neutral-800
                px-4
                py-4
                text-left
                transition-colors
                hover:bg-[#111111]
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8A44D]/10
                  text-[#C8A44D]
                "
              >

                <Headphones
                  size={18}
                />

              </div>


              <div
                className="
                  min-w-0
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
                  Contact Support
                </p>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-neutral-500
                  "
                >
                  Need help? We're here for you
                </p>

              </div>


              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-neutral-600
                  transition-colors
                  group-hover:text-[#C8A44D]
                "
              />

            </button>




            {/* Logout */}

            <button
              type="button"
              onClick={() =>
                setShowLogout(true)
              }
              className="
                group
                flex
                w-full
                items-center
                gap-3
                px-4
                py-4
                text-left
                transition-colors
                hover:bg-red-500/5
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-red-500/10
                  text-red-400
                "
              >

                <LogOut
                  size={18}
                />

              </div>


              <div
                className="
                  min-w-0
                  flex-1
                "
              >

                <p
                  className="
                    text-sm
                    font-medium
                    text-red-400
                  "
                >
                  Logout
                </p>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-neutral-600
                  "
                >
                  Sign out of your T&M account
                </p>

              </div>


              <ChevronRight
                size={17}
                className="
                  shrink-0
                  text-neutral-700
                  transition-colors
                  group-hover:text-red-400
                "
              />

            </button>


          </div>

        </section>





        {/* =================================================
            DIALOGS
        ================================================== */}

        <SavedAddressesDialog
          open={showAddresses}
          onClose={() =>
            setShowAddresses(false)
          }
        />


        <EditProfileDialog
          open={showEditProfile}
          onClose={() =>
            setShowEditProfile(false)
          }
        />


        <ContactSupportDialog
          open={showSupport}
          onClose={() =>
            setShowSupport(false)
          }
        />


        <LogoutConfirmDialog
          open={showLogout}
          loading={loggingOut}
          onClose={() =>
            setShowLogout(false)
          }
          onConfirm={handleLogout}
        />


      </div>

    </div>

  );

}
