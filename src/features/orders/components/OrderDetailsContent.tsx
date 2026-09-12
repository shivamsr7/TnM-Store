import {
  ORDER_STEPS,
  getStatusIndex,
} from "../utils/order-status";

import {
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  ReceiptText,
  Truck,
  XCircle,
} from "lucide-react";


interface Props {
  order: any;
}


const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {

  pending: {
    label: "Pending",
    className:
      "border-amber-200 bg-amber-50 text-amber-700",
  },

  confirmed: {
    label: "Confirmed",
    className:
      "border-blue-200 bg-blue-50 text-blue-700",
  },

  packed: {
    label: "Packed",
    className:
      "border-violet-200 bg-violet-50 text-violet-700",
  },

  shipped: {
    label: "Shipped",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700",
  },

  delivered: {
    label: "Delivered",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  cancelled: {
    label: "Cancelled",
    className:
      "border-red-200 bg-red-50 text-red-700",
  },

  returned: {
    label: "Returned",
    className:
      "border-orange-200 bg-orange-50 text-orange-700",
  },

  refunded: {
    label: "Refunded",
    className:
      "border-sky-200 bg-sky-50 text-sky-700",
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

  return `₹${amount.toLocaleString("en-IN")}`;

}


function getStepIcon(
  key: string
) {

  switch (key) {

    case "pending":
      return Clock3;

    case "confirmed":
      return Check;

    case "packed":
      return Package;

    case "shipped":
      return Truck;

    case "delivered":
      return Check;

    default:
      return Package;

  }

}


function StatusBadge({
  status,
}: {
  status: string;
}) {

  const config =
    STATUS_CONFIG[status] ??
    {
      label:
        status || "Unknown",
      className:
        "border-neutral-200 bg-neutral-100 text-neutral-600",
    };

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-3
        py-1.5
        text-[11px]
        font-semibold
        ${config.className}
      `}
    >

      {status === "delivered" && (
        <Check
          size={13}
          strokeWidth={2.5}
        />
      )}

      {status === "cancelled" && (
        <XCircle
          size={13}
          strokeWidth={2.2}
        />
      )}

      {config.label}

    </span>

  );

}


function SectionCard({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: typeof Package;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {

  return (

    <section
      className={`
        rounded-2xl
        border
        border-neutral-200
        bg-white
        p-4
        shadow-[0_2px_12px_rgba(0,0,0,0.035)]

        sm:p-5

        ${className}
      `}
    >

      <div
        className="
          mb-4
          flex
          items-center
          gap-3
        "
      >

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-[#C8A44D]/10
            text-[#9A7A22]
          "
        >

          <Icon
            size={17}
            strokeWidth={1.8}
          />

        </div>

        <h3
          className="
            text-sm
            font-semibold
            text-neutral-950
            sm:text-[15px]
          "
        >
          {title}
        </h3>

      </div>

      {children}

    </section>

  );

}


export default function OrderDetailsContent({
  order,
}: Props) {

  const currentStatusIndex =
    getStatusIndex(
      order.order_status
    );


  return (

    <div
      className="
        space-y-3
        text-neutral-950

        sm:space-y-4
      "
    >

      {/* =====================================================
          ORDER HERO
      ====================================================== */}

      <section
        className="
          relative
          overflow-hidden
          rounded-2xl
          border
          border-[#C8A44D]/25
          bg-white
          p-4
          shadow-[0_4px_20px_rgba(0,0,0,0.045)]

          sm:p-5
        "
      >

        <div
          className="
            absolute
            right-0
            top-0
            h-24
            w-24
            rounded-full
            bg-[#C8A44D]/[0.07]
            blur-2xl
          "
        />

        <div
          className="
            relative
            flex
            flex-col
            gap-4

            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >

          <div className="min-w-0">

            <div
              className="
                flex
                items-center
                gap-2
                text-[10px]
                font-medium
                uppercase
                tracking-[0.16em]
                text-neutral-400
              "
            >
              <ReceiptText size={13} />
              Order
            </div>

            <p
              className="
                mt-1.5
                truncate
                text-lg
                font-semibold
                tracking-[-0.02em]
                text-neutral-950

                sm:text-xl
              "
            >
              #{order.order_number}
            </p>

            <p
              className="
                mt-1
                text-xs
                text-neutral-500
              "
            >
              Placed on {formatDate(order.created_at)}
            </p>

          </div>


          <div
            className="
              flex
              items-center
              justify-between
              gap-3

              sm:flex-col
              sm:items-end
            "
          >

            <StatusBadge
              status={order.order_status}
            />

            <p
              className="
                text-base
                font-semibold
                text-[#9A7A22]

                sm:text-lg
              "
            >
              {formatMoney(order.total_amount)}
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          ORDER TIMELINE
      ====================================================== */}

      <SectionCard
        icon={Truck}
        title="Order Timeline"
      >

        <div
          className="
            relative
            px-1
            pb-1

            sm:px-2
          "
        >

          {/* Desktop connector */}

          <div
            className="
              absolute
              left-[10%]
              right-[10%]
              top-[17px]
              hidden
              h-px
              bg-neutral-200

              sm:block
            "
          />

          <div
            className="
              grid
              grid-cols-5
              gap-1

              sm:gap-2
            "
          >

            {ORDER_STEPS.map(
              (step, index) => {

                const completed =
                  index <=
                  currentStatusIndex;

                const active =
                  index ===
                  currentStatusIndex;

                const StepIcon =
                  getStepIcon(
                    step.key
                  );

                return (

                  <div
                    key={step.key}
                    className="
                      relative
                      flex
                      min-w-0
                      flex-col
                      items-center
                      text-center
                    "
                  >

                    <div
                      className={`
                        relative
                        z-10
                        flex
                        h-[34px]
                        w-[34px]
                        items-center
                        justify-center
                        rounded-full
                        border
                        transition

                        ${
                          completed
                            ? "border-[#C8A44D] bg-[#C8A44D] text-black"
                            : "border-neutral-200 bg-white text-neutral-300"
                        }

                        ${
                          active
                            ? "ring-4 ring-[#C8A44D]/10"
                            : ""
                        }
                      `}
                    >

                      <StepIcon
                        size={15}
                        strokeWidth={
                          completed
                            ? 2.2
                            : 1.8
                        }
                      />

                    </div>

                    <p
                      className={`
                        mt-2
                        text-[9px]
                        leading-3

                        sm:text-[10px]
                        sm:leading-4

                        ${
                          completed
                            ? "font-semibold text-neutral-900"
                            : "text-neutral-400"
                        }
                      `}
                    >
                      {step.label}
                    </p>

                  </div>

                );

              }
            )}

          </div>

        </div>

      </SectionCard>


      {/* =====================================================
          ITEMS
      ====================================================== */}

      <SectionCard
        icon={Package}
        title={`Items (${order.order_items?.length ?? 0})`}
      >

        <div
          className="
            divide-y
            divide-neutral-100
            overflow-hidden
            rounded-xl
            border
            border-neutral-100
          "
        >

          {order.order_items?.map(
            (item: any) => (

              <div
                key={item.id}
                className="
                  flex
                  items-center
                  gap-3
                  p-3

                  sm:gap-4
                  sm:p-3.5
                "
              >

                <div
                  className="
                    h-14
                    w-14
                    shrink-0
                    overflow-hidden
                    rounded-xl
                    bg-neutral-100

                    sm:h-16
                    sm:w-16
                  "
                >

                  <img
                    src={
                      item.product_image ||
                      "/placeholder.png"
                    }
                    alt={item.product_name}
                    className="
                      h-full
                      w-full
                      object-cover
                    "
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
                      line-clamp-2
                      text-xs
                      font-semibold
                      leading-5
                      text-neutral-900

                      sm:text-sm
                    "
                  >
                    {item.product_name}
                  </p>

                  <p
                    className="
                      mt-0.5
                      text-[11px]
                      text-neutral-500
                    "
                  >
                    Qty: {item.quantity}
                  </p>

                </div>


                <p
                  className="
                    shrink-0
                    text-sm
                    font-semibold
                    text-[#9A7A22]

                    sm:text-[15px]
                  "
                >
                  {formatMoney(item.total)}
                </p>

              </div>

            )
          )}

        </div>

      </SectionCard>


      {/* =====================================================
          PAYMENT + ADDRESS
      ====================================================== */}

      <div
        className="
          grid
          gap-3

          sm:grid-cols-2
          sm:gap-4
        "
      >

        <SectionCard
          icon={CreditCard}
          title="Payment"
        >

          <div
            className="
              space-y-3
              text-xs
            "
          >

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <span className="text-neutral-500">
                Method
              </span>

              <span
                className="
                  max-w-[60%]
                  text-right
                  font-medium
                  capitalize
                  text-neutral-900
                "
              >
                {order.payment_method || "Not available"}
              </span>

            </div>


            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <span className="text-neutral-500">
                Transaction ID
              </span>

              <span
                className="
                  max-w-[60%]
                  break-all
                  text-right
                  font-medium
                  text-neutral-900
                "
              >
                {order.payment_transaction_id ||
                  "Not available"}
              </span>

            </div>

          </div>

        </SectionCard>


        <SectionCard
          icon={MapPin}
          title="Delivery Address"
        >

          <div
            className="
              space-y-1
              text-xs
              leading-5
              text-neutral-600
            "
          >

            <p
              className="
                font-semibold
                text-neutral-900
              "
            >
              {order.shipping_full_name}
            </p>

            <p>
              {order.shipping_phone}
            </p>

            <p>
              {order.shipping_address}
            </p>

            <p>
              {order.shipping_city},{" "}
              {order.shipping_state}
              {" - "}
              {order.shipping_pincode}
            </p>

            {order.shipping_landmark && (

              <p className="text-neutral-500">
                Landmark: {order.shipping_landmark}
              </p>

            )}

          </div>

        </SectionCard>

      </div>


      {/* =====================================================
          PAYMENT SUMMARY
      ====================================================== */}

      <SectionCard
        icon={ReceiptText}
        title="Payment Summary"
      >

        <div
          className="
            space-y-2.5
            text-xs
            sm:text-sm
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <span className="text-neutral-500">
              Subtotal
            </span>

            <span className="font-medium">
              {formatMoney(
                order.subtotal ??
                order.total_amount
              )}
            </span>

          </div>


          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <span className="text-neutral-500">
              Discount
            </span>

            <span className="font-medium text-emerald-600">
              - {formatMoney(order.discount ?? 0)}
            </span>

          </div>


          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <span className="text-neutral-500">
              Shipping
            </span>

            <span className="font-medium">
              {formatMoney(
                order.shipping_charge ?? 0
              )}
            </span>

          </div>


          <div
            className="
              my-3
              border-t
              border-dashed
              border-neutral-200
            "
          />


          <div
            className="
              flex
              items-center
              justify-between
              gap-4
            "
          >

            <span
              className="
                font-semibold
                text-neutral-900
              "
            >
              Total
            </span>

            <span
              className="
                text-base
                font-bold
                text-[#9A7A22]

                sm:text-lg
              "
            >
              {formatMoney(order.total_amount)}
            </span>

          </div>


          {Number(order.advance_amount ?? 0) > 0 && (

            <div
              className="
                mt-3
                rounded-xl
                border
                border-neutral-100
                bg-neutral-50
                p-3
              "
            >

              <div
                className="
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-neutral-500">
                  Paid
                </span>

                <span className="font-semibold text-emerald-600">
                  {formatMoney(order.advance_amount)}
                </span>

              </div>


              <div
                className="
                  mt-2
                  flex
                  justify-between
                  gap-4
                "
              >

                <span className="text-neutral-500">
                  Remaining
                </span>

                <span className="font-semibold text-amber-600">
                  {formatMoney(order.remaining_amount)}
                </span>

              </div>

            </div>

          )}

        </div>

      </SectionCard>


      {/* =====================================================
          FINAL TOTAL
      ====================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          rounded-2xl
          bg-neutral-950
          px-4
          py-4
          text-white
          shadow-[0_5px_20px_rgba(0,0,0,0.12)]

          sm:px-5
          sm:py-4.5
        "
      >

        <div>

          <p
            className="
              text-[10px]
              uppercase
              tracking-[0.14em]
              text-white/45
            "
          >
            Total Paid
          </p>

          <p
            className="
              mt-0.5
              text-[11px]
              text-white/55
            "
          >
            Order #{order.order_number}
          </p>

        </div>

        <p
          className="
            text-lg
            font-bold
            text-[#C8A44D]

            sm:text-xl
          "
        >
          {formatMoney(order.total_amount)}
        </p>

      </div>

    </div>

  );
}
