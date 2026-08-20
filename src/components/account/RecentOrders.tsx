import {
  Package,
  ChevronRight,
} from "lucide-react";


import {
  useState,
} from "react";


import {
  Link,
} from "react-router-dom";


import {
  useAuth,
} from "@/features/Auth/context/AuthContext";


import {
  useCustomerOrders,
} from "@/features/orders/hooks/useCustomerOrders";


import OrderDetailsDialog from "@/features/orders/components/OrderDetailsDialog";



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





export default function RecentOrders() {


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
  ] = useState<string | null>(
    null
  );



  if (isLoading) {

    return (

      <div
        className="
          px-4
          py-8
          text-center
          text-sm
          text-neutral-400
        "
      >

        Loading orders...

      </div>

    );

  }





  return (

    <>


      {/* =====================================================
          ORDERS CONTENT
      ====================================================== */}

      <div>

        {
          orders.length === 0 ? (

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

                <Package
                  size={24}
                  strokeWidth={1.8}
                />

              </div>


              <p
                className="
                  mt-4
                  text-sm
                  font-medium
                  text-white
                "
              >
                No orders yet
              </p>


              <p
                className="
                  mt-1
                  max-w-[250px]
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                Your recent purchases will appear here.
              </p>


              <Link
                to="/shop"
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

                Start Shopping

                <ChevronRight
                  size={13}
                />

              </Link>

            </div>

          ) : (

            <div
              className="
                divide-y
                divide-neutral-800
              "
            >

              {
                orders
                  .slice(0, 3)
                  .map(
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
                          flex
                          w-full
                          items-center
                          gap-3
                          px-4
                          py-4
                          text-left
                          transition-colors
                          hover:bg-[#111111]
                          active:bg-[#151515]
                          sm:px-5
                        "
                      >


                        {/* =================================
                            ORDER ICON
                        ================================== */}

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

                          <Package
                            size={18}
                            strokeWidth={1.8}
                          />

                        </div>


                        {/* =================================
                            ORDER INFO
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
                              min-w-0
                              items-center
                              gap-2
                            "
                          >

                            <p
                              className="
                                truncate
                                text-sm
                                font-medium
                                text-white
                              "
                            >

                              #
                              {
                                order.order_number
                              }

                            </p>


                            <OrderStatusBadge
                              status={
                                order.order_status
                              }
                            />

                          </div>


                          <div
                            className="
                              mt-1
                              flex
                              items-center
                              gap-2
                              text-[11px]
                              text-neutral-500
                            "
                          >

                            <span>
                              {
                                new Date(
                                  order.created_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              }
                            </span>


                            <span
                              className="
                                h-1
                                w-1
                                rounded-full
                                bg-neutral-700
                              "
                            />


                            <span
                              className="
                                text-[#C8A44D]
                              "
                            >
                              ₹
                              {
                                Number(
                                  order.total_amount
                                ).toFixed(2)
                              }
                            </span>

                          </div>

                        </div>


                        {/* =================================
                            VIEW ORDER
                        ================================== */}

                        <ChevronRight
                          size={18}
                          className="
                            shrink-0
                            text-neutral-600
                            transition-all
                            duration-200
                            group-hover:translate-x-0.5
                            group-hover:text-[#C8A44D]
                          "
                        />

                      </button>

                    )
                  )
              }

            </div>

          )
        }

      </div>


      {/* =====================================================
          VIEW ALL FOOTER
      ====================================================== */}

      {
        orders.length > 3 && (

          <Link
            to="/account/orders"
            className="
              flex
              items-center
              justify-center
              gap-1
              border-t
              border-neutral-800
              px-4
              py-3.5
              text-xs
              font-medium
              text-[#C8A44D]
              transition-colors
              hover:bg-[#111111]
              hover:text-white
              sm:px-5
            "
          >

            View all orders

            <ChevronRight
              size={14}
            />

          </Link>

        )
      }


      {/* =====================================================
          ORDER DETAILS
      ====================================================== */}

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
