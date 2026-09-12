import {
  Bell,
  Package,
  CreditCard,
  Gift,
  Truck,
  ChevronRight,
} from "lucide-react";


import {
  Link,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerNotifications,
  useMarkNotificationRead,
} from "@/features/notifications/hooks/useNotifications";


import {
  timeAgo,
} from "@/features/notifications/utils/timeAgo";



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
  type: string,
  theme: "light" | "dark"
) {

  if (theme === "light") {

    switch (type) {

      case "payment":
        return "bg-emerald-50 text-emerald-600";

      case "reward":
        return "bg-purple-50 text-purple-600";

      case "shipping":
        return "bg-blue-50 text-blue-600";

      case "order":
        return "bg-[#C8A44D]/10 text-[#9A7A22]";

      default:
        return "bg-neutral-100 text-neutral-500";

    }

  }

  switch (type) {

    case "payment":
      return "bg-emerald-500/10 text-emerald-400";

    case "reward":
      return "bg-purple-500/10 text-purple-400";

    case "shipping":
      return "bg-blue-500/10 text-blue-400";

    case "order":
      return "bg-[#C8A44D]/10 text-[#C8A44D]";

    default:
      return "bg-neutral-800 text-neutral-400";

  }

}



interface RecentNotificationsProps {
  theme: "light" | "dark";
}


export default function RecentNotifications({
  theme,
}: RecentNotificationsProps) {


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
  } = useMarkNotificationRead();



  function handleClick(
    item: any
  ) {

    if (!item.is_read) {

      markRead(
        item.id
      );

    }

  }



  if (isLoading) {

    return (

      <div
        className={`
          px-4
          py-8
          text-center
          text-sm
          ${
            theme === "light"
              ? "text-neutral-500"
              : "text-neutral-400"
          }
        `}
      >

        Loading activity...

      </div>

    );

  }



  return (

    <div>

      {
        notifications.length === 0 ? (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              px-5
              py-10
              text-center
            "
          >

            <div
              className="
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

              <Bell
                size={24}
                strokeWidth={1.8}
              />

            </div>


            <p
              className={`
                mt-4
                text-sm
                font-medium
                ${
                  theme === "light"
                    ? "text-neutral-900"
                    : "text-white"
                }
              `}
            >
              You're all caught up
            </p>


            <p
              className="
                mt-1
                max-w-[260px]
                text-xs
                leading-5
                text-neutral-500
              "
            >
              New order and account updates will appear here.
            </p>

          </div>

        ) : (

          <div
            className={`
              divide-y
              ${
                theme === "light"
                  ? "divide-neutral-200"
                  : "divide-neutral-800"
              }
            `}
          >

            {
              notifications
                .slice(0, 4)
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
                          handleClick(
                            item
                          )
                        }
                        className={`
                          group
                          flex
                          w-full
                          items-start
                          gap-3
                          px-4
                          py-4
                          text-left
                          transition-colors
                          duration-200
                          ${
                            theme === "light"
                              ? "hover:bg-[#faf8f2] active:bg-[#f5f1e7]"
                              : "hover:bg-[#111111] active:bg-[#151515]"
                          }
                          sm:px-5

                          ${
                            item.is_read
                              ? ""
                              : theme === "light"
                                ? "bg-[#C8A44D]/[0.055]"
                                : "bg-[#C8A44D]/[0.035]"
                          }
                        `}
                      >


                        {/* =================================
                            ICON
                        ================================== */}

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${getNotificationColor(
                              item.type,
                              theme
                            )}
                          `}
                        >

                          <Icon
                            size={17}
                            strokeWidth={1.9}
                          />

                        </div>



                        {/* =================================
                            CONTENT
                        ================================== */}

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
                              gap-2
                            "
                          >

                            <p
                              className={`
                                min-w-0
                                flex-1
                                line-clamp-1
                                text-sm
                                font-medium
                                ${
                                  theme === "light"
                                    ? "text-neutral-900"
                                    : "text-white"
                                }
                              `}
                            >

                              {
                                item.title
                              }

                            </p>


                            {
                              !item.is_read && (

                                <span
                                  className="
                                    mt-1.5
                                    h-1.5
                                    w-1.5
                                    shrink-0
                                    rounded-full
                                    bg-[#C8A44D]
                                    shadow-[0_0_0_3px_rgba(200,164,77,0.08)]
                                  "
                                  aria-label="Unread"
                                />

                              )
                            }

                          </div>


                          <p
                            className={`
                              mt-1
                              line-clamp-1
                              text-[11px]
                              leading-4
                              ${
                                theme === "light"
                                  ? "text-neutral-500"
                                  : "text-neutral-500"
                              }
                            `}
                          >

                            {
                              item.message
                            }

                          </p>


                          <p
                            className={`
                              mt-1.5
                              text-[10px]
                              ${
                                theme === "light"
                                  ? "text-neutral-500"
                                  : "text-neutral-600"
                              }
                            `}
                          >

                            {
                              timeAgo(
                                item.created_at
                              )
                            }

                          </p>

                        </div>



                        {/* =================================
                            NAVIGATION CUE
                        ================================== */}

                        <ChevronRight
                          size={17}
                          className={`
                            mt-2
                            shrink-0
                            ${
                              theme === "light"
                                ? "text-neutral-400"
                                : "text-neutral-700"
                            }
                            transition-all
                            duration-200
                            group-hover:translate-x-0.5
                            group-hover:text-[#C8A44D]
                          `}
                        />

                      </button>

                    );

                  }
                )
            }

          </div>

        )
      }



      {/* =====================================================
          VIEW ALL
      ====================================================== */}

      {
        notifications.length > 4 && (

          <Link
            to="/account/notifications"
            className={`
              flex
              items-center
              justify-center
              gap-1
              border-t
              ${
                theme === "light"
                  ? "border-neutral-200"
                  : "border-neutral-800"
              }
              px-4
              py-3.5
              text-xs
              font-medium
              text-[#C8A44D]
              transition-colors
              ${
                theme === "light"
                  ? "hover:bg-[#faf8f2] hover:text-[#9A7A22]"
                  : "hover:bg-[#111111] hover:text-white"
              }
              sm:px-5
            `}
          >

            View all activity

            <ChevronRight
              size={14}
            />

          </Link>

        )
      }

    </div>

  );

}
