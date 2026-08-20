import {
  User,
  Mail,
  Phone,
  ChevronRight,
} from "lucide-react";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";



interface Props {

  onEditProfile: () => void;

}



export default function ProfileCard({

  onEditProfile,

}: Props) {


  const {
    customer,
  } = useAuth();



  if (!customer) {

    return null;

  }



  return (

    <section
      className="
        overflow-hidden
        rounded-2xl
        border
        border-neutral-800
        bg-[#0D0D0D]
        shadow-[0_10px_35px_rgba(0,0,0,0.18)]
      "
    >


      {/* =====================================================
          PROFILE HEADER
      ====================================================== */}

      <div
        className="
          flex
          items-center
          gap-4
          border-b
          border-neutral-800
          px-4
          py-4
          sm:px-5
          sm:py-5
        "
      >


        {/* ===================================================
            AVATAR
        ==================================================== */}

        <div
          className="
            relative
            flex
            h-14
            w-14
            shrink-0
            items-center
            justify-center
            overflow-hidden
            rounded-full
            border
            border-[#C8A44D]/35
            bg-[#C8A44D]/10
            shadow-[0_0_0_4px_rgba(200,164,77,0.05)]
            sm:h-16
            sm:w-16
          "
        >

          {
            customer.avatar

              ? (

                <img
                  src={
                    customer.avatar ||
                    "/default-avatar.png"
                  }
                  alt="Profile"
                  onError={(
                    event
                  ) => {

                    event.currentTarget.src =
                      "/default-avatar.png";

                  }}
                  className="
                    h-full
                    w-full
                    object-cover
                  "
                />

              )

              : (

                <User
                  size={26}
                  className="
                    text-[#C8A44D]
                  "
                  strokeWidth={1.8}
                />

              )
          }

        </div>



        {/* ===================================================
            CUSTOMER INFO
        ==================================================== */}

        <div
          className="
            min-w-0
            flex-1
          "
        >

          <p
            className="
              text-[10px]
              font-medium
              uppercase
              tracking-[0.16em]
              text-[#C8A44D]
            "
          >
            T&M Member
          </p>


          <h2
            className="
              mt-1
              truncate
              text-lg
              font-semibold
              tracking-[-0.01em]
              text-white
              sm:text-xl
            "
          >

            {customer.first_name}

            {" "}

            {customer.last_name}

          </h2>


          <p
            className="
              mt-0.5
              text-xs
              text-neutral-500
            "
          >
            Your personal account
          </p>

        </div>



        {/* ===================================================
            EDIT BUTTON
        ==================================================== */}

        <button
          type="button"
          onClick={
            onEditProfile
          }
          className="
            group
            flex
            shrink-0
            items-center
            gap-1
            rounded-full
            border
            border-[#C8A44D]/45
            px-3
            py-2
            text-[11px]
            font-medium
            text-[#C8A44D]
            transition-all
            duration-200
            hover:border-[#C8A44D]
            hover:bg-[#C8A44D]/10
            hover:text-[#E0C06A]
            active:scale-95
            sm:px-3.5
          "
        >

          <span>
            Edit
          </span>

          <ChevronRight
            size={13}
            className="
              transition-transform
              duration-200
              group-hover:translate-x-0.5
            "
          />

        </button>

      </div>



      {/* =====================================================
          CONTACT DETAILS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          divide-y
          divide-neutral-800
          sm:grid-cols-2
          sm:divide-x
          sm:divide-y-0
        "
      >


        {/* ===================================================
            EMAIL
        ==================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
            px-4
            py-3.5
            sm:px-5
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#C8A44D]/10
              text-[#C8A44D]
            "
          >

            <Mail
              size={15}
              strokeWidth={1.8}
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-neutral-500
              "
            >
              Email
            </p>


            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-neutral-300
              "
              title={
                customer.email ||
                "Email not added"
              }
            >

              {
                customer.email ||
                "Email not added"
              }

            </p>

          </div>

        </div>



        {/* ===================================================
            PHONE
        ==================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
            px-4
            py-3.5
            sm:px-5
          "
        >

          <div
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#C8A44D]/10
              text-[#C8A44D]
            "
          >

            <Phone
              size={15}
              strokeWidth={1.8}
            />

          </div>


          <div
            className="
              min-w-0
            "
          >

            <p
              className="
                text-[9px]
                font-medium
                uppercase
                tracking-[0.14em]
                text-neutral-500
              "
            >
              Phone
            </p>


            <p
              className="
                mt-0.5
                truncate
                text-xs
                text-neutral-300
              "
            >

              {
                customer.phone ||
                "Phone not added"
              }

            </p>

          </div>

        </div>


      </div>


    </section>

  );

}
