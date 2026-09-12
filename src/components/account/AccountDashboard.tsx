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
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowLeft,
  Bell,
  ChevronRight,
  Gift,
  Headphones,
  Heart,
  LogOut,
  MapPin,
  Package,
  UserRound,
  Wallet,
} from "lucide-react";

import {
  supabase,
} from "@/shared/lib/supabase";





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


  // =========================================================
  // T&M WALLET
  // =========================================================

  const [
    walletBalance,
    setWalletBalance,
  ] = useState<number | null>(null);


  const [
    walletLoading,
    setWalletLoading,
  ] = useState(true);


  useEffect(() => {

    let mounted = true;


    async function loadWallet() {

      if (!customer?.id) {

        if (mounted) {

          setWalletBalance(null);
          setWalletLoading(false);

        }

        return;

      }


      try {

        setWalletLoading(true);


        /*
         * This securely finds the logged-in customer's
         * wallet and creates it if it doesn't exist.
         */
        const {
          data,
          error,
        } = await supabase.rpc(
          "get_or_create_my_wallet"
        );


        if (error) {

          console.error(
            "T&M Wallet error:",
            error
          );

          return;

        }


        if (!mounted) return;


        const wallet =
          Array.isArray(data)
            ? data[0]
            : data;


        if (wallet) {

          setWalletBalance(
            Number(
              wallet.balance_paise || 0
            )
          );

        }

      }

      catch (error) {

        console.error(
          "Failed to load T&M Wallet:",
          error
        );

      }

      finally {

        if (mounted) {

          setWalletLoading(false);

        }

      }

    }


    loadWallet();


    return () => {

      mounted = false;

    };

  }, [customer?.id]);





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





  function formatWalletBalance(
    balancePaise: number | null
  ) {

    if (
      balancePaise === null
    ) {

      return "—";

    }


    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      balancePaise / 100
    );

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
        ================================================= */}

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
              lg:grid-cols-4
            "
          >


            {/* =================================================
                ORDERS
            ================================================== */}

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




            {/* =================================================
                REVIEW & EARN — HIGHLIGHTED
            ================================================== */}

            <Link
              to="/account/review-earn"
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#C8A44D]/70
                bg-gradient-to-br
                from-[#211B0F]
                via-[#14110C]
                to-[#0D0D0D]
                p-4
                shadow-[0_0_20px_rgba(200,164,77,0.12)]
                transition-all
                duration-300
                hover:border-[#C8A44D]
                hover:shadow-[0_0_28px_rgba(200,164,77,0.22)]
                active:scale-[0.98]
              "
            >

              {/* Highlight glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-24
                  w-24
                  rounded-full
                  bg-[#C8A44D]/20
                  blur-2xl
                  transition-all
                  duration-300
                  group-hover:bg-[#C8A44D]/30
                "
              />


              {/* Earn rewards badge */}

              <div
                className="
                  absolute
                  right-3
                  top-3
                  rounded-full
                  border
                  border-[#C8A44D]/40
                  bg-[#C8A44D]/10
                  px-2
                  py-1
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-wider
                  text-[#C8A44D]
                "
              >
                Earn Rewards
              </div>


              <div
                className="
                  relative
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
                    bg-[#C8A44D]/15
                    text-[#C8A44D]
                    ring-1
                    ring-[#C8A44D]/20
                  "
                >

                  <Gift
                    size={19}
                  />

                </div>


                <ChevronRight
                  size={17}
                  className="
                    mt-1
                    text-[#C8A44D]/70
                    transition-all
                    duration-200
                    group-hover:translate-x-0.5
                    group-hover:text-[#C8A44D]
                  "
                />

              </div>


              <p
                className="
                  relative
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >
                Review & Earn
              </p>


              <p
                className="
                  relative
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-400
                "
              >
                Review your purchases & earn wallet rewards
              </p>


              {/* Reward hint */}

              <p
                className="
                  relative
                  mt-2
                  text-[10px]
                  font-medium
                  text-[#C8A44D]
                "
              >
                Earn up to ₹20 per review
              </p>

            </Link>




            {/* =================================================
                WISHLIST
            ================================================== */}

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




            {/* =================================================
                ADDRESSES
            ================================================== */}

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




            {/* =================================================
                T&M WALLET
            ================================================== */}

            <Link
              to="/account/wallet"
              className="
                group
                relative
                overflow-hidden
                rounded-2xl
                border
                border-[#C8A44D]/30
                bg-gradient-to-br
                from-[#15130F]
                via-[#0D0D0D]
                to-[#0D0D0D]
                p-4
                transition-all
                duration-300
                hover:border-[#C8A44D]/70
                hover:bg-[#15120D]
                active:scale-[0.98]
              "
            >

              {/* Subtle gold glow */}

              <div
                className="
                  pointer-events-none
                  absolute
                  -right-8
                  -top-8
                  h-20
                  w-20
                  rounded-full
                  bg-[#C8A44D]/10
                  blur-2xl
                  transition-opacity
                  duration-300
                  group-hover:bg-[#C8A44D]/15
                "
              />


              <div
                className="
                  relative
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

                  <Wallet
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
                  relative
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >
                T&M Wallet
              </p>


              <p
                className="
                  relative
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                {walletLoading
                  ? "Loading balance..."
                  : `${formatWalletBalance(walletBalance)} available`
                }
              </p>

            </Link>

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