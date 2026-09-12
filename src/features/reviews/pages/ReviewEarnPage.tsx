import {
  ChevronRight,
  Clock3,
  Gift,
  Loader2,
  MessageCircleHeart,
  Star,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "@/shared/lib/supabase";

import WriteReviewDialog
  from "../components/WriteReviewDialog";


type ReviewEarnItem = {
  orderId: string;
  orderNumber: string | null;
  deliveredAt: string;
  productId: string;
  productName: string;
  productImage: string | null;
  productSlug: string;
};


function formatDate(value: string) {
  return new Date(value).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
}


export default function ReviewEarnPage() {

  const navigate = useNavigate();

  const [items, setItems] =
    useState<ReviewEarnItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedProductId, setSelectedProductId] =
    useState<string | null>(null);


  async function loadItems() {

    setLoading(true);
    setError(null);

    try {

      const {
        data,
        error: rpcError,
      } =
        await supabase.rpc(
          "customer_get_review_earn_items"
        );

      if (rpcError) {
        throw rpcError;
      }

      setItems(
        Array.isArray(data)
          ? (data as ReviewEarnItem[])
          : []
      );

    } catch (loadError) {

      console.error(
        "Review & Earn load error:",
        loadError
      );

      setError(
        "We couldn't load your pending reviews. Please try again."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {
    loadItems();
  }, []);


  function handleReviewNow(
    item: ReviewEarnItem
  ) {

    if (selectedProductId) {
      return;
    }

    setError(null);
    setSelectedProductId(item.productId);
  }


  function handleReviewDialogClose() {
    setSelectedProductId(null);

    /*
     * Refresh the list after the dialog closes.
     * If the review was successfully submitted, the
     * reviewed product will disappear from Review & Earn.
     */
    void loadItems();
  }


  return (

    <main
      className="
        min-h-screen
        bg-black
        px-4
        pb-12
        pt-6
        text-white
        sm:px-6
        lg:px-8
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >

        <button
          type="button"
          onClick={() =>
            navigate("/account")
          }
          className="
            mb-6
            inline-flex
            items-center
            gap-2
            text-sm
            text-neutral-400
            transition
            hover:text-[#C8A44D]
          "
        >
          ← Back to My Account
        </button>


        {/* Hero */}

        <section
          className="
            overflow-hidden
            rounded-3xl
            border
            border-[#C8A44D]/20
            bg-gradient-to-br
            from-[#15130D]
            via-[#0D0D0D]
            to-[#0D0D0D]
            p-5
            sm:p-7
          "
        >

          <div
            className="
              flex
              items-start
              gap-4
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-[#C8A44D]/10
                text-[#C8A44D]
              "
            >
              <Gift size={22} />
            </div>


            <div className="min-w-0">

              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.2em]
                  text-[#C8A44D]
                "
              >
                T&amp;M Rewards
              </p>

              <h1
                className="
                  mt-1
                  text-2xl
                  font-semibold
                  tracking-tight
                  text-white
                  sm:text-3xl
                "
              >
                Review &amp; Earn
              </h1>

              <p
                className="
                  mt-2
                  max-w-2xl
                  text-sm
                  leading-6
                  text-neutral-400
                "
              >
                Share your experience on products
                you&apos;ve purchased and earn wallet
                rewards after your review is approved.
              </p>

            </div>

          </div>


          <div
            className="
              mt-6
              grid
              grid-cols-3
              gap-2
              sm:gap-3
            "
          >

            {[
              ["₹5", "Text review"],
              ["₹10", "Photo review"],
              ["₹20", "Video review"],
            ].map(([amount, label]) => (
              <div
                key={label}
                className="
                  rounded-2xl
                  border
                  border-white/[0.07]
                  bg-white/[0.025]
                  px-3
                  py-3
                  text-center
                "
              >
                <p
                  className="
                    text-base
                    font-semibold
                    text-[#C8A44D]
                    sm:text-lg
                  "
                >
                  {amount}
                </p>
                <p
                  className="
                    mt-0.5
                    text-[10px]
                    leading-4
                    text-neutral-500
                    sm:text-[11px]
                  "
                >
                  {label}
                </p>
              </div>
            ))}

          </div>

        </section>


        {/* Pending Reviews */}

        <section className="mt-6">

          <div
            className="
              mb-3
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
                Your purchases
              </p>

              <h2
                className="
                  mt-1
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Waiting for your review
              </h2>

            </div>

            {!loading && items.length > 0 && (
              <span
                className="
                  rounded-full
                  bg-[#C8A44D]/10
                  px-3
                  py-1
                  text-[11px]
                  font-medium
                  text-[#C8A44D]
                "
              >
                {items.length}
              </span>
            )}

          </div>


          {error && (
            <div
              className="
                mb-4
                rounded-2xl
                border
                border-red-500/20
                bg-red-500/5
                px-4
                py-3
                text-sm
                text-red-300
              "
            >
              {error}
            </div>
          )}


          {loading ? (

            <div
              className="
                flex
                items-center
                justify-center
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                py-16
              "
            >
              <Loader2
                className="
                  h-6
                  w-6
                  animate-spin
                  text-[#C8A44D]
                "
              />
            </div>

          ) : items.length === 0 ? (

            <div
              className="
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                px-5
                py-14
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
                <MessageCircleHeart size={25} />
              </div>

              <h3
                className="
                  mt-5
                  text-lg
                  font-semibold
                  text-white
                "
              >
                You&apos;re all caught up! ♡
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-neutral-500
                "
              >
                There are no eligible purchases waiting
                for a review right now.
              </p>

            </div>

          ) : (

            <div
              className="
                grid
                gap-3
                sm:grid-cols-2
              "
            >

              {items.map((item) => (

                <article
                  key={item.productId}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-neutral-800
                    bg-[#0D0D0D]
                    transition
                    hover:border-[#C8A44D]/30
                  "
                >

                  <div
                    className="
                      flex
                      gap-4
                      p-4
                    "
                  >

                    <div
                      className="
                        h-24
                        w-24
                        shrink-0
                        overflow-hidden
                        rounded-2xl
                        bg-neutral-900
                        sm:h-28
                        sm:w-28
                      "
                    >

                      {item.productImage ? (
                        <img
                          src={
                            item.productImage
                          }
                          alt={
                            item.productName
                          }
                          className="
                            h-full
                            w-full
                            object-cover
                          "
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className="
                            flex
                            h-full
                            w-full
                            items-center
                            justify-center
                            text-[10px]
                            text-neutral-600
                          "
                        >
                          T&amp;M
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
                          font-semibold
                          leading-5
                          text-white
                        "
                      >
                        {item.productName}
                      </p>

                      <div
                        className="
                          mt-2
                          flex
                          items-center
                          gap-1.5
                          text-[10px]
                          text-neutral-500
                        "
                      >
                        <Clock3 size={12} />
                        Delivered{" "}
                        {formatDate(
                          item.deliveredAt
                        )}
                      </div>

                      <div
                        className="
                          mt-2
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-[#C8A44D]/10
                          px-2.5
                          py-1
                          text-[10px]
                          font-medium
                          text-[#C8A44D]
                        "
                      >
                        <Star
                          size={11}
                          fill="currentColor"
                        />
                        Earn up to ₹20
                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      border-t
                      border-neutral-800
                      px-4
                      py-3
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleReviewNow(item)
                      }
                      disabled={
                        selectedProductId ===
                        item.productId
                      }
                      className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#C8A44D]
                        px-4
                        py-3
                        text-sm
                        font-semibold
                        text-black
                        transition
                        hover:bg-[#D6B65C]
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {selectedProductId ===
                      item.productId ? (
                        <>
                          <Loader2
                            size={15}
                            className="animate-spin"
                          />
                          Opening review...
                        </>
                      ) : (
                        <>
                          Review Now
                          <ChevronRight size={15} />
                        </>
                      )}

                    </button>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>

      </div>

      {selectedProductId && (
        <WriteReviewDialog
          productId={selectedProductId}
          open={true}
          onClose={handleReviewDialogClose}
        />
      )}

    </main>
  );
}
