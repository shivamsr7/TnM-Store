import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  getOrderDetails,
} from "../services/order-details.service";

import OrderDetailsContent from "./OrderDetailsContent";


interface Props {
  open: boolean;
  onClose: () => void;
  orderId: string | null;
}


export default function OrderDetailsDialog({
  open,
  onClose,
  orderId,
}: Props) {

  const [
    order,
    setOrder,
  ] = useState<any>(null);

  const [
    loading,
    setLoading,
  ] = useState(false);


  useEffect(() => {

    async function loadOrder() {

      if (!orderId) {
        return;
      }

      setLoading(true);

      try {

        const data =
          await getOrderDetails(orderId);

        setOrder(data);

      } catch (error) {

        console.error(
          "Failed to load order details",
          error
        );

        setOrder(null);

      } finally {

        setLoading(false);

      }

    }


    if (open) {
      loadOrder();
    }

  }, [
    open,
    orderId,
  ]);


  return (

    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          onClose();
        }
      }}
    >

      <DialogContent

        className="
          flex
          h-[100dvh]
          max-h-[100dvh]
          w-full
          max-w-none
          flex-col
          overflow-hidden
          rounded-none
          border-0
          bg-white
          p-0
          text-neutral-950
          shadow-2xl

          sm:h-auto
          sm:max-h-[92vh]
          sm:w-[calc(100%-32px)]
          sm:max-w-[780px]
          sm:rounded-3xl
          sm:border
          sm:border-neutral-200

          [&>button]:hidden
        "

      >

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div
          className="
            relative
            shrink-0
            border-b
            border-neutral-200
            bg-white
            px-4
            pb-4
            pt-[calc(0.9rem+env(safe-area-inset-top))]

            sm:px-6
            sm:pb-5
            sm:pt-5
          "
        >

          <DialogHeader>

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div className="min-w-0">

                <DialogTitle
                  className="
                    text-[21px]
                    font-semibold
                    tracking-[-0.025em]
                    text-neutral-950

                    sm:text-2xl
                  "
                >
                  Order Details
                </DialogTitle>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-neutral-500

                    sm:text-xs
                  "
                >
                  Complete information about your purchase
                </p>

              </div>


              <button
                type="button"
                onClick={onClose}
                aria-label="Close order details"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-neutral-200
                  bg-white
                  text-neutral-700
                  shadow-sm
                  transition
                  hover:bg-neutral-50
                  hover:text-black
                  active:scale-95

                  sm:h-10
                  sm:w-10
                "
              >
                <X
                  size={18}
                  strokeWidth={1.8}
                />
              </button>

            </div>

          </DialogHeader>

        </div>


        {/* =====================================================
            SCROLLABLE CONTENT
        ====================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            bg-[#fafafa]
            px-3
            py-3

            sm:px-6
            sm:py-5
          "
        >

          {loading && (

            <div
              className="
                flex
                min-h-[420px]
                items-center
                justify-center
                text-sm
                text-neutral-500
              "
            >
              Loading order...
            </div>

          )}


          {!loading && order && (

            <OrderDetailsContent
              order={order}
            />

          )}


          {!loading && !order && (

            <div
              className="
                flex
                min-h-[420px]
                items-center
                justify-center
                text-sm
                text-neutral-500
              "
            >
              Order not found
            </div>

          )}

        </div>

      </DialogContent>

    </Dialog>

  );
}
