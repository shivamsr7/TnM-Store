import {
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ChevronRight,
  Check,
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


const PAGE_SIZE = 6;


const STATUS_FILTERS = [
  "all",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
] as const;


const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {

  pending: {
    label: "Pending",
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    dotClassName:
      "bg-amber-300",
  },

  confirmed: {
    label: "Confirmed",
    className:
      "border-blue-400/20 bg-blue-400/10 text-blue-300",
    dotClassName:
      "bg-blue-300",
  },

  packed: {
    label: "Packed",
    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-300",
    dotClassName:
      "bg-violet-300",
  },

  shipped: {
    label: "Shipped",
    className:
      "border-indigo-400/20 bg-indigo-400/10 text-indigo-300",
    dotClassName:
      "bg-indigo-300",
  },

  delivered: {
    label: "Delivered",
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    dotClassName:
      "bg-emerald-300",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "border-red-400/20 bg-red-400/10 text-red-300",
    dotClassName:
      "bg-red-300",
  },

};


function formatDate(
  value: string
) {

  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );

}


function formatMoney(
  value: any
) {

  const amount =
    Number(value ?? 0);

  return `₹${amount.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;

}


function getStatusConfig(
  status: string
) {

  return (
    STATUS_CONFIG[status] ?? {
      label:
        status
          ? status.charAt(0).toUpperCase() +
            status.slice(1)
          : "Unknown",
      className:
        "border-[#d9d3c7] bg-neutral-800 text-neutral-500",
      dotClassName:
        "bg-neutral-400",
    }
  );

}


function StatusBadge({
  status,
}: {
  status: string;
}) {

  const config =
    getStatusConfig(status);

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1
        text-[10px]
        font-semibold
        tracking-wide

        sm:px-3
        sm:text-[11px]

        ${config.className}
      `}
    >

      <span
        className={`
          h-1.5
          w-1.5
          rounded-full
          ${config.dotClassName}
        `}
      />

      {config.label}

    </span>

  );

}




