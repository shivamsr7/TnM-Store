import {
  useMemo,
  useState,
} from "react";


import {
  useNavigate,
} from "react-router-dom";


import {
  Bell,
  CheckCheck,
  ChevronRight,
  CreditCard,
  Gift,
  Package,
  Truck,
} from "lucide-react";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useNotifications";


import {
  timeAgo,
} from "../utils/timeAgo";


import {
  groupNotifications,
} from "../utils/groupNotifications";





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





function getNotificationStyle(
  type: string
) {

  switch (type) {

    case "payment":
      return {
        icon:
          "bg-emerald-500/10 text-emerald-400",
        dot:
          "bg-emerald-400",
      };

    case "reward":
      return {
        icon:
          "bg-purple-500/10 text-purple-400",
        dot:
          "bg-purple-400",
      };

    case "shipping":
      return {
        icon:
          "bg-blue-500/10 text-blue-400",
        dot:
          "bg-blue-400",
      };

    case "order":
      return {
        icon:
          "bg-[#C8A44D]/10 text-[#C8A44D]",
        dot:
          "bg-[#C8A44D]",
      };

    default:
      return {
        icon:
          "bg-neutral-800 text-neutral-400",
        dot:
          "bg-neutral-400",
      };

  }

}





export default function NotificationsPage() {


  const navigate =
    useNavigate();


  const [
    tab,
    setTab,
  ] = useState<
    "all" | "unread"
  >("all");


  const {
    customer,
  } = useAuth();


  const {
    data: notifications = [],
    isLoading,
  } = useCustomerNotifications(
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





  const unreadCount =
    useMemo(
      () =>
        notifications.filter(
          (
            item: any
          ) =>
            !item.is_read
        ).length,
      [
        notifications,
      ]
    );





  const filteredNotifications =
    tab === "unread"
      ? notifications.filter(
          (
            item: any
          ) =>
            !item.is_read
        )
      : notifications;





  const groupedNotifications =
    groupNotifications(
      filteredNotifications
    );





  function handleNotificationClick(
    item: any
  ) {

    if (
      !item.is_read
    ) {

      markRead(
        item.id
      );

    }


    if (
      item.reference_id
    ) {

      navigate(
        `/account/orders/${item.reference_id}`
      );

    }

  }





  if (!customer) {

    return (

      <div
        className="
          min-h-[60vh]
          bg-black
          px-4
          py-12
          text-center
          text-sm
          text-neutral-400
        "
      >

        Please login

      </div>

    );

  }





  if (isLoading) {

    return (

      <div
        className="
          min-h-[60vh]
          bg-black
          px-4
          py-12
          text-center
          text-sm
          text-neutral-400
        "
      >

        Loading your activity...

      </div>

    );

  }





  return (

    <div
      className="
        min-h-screen
        bg-black
        px-4
        pb-10
        pt-5
        text-white
        sm:px-6
      "
    >

      <div
        className="
          mx-auto
          max-w-3xl
        "
      >


        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >

          <div>

            <div
              className="
                flex
                items-center
                gap-2
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#C8A44D]/10
                  text-[#C8A44D]
                "
              >

                <Bell
                  size={18}
                  strokeWidth={1.9}
                />

              </div>


              <p
                className="
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#C8A44D]
                "
              >
                Account activity
              </p>

            </div>


            <h1
              className="
                mt-3
                text-3xl
                font-semibold
                tracking-tight
                text-white
                sm:text-4xl
              "
            >
              Notifications
            </h1>


            <p
              className="
                mt-1.5
                text-sm
                leading-5
                text-neutral-500
              "
            >
              Stay updated on your orders, payments and account.
            </p>

          </div>


          {
            unreadCount > 0 && (

              <button
                type="button"
                onClick={() => {

                  if (
                    customer?.id
                  ) {

                    markAllRead(
                      customer.id
                    );

                  }

                }}
                className="
                  mt-1
                  inline-flex
                  shrink-0
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#C8A44D]/25
                  bg-[#C8A44D]/[0.05]
                  px-3
                  py-2
                  text-[11px]
                  font-medium
                  text-[#C8A44D]
                  transition-all
                  duration-200
                  hover:border-[#C8A44D]/50
                  hover:bg-[#C8A44D]/10
                  hover:text-white
                  active:scale-95
                "
              >

                <CheckCheck
                  size={14}
                />

                Mark all read

              </button>

            )
          }

        </div>




        {/* =================================================
            SUMMARY
        ================================================== */}

        <div
          className="
            mt-5
            flex
            items-center
            justify-between
            gap-3
            rounded-2xl
            border
            border-neutral-800
            bg-[#0D0D0D]
            px-4
            py-3.5
          "
        >

          <div
            className="
              flex
              items-center
              gap-3
            "
          >

            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-full
                bg-[#C8A44D]/10
                text-[#C8A44D]
              "
            >

              <Bell
                size={15}
              />

            </div>


            <div>

              <p
                className="
                  text-xs
                  font-medium
                  text-white
                "
              >

                {
                  unreadCount === 0
                    ? "You're all caught up"
                    : `${unreadCount} ${
                        unreadCount === 1
                          ? "unread update"
                          : "unread updates"
                      }`
                }

              </p>


              <p
                className="
                  mt-0.5
                  text-[10px]
                  text-neutral-600
                "
              >

                {notifications.length} total updates

              </p>

            </div>

          </div>


          {
            unreadCount > 0 && (

              <span
                className="
                  h-2
                  w-2
                  rounded-full
                  bg-[#C8A44D]
                  shadow-[0_0_0_4px_rgba(200,164,77,0.08)]
                "
              />

            )
          }

        </div>




        {/* =================================================
            FILTER
        ================================================== */}

        <div
          className="
            mt-5
            inline-flex
            rounded-full
            border
            border-neutral-800
            bg-[#0D0D0D]
            p-1
          "
        >

          <button
            type="button"
            onClick={() =>
              setTab("all")
            }
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              transition-all
              duration-200

              ${
                tab === "all"
                  ? "bg-[#C8A44D] text-black"
                  : "text-neutral-400 hover:text-white"
              }
            `}
          >

            All

            <span
              className={`
                text-[10px]
                ${
                  tab === "all"
                    ? "text-black/60"
                    : "text-neutral-600"
                }
              `}
            >
              {notifications.length}
            </span>

          </button>


          <button
            type="button"
            onClick={() =>
              setTab("unread")
            }
            className={`
              inline-flex
              items-center
              gap-1.5
              rounded-full
              px-4
              py-2
              text-xs
              font-medium
              transition-all
              duration-200

              ${
                tab === "unread"
                  ? "bg-[#C8A44D] text-black"
                  : "text-neutral-400 hover:text-white"
              }
            `}
          >

            Unread

            {
              unreadCount > 0 && (

                <span
                  className={`
                    text-[10px]
                    ${
                      tab === "unread"
                        ? "text-black/60"
                        : "text-[#C8A44D]"
                    }
                  `}
                >
                  {unreadCount}
                </span>

              )
            }

          </button>

        </div>




        {/* =================================================
            ACTIVITY
        ================================================== */}

        {
          Object.keys(
            groupedNotifications
          ).length === 0 ? (

            <div
              className="
                mt-5
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                px-5
                py-12
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[#C8A44D]/10
                  text-[#C8A44D]
                "
              >

                <CheckCheck
                  size={24}
                  strokeWidth={1.8}
                />

              </div>


              <h3
                className="
                  mt-4
                  text-sm
                  font-semibold
                  text-white
                "
              >

                {
                  tab === "unread"
                    ? "You're all caught up"
                    : "No notifications yet"
                }

              </h3>


              <p
                className="
                  mx-auto
                  mt-1.5
                  max-w-[290px]
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >

                {
                  tab === "unread"
                    ? "There are no unread updates waiting for you."
                    : "We'll keep you updated about orders, payments, shipping and rewards."
                }

              </p>

            </div>

          ) : (

            <div
              className="
                mt-6
                space-y-7
              "
            >

              {
                Object.entries(
                  groupedNotifications
                ).map(
                  (
                    [
                      group,
                      items,
                    ]: any
                  ) => (

                    <section
                      key={group}
                    >

                      <div
                        className="
                          mb-3
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <h2
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.14em]
                            text-neutral-500
                          "
                        >

                          {group}

                        </h2>


                        <span
                          className="
                            text-[10px]
                            text-neutral-700
                          "
                        >

                          {items.length}{" "}
                          {items.length === 1
                            ? "update"
                            : "updates"}

                        </span>

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

                        {
                          items.map(
                            (
                              item: any,
                              index: number
                            ) => {

                              const Icon =
                                getNotificationIcon(
                                  item.type
                                );


                              const style =
                                getNotificationStyle(
                                  item.type
                                );


                              const isUnread =
                                !item.is_read;


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
                                  className={`
                                    group
                                    relative
                                    flex
                                    w-full
                                    items-start
                                    gap-3.5
                                    px-4
                                    py-4
                                    text-left
                                    transition-colors
                                    duration-200
                                    hover:bg-[#111111]
                                    active:bg-[#151515]
                                    sm:px-5

                                    ${
                                      index > 0
                                        ? "border-t border-neutral-800"
                                        : ""
                                    }

                                    ${
                                      isUnread
                                        ? "bg-[#C8A44D]/[0.025]"
                                        : ""
                                    }
                                  `}
                                >

                                  {/* Timeline */}

                                  <div
                                    className="
                                      relative
                                      flex
                                      w-10
                                      shrink-0
                                      justify-center
                                    "
                                  >

                                    {
                                      index <
                                        items.length - 1 && (

                                        <span
                                          className="
                                            absolute
                                            left-1/2
                                            top-10
                                            h-[calc(100%+1rem)]
                                            w-px
                                            -translate-x-1/2
                                            bg-neutral-800
                                          "
                                        />

                                      )
                                    }


                                    <div
                                      className={`
                                        relative
                                        z-10
                                        flex
                                        h-10
                                        w-10
                                        items-center
                                        justify-center
                                        rounded-xl
                                        ${style.icon}
                                      `}
                                    >

                                      <Icon
                                        size={17}
                                        strokeWidth={1.9}
                                      />

                                    </div>

                                  </div>


                                  {/* Content */}

                                  <div
                                    className="
                                      min-w-0
                                      flex-1
                                    "
                                  >

                                    <div
                                      className="
                                        flex
                                        items-start
                                        justify-between
                                        gap-3
                                      "
                                    >

                                      <div
                                        className="
                                          min-w-0
                                          flex-1
                                        "
                                      >

                                        <div
                                          className="
                                            flex
                                            items-center
                                            gap-2
                                          "
                                        >

                                          <h3
                                            className={`
                                              truncate
                                              text-sm
                                              font-medium
                                              ${
                                                isUnread
                                                  ? "text-white"
                                                  : "text-neutral-300"
                                              }
                                            `}
                                          >

                                            {item.title}

                                          </h3>


                                          {
                                            isUnread && (

                                              <span
                                                className={`
                                                  h-1.5
                                                  w-1.5
                                                  shrink-0
                                                  rounded-full
                                                  ${style.dot}
                                                `}
                                                aria-label="Unread"
                                              />

                                            )
                                          }

                                        </div>


                                        <p
                                          className={`
                                            mt-1.5
                                            text-xs
                                            leading-5
                                            ${
                                              isUnread
                                                ? "text-neutral-400"
                                                : "text-neutral-500"
                                            }
                                          `}
                                        >

                                          {item.message}

                                        </p>

                                      </div>


                                      <div
                                        className="
                                          flex
                                          shrink-0
                                          items-center
                                          gap-1
                                          pt-0.5
                                        "
                                      >

                                        <span
                                          className="
                                            text-[10px]
                                            text-neutral-600
                                          "
                                        >

                                          {
                                            timeAgo(
                                              item.created_at
                                            )
                                          }

                                        </span>


                                        {
                                          item.reference_id && (

                                            <ChevronRight
                                              size={14}
                                              className="
                                                text-neutral-700
                                                transition-all
                                                duration-200
                                                group-hover:translate-x-0.5
                                                group-hover:text-[#C8A44D]
                                              "
                                            />

                                          )
                                        }

                                      </div>

                                    </div>


                                    {
                                      item.reference_id && (

                                        <div
                                          className="
                                            mt-2.5
                                            inline-flex
                                            items-center
                                            gap-1
                                            text-[10px]
                                            font-medium
                                            text-[#C8A44D]/80
                                          "
                                        >

                                          View related order

                                          <ChevronRight
                                            size={12}
                                          />

                                        </div>

                                      )
                                    }

                                  </div>

                                </button>

                              );

                            }
                          )
                        }

                      </div>

                    </section>

                  )
                )
              }

            </div>

          )
        }

      </div>

    </div>

  );

}
