import ProfileCard from "./ProfileCard";
import RecentOrders from "./RecentOrders";
import AccountActions from "./AccountActions";
import RecentNotifications from "./RecentNotifications";

import EditProfileDialog from "@/components/account/EditProfileDialog";
import SavedAddressesDialog from "./SavedAddressesDialog";

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
} from "lucide-react";



export default function AccountDashboard() {

  const {
    customer,
  } = useAuth();



  const [
    showAddresses,
    setShowAddresses,
  ] = useState(false);



  const [
    showEditProfile,
    setShowEditProfile,
  ] = useState(false);



  return (

    <div
      className="
        min-h-screen
        bg-black
        px-4
        py-5
        text-white
        sm:px-6
        lg:px-8
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
          space-y-5
        "
      >



        {/* =================================================
            Back to Home
        ================================================== */}

        <Link
          to="/"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-neutral-400
            transition
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
            Account Header
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
              text-[#C8A44D]
              sm:text-3xl
            "
          >
            My Account ✨
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
            Content
        ================================================== */}

        <div
          className="
            grid
            gap-5
            lg:grid-cols-[1fr_320px]
          "
        >



          {/* =================================================
              Main Content
          ================================================== */}

          <div
            className="
              space-y-5
            "
          >

            <ProfileCard
              onEditProfile={() =>
                setShowEditProfile(true)
              }
            />



            <RecentOrders />



            <RecentNotifications />

          </div>



          {/* =================================================
              Sidebar
          ================================================== */}

          <div
            className="
              lg:sticky
              lg:top-5
              lg:self-start
            "
          >

            <AccountActions
              onOpenAddresses={() =>
                setShowAddresses(true)
              }
            />

          </div>

        </div>



        {/* =================================================
            Dialogs
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

      </div>

    </div>

  );
}