function getOrderPreview(
  order: any
) {

  const items = Array.isArray(
    order.order_items
  )
    ? order.order_items
    : [];

  const firstItem =
    items[0] ?? null;

  const totalQuantity =
    items.reduce(
      (
        total: number,
        item: any
      ) =>
        total +
        Number(
          item?.quantity ?? 0
        ),
      0
    );

  return {
    firstItem,
    itemCount: items.length,
    totalQuantity,
  };

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
  ] = useState<string | null>(null);

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState<
    typeof STATUS_FILTERS[number]
  >("all");

  const [
    visibleCount,
    setVisibleCount,
  ] = useState(PAGE_SIZE);


  const normalizedSearch =
    search
      .trim()
      .toLowerCase();


  const statusCounts =
    useMemo(() => {

      const counts: Record<
        string,
        number
      > = {
        all: orders.length,
        pending: 0,
        confirmed: 0,
        packed: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      };

      orders.forEach(
        (order: any) => {

          if (
            counts[
              order.order_status
            ] !== undefined
          ) {
            counts[
              order.order_status
            ] += 1;
          }

        }
      );

      return counts;

    }, [orders]);


  const filteredOrders =
    useMemo(() => {

      return orders.filter(
        (order: any) => {

          const matchesStatus =
            statusFilter === "all" ||
            order.order_status ===
              statusFilter;

          if (!matchesStatus) {
            return false;
          }

          if (!normalizedSearch) {
            return true;
          }

          const orderNumber =
            String(
              order.order_number ?? ""
            ).toLowerCase();

          const productMatch =
            Array.isArray(
              order.order_items
            ) &&
            order.order_items.some(
              (item: any) =>
                String(
                  item.product_name ?? ""
                )
                  .toLowerCase()
                  .includes(
                    normalizedSearch
                  )
            );

          return (
            orderNumber.includes(
              normalizedSearch
            ) ||
            productMatch
          );

        }
      );

    }, [
      orders,
      normalizedSearch,
      statusFilter,
    ]);


  const visibleOrders =
    filteredOrders.slice(
      0,
      visibleCount
    );


  const hasMore =
    visibleCount <
    filteredOrders.length;


  function changeStatus(
    value: typeof STATUS_FILTERS[number]
  ) {

    setStatusFilter(value);
    setVisibleCount(PAGE_SIZE);

  }


  function changeSearch(
    value: string
  ) {

    setSearch(value);
    setVisibleCount(PAGE_SIZE);

  }


  function clearFilters() {

    setSearch("");
    setStatusFilter("all");
    setVisibleCount(PAGE_SIZE);

  }


  if (isLoading) {

    return (

      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          py-16

          sm:px-6
          lg:px-8
        "
      >

        <div
          className="
            flex
            min-h-[420px]
            items-center
            justify-center
          "
        >

          <div className="text-center">

            <div
              className="
                mx-auto
                mb-4
                h-10
                w-10
                animate-spin
                rounded-full
                border-2
                border-[#d9d3c7]
                border-t-[#C8A44D]
              "
            />

            <p
              className="
                text-sm
                text-neutral-500
              "
            >
              Loading your orders...
            </p>

          </div>

        </div>

      </div>

    );

  }


  if (!customer) {

    return (

      <div
        className="
          mx-auto
          max-w-6xl
          px-4
          py-16
          text-center
          sm:px-6
        "
      >

        <div
          className="
            mx-auto
            max-w-md
            rounded-3xl
            border
            border-[#e6e1d7]
            bg-white
            px-6
            py-12
          "
        >

          <Package
            size={42}
            className="
              mx-auto
              mb-4
              text-[#C8A44D]
            "
          />

          <h2
            className="
              text-xl
              font-semibold
              text-neutral-950
            "
          >
            Please login
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-neutral-500
            "
          >
            Login to view your T&M Jewels orders.
          </p>

        </div>

      </div>

    );

  }


  return (

    <>

      <main
        className="
          min-h-screen
          bg-[#f7f5f0]
          text-neutral-900
        "
      >

        <div
          className="
            mx-auto
            max-w-6xl
            px-4
            pb-16
            pt-6

            sm:px-6
            sm:pb-20
            sm:pt-8

            lg:px-8
          "
        >

          {/* =================================================
              TOP NAV
          ================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate("/account")
            }
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-[#e6e1d7]
              bg-white
              px-3.5
              py-2
              text-xs
              font-medium
              text-neutral-500
              transition

              hover:border-[#C8A44D]/40
              hover:text-[#C8A44D]

              active:scale-[0.98]
            "
          >

            <ArrowLeft
              size={14}
            />

            Back to Account

          </button>


          {/* =================================================
              PAGE HEADER
          ================================================== */}

          <div
            className="
              mt-7
              flex
              flex-col
              gap-5

              sm:mt-8
              sm:flex-row
              sm:items-end
              sm:justify-between
            "
          >

            <div>

              <div
                className="
                  mb-2
                  flex
                  items-center
                  gap-2
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-[#C8A44D]
                "
              >

                <Package size={13} />

                Your Shopping Journey

              </div>

              <h1
                className="
                  text-[30px]
                  font-semibold
                  tracking-[-0.035em]
                  text-neutral-950

                  sm:text-4xl
                "
              >
                My Orders
              </h1>

              <p
                className="
                  mt-1.5
                  max-w-xl
                  text-sm
                  leading-5
                  text-neutral-500
                "
              >
                Track and manage your T&M Jewels purchases.
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
                px-3.5
                py-2
                text-xs
                font-medium
                text-[#9A7A22]
              "
            >

              <span
                className="
                  flex
                  h-6
                  w-6
                  items-center
                  justify-center
                  rounded-full
                  bg-[#C8A44D]/10
                "
              >

                <Package
                  size={13}
                />

              </span>

              {orders.length}{" "}
              {orders.length === 1
                ? "order"
                : "orders"}

            </div>

          </div>


          {/* =================================================
              SEARCH
          ================================================== */}

          <section
            className="
              mt-6
              rounded-2xl
              border
              border-[#e6e1d7]
              bg-white
              p-2

              sm:mt-7
              sm:p-2.5
            "
          >

            <div
              className="
                relative
                flex
                items-center
              "
            >

              <Search
                size={18}
                className="
                  pointer-events-none
                  absolute
                  left-4
                  text-neutral-500
                "
              />

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  changeSearch(
                    event.target.value
                  )
                }
                placeholder="
                  Search by order number or product...
                "
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-[#e6e1d7]
                  bg-white
                  pl-11
                  pr-11
                  text-sm
                  text-neutral-950
                  outline-none
                  placeholder:text-neutral-500
                  transition

                  focus:border-[#C8A44D]/60
                  focus:ring-2
                  focus:ring-[#C8A44D]/10
                "
              />

              {search && (

                <button
                  type="button"
                  onClick={() =>
                    changeSearch("")
                  }
                  aria-label="Clear search"
                  className="
                    absolute
                    right-3
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    text-neutral-500
                    transition
                    hover:bg-neutral-800
                    hover:text-neutral-950
                  "
                >

                  <X size={15} />

                </button>

              )}

            </div>

          </section>


          {/* =================================================
              FILTERS
          ================================================== */}

          <div
            className="
              mt-4
              overflow-x-auto
              pb-1
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >

            <div
              className="
                flex
                min-w-max
                items-center
                gap-2
              "
            >

              <div
                className="
                  mr-1
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-neutral-500
                "
                aria-hidden="true"
              >

                <SlidersHorizontal
                  size={16}
                />

              </div>


              {STATUS_FILTERS.map(
                (status) => {

                  const active =
                    statusFilter ===
                    status;

                  const count =
                    statusCounts[
                      status
                    ] ?? 0;

                  const label =
                    status === "all"
                      ? "All"
                      : getStatusConfig(
                          status
                        ).label;

                  return (

                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        changeStatus(
                          status
                        )
                      }
                      className={`
                        inline-flex
                        h-9
                        shrink-0
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        px-3.5
                        text-xs
                        font-medium
                        transition

                        ${
                          active
                            ? `
                              border-[#C8A44D]
                              bg-[#C8A44D]
                              text-black
                            `
                            : `
                              border-[#e6e1d7]
                              bg-white
                              text-neutral-500
                              hover:border-neutral-600
                              hover:text-neutral-950
                            `
                        }
                      `}
                    >

                      {active && (
                        <Check
                          size={13}
                          strokeWidth={2.5}
                        />
                      )}

                      {label}

                      <span
                        className={`
                          ${
                            active
                              ? "text-black/60"
                              : "text-neutral-500"
                          }
                        `}
                      >
                        {count}
                      </span>

                    </button>

                  );

                }
              )}

            </div>

          </div>


          {/* =================================================
              RESULT META
          ================================================== */}

          <div
            className="
              mt-5
              flex
              flex-col
              gap-2

              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >

            <p
              className="
                text-xs
                text-neutral-500
              "
            >

              Showing{" "}
              <span
                className="
                  font-semibold
                  text-neutral-700
                "
              >
                {Math.min(
                  visibleCount,
                  filteredOrders.length
                )}
              </span>{" "}
              of{" "}
              <span
                className="
                  font-semibold
                  text-neutral-700
                "
              >
                {filteredOrders.length}
              </span>{" "}
              {filteredOrders.length === 1
                ? "order"
                : "orders"}

            </p>


            {(search ||
              statusFilter !== "all") && (

              <button
                type="button"
                onClick={clearFilters}
                className="
                  inline-flex
                  w-fit
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-[#C8A44D]
                  transition
                  hover:text-neutral-950
                "
              >
                <X size={13} />
                Clear filters
              </button>

            )}

          </div>


          {/* =================================================
              ORDERS
          ================================================== */}

          {filteredOrders.length === 0 ? (

            <div
              className="
                mt-4
                rounded-3xl
                border
                border-[#e6e1d7]
                bg-white
                px-5
                py-16
                text-center

                sm:mt-5
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
                  rounded-2xl
                  bg-[#C8A44D]/[0.08]
                  text-[#C8A44D]
                "
              >

                <Search
                  size={22}
                />

              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-semibold
                  text-neutral-950
                "
              >
                No matching orders
              </h3>

              <p
                className="
                  mx-auto
                  mt-1.5
                  max-w-sm
                  text-sm
                  leading-5
                  text-neutral-500
                "
              >
                Try another order number, product name, or status filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-5
                  rounded-full
                  bg-[#C8A44D]
                  px-5
                  py-2.5
                  text-xs
                  font-semibold
                  text-black
                  transition
                  hover:bg-[#d7b85f]
                "
              >
                View all orders
              </button>

            </div>

          ) : (

            <div
              className="
                mt-4
                space-y-3

                sm:mt-5
                sm:space-y-4
              "
            >

              {visibleOrders.map(
                (order: any) => {

                  const {
                    firstItem,
                    itemCount,
                    totalQuantity,
                  } = getOrderPreview(
                    order
                  );


                  return (

                    <article
                      key={order.id}
                      className="
                        group
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#e6e1d7]
                        bg-white
                        transition

                        hover:border-[#C8A44D]/40
                        hover:bg-[#fffdf9]
                      "
                    >

                      <div
                        className="
                          px-4
                          py-4

                          sm:px-5
                          sm:py-5
                        "
                      >

                        {/* ================================
                            ORDER HEADER
                        ================================= */}

                        <div
                          className="
                            flex
                            items-start
                            justify-between
                            gap-3
                          "
                        >

                          <div className="min-w-0">

                            <p
                              className="
                                truncate
                                text-sm
                                font-semibold
                                tracking-[-0.01em]
                                text-neutral-950

                                sm:text-[15px]
                              "
                            >
                              #{order.order_number}
                            </p>

                            <p
                              className="
                                mt-1
                                text-[11px]
                                text-neutral-500

                                sm:text-xs
                              "
                            >
                              Placed on{" "}
                              {formatDate(
                                order.created_at
                              )}
                            </p>

                          </div>


                          <StatusBadge
                            status={
                              order.order_status
                            }
                          />

                        </div>


                        {/* ================================
                            ORDER SUMMARY
                        ================================= */}

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            gap-3

                            sm:mt-5
                            sm:gap-4
                          "
                        >

                          <div
                            className="
                              h-14
                              w-14
                              shrink-0
                              overflow-hidden
                              rounded-xl
                              border
                              border-[#e6e1d7]
                              bg-[#f7f5f0]

                              sm:h-16
                              sm:w-16
                            "
                          >

                            {firstItem?.product_image ? (

                              <img
                                src={
                                  firstItem.product_image
                                }
                                alt={
                                  firstItem.product_name ||
                                  "Order product"
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                  transition
                                  duration-300
                                  group-hover:scale-[1.04]
                                "
                              />

                            ) : (

                              <div
                                className="
                                  flex
                                  h-full
                                  w-full
                                  items-center
                                  justify-center
                                  text-[#9A7A22]
                                "
                              >

                                <Package
                                  size={23}
                                  strokeWidth={1.5}
                                />

                              </div>

                            )}

                          </div>


                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >

                            <p
                              className="
                                line-clamp-2
                                text-sm
                                font-medium
                                leading-5
                                text-neutral-900

                                sm:text-[15px]
                              "
                            >
                              {firstItem?.product_name ||
                                "T&amp;M Jewels Order"}
                            </p>

                            <p
                              className="
                                mt-1
                                text-[11px]
                                leading-4
                                text-neutral-500

                                sm:text-xs
                              "
                            >
                              {getStatusConfig(
                                order.order_status
                              ).label}
                              {" · "}
                              {itemCount > 0
                                ? `${totalQuantity} ${
                                    totalQuantity === 1
                                      ? "item"
                                      : "items"
                                  }`
                                : "Order details"}
                              {itemCount > 1
                                ? ` · +${itemCount - 1} more`
                                : ""}
                            </p>

                          </div>


                          <div
                            className="
                              shrink-0
                              text-right
                            "
                          >

                            <p
                              className="
                                text-[9px]
                                uppercase
                                tracking-[0.16em]
                                text-neutral-500

                                sm:text-[10px]
                              "
                            >
                              Total
                            </p>

                            <p
                              className="
                                mt-0.5
                                text-base
                                font-semibold
                                tracking-[-0.01em]
                                text-[#C8A44D]

                                sm:text-lg
                              "
                            >
                              {formatMoney(
                                order.total_amount
                              )}
                            </p>

                          </div>

                        </div>


                        {/* ================================
                            ACTION ROW
                        ================================= */}

                        <div
                          className="
                            mt-4
                            flex
                            items-center
                            justify-end
                            border-t
                            border-[#e6e1d7]
                            pt-3

                            sm:mt-5
                            sm:pt-3.5
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedOrder(
                                order.id
                              )
                            }
                            className="
                              inline-flex
                              min-h-9
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              border-[#d9d3c7]
                              bg-white
                              px-4
                              text-xs
                              font-medium
                              text-neutral-700
                              transition

                              hover:border-[#C8A44D]/60
                              hover:bg-[#C8A44D]/[0.06]
                              hover:text-[#9A7A22]

                              active:scale-[0.98]
                            "
                          >

                            View Order

                            <ChevronRight
                              size={14}
                            />

                          </button>

                        </div>

                      </div>

                    </article>

                  );

                }
              )}

            </div>

          )}


          {/* =================================================
              LOAD MORE
          ================================================== */}

          {hasMore && (

            <div
              className="
                mt-6
                flex
                justify-center
                sm:mt-8
              "
            >

              <button
                type="button"
                onClick={() =>
                  setVisibleCount(
                    (current) =>
                      current + PAGE_SIZE
                  )
                }
                className="
                  inline-flex
                  min-h-11
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  border
                  border-[#C8A44D]/30
                  bg-[#C8A44D]/[0.06]
                  px-6
                  text-xs
                  font-semibold
                  text-[#9A7A22]
                  transition

                  hover:border-[#C8A44D]/60
                  hover:bg-[#C8A44D]/10
                  hover:text-neutral-950

                  active:scale-[0.98]
                "
              >

                Load more orders

                <ChevronRight
                  size={15}
                />

              </button>

            </div>

          )}

        </div>

      </main>


      <OrderDetailsDialog
        open={
          Boolean(selectedOrder)
        }
        orderId={
          selectedOrder
        }
        onClose={() =>
          setSelectedOrder(null)
        }
      />

    </>

  );

}
