import {
  Check,
  Copy,
  Loader2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useCoupons,
} from "../hooks/useCoupons";

import {
  validateCoupon,
} from "../services/coupon.service";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

interface Props {
  open: boolean;
  onClose: () => void;
  onApply: (coupon: any) => void | Promise<void>;
  cartTotal: number;
  cartItems?: any[];
  appliedCoupon?: any;
}

interface EligibleCoupon {
  coupon: any;
  result: any;
  saving: number;
}

export default function CouponModal({
  open,
  onClose,
  onApply,
  cartTotal,
  cartItems = [],
  appliedCoupon,
}: Props) {
  const {
    customer,
  } = useAuth();

  const {
    data: coupons = [],
    isLoading,
  } = useCoupons();

  const [
    eligibleCoupons,
    setEligibleCoupons,
  ] = useState<EligibleCoupon[]>([]);

  const [
    checkingEligibility,
    setCheckingEligibility,
  ] = useState(false);

  const [
    applyingCouponId,
    setApplyingCouponId,
  ] = useState<string | null>(null);

  const [
    copiedCode,
    setCopiedCode,
  ] = useState<string | null>(null);


  /*
   * =========================================================
   * CHECK EVERY COUPON AGAINST THE CURRENT CUSTOMER + CART
   * =========================================================
   *
   * The modal must never show a coupon merely because it is
   * active or because the cart total passes its minimum.
   *
   * validateCoupon is the source of truth for:
   * - customer targeting
   * - membership
   * - product/category/collection/brand/tag targeting
   * - cart conditions
   * - usage limits
   * - one-use-per-customer
   * - dates
   * - discount rules
   * =========================================================
   */

  /*
   * CartDrawer can provide a newly-created cartItems array on
   * every render. Do not use that array directly as an effect
   * dependency or eligibility checking will run forever.
   *
   * A stable fingerprint lets us re-check only when the actual
   * cart contents change.
   */
  const cartFingerprint =
    useMemo(
      () =>
        cartItems
          .map((item: any) => ({
            id:
              item.productId ??
              item.product_id ??
              item.id ??
              "",
            quantity:
              Number(item.quantity ?? 0),
            price:
              Number(
                item.unit_price ??
                item.price ??
                0
              ),
          }))
          .sort(
            (a, b) =>
              String(a.id).localeCompare(
                String(b.id)
              )
          )
          .map(
            item =>
              `${item.id}:${item.quantity}:${item.price}`
          )
          .join("|"),
      [cartItems]
    );

  const stableCartItems =
    useMemo(
      () =>
        cartItems.map(
          (item: any) => ({
            ...item,
          })
        ),
      [cartFingerprint]
    );


  useEffect(() => {
    let cancelled = false;

    async function checkEligibility() {
      if (
        !open ||
        isLoading ||
        coupons.length === 0
      ) {
        if (!cancelled) {
          setEligibleCoupons([]);
          setCheckingEligibility(false);
        }

        return;
      }

      setCheckingEligibility(true);

      try {
        const results =
          await Promise.all(
            coupons
              .filter(
                (coupon: any) =>
                  coupon.is_active === true
              )
              .map(
                async (
                  coupon: any
                ): Promise<EligibleCoupon | null> => {
                  try {
                    const result =
                      await Promise.race([
                        validateCoupon(
                          coupon.code,
                          cartTotal,
                          customer?.id ?? "",
                          stableCartItems
                        ),
                        new Promise<never>(
                          (_, reject) =>
                            window.setTimeout(
                              () =>
                                reject(
                                  new Error(
                                    "Coupon eligibility check timed out"
                                  )
                                ),
                              8000
                            )
                        ),
                      ]);

                    const discount =
                      Number(
                        result.discount ?? 0
                      );

                    /*
                     * validateCoupon currently returns
                     * freeShipping but does not return a
                     * shippingCharge value. Keep the saving
                     * calculation based on the actual
                     * discount returned by validation.
                     */
                    return {
                      coupon,
                      result,
                      saving: discount,
                    };
                  } catch {
                    /*
                     * Ineligible coupons are intentionally
                     * omitted completely.
                     */
                    return null;
                  }
                }
              )
          );

        if (cancelled) {
          return;
        }

        const eligible =
          results
            .filter(
              (
                item
              ): item is EligibleCoupon =>
                !!item
            )
            .sort(
              (
                a,
                b
              ) =>
                b.saving -
                a.saving
            );

        setEligibleCoupons(
          eligible
        );
      } finally {
        if (!cancelled) {
          setCheckingEligibility(false);
        }
      }
    }

    checkEligibility();

    return () => {
      cancelled = true;
    };
  }, [
    open,
    isLoading,
    coupons,
    cartTotal,
    customer?.id,
    cartFingerprint,
  ]);


  /*
   * Re-check after the modal opens so the list feels fresh.
   */
  useEffect(() => {
    if (!open) {
      setCopiedCode(null);
    }
  }, [open]);


  const topOffer =
    eligibleCoupons[0] ?? null;


  const otherOffers =
    useMemo(
      () =>
        topOffer
          ? eligibleCoupons.slice(1)
          : eligibleCoupons,
      [eligibleCoupons, topOffer]
    );


  const formatSaving = (
    amount: number
  ) =>
    Number(
      amount || 0
    ).toLocaleString(
      "en-IN"
    );


  const getOfferText = (
    item: EligibleCoupon
  ) => {
    const {
      coupon,
      result,
    } = item;

    if (result.freeShipping) {
      return "Free shipping on this order";
    }

    if (result.freeGift) {
      return "Free gift unlocked on this order";
    }

    if (
      coupon.discount_type ===
      "percentage"
    ) {
      return `${coupon.discount_value}% off`;
    }

    if (
      coupon.discount_type ===
      "fixed"
    ) {
      return `₹${formatSaving(
        coupon.discount_value
      )} off`;
    }

    if (
      coupon.discount_type ===
      "buy_x_get_y"
    ) {
      return "Special Buy X Get Y offer";
    }

    return "Special offer";
  };


  const copyCode = async (
    code: string
  ) => {
    try {
      await navigator.clipboard.writeText(
        code
      );

      setCopiedCode(code);

      window.setTimeout(() => {
        setCopiedCode(
          current =>
            current === code
              ? null
              : current
        );
      }, 1400);
    } catch {
      /* Clipboard permission can be unavailable. */
    }
  };


  if (!open) {
    return null;
  }


  return (
    <>
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="
          fixed inset-0
          z-[1100]
          bg-black/45
          backdrop-blur-[3px]

          animate-in
          fade-in
          duration-300
        "
        onClick={onClose}
      />


      {/* =====================================================
          MODAL
      ====================================================== */}

      <div
        className="
          fixed
          inset-x-0
          bottom-0
          z-[1200]

          flex
          max-h-[88dvh]
          flex-col

          overflow-hidden

          rounded-t-[28px]
          bg-white

          shadow-[0_-20px_70px_rgba(0,0,0,0.20)]

          animate-in
          slide-in-from-bottom-8
          duration-400

          sm:inset-x-1/2
          sm:bottom-1/2
          sm:w-[min(680px,calc(100vw-32px))]
          sm:max-h-[82vh]
          sm:-translate-x-1/2
          sm:translate-y-1/2
          sm:rounded-[28px]
          sm:animate-in
          sm:zoom-in-95
          sm:slide-in-from-bottom-0
        "
        role="dialog"
        aria-modal="true"
        aria-labelledby="available-offers-title"
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            relative
            shrink-0
            border-b
            border-neutral-100
            bg-white
            px-5
            pb-4
            pt-4
            sm:px-6
            sm:pt-5
          "
        >

          <div
            className="
              mx-auto
              mb-3
              h-1
              w-10
              rounded-full
              bg-neutral-200
              sm:hidden
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

            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-[#C8A44D]/10
                  text-[#A88325]
                "
              >
                <Sparkles
                  size={19}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >

                <h2
                  id="available-offers-title"
                  className="
                    truncate
                    text-base
                    font-semibold
                    text-neutral-950
                    sm:text-lg
                  "
                >
                  Offers for you
                </h2>

                <p
                  className="
                    mt-0.5
                    text-[11px]
                    text-neutral-500
                    sm:text-xs
                  "
                >
                  Showing only offers you can use right now
                </p>

              </div>

            </div>


            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-neutral-100
                text-neutral-700

                transition
                hover:bg-neutral-200
                active:scale-90
              "
              aria-label="Close offers"
            >
              <X
                size={18}
              />
            </button>

          </div>

        </div>


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain

            px-4
            py-4

            sm:px-6
            sm:py-5
          "
        >

          {
            (
              isLoading ||
              checkingEligibility
            ) ? (

              <div
                className="
                  flex
                  min-h-[180px]
                  flex-col
                  items-center
                  justify-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C8A44D]/10
                  "
                >
                  <Loader2
                    size={20}
                    className="
                      animate-spin
                      text-[#A88325]
                    "
                  />
                </div>

                <div
                  className="
                    text-center
                  "
                >

                  <p
                    className="
                      text-sm
                      font-medium
                      text-neutral-800
                    "
                  >
                    Finding your best offers…
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-neutral-500
                    "
                  >
                    Checking offers against your cart
                  </p>

                </div>

              </div>

            ) : eligibleCoupons.length > 0 ? (

              <div
                className="
                  space-y-3
                "
              >

                {/* =================================================
                    BEST OFFER
                ================================================== */}

                {
                  topOffer && (

                    <div
                      className="
                        relative
                        overflow-hidden
                        rounded-[22px]

                        border
                        border-[#D7C27A]

                        bg-gradient-to-br
                        from-[#fffdf4]
                        via-[#fffaf0]
                        to-white

                        p-4
                        shadow-[0_8px_30px_rgba(184,146,43,0.10)]

                        animate-in
                        fade-in
                        zoom-in-95
                        duration-300
                      "
                    >

                      <div
                        className="
                          absolute
                          -right-8
                          -top-8
                          h-24
                          w-24
                          rounded-full
                          bg-[#C8A44D]/10
                        "
                      />

                      <div
                        className="
                          relative
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
                              mb-2
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              bg-[#C8A44D]
                              px-2.5
                              py-1
                              text-[10px]
                              font-bold
                              uppercase
                              tracking-[0.08em]
                              text-white
                            "
                          >
                            <Sparkles
                              size={11}
                            />
                            Best offer
                          </div>

                          <div
                            className="
                              flex
                              flex-wrap
                              items-center
                              gap-2
                            "
                          >

                            <p
                              className="
                                text-base
                                font-bold
                                tracking-wide
                                text-neutral-950
                              "
                            >
                              {topOffer.coupon.code}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                copyCode(
                                  topOffer.coupon.code
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-1
                                rounded-full
                                border
                                border-neutral-200
                                bg-white
                                px-2
                                py-1
                                text-[10px]
                                font-medium
                                text-neutral-600
                                transition
                                hover:border-neutral-300
                              "
                            >
                              <Copy
                                size={10}
                              />
                              {
                                copiedCode ===
                                topOffer.coupon.code
                                  ? "Copied"
                                  : "Copy"
                              }
                            </button>

                          </div>

                          <p
                            className="
                              mt-1
                              text-sm
                              text-neutral-700
                            "
                          >
                            {
                              topOffer.coupon.title ||
                              "Special offer"
                            }
                          </p>

                          <div
                            className="
                              mt-2
                              flex
                              flex-wrap
                              items-center
                              gap-x-3
                              gap-y-1
                              text-xs
                              text-neutral-500
                            "
                          >

                            <span
                              className="
                                font-medium
                                text-neutral-700
                              "
                            >
                              {
                                getOfferText(
                                  topOffer
                                )
                              }
                            </span>

                            {
                              topOffer.saving >
                                0 && (
                                <span
                                  className="
                                    font-semibold
                                    text-green-700
                                  "
                                >
                                  Save ₹
                                  {
                                    formatSaving(
                                      topOffer.saving
                                    )
                                  }
                                </span>
                              )
                            }

                          </div>

                        </div>


                        <div
                          className="
                            flex
                            shrink-0
                            flex-col
                            items-end
                            gap-2
                          "
                        >

                          <Tag
                            size={18}
                            className="
                              text-[#A88325]
                            "
                          />

                          <button
                            type="button"
                            disabled={
                              applyingCouponId ===
                              topOffer.coupon.id ||
                              appliedCoupon?.code ===
                              topOffer.coupon.code
                            }
                            onClick={async () => {
                              try {
                                setApplyingCouponId(
                                  topOffer.coupon.id
                                );

                                await onApply(
                                  topOffer.coupon
                                );
                              } finally {
                                setApplyingCouponId(
                                  null
                                );
                              }
                            }}
                            className="
                              min-w-[76px]
                              rounded-xl
                              bg-black
                              px-4
                              py-2.5
                              text-xs
                              font-semibold
                              text-white

                              shadow-sm

                              transition
                              hover:bg-neutral-800
                              active:scale-95
                              disabled:cursor-not-allowed
                              disabled:opacity-60
                            "
                          >

                            {
                              applyingCouponId ===
                              topOffer.coupon.id ? (
                                <Loader2
                                  size={14}
                                  className="
                                    mx-auto
                                    animate-spin
                                  "
                                />
                              ) : appliedCoupon?.code ===
                                topOffer.coupon.code ? (
                                <span
                                  className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-1
                                  "
                                >
                                  <Check
                                    size={13}
                                  />
                                  Applied
                                </span>
                              ) : (
                                "Apply"
                              )
                            }

                          </button>

                        </div>

                      </div>

                    </div>
                  )
                }


                {/* =================================================
                    OTHER ELIGIBLE OFFERS
                ================================================== */}

                {
                  otherOffers.length > 0 && (

                    <div
                      className="
                        pt-2
                      "
                    >

                      <div
                        className="
                          mb-2.5
                          flex
                          items-center
                          justify-between
                        "
                      >

                        <p
                          className="
                            text-xs
                            font-semibold
                            uppercase
                            tracking-[0.08em]
                            text-neutral-500
                          "
                        >
                          More offers you can use
                        </p>

                        <span
                          className="
                            text-[10px]
                            text-neutral-400
                          "
                        >
                          {otherOffers.length}
                        </span>

                      </div>


                      <div
                        className="
                          grid
                          gap-2.5
                          sm:grid-cols-2
                        "
                      >

                        {
                          otherOffers.map(
                            (
                              item,
                              index
                            ) => (

                              <div
                                key={
                                  item.coupon.id
                                }
                                style={{
                                  animationDelay:
                                    `${index * 60}ms`,
                                }}
                                className="
                                  rounded-2xl
                                  border
                                  border-neutral-200
                                  bg-white
                                  p-3.5

                                  transition-all
                                  duration-300
                                  hover:-translate-y-0.5
                                  hover:border-neutral-300
                                  hover:shadow-md

                                  animate-in
                                  fade-in
                                  slide-in-from-bottom-2
                                "
                              >

                                <div
                                  className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                  "
                                >

                                  <div
                                    className="
                                      min-w-0
                                    "
                                  >

                                    <div
                                      className="
                                        flex
                                        flex-wrap
                                        items-center
                                        gap-1.5
                                      "
                                    >

                                      <p
                                        className="
                                          truncate
                                          text-sm
                                          font-bold
                                          text-neutral-900
                                        "
                                      >
                                        {
                                          item.coupon.code
                                        }
                                      </p>

                                      {
                                        item.saving >
                                          0 && (
                                          <span
                                            className="
                                              rounded-full
                                              bg-green-50
                                              px-2
                                              py-0.5
                                              text-[9px]
                                              font-semibold
                                              text-green-700
                                            "
                                          >
                                            Save ₹
                                            {
                                              formatSaving(
                                                item.saving
                                              )
                                            }
                                          </span>
                                        )
                                      }

                                    </div>

                                    <p
                                      className="
                                        mt-1
                                        truncate
                                        text-xs
                                        text-neutral-600
                                      "
                                    >
                                      {
                                        item.coupon.title ||
                                        getOfferText(
                                          item
                                        )
                                      }
                                    </p>

                                    <p
                                      className="
                                        mt-1
                                        text-[10px]
                                        text-neutral-400
                                      "
                                    >
                                      {
                                        getOfferText(
                                          item
                                        )
                                      }
                                    </p>

                                  </div>


                                  <button
                                    type="button"
                                    disabled={
                                      applyingCouponId ===
                                      item.coupon.id ||
                                      appliedCoupon?.code ===
                                      item.coupon.code
                                    }
                                    onClick={async () => {
                                      try {
                                        setApplyingCouponId(
                                          item.coupon.id
                                        );

                                        await onApply(
                                          item.coupon
                                        );
                                      } finally {
                                        setApplyingCouponId(
                                          null
                                        );
                                      }
                                    }}
                                    className="
                                      shrink-0
                                      rounded-xl
                                      bg-black
                                      px-3.5
                                      py-2
                                      text-[11px]
                                      font-semibold
                                      text-white

                                      transition
                                      hover:bg-neutral-800
                                      active:scale-95
                                      disabled:opacity-60
                                    "
                                  >
                                    {
                                      applyingCouponId ===
                                      item.coupon.id ? (
                                        <Loader2
                                          size={13}
                                          className="animate-spin"
                                        />
                                      ) : appliedCoupon?.code ===
                                        item.coupon.code ? (
                                        "Applied"
                                      ) : (
                                        "Apply"
                                      )
                                    }
                                  </button>

                                </div>

                              </div>

                            )
                          )
                        }

                      </div>

                    </div>
                  )
                }

              </div>

            ) : (

              <div
                className="
                  flex
                  min-h-[220px]
                  flex-col
                  items-center
                  justify-center
                  px-5
                  text-center

                  animate-in
                  fade-in
                  duration-300
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
                    bg-neutral-100
                    text-neutral-400
                  "
                >
                  <Tag
                    size={24}
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-sm
                    font-semibold
                    text-neutral-800
                  "
                >
                  No eligible offers right now
                </p>

                <p
                  className="
                    mt-1
                    max-w-xs
                    text-xs
                    leading-5
                    text-neutral-500
                  "
                >
                  We’re only showing offers that are valid
                  for your account and current cart.
                </p>

              </div>
            )
          }

        </div>


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            shrink-0
            border-t
            border-neutral-100
            bg-white
            px-4
            py-3

            sm:px-6
          "
        >

          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >

            <p
              className="
                text-[10px]
                text-neutral-400
              "
            >
              Offers are checked against your current cart.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="
                shrink-0
                rounded-lg
                px-2
                py-1
                text-[11px]
                font-medium
                text-neutral-500
                transition
                hover:text-black
              "
            >
              Close
            </button>

          </div>

        </div>

      </div>
    </>
  );
}
