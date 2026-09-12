import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  ArrowLeft,
  Check,
  ChevronRight,
  Package,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";


import {
  useNavigate,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerOrders,
} from "@/features/orders/hooks/useCustomerOrders";


import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog";





const FILTERS = [
  {
    key: "all",
    label: "All",
  },
  {
    key: "pending",
    label: "Pending",
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },
  {
    key: "packed",
    label: "Packed",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
  {
    key: "cancelled",
    label: "Cancelled",
  },
] as const;



type FilterKey =
  typeof FILTERS[number]["key"];





function OrderStatusBadge({

  status,

}: {

  status: string;

}) {


  const styles: Record<
    string,
    string
  > = {

    pending:
      "border-yellow-500/25 bg-yellow-500/10 text-yellow-400",

    confirmed:
      "border-blue-500/25 bg-blue-500/10 text-blue-400",

    packed:
      "border-purple-500/25 bg-purple-500/10 text-purple-400",

    shipped:
      "border-indigo-500/25 bg-indigo-500/10 text-indigo-400",

    delivered:
      "border-green-500/25 bg-green-500/10 text-green-400",

    cancelled:
      "border-red-500/25 bg-red-500/10 text-red-400",

  };


  return (

    <span
      className={`
        inline-flex
        shrink-0
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-medium
        capitalize
        tracking-wide
        ${
          styles[status] ??
          "border-neutral-700 bg-neutral-800 text-neutral-400"
        }
      `}
    >

      {status}

    </span>

  );

}





function getOrderSearchText(
  order: any
) {

  const values: string[] = [

    order.order_number,

    order.status,

    order.order_status,

  ];


  /*
   * Orders can come back with product information under
   * different nested keys depending on the query/service.
   *
   * Include those common shapes when available so product
   * name search works without changing the order service.
   */

  const items =
    order.items ??
    order.order_items ??
    order.products ??
    [];


  if (
    Array.isArray(items)
  ) {

    items.forEach(
      (
        item: any
      ) => {

        values.push(
          item?.product_name,
          item?.name,
          item?.title,
          item?.product?.name,
          item?.product?.title,
          item?.products?.name,
          item?.products?.title
        );

      }
    );

  }


  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

}





function formatOrderDate(
  value: string
) {

  return new Date(
    value
  ).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}





function formatAmount(
  value: number | string
) {

  return Number(
    value
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

}





export default function MyOrders() {


  const navigate =
    useNavigate();


  const {
    customer,
  } = useAuth();


  const {
    data: orders = [],
    isLoading,
  } = useCustomerOrders(
    customer?.id
  );


  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState<
    string | null
  >(null);


  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    activeFilter,
    setActiveFilter,
  ] = useState<FilterKey>(
    "all"
  );


  const [
    visibleOrderCount,
    setVisibleOrderCount,
  ] = useState(6);


  const ORDERS_PER_LOAD = 6;





  const filteredOrders =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        return orders.filter(
          (
            order: any
          ) => {

            const matchesFilter =
              activeFilter === "all" ||
              order.order_status ===
                activeFilter;


            if (
              !matchesFilter
            ) {

              return false;

            }


            if (!query) {

              return true;

            }


            return getOrderSearchText(
              order
            ).includes(
              query
            );

          }
        );

      },
      [
        orders,
        searchQuery,
        activeFilter,
      ]
    );





  const visibleOrders =
    filteredOrders.slice(
      0,
      visibleOrderCount
    );


  const hasMoreOrders =
    visibleOrderCount <
    filteredOrders.length;


  useEffect(
    () => {

      setVisibleOrderCount(
        ORDERS_PER_LOAD
      );

    },
    [
      searchQuery,
      activeFilter,
    ]
  );


  const filterCounts =
    useMemo(
      () => {

        const counts: Record<
          FilterKey,
          number
        > = {

          all:
            orders.length,

          pending:
            0,

          confirmed:
            0,

          packed:
            0,

          shipped:
            0,

          delivered:
            0,

          cancelled:
            0,

        };


        orders.forEach(
          (
            order: any
          ) => {

            const status =
              order.order_status as FilterKey;


            if (
              status in counts
            ) {

              counts[status] += 1;

            }

          }
        );


        return counts;

      },
      [
        orders,
      ]
    );





  if (
    isLoading
  ) {

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

        Loading your orders...

      </div>

    );

  }





  if (
    !customer
  ) {

    return (

      <div
        className="
          min-h-[60vh]
          bg-black
          px-4
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

          <Package
            size={24}
            strokeWidth={1.8}
          />

        </div>


        <h3
          className="
            mt-4
            font-semibold
            text-white
          "
        >

          Please login

        </h3>


        <p
          className="
            mt-1
            text-sm
            text-neutral-500
          "
        >

          Login to view your orders

        </p>

      </div>

    );

  }





  return (

    <>

      <div
        className="
          min-h-screen
          bg-black
          px-4
          pb-10
          pt-5
          text-white
          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            mx-auto
            max-w-4xl
          "
        >


          {/* =================================================
              BACK
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/account"
              )
            }
            className="
              group
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
              className="
                transition-transform
                duration-200
                group-hover:-translate-x-0.5
              "
            />

            Back to Account

          </button>




          {/* =================================================
              HEADER
          ================================================== */}

          <div
            className="
              mt-6
              flex
              flex-col
              gap-4
              sm:flex-row
              sm:items-end
              sm:justify-between
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


              <h1
                className="
                  mt-1
                  text-3xl
                  font-semibold
                  tracking-tight
                  text-white
                  sm:text-4xl
                "
              >
                My Orders
              </h1>


              <p
                className="
                  mt-2
                  text-sm
                  text-neutral-400
                "
              >
                Track and manage your T&M Jewels purchases
              </p>

            </div>


            <div
              className="
                inline-flex
                w-fit
                items-center
                gap-2
                rounded-full
                border
                border-[#C8A44D]/20
                bg-[#C8A44D]/[0.06]
                px-3
                py-1.5
                text-xs
                text-[#C8A44D]
              "
            >

              <Package
                size={14}
              />

              {orders.length}

              {" "}

              {
                orders.length === 1
                  ? "order"
                  : "orders"
              }

            </div>

          </div>




          {/* =================================================
              SEARCH
          ================================================== */}

          <div
            className="
              mt-6
              rounded-2xl
              border
              border-neutral-800
              bg-[#0D0D0D]
              p-3
            "
          >

            <div
              className="
                flex
                items-center
                gap-3
                rounded-xl
                border
                border-neutral-800
                bg-black
                px-3.5
                py-3
                transition-colors
                focus-within:border-[#C8A44D]/50
              "
            >

              <Search
                size={18}
                className="
                  shrink-0
                  text-neutral-500
                "
              />


              <input
                type="text"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search by order number or product..."
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-neutral-600
                "
              />


              {
                searchQuery && (

                  <button
                    type="button"
                    onClick={() =>
                      setSearchQuery("")
                    }
                    className="
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-neutral-500
                      transition-colors
                      hover:bg-neutral-800
                      hover:text-white
                    "
                    aria-label="Clear search"
                  >

                    <X
                      size={15}
                    />

                  </button>

                )
              }

            </div>

          </div>




          {/* =================================================
              FILTERS
          ================================================== */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-2
              overflow-x-auto
              pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >

            <SlidersHorizontal
              size={15}
              className="
                mr-1
                shrink-0
                text-neutral-600
              "
            />


            {
              FILTERS.map(
                (
                  filter
                ) => {

                  const active =
                    activeFilter ===
                    filter.key;


                  return (

                    <button
                      key={
                        filter.key
                      }
                      type="button"
                      onClick={() =>
                        setActiveFilter(
                          filter.key
                        )
                      }
                      className={`
                        inline-flex
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3.5
                        py-2
                        text-xs
                        font-medium
                        transition-all
                        duration-200

                        ${
                          active
                            ? "border-[#C8A44D] bg-[#C8A44D] text-black"
                            : "border-neutral-800 bg-[#0D0D0D] text-neutral-400 hover:border-[#C8A44D]/40 hover:text-white"
                        }
                      `}
                    >

                      {
                        active && (

                          <Check
                            size={12}
                            strokeWidth={2.5}
                          />

                        )
                      }

                      {filter.label}


                      <span
                        className={`
                          text-[10px]

                          ${
                            active
                              ? "text-black/60"
                              : "text-neutral-600"
                          }
                        `}
                      >
                        {filterCounts[
                          filter.key
                        ]}
                      </span>

                    </button>

                  );

                }
              )
            }

          </div>




          {/* =================================================
              RESULT SUMMARY
          ================================================== */}

          <div
            className="
              mt-6
              flex
              items-center
              justify-between
              gap-3
            "
          >

            <p
              className="
                text-xs
                text-neutral-500
              "
            >

              {
                searchQuery ||
                activeFilter !== "all"
                  ? `${filteredOrders.length} ${
                      filteredOrders.length === 1
                        ? "order"
                        : "orders"
                    } found`
                  : `${orders.length} ${
                      orders.length === 1
                        ? "order"
                        : "orders"
                    }`

              }

            </p>


            {
              (
                searchQuery ||
                activeFilter !== "all"
              ) && (

                <button
                  type="button"
                  onClick={() => {

                    setSearchQuery("");

                    setActiveFilter(
                      "all"
                    );

                  }}
                  className="
                    text-xs
                    font-medium
                    text-[#C8A44D]
                    transition-colors
                    hover:text-white
                  "
                >

                  Clear filters

                </button>

              )
            }

          </div>




          {/* =================================================
              ORDERS
          ================================================== */}

          <div
            className="
              mt-3
              space-y-3
            "
          >

            {
              filteredOrders.length === 0 ? (

                <div
                  className="
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

                    {
                      searchQuery ||
                      activeFilter !== "all" ? (

                        <Search
                          size={23}
                          strokeWidth={1.8}
                        />

                      ) : (

                        <Package
                          size={23}
                          strokeWidth={1.8}
                        />

                      )
                    }

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
                      searchQuery
                        ? "No matching orders"
                        : activeFilter !== "all"
                          ? `No ${activeFilter} orders`
                          : "No orders yet"
                    }

                  </h3>


                  <p
                    className="
                      mx-auto
                      mt-1.5
                      max-w-[280px]
                      text-xs
                      leading-5
                      text-neutral-500
                    "
                  >

                    {
                      searchQuery
                        ? "Try a different order number or product name."
                        : activeFilter !== "all"
                          ? "Orders with this status will appear here."
                          : "Your T&M Jewels purchases will appear here."
                    }

                  </p>


                  {
                    (
                      searchQuery ||
                      activeFilter !== "all"
                    ) && (

                      <button
                        type="button"
                        onClick={() => {

                          setSearchQuery("");

                          setActiveFilter(
                            "all"
                          );

                        }}
                        className="
                          mt-4
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          border
                          border-[#C8A44D]/50
                          px-4
                          py-2
                          text-xs
                          font-medium
                          text-[#C8A44D]
                          transition
                          hover:bg-[#C8A44D]/10
                          active:scale-95
                        "
                      >

                        Show all orders

                        <ChevronRight
                          size={13}
                        />

                      </button>

                    )
                  }

                </div>

              ) : (

                visibleOrders.map(
                  (
                    order: any
                  ) => (

                    <button
                      key={
                        order.id
                      }
                      type="button"
                      onClick={() =>
                        setSelectedOrder(
                          order.id
                        )
                      }
                      className="
                        group
                        block
                        w-full
                        rounded-2xl
                        border
                        border-neutral-800
                        bg-[#0D0D0D]
                        p-4
                        text-left
                        transition-all
                        duration-200
                        hover:border-[#C8A44D]/35
                        hover:bg-[#101010]
                        active:scale-[0.995]
                        sm:p-5
                      "
                    >

                      {/* =====================================
                          ORDER HEADER
                      ====================================== */}

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
                          "
                        >

                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-white
                              sm:text-base
                            "
                          >

                            #
                            {
                              order.order_number
                            }

                          </p>


                          <p
                            className="
                              mt-1
                              text-[11px]
                              text-neutral-500
                            "
                          >

                            Placed on{" "}

                            {
                              formatOrderDate(
                                order.created_at
                              )
                            }

                          </p>

                        </div>


                        <OrderStatusBadge
                          status={
                            order.order_status
                          }
                        />

                      </div>



                      {/* =====================================
                          ORDER FOOTER
                      ====================================== */}

                      <div
                        className="
                          mt-4
                          flex
                          items-end
                          justify-between
                          gap-4
                          border-t
                          border-neutral-800
                          pt-4
                        "
                      >

                        <div>

                          <p
                            className="
                              text-[10px]
                              uppercase
                              tracking-[0.12em]
                              text-neutral-600
                            "
                          >
                            Total
                          </p>


                          <p
                            className="
                              mt-1
                              text-lg
                              font-semibold
                              text-[#C8A44D]
                            "
                          >

                            ₹
                            {
                              formatAmount(
                                order.total_amount
                              )
                            }

                          </p>

                        </div>


                        <span
                          className="
                            inline-flex
                            items-center
                            gap-1
                            text-xs
                            font-medium
                            text-neutral-400
                            transition-colors
                            group-hover:text-[#C8A44D]
                          "
                        >

                          View order

                          <ChevronRight
                            size={15}
                            className="
                              transition-transform
                              duration-200
                              group-hover:translate-x-0.5
                            "
                          />

                        </span>

                      </div>

                    </button>

                  )
                )

              )
            }

          </div>


          {/* =================================================
              LOAD MORE
          ================================================== */}

          {
            hasMoreOrders && (

              <div
                className="
                  mt-5
                  flex
                  flex-col
                  items-center
                  gap-2
                "
              >

                <button
                  type="button"
                  onClick={() =>
                    setVisibleOrderCount(
                      (
                        current
                      ) =>
                        Math.min(
                          current +
                            ORDERS_PER_LOAD,
                          filteredOrders.length
                        )
                    )
                  }
                  className="
                    group
                    inline-flex
                    min-w-[190px]
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    border
                    border-[#C8A44D]/45
                    bg-[#C8A44D]/[0.07]
                    px-5
                    py-3
                    text-sm
                    font-medium
                    text-[#C8A44D]
                    transition-all
                    duration-200
                    hover:border-[#C8A44D]
                    hover:bg-[#C8A44D]/12
                    hover:text-[#E0C06A]
                    active:scale-[0.98]
                  "
                >

                  Load more orders

                  <ChevronRight
                    size={16}
                    className="
                      transition-transform
                      duration-200
                      group-hover:translate-y-0.5
                      group-hover:translate-x-0.5
                    "
                  />

                </button>


                <p
                  className="
                    text-[11px]
                    text-neutral-600
                  "
                >

                  Showing{" "}
                  <span
                    className="
                      text-neutral-400
                    "
                  >
                    {Math.min(
                      visibleOrderCount,
                      filteredOrders.length
                    )}
                  </span>
                  {" "}of{" "}
                  <span
                    className="
                      text-neutral-400
                    "
                  >
                    {filteredOrders.length}
                  </span>
                  {" "}
                  {filteredOrders.length === 1
                    ? "order"
                    : "orders"}

                </p>

              </div>

            )
          }


        </div>

      </div>


      <OrderDetailsDialog
        open={
          !!selectedOrder
        }
        orderId={
          selectedOrder
        }
        onClose={() =>
          setSelectedOrder(
            null
          )
        }
      />

    </>

  );

}
