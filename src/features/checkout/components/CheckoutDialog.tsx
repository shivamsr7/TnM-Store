import {
  X,
  ArrowDown,
  ShieldCheck,
  UserRound,
  Mail,
  Smartphone,
  MapPin,
  CreditCard,
  Loader2,
  Wallet,
} from "lucide-react";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  useState,
  useEffect,
  useRef,
} from "react";

import { createPortal } from "react-dom";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  supabase,
} from "@/shared/lib/supabase";

import OrderSuccess from "./OrderSuccess";
import PaymentStep from "./PaymentStep";
import LoginStep from "./LoginStep";
import AddressStep from "./AddressStep";
import CouponModal from "@/features/coupons/components/CouponModal";

import { validateCoupon } from "@/features/coupons/services/coupon.service";

import {
  useCustomerStore,
} from "@/features/customers/store/customer.store";

import {
  getCustomerByPhone,
  createCustomer,
  createGuestCustomer,
  sendGuestOtp,
  verifyGuestOtp,
  upgradeGuestToMember,
} from "@/features/customers/services/customer.service";

import {
  createOrder,
} from "@/features/orders/services/order.service";

import {
  useCartStore,
} from "@/features/cart/store/cart.store";

import {
  useDeliveryCheck,
} from "@/features/shipping/hooks/useDeliveryCheck";

import {
  finalizeCheckoutQuote,
  setCheckoutQuoteGiftWrap,
} from "@/features/orders/services/checkout-quote.service";

interface Props {
  open: boolean;
  onClose: () => void;
  buyNowItem?: any | null;
}


const STEPS = [
  {
    key: "login",
    label: "Login",
    icon: UserRound,
  },
  {
    key: "address",
    label: "Address",
    icon: MapPin,
  },
  {
    key: "payment",
    label: "Payment",
    icon: CreditCard,
  },
];


const FREE_GIFT_AMOUNT = 1000;

const FREE_SHIPPING_AMOUNT = 2000;

interface CheckoutProductPricing {
  id: string;
  price: number | null;
  compare_price: number | null;
  special_discount_enabled: boolean | null;
  special_discount_type: string | null;
  special_discount_value: number | null;
  special_discount_ends_at: string | null;
}


export default function CheckoutDialog({
  open,
  onClose,
  buyNowItem = null,
}: Props) {

  /*
   * =========================================================
   * AUTH
   * =========================================================
   */

  const {
    customer: authCustomer,
    refreshCustomer,
  } = useAuth();


  /*
   * =========================================================
   * STEP
   * =========================================================
   */

  const [
    isAddingNewAddress,
    setIsAddingNewAddress,
  ] = useState(false);


  const [
    step,
    setStep,
  ] = useState<
    "login" | "address" | "payment"
  >("login");


  /*
   * =========================================================
   * CUSTOMER
   * =========================================================
   */

  const [
    customer,
    setCustomer,
  ] = useState<any>(null);

  /*
   * =========================================================
   * LOGIN / GUEST CHECKOUT CHOICE
   * =========================================================
   *
   * The first checkout step now lets the customer choose
   * between the existing Member login flow and Guest checkout.
   * Both paths stay inside this same Login step; no additional
   * dialog is opened.
   */
  const [
    loginChoice,
    setLoginChoice,
  ] = useState<"member" | "guest" | null>(null);

  const [
    guestName,
    setGuestName,
  ] = useState("");

  const [
    guestPhone,
    setGuestPhone,
  ] = useState("");

  const [
    guestEmail,
    setGuestEmail,
  ] = useState("");

  const [
    guestError,
    setGuestError,
  ] = useState("");

  const [
    guestSubmitting,
    setGuestSubmitting,
  ] = useState(false);

  const [
    guestOtp,
    setGuestOtp,
  ] = useState("");

  const [
    guestOtpSent,
    setGuestOtpSent,
  ] = useState(false);

  const [
    guestOtpVerifying,
    setGuestOtpVerifying,
  ] = useState(false);

  const [
    guestCustomerDraft,
    setGuestCustomerDraft,
  ] = useState<any>(null);

  const [
    guestOtpVerified,
    setGuestOtpVerified,
  ] = useState(false);

  /*
   * Tracks the temporary Supabase Auth session created by Guest OTP.
   * It intentionally stays alive for the whole checkout.
   *
   * It is cleared only when:
   *   1. the Guest checkout dialog is closed, or
   *   2. a Guest successfully completes the order/payment flow.
   *
   * A Guest who upgrades to Member is no longer treated as a
   * temporary Guest session, so we never sign that Member session out.
   */
  const [
    guestCheckoutSessionActive,
    setGuestCheckoutSessionActive,
  ] = useState(false);

  const [
    guestMembershipSubmitting,
    setGuestMembershipSubmitting,
  ] = useState(false);

  /*
   * =========================================================
   * GUEST → MEMBER PROMPT
   * =========================================================
   *
   * Used when a verified Guest encounters a Member-only
   * benefit such as a special price or a membership coupon.
   */
  const [
    memberUpgradeDialogOpen,
    setMemberUpgradeDialogOpen,
  ] = useState(false);

  const [
    memberUpgradeReason,
    setMemberUpgradeReason,
  ] = useState<"special_price" | "coupon">("special_price");

  const [
    memberUpgradeSubmitting,
    setMemberUpgradeSubmitting,
  ] = useState(false);

  /*
   * True when a Guest has explicitly chosen to continue without
   * the Member-only special price.
   *
   * The Guest should continue to Address at the normal/regular
   * product price. The Member price can be unlocked again from
   * the price-breakdown button.
   */
  const [
    guestContinueWithoutSpecialPrice,
    setGuestContinueWithoutSpecialPrice,
  ] = useState(false);

  /*
   * Used when a guest clicks "View available coupons".
   * We keep the existing Login step exactly where it is and
   * smoothly scroll the checkout content down to it.
   */
  const loginSectionRef = useRef<HTMLDivElement | null>(null);
  const checkoutContentRef = useRef<HTMLDivElement | null>(null);
  const [showLoginScrollHint, setShowLoginScrollHint] = useState(true);


  /*
   * =========================================================
   * SELECTED ADDRESS
   * =========================================================
   */

  const [
    selectedAddress,
    setSelectedAddress,
  ] = useState<any>(null);


  /*
   * =========================================================
   * ORDER SUCCESS
   * =========================================================
   */

  const [
    orderSuccess,
    setOrderSuccess,
  ] = useState(false);


  const [
    orderNumber,
    setOrderNumber,
  ] = useState("");

  /*
   * =========================================================
   * PAYMENT PROCESSING
   * =========================================================
   *
   * Razorpay success is only the beginning of the final
   * order-completion step. Keep the checkout locked in a
   * dedicated processing state until the server-side order
   * transaction has completed successfully.
   */

  const [
    processingPayment,
    setProcessingPayment,
  ] = useState(false);


  /*
   * Payment was captured/verified, but final order completion
   * encountered a recoverable client/server error.
   *
   * Keep the customer away from the payment step so they cannot
   * accidentally pay twice. Retry uses the SAME Razorpay payment
   * ID and the database idempotency protection.
   */
  const [
    paymentRecoveryError,
    setPaymentRecoveryError,
  ] = useState("");


  /*
   * =========================================================
   * SHIPPING
   * =========================================================
   */

  const [
    shippingCharge,
    setShippingCharge,
  ] = useState(0);


  const [
    calculatingShipping,
    setCalculatingShipping,
  ] = useState(false);


  const [
    shippingError,
    setShippingError,
  ] = useState("");

  /*
   * =========================================================
   * SECURE SHIPPING QUOTE
   * =========================================================
   *
   * Created server-side by check-delivery.
   * This will become the source of truth for the final
   * order calculation in the next security step.
   */

  const [
    checkoutQuoteId,
    setCheckoutQuoteId,
  ] = useState<string | null>(null);

  /*
   * =========================================================
   * SERVER-VERIFIED CHECKOUT PRICING
   * =========================================================
   */

  const [
    verifiedCheckoutPricing,
    setVerifiedCheckoutPricing,
  ] = useState<{
    subtotal:number;
    discount:number;
    shippingCharge:number;
    giftWrapAmount:number;
    tax:number;
    totalAmount:number;
  } | null>(null);


  /*
   * =========================================================
   * T&M WALLET CHECKOUT
   * =========================================================
   *
   * Wallet credit is reserved with a short-lived server-side
   * hold before PaymentStep starts. The hold is the source of
   * truth; the displayed balance/amount is only UI state.
   */

  const [
    walletBalancePaise,
    setWalletBalancePaise,
  ] = useState(0);

  const [
    walletLoading,
    setWalletLoading,
  ] = useState(false);

  const [
    walletApplying,
    setWalletApplying,
  ] = useState(false);

  const [
    walletSelected,
    setWalletSelected,
  ] = useState(false);

  const [
    walletHoldId,
    setWalletHoldId,
  ] = useState<string | null>(null);

  const [
    walletAmountPaise,
    setWalletAmountPaise,
  ] = useState(0);

  const [
    walletError,
    setWalletError,
  ] = useState("");


  /*
   * Must be declared before the wallet effect because the effect
   * uses this value in both its body and dependency array.
   */
  const isGuestCheckoutCustomer =
    Boolean(
      (customer?.customer_type === "guest" &&
        !customer?.auth_user_id) ||
      (guestCustomerDraft?.customer_type === "guest" &&
        !guestCustomerDraft?.auth_user_id)
    );


  useEffect(() => {

    let mounted = true;

    async function loadCheckoutWallet() {

      if (
        step !== "payment" ||
        !customer?.id ||
        isGuestCheckoutCustomer ||
        !checkoutQuoteId
      ) {
        return;
      }

      try {

        setWalletLoading(true);
        setWalletError("");

        const {
          data,
          error,
        } = await supabase.rpc(
          "get_or_create_my_wallet"
        );

        if (error) {
          throw error;
        }

        const wallet =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!mounted) return;

        setWalletBalancePaise(
          Math.max(
            0,
            Number(wallet?.balance_paise || 0)
          )
        );

      } catch (error: any) {

        console.error(
          "Checkout wallet load failed:",
          error
        );

        if (!mounted) return;

        setWalletBalancePaise(0);
        setWalletError(
          "Wallet is temporarily unavailable. You can continue with online payment."
        );

      } finally {

        if (mounted) {
          setWalletLoading(false);
        }

      }

    }

    loadCheckoutWallet();

    return () => {
      mounted = false;
    };

  }, [
    step,
    customer?.id,
    checkoutQuoteId,
    isGuestCheckoutCustomer,
  ]);


  async function releaseWalletHold() {

    if (!walletHoldId) {
      return true;
    }

    let released = false;

    try {

      const {
        error,
      } = await supabase.rpc(
        "release_wallet_checkout_hold",
        {
          p_hold_id:
            walletHoldId,
        }
      );

      if (error) {
        throw error;
      }

      released = true;

    } catch (error) {

      console.warn(
        "Wallet checkout hold release failed:",
        error
      );

    } finally {

      setWalletHoldId(null);
      setWalletAmountPaise(0);
      setWalletSelected(false);

    }

    return released;

  }


  async function createWalletHoldForQuote(
    quoteId: string,
    totalAmount: number
  ) {

    if (
      !customer?.id ||
      isGuestCheckoutCustomer ||
      !quoteId
    ) {
      return false;
    }

    const totalPaise =
      Math.max(
        0,
        Math.round(
          Number(totalAmount || 0) * 100
        )
      );

    const requestedAmountPaise =
      Math.min(
        Math.max(
          0,
          Number(walletBalancePaise || 0)
        ),
        totalPaise
      );

    if (requestedAmountPaise <= 0) {
      setWalletHoldId(null);
      setWalletAmountPaise(0);
      setWalletSelected(false);
      setWalletError(
        "You don't have enough wallet balance to use on this order."
      );
      return false;
    }

    try {

      setWalletApplying(true);
      setWalletError("");

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_wallet_checkout_hold",
        {
          p_customer_id:
            customer.id,

          p_checkout_quote_id:
            quoteId,

          p_amount_paise:
            requestedAmountPaise,
        }
      );

      if (error) {
        throw error;
      }

      const hold =
        Array.isArray(data)
          ? data[0]
          : data;

      const holdId =
        hold?.hold_id ??
        hold?.id ??
        hold?.wallet_hold_id;

      const returnedAmountPaise =
        Number(
          hold?.amount_paise ??
          hold?.wallet_amount_paise ??
          requestedAmountPaise
        );

      if (
        !holdId ||
        returnedAmountPaise <= 0
      ) {
        console.error(
          "Unexpected wallet hold response:",
          data
        );

        throw new Error(
          "Wallet could not be reserved for this checkout."
        );
      }

      setWalletHoldId(holdId);
      setWalletAmountPaise(returnedAmountPaise);
      setWalletSelected(true);

      return true;

    } catch (error: any) {

      console.error(
        "Wallet checkout hold creation failed:",
        error
      );

      setWalletHoldId(null);
      setWalletAmountPaise(0);
      setWalletSelected(false);

      setWalletError(
        error?.message ||
        "We couldn't apply your wallet right now. Please try again."
      );

      return false;

    } finally {

      setWalletApplying(false);

    }

  }


  async function toggleWallet() {

    if (walletApplying) {
      return;
    }

    if (walletSelected) {

      setWalletApplying(true);

      try {
        await releaseWalletHold();
        setWalletError("");
      } finally {
        setWalletApplying(false);
      }

      return;
    }

    if (!checkoutQuoteId) {
      return;
    }

    await createWalletHoldForQuote(
      checkoutQuoteId,
      verifiedCheckoutPricing?.totalAmount ??
        finalAmount
    );

  }


  /*
   * =========================================================
   * SHIPROCKET
   * =========================================================
   */

  const {
    mutate: checkDelivery,
  } = useDeliveryCheck();


  /*
   * =========================================================
   * CART
   * =========================================================
   */

  const {
    items: cartItems,
    getTotal,
    discount: cartDiscount,
    appliedCoupon: cartAppliedCoupon,
    clearCart,

    giftWrapSelected: cartGiftWrapSelected,
    giftMessage: cartGiftMessage,

  } = useCartStore();

  /*
   * Buy Now uses an isolated temporary checkout state.
   * Normal cart checkout continues using the persistent cart store.
   */
  const isBuyNow = Boolean(buyNowItem);

  const checkoutItems =
    isBuyNow
      ? [buyNowItem]
      : cartItems;

  const [buyNowCoupon, setBuyNowCoupon] = useState<any>(null);
  const [buyNowDiscount, setBuyNowDiscount] = useState(0);
  const [buyNowCouponCode, setBuyNowCouponCode] = useState("");
  const [buyNowCouponError, setBuyNowCouponError] = useState("");
  const [buyNowCouponLoading, setBuyNowCouponLoading] = useState(false);
  const [buyNowCouponModalOpen, setBuyNowCouponModalOpen] = useState(false);
  const [buyNowAvailableCouponCount, setBuyNowAvailableCouponCount] = useState(0);
  const [buyNowCheckingCouponCount, setBuyNowCheckingCouponCount] = useState(false);
  const [buyNowGiftWrapSelected, setBuyNowGiftWrapSelected] = useState(false);
  const [buyNowGiftMessage, setBuyNowGiftMessage] = useState("");

  const appliedCoupon =
    isBuyNow ? buyNowCoupon : cartAppliedCoupon;

  const discount =
    isBuyNow ? buyNowDiscount : cartDiscount;

  const giftWrapSelected =
    isBuyNow ? buyNowGiftWrapSelected : cartGiftWrapSelected;

  const giftMessage =
    isBuyNow ? buyNowGiftMessage : cartGiftMessage;

  /*
   * Buy Now subtotal is the actual snapped customer price.
   *
   * item.price already contains the active special price.
   * The MRP -> regular-price discount and the regular-price ->
   * special-price discount are shown separately in the breakdown,
   * but must NOT be deducted again from subtotal.
   *
   * Example:
   * ₹2,000 MRP - ₹401 item discount - ₹179 special offer
   * = ₹1,420 actual subtotal.
   */
  /*
   * =========================================================
   * CHECKOUT PRODUCT PRICING
   * =========================================================
   *
   * Used only for the checkout price breakdown. The cart item's
   * price remains the actual snapped customer price, while the
   * product table supplies the current regular price and MRP.
   * =========================================================
   */

  const {
    data: checkoutProductPricing = [],
  } = useQuery<CheckoutProductPricing[]>({
    queryKey: [
      "checkout-product-pricing",
      checkoutItems
        .map(item => item.productId)
        .sort()
        .join("|"),
    ],

    queryFn: async () => {
      const productIds = [
        ...new Set(
          checkoutItems.map(
            item => item.productId
          )
        ),
      ];

      if (productIds.length === 0) {
        return [];
      }

      const {
        data,
        error,
      } = await supabase
        .from("products")
        .select(
          "id, price, compare_price, special_discount_enabled, special_discount_type, special_discount_value, special_discount_ends_at"
        )
        .in(
          "id",
          productIds
        );

      if (error) {
        throw error;
      }

      return (
        data ?? []
      ) as CheckoutProductPricing[];
    },

    enabled:
      open &&
      checkoutItems.length > 0,

    staleTime:
      5 * 60 * 1000,
  });

  const checkoutProductPricingMap =
    new Map<string, CheckoutProductPricing>(
      checkoutProductPricing.map(
        product => [
          product.id,
          product,
        ]
      )
    );

  const getGuestEffectiveItemPrice = (item: any) => {
    const pricing =
      checkoutProductPricingMap.get(
        item.productId
      );

    const regularPrice =
      Number(
        pricing?.price ??
        item.price ??
        0
      );

    const specialEnabled =
      pricing?.special_discount_enabled === true;

    const specialValue =
      Number(
        pricing?.special_discount_value ?? 0
      );

    const hasActiveSpecialOffer =
      specialEnabled &&
      specialValue > 0;

    if (
      isGuestCheckoutCustomer &&
      guestContinueWithoutSpecialPrice &&
      hasActiveSpecialOffer
    ) {
      return regularPrice;
    }

    return Number(item.price ?? 0);
  };

  const subtotal = isBuyNow
    ? checkoutItems.reduce(
        (sum: number, item: any) =>
          sum +
          getGuestEffectiveItemPrice(item) *
            Number(item.quantity || 0),
        0
      )
    : getTotal();


  /*
   * =========================================================
   * GIFT WRAP SETTINGS
   * =========================================================
   *
   * Address step uses the current Admin-configured Gift Wrap
   * price because shipping has not been calculated yet.
   * Payment step uses the server-verified amount from the
   * finalized checkout quote.
   */

  const {
    data: giftWrapSettings,
  } = useQuery({

    queryKey: [
      "gift-wrap-settings-checkout",
    ],

    queryFn: async () => {

      const {
        data,
        error,
      } = await supabase
        .from("gift_wrap_settings")
        .select("enabled, price")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return {
        enabled: Boolean(data?.enabled),
        price: Number(data?.price ?? 0),
      };

    },

    staleTime: 5 * 60 * 1000,

    enabled: open,

  });


  const addressStepGiftWrapAmount =
    giftWrapSelected &&
    giftWrapSettings?.enabled
      ? Number(giftWrapSettings.price ?? 0)
      : 0;


  const addressStepTotal =
    Math.max(
      subtotal - discount,
      0
    ) +
    addressStepGiftWrapAmount;


  /*
   * =========================================================
   * FREE GIFT PROGRESS
   * =========================================================
   */

  const giftRemaining =
    Math.max(
      FREE_GIFT_AMOUNT - subtotal,
      0
    );


  const giftProgress =
    Math.min(
      (
        subtotal /
        FREE_GIFT_AMOUNT
      ) * 100,
      100
    );


  const giftUnlocked =
    subtotal >=
    FREE_GIFT_AMOUNT;


  /*
   * =========================================================
   * FREE SHIPPING PROGRESS
   * =========================================================
   */

  const shippingRemaining =
    Math.max(
      FREE_SHIPPING_AMOUNT - subtotal,
      0
    );


  const shippingProgress =
    Math.min(
      (
        subtotal /
        FREE_SHIPPING_AMOUNT
      ) * 100,
      100
    );


  const freeShippingByAmount =
    subtotal >=
    FREE_SHIPPING_AMOUNT;


  const freeShippingByCoupon =
    Boolean(
      appliedCoupon?.freeShipping
    );


  const freeShippingUnlocked =
    freeShippingByAmount ||
    freeShippingByCoupon;


  /*
   * =========================================================
   * FINAL SHIPPING
   * =========================================================
   */

  const finalShippingCharge =
    freeShippingUnlocked
      ? 0
      : shippingCharge;


  /*
   * =========================================================
   * FINAL TOTAL
   * =========================================================
   */

  const finalAmount =
    Math.max(
      subtotal - discount,
      0
    ) +
    finalShippingCharge;


  /*
   * =========================================================
   * CHECKOUT PRICE BREAKDOWN
   * =========================================================
   *
   * Total MRP = MRP of all cart items × quantity.
   * Item Discount = MRP → regular/our price.
   * Special Offer Discount = regular/our price → snapped
   * Special Price.
   * Subtotal = actual cart/verified checkout subtotal.
   * =========================================================
   */

  let totalMrp = 0;
  let itemDiscount = 0;
  let specialOfferDiscount = 0;

  checkoutItems.forEach(item => {
    const pricing =
      checkoutProductPricingMap.get(
        item.productId
      );

    /*
     * IMPORTANT:
     * For Guests, item.price is the actual normal checkout price.
     * A Member-only special price must never be counted as the
     * normal Item Discount.
     *
     * For Members, products.price is the regular/our price and
     * item.price is the snapped Member special price.
     */
    const pricingRegularPrice =
      Number(
        pricing?.price ??
        item.price ??
        0
      );

    const itemPrice =
      Number(
        item.price ??
        pricingRegularPrice
      );

    const effectiveItemPrice =
      getGuestEffectiveItemPrice(item);

    const regularPrice =
      isGuestCheckoutCustomer
        ? (
            guestContinueWithoutSpecialPrice
              ? pricingRegularPrice
              : itemPrice
          )
        : pricingRegularPrice;

    const mrp =
      Number(
        pricing?.compare_price ??
        regularPrice
      );

    const quantity =
      Number(item.quantity) || 0;

    const productMrp =
      mrp > 0
        ? mrp
        : regularPrice;

    totalMrp +=
      productMrp *
      quantity;

    /*
     * Item Discount is ONLY:
     *
     * MRP → regular customer price
     *
     * For a Guest, this is the price the Guest actually sees.
     * For a Member, this is the product's regular price before
     * the Member special offer.
     */
    itemDiscount +=
      Math.max(
        0,
        productMrp -
        regularPrice
      ) *
      quantity;

    /*
     * Special Offer Discount is ONLY for a Member who is
     * actually receiving the active product-level special price.
     *
     * Normal product discounts are therefore never treated as
     * special discounts.
     */
    const productSpecialEnabled =
      pricing?.special_discount_enabled === true;

    const productSpecialValue =
      Number(
        pricing?.special_discount_value ?? 0
      );

    const hasSpecialOffer =
      productSpecialEnabled &&
      productSpecialValue > 0;

    const isMemberReceivingSpecialPrice =
      !isGuestCheckoutCustomer &&
      hasSpecialOffer &&
      effectiveItemPrice <
        regularPrice;

    if (isMemberReceivingSpecialPrice) {
      specialOfferDiscount +=
        Math.max(
          0,
          regularPrice -
          effectiveItemPrice
        ) *
        quantity;
    }
  });

  const displayedSubtotal =
    verifiedCheckoutPricing?.subtotal ??
    subtotal;

  const displayedCouponDiscount =
    verifiedCheckoutPricing?.discount ??
    discount;

  const displayedGiftWrapAmount =
    step === "payment"
      ? (
          verifiedCheckoutPricing?.giftWrapAmount ??
          0
        )
      : addressStepGiftWrapAmount;

  const displayedTax =
    step === "payment"
      ? (
          verifiedCheckoutPricing?.tax ??
          0
        )
      : 0;

  const displayedTotal =
    step === "payment"
      ? (
          verifiedCheckoutPricing?.totalAmount ??
          finalAmount
        )
      : addressStepTotal;


  /*
   * =========================================================
   * CLOSE CHECKOUT
   * =========================================================
   *
   * Guest OTP creates a temporary Supabase Auth session.
   * Keep that session alive while CheckoutDialog is open so
   * secure Guest operations can continue through Address and
   * Payment.
   *
   * When the Guest closes checkout, sign out that temporary
   * session. Members are never signed out by this handler.
   */
  async function handleCheckoutClose() {
    setGuestContinueWithoutSpecialPrice(false);

    if (walletHoldId) {
      await releaseWalletHold();
    }

    if (guestCheckoutSessionActive) {
      try {
        const { error } = await supabase.auth.signOut();

        if (error) {
          console.warn(
            "[T&M GUEST] Checkout-close session sign-out failed:",
            error
          );
        }
      } catch (error) {
        console.warn(
          "[T&M GUEST] Checkout-close session sign-out failed:",
          error
        );
      } finally {
        setGuestCheckoutSessionActive(false);
      }
    }

    onClose();
  }


  /*
   * =========================================================
   * AUTH CUSTOMER EFFECT
   * =========================================================
   */

  useEffect(() => {

    /*
     * Once the order has been confirmed, do not let a late
     * auth/customer context update move the checkout back to
     * the Address step.
     */
    if (
      orderSuccess ||
      !authCustomer
    ) {
      return;
    }

    setCustomer(
      authCustomer
    );

    setStep(
      "address"
    );

  }, [
    authCustomer,
    orderSuccess,
  ]);


  /*
   * =========================================================
   * RESET AFTER CHECKOUT CLOSES
   * =========================================================
   *
   * OrderSuccess belongs to the previous checkout session.
   * When the confirmation screen is closed, clear that state
   * so the next Proceed to Checkout starts as a fresh checkout.
   * =========================================================
   */

  useEffect(() => {

    if (open) {
      return;
    }

    setOrderSuccess(
      false
    );

    setOrderNumber(
      ""
    );

    setProcessingPayment(
      false
    );

    setPaymentRecoveryError(
      ""
    );

    setSelectedAddress(
      null
    );

    setShippingCharge(
      0
    );

    setShippingError(
      ""
    );

    setCheckoutQuoteId(
      null
    );

    setVerifiedCheckoutPricing(
      null
    );

    setCalculatingShipping(
      false
    );

    setShowLoginScrollHint(true);

    setLoginChoice(null);
    setGuestName("");
    setGuestPhone("");
    setGuestEmail("");
    setGuestError("");
    setGuestSubmitting(false);
    setGuestOtp("");
    setGuestOtpSent(false);
    setGuestOtpVerifying(false);
    setGuestCustomerDraft(null);
    setGuestOtpVerified(false);
    setGuestCheckoutSessionActive(false);
    setGuestMembershipSubmitting(false);
    setMemberUpgradeDialogOpen(false);
    setMemberUpgradeReason("special_price");
    setMemberUpgradeSubmitting(false);

  }, [
    open,
  ]);


  /*
   * =========================================================
   * RESET BUY NOW STATE
   * =========================================================
   */

  useEffect(() => {

    if (!isBuyNow) {
      setBuyNowCoupon(null);
      setBuyNowDiscount(0);
      setBuyNowCouponCode("");
      setBuyNowCouponError("");
      setBuyNowCouponModalOpen(false);
      setBuyNowAvailableCouponCount(0);
      setBuyNowCheckingCouponCount(false);
      setBuyNowGiftWrapSelected(false);
      setBuyNowGiftMessage("");
      return;
    }

    setBuyNowCoupon(null);
    setBuyNowDiscount(0);
    setBuyNowCouponCode("");
    setBuyNowCouponError("");
    setBuyNowCouponModalOpen(false);
    setBuyNowGiftWrapSelected(false);
    setBuyNowGiftMessage("");

  }, [buyNowItem, isBuyNow]);


  /*
   * =========================================================
   * BUY NOW AVAILABLE COUPON COUNT
   * =========================================================
   *
   * Show the customer how many coupons are actually eligible
   * for this Buy Now product.
   *
   * This deliberately uses the same validateCoupon() source of
   * truth as CouponModal, so the count respects:
   * - product/category/collection targeting
   * - customer targeting
   * - membership restrictions
   * - minimum/maximum conditions
   * - usage limits
   * - coupon dates
   * - the current Special Price expiry state
   *
   * Ineligible coupons are simply not counted.
   */

  useEffect(() => {

    let cancelled = false;

    async function loadBuyNowAvailableCouponCount() {

      if (
        !isBuyNow ||
        !open ||
        !customer?.id ||
        checkoutItems.length === 0
      ) {
        if (!cancelled) {
          setBuyNowAvailableCouponCount(0);
          setBuyNowCheckingCouponCount(false);
        }
        return;
      }

      setBuyNowCheckingCouponCount(true);

      try {

        const {
          data: activeCoupons,
          error: couponsError,
        } = await supabase
          .from("coupons")
          .select("*")
          .eq("is_active", true);

        if (couponsError) {
          throw couponsError;
        }

        const eligibleResults =
          await Promise.all(
            (activeCoupons ?? []).map(
              async (coupon: any) => {

                try {

                  await validateCoupon(
                    coupon.code,
                    subtotal,
                    customer.id,
                    checkoutItems.map(
                      (item: any) => ({
                        productId:
                          item.productId,
                        quantity:
                          item.quantity,
                        price:
                          item.price,
                      })
                    )
                  );

                  return true;

                } catch {
                  return false;
                }

              }
            )
          );

        if (cancelled) {
          return;
        }

        setBuyNowAvailableCouponCount(
          eligibleResults.filter(Boolean).length
        );

      } catch {

        if (!cancelled) {
          /*
           * If the availability check itself fails, do not show
           * a misleading offer count.
           */
          setBuyNowAvailableCouponCount(0);
        }

      } finally {

        if (!cancelled) {
          setBuyNowCheckingCouponCount(false);
        }

      }

    }

    void loadBuyNowAvailableCouponCount();

    return () => {
      cancelled = true;
    };

  }, [
    isBuyNow,
    open,
    customer?.id,
    checkoutItems.length,
    checkoutItems[0]?.productId,
    checkoutItems[0]?.quantity,
    checkoutItems[0]?.price,
    subtotal,
  ]);


  /*
   * =========================================================
   * BUY NOW COUPON
   * =========================================================
   */

  function scrollToLoginSection() {
    const loginSection =
      loginSectionRef.current;

    if (!loginSection) {
      return;
    }

    /*
     * Login is rendered below the Order Summary inside the
     * checkout scroll container. Scrolling the section itself
     * keeps the modal fixed while moving the checkout content.
     */
    loginSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    setShowLoginScrollHint(false);
  }


  function handleViewAvailableCoupons() {

    /*
     * While the checkout is still on the Login step, this
     * button should behave as a shortcut to the Login section.
     *
     * It must NOT open CouponModal from the Login step.
     */
    if (
      step === "login" &&
      !authCustomer
    ) {
      scrollToLoginSection();
      return;
    }


    /*
     * Once the Guest has completed Login/OTP and reached the
     * Address step, "View available coupons" opens the coupon
     * dialog so the Guest can browse available offers.
     */
    setBuyNowCouponError("");
    setBuyNowCouponModalOpen(true);
  }


  /*
   * =========================================================
   * LOGIN SCROLL HINT
   * =========================================================
   *
   * The cute floating arrow is only a visual cue for guests.
   * It disappears permanently for the current checkout session
   * once the customer clicks it OR naturally reaches the Login
   * section by scrolling.
   */
  useEffect(() => {

    if (!open || authCustomer || step !== "login" || orderSuccess) {
      return;
    }

    setShowLoginScrollHint(true);

    const container = checkoutContentRef.current;

    if (!container) {
      return;
    }

    const handleScroll = () => {

      if (loginSectionRef.current) {

        const loginRect =
          loginSectionRef.current.getBoundingClientRect();

        const containerRect =
          container.getBoundingClientRect();

        /*
         * Consider the Login section "reached" when its top has
         * entered the visible checkout content area.
         */
        if (
          loginRect.top <=
          containerRect.top + 110
        ) {
          setShowLoginScrollHint(false);
        }
      }

    };

    container.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    handleScroll();

    return () => {
      container.removeEventListener(
        "scroll",
        handleScroll
      );
    };

  }, [
    open,
    authCustomer,
    step,
    orderSuccess,
  ]);



  /*
   * =========================================================
   * MEMBER UPGRADE PROMPT
   * =========================================================
   */

  const isGuestCustomer =
    Boolean(
      customer?.id &&
      !customer?.auth_user_id &&
      customer?.customer_type === "guest"
    ) ||
    Boolean(
      guestCustomerDraft?.id &&
      !guestCustomerDraft?.auth_user_id &&
      guestCustomerDraft?.customer_type === "guest"
    );

  const hasMemberOnlySpecialPrice =
    checkoutItems.some((item: any) => {
      const pricing =
        checkoutProductPricingMap.get(
          item.productId
        );

      return (
        pricing?.special_discount_enabled === true &&
        Number(
          pricing?.special_discount_value ?? 0
        ) > 0
      );
    });

  function openMemberUpgradeDialog(
    reason: "special_price" | "coupon"
  ) {
    setMemberUpgradeReason(reason);
    setMemberUpgradeDialogOpen(true);
  }

  async function handleMemberUpgradeFromDialog() {
    const normalizedPhone =
      String(
        customer?.phone ??
        guestCustomerDraft?.phone ??
        guestPhone ??
        ""
      )
        .replace(/\D/g, "")
        .slice(-10);

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setBuyNowCouponError(
        "Please verify your mobile number before becoming a member."
      );
      setMemberUpgradeDialogOpen(false);
      return;
    }

    setMemberUpgradeSubmitting(true);

    try {
      const memberCustomer =
        await upgradeGuestToMember(
          normalizedPhone
        );

      const draft =
        customer ||
        guestCustomerDraft ||
        {};

      const upgradedCustomer = {
        ...draft,
        id:
          memberCustomer.customer_id ||
          draft?.id,
        first_name:
          memberCustomer.first_name ||
          draft?.first_name ||
          "",
        last_name:
          memberCustomer.last_name ||
          draft?.last_name ||
          "",
        email:
          memberCustomer.email ||
          draft?.email ||
          null,
        phone:
          memberCustomer.phone ||
          normalizedPhone,
        auth_user_id:
          memberCustomer.auth_user_id ||
          null,
        customer_type:
          memberCustomer.customer_type ||
          "member",
        phone_verified:
          Boolean(
            memberCustomer.phone_verified
          ),
      };

      setCustomer(upgradedCustomer);

      useCustomerStore
        .getState()
        .setCustomer(
          upgradedCustomer
        );

      setGuestCustomerDraft(
        upgradedCustomer
      );

      /*
       * This Guest Auth session is now the permanent Member
       * session. It must NOT be signed out when CheckoutDialog
       * closes.
       */
      setGuestCheckoutSessionActive(false);
      setGuestOtpVerified(false);

      /*
       * Refresh the GLOBAL AuthContext as well.
       *
       * Guest → Member changes the customer row in Supabase,
       * but that database update does not emit a Supabase
       * auth-state event. Without this refresh, the page behind
       * CheckoutDialog can continue showing the Guest state until
       * the browser is manually refreshed.
       *
       * Do NOT reload the whole browser page here because that
       * would destroy the active checkout state/address.
       */
      try {
        const refreshedCustomer =
          await refreshCustomer(
            normalizedPhone
          );

        if (refreshedCustomer) {
          setCustomer(
            refreshedCustomer
          );

          useCustomerStore
            .getState()
            .setCustomer(
              refreshedCustomer
            );

          setGuestCustomerDraft(
            refreshedCustomer
          );
        }
      } catch (refreshError) {
        console.warn(
          "Member upgrade succeeded, but global AuthContext refresh failed:",
          refreshError
        );
      }

      /*
       * The customer is now a Member, so the Member special price
       * is allowed again.
       */
      setGuestContinueWithoutSpecialPrice(false);

      setMemberUpgradeDialogOpen(false);
      setMemberUpgradeSubmitting(false);

      /*
       * A membership upgrade changes coupon eligibility and
       * special-price eligibility. Remove any stale quote and
       * force the next Address → Payment transition to create
       * a fresh server-side quote.
       */
      setCheckoutQuoteId(null);
      setVerifiedCheckoutPricing(null);
      setShippingCharge(0);
      setShippingError("");

      /*
       * If the prompt was caused by a coupon, automatically
       * retry the exact coupon after the customer becomes a
       * Member.
       */
      if (
        memberUpgradeReason === "coupon" &&
        buyNowCouponCode.trim()
      ) {
        await applyBuyNowCoupon(
          buyNowCouponCode
        );
      }
    } catch (error: any) {
      console.error(
        "Guest to member upgrade from checkout failed:",
        error
      );

      setMemberUpgradeSubmitting(false);

      setBuyNowCouponError(
        error?.message ||
        "Unable to activate membership. Please try again."
      );
    }
  }

  function continueAsGuestAfterMemberPrompt() {
    setMemberUpgradeDialogOpen(false);
    setMemberUpgradeSubmitting(false);

    /*
     * A Guest must never continue checkout with a Member-only
     * special price.
     *
     * If the prompt was triggered by special pricing, remove that
     * special-price benefit from the checkout display and continue
     * to Address at the normal product price.
     */
    if (
      memberUpgradeReason === "special_price"
    ) {
      setGuestContinueWithoutSpecialPrice(true);

      /*
       * The old Member-price quote must not be reused.
       * Address → Payment will create a fresh quote using the
       * Guest's normal product price.
       */
      setCheckoutQuoteId(null);
      setVerifiedCheckoutPricing(null);
      setShippingCharge(0);
      setShippingError("");

      setStep("address");
      return;
    }

    /*
     * Coupon prompts happen after the Guest is already in Address.
     * Keep the existing step unchanged in that case.
     */
    if (
      step === "login" &&
      guestOtpVerified
    ) {
      setStep("address");
    }
  }

  async function applyBuyNowCoupon(input: any) {

    const code =
      typeof input === "string"
        ? input
        : input?.code ?? "";

    if (!code.trim()) {
      setBuyNowCouponError("Please enter a coupon code.");
      return;
    }

    if (!customer?.id) {
      setBuyNowCouponError("Please log in to use a coupon.");
      return;
    }

    setBuyNowCouponLoading(true);
    setBuyNowCouponError("");

    try {
      const result =
        await validateCoupon(
          code,
          subtotal,
          customer.id,
          checkoutItems.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          }))
        );

      setBuyNowCoupon({
        ...result.coupon,
        discount: result.discount,
        freeShipping: result.freeShipping,
        freeGift: result.freeGift,
      });

      setBuyNowDiscount(result.discount);
      setBuyNowCouponCode("");
      setBuyNowCouponModalOpen(false);
    } catch (error: any) {
      if (
        isGuestCustomer &&
        error?.code === "MEMBER_ONLY_COUPON"
      ) {
        /*
         * Keep the entered code so that after the guest becomes
         * a Member we can validate/apply the same coupon again.
         */
        setBuyNowCouponCode(code.trim().toUpperCase());
        setBuyNowCouponError("");
        setBuyNowCouponModalOpen(false);
        openMemberUpgradeDialog("coupon");
      } else {
        setBuyNowCouponError(
          error?.message || "Unable to apply this coupon."
        );
      }
    } finally {
      setBuyNowCouponLoading(false);
    }
  }


  function removeBuyNowCoupon() {
    setBuyNowCoupon(null);
    setBuyNowDiscount(0);
    setBuyNowCouponCode("");
    setBuyNowCouponError("");
  }


  /*
   * =========================================================
   * RESET WHEN CHECKOUT OPENS
   * =========================================================
   */

  useEffect(() => {

    if (step !== "address") {
      setIsAddingNewAddress(false);
    }

  }, [step]);


  useEffect(() => {

    if (!open) {
      return;
    }

    /*
     * Do not reset an already-confirmed order.
     *
     * The auth context can receive a late update after payment
     * or order creation. Without this guard, the effect below
     * would reset orderSuccess and move the customer back to
     * Address.
     */
    if (orderSuccess) {
      return;
    }


    setOrderSuccess(
      false
    );

    setOrderNumber(
      ""
    );

    setProcessingPayment(
      false
    );

    setPaymentRecoveryError(
      ""
    );

    setSelectedAddress(
      null
    );

    setShippingCharge(
      0
    );

    setShippingError(
      ""
    );

    setCheckoutQuoteId(
      null
    );

    setVerifiedCheckoutPricing(
      null
    );

    setCalculatingShipping(
      false
    );


    setStep(
      authCustomer
        ? "address"
        : "login"
    );

    if (!authCustomer) {
      setLoginChoice(null);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      setGuestError("");
      setGuestSubmitting(false);
      setGuestOtp("");
      setGuestOtpSent(false);
      setGuestOtpVerifying(false);
      setGuestCustomerDraft(null);
      setGuestOtpVerified(false);
      setGuestMembershipSubmitting(false);
    }

  }, [
    open,
    authCustomer,
    orderSuccess,
  ]);


  /*
   * =========================================================
   * LOGIN SUCCESS
   * =========================================================
   */

  async function handleLoginSuccess(
    data: {
      phone: string;
    }
  ) {

    try {

      const existingCustomer =
        await getCustomerByPhone(
          data.phone
        );


      if (existingCustomer) {

        setCustomer(
          existingCustomer
        );


        useCustomerStore
          .getState()
          .setCustomer(
            existingCustomer
          );


        setStep(
          "address"
        );


        return;

      }


      const newCustomer =
        await createCustomer({

          first_name:
            "Customer",

          phone:
            data.phone,

        });


      setCustomer(
        newCustomer
      );


      useCustomerStore
        .getState()
        .setCustomer(
          newCustomer
        );


      setStep(
        "address"
      );

    }

    catch (error) {

      console.error(
        "Customer login failed",
        error
      );

    }

  }


  /*
   * =========================================================
   * GUEST CHECKOUT
   * =========================================================
   *
   * Guest checkout stays inside the existing Login step.
   * We create/reuse a customer record without creating a
   * Supabase Auth account. The Address and Payment steps remain
   * completely unchanged.
   */
  async function handleGuestContinue() {
    const normalizedName =
      guestName.trim().replace(/\s+/g, " ");

    const normalizedPhone =
      guestPhone.replace(/\D/g, "").slice(-10);

    const normalizedEmail =
      guestEmail.trim().toLowerCase();

    setGuestError("");

    if (!normalizedName || normalizedName.length < 2) {
      setGuestError("Please enter your full name.");
      return;
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setGuestError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setGuestError("Please enter a valid email address.");
      return;
    }

    setGuestSubmitting(true);

    try {
      const nameParts = normalizedName.split(" ");
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(" ");

      /*
       * Create/reuse the guest customer BEFORE sending OTP.
       * The secure RPC rejects phone numbers that already belong
       * to a registered Member.
       */
      const guestCustomer = await createGuestCustomer({
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail || undefined,
        phone: normalizedPhone,
      });

      const checkoutGuestCustomer = {
        ...guestCustomer,
        first_name:
          guestCustomer?.first_name || firstName,
        last_name:
          guestCustomer?.last_name || lastName,
        phone:
          guestCustomer?.phone || normalizedPhone,
        email:
          normalizedEmail ||
          guestCustomer?.email ||
          null,
      };

      setGuestCustomerDraft(checkoutGuestCustomer);

      await sendGuestOtp(normalizedPhone);

      setGuestOtp("");
      setGuestOtpSent(true);
      setGuestSubmitting(false);
    } catch (error: any) {
      console.error(
        "Guest checkout OTP setup failed:",
        error
      );

      setGuestError(
        error?.message ||
        "Unable to send OTP. Please try again."
      );

      setGuestSubmitting(false);
    }
  }

  async function handleVerifyGuestOtp() {
    const normalizedPhone =
      guestPhone.replace(/\D/g, "").slice(-10);

    const normalizedOtp =
      guestOtp.replace(/\D/g, "").slice(0, 6);

    setGuestError("");

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setGuestError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setGuestError("Please enter the 6-digit OTP.");
      return;
    }

    setGuestOtpVerifying(true);

    try {
      await verifyGuestOtp(
        normalizedPhone,
        normalizedOtp,
        { keepSession: true }
      );

      const draft = guestCustomerDraft || {};

      const verifiedGuestCustomer = {
        ...draft,
        phone: draft?.phone || normalizedPhone,
        first_name:
          draft?.first_name ||
          guestName.trim().split(/\s+/)[0],
        last_name:
          draft?.last_name ||
          guestName.trim().split(/\s+/).slice(1).join(" "),
        email:
          guestEmail.trim().toLowerCase() ||
          draft?.email ||
          null,
      };

      setGuestCustomerDraft(verifiedGuestCustomer);
      setGuestOtpVerified(true);
      setGuestCheckoutSessionActive(true);
      setGuestOtpVerifying(false);
      setGuestSubmitting(false);
    } catch (error: any) {
      console.error(
        "Guest OTP verification failed:",
        error
      );

      setGuestError(
        error?.message ||
        "Invalid OTP. Please try again."
      );

      setGuestOtpVerifying(false);
    }
  }

  async function handleGuestMemberChoice(
    choice: "member" | "guest"
  ) {
    const normalizedPhone =
      guestPhone.replace(/\D/g, "").slice(-10);

    const draft = guestCustomerDraft || {};

    setGuestError("");

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setGuestError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setGuestMembershipSubmitting(true);

    try {
      if (choice === "member") {
        const memberCustomer =
          await upgradeGuestToMember(normalizedPhone);

        const upgradedCustomer = {
          ...draft,
          id:
            memberCustomer.customer_id ||
            draft?.id,
          first_name:
            memberCustomer.first_name ||
            draft?.first_name ||
            "",
          last_name:
            memberCustomer.last_name ||
            draft?.last_name ||
            "",
          email:
            memberCustomer.email ||
            draft?.email ||
            null,
          phone:
            memberCustomer.phone ||
            normalizedPhone,
          auth_user_id:
            memberCustomer.auth_user_id ||
            null,
          phone_verified:
            Boolean(memberCustomer.phone_verified),
        };

        setCustomer(upgradedCustomer);

        useCustomerStore
          .getState()
          .setCustomer(upgradedCustomer);

        /*
         * The database row is now a Member, but Supabase Auth does
         * not emit an auth-state event when only the customer row
         * changes. Refresh AuthContext explicitly so the main
         * website/header/account immediately sees the Member.
         */
        try {
          const refreshedCustomer = await refreshCustomer();

          if (refreshedCustomer) {
            setCustomer(refreshedCustomer);

            useCustomerStore
              .getState()
              .setCustomer(refreshedCustomer);

            setGuestCustomerDraft(refreshedCustomer);
          }
        } catch (refreshError) {
          console.warn(
            "Member upgrade succeeded, but AuthContext refresh failed:",
            refreshError
          );
        }

        /*
         * The same verified Auth session is now the Member's
         * session. It must NOT be signed out.
         */
        setGuestCheckoutSessionActive(false);
        setGuestOtpVerified(false);
        setGuestMembershipSubmitting(false);
        setStep("address");
        return;
      }

      /*
       * IMPORTANT:
       * Do NOT sign out here.
       *
       * The Guest has already verified their phone. The temporary
       * Auth session must remain active so the secure Guest
       * Address / Quote / Payment operations can continue.
       * handleCheckoutClose() signs it out when the checkout closes.
       */
      setGuestCheckoutSessionActive(true);

      const guestCustomer = {
        ...draft,
        customer_type:
          draft?.customer_type ||
          "guest",
        auth_user_id:
          null,
      };

      setCustomer(guestCustomer);

      useCustomerStore
        .getState()
        .setCustomer(guestCustomer);

      setGuestOtpVerified(false);
      setGuestMembershipSubmitting(false);

      /*
       * A verified Guest can continue normally, but Member-only
       * special pricing should first offer the option to upgrade.
       *
       * The server remains authoritative; this dialog is only the
       * customer-facing upgrade prompt.
       */
      if (
        hasMemberOnlySpecialPrice
      ) {
        setMemberUpgradeReason("special_price");
        setMemberUpgradeDialogOpen(true);
        return;
      }

      setStep("address");
    } catch (error: any) {
      console.error(
        "Guest membership choice failed:",
        error
      );

      setGuestError(
        error?.message ||
        "Unable to continue. Please try again."
      );

      setGuestMembershipSubmitting(false);
    }
  }

  async function handleResendGuestOtp() {
    const normalizedPhone =
      guestPhone.replace(/\D/g, "").slice(-10);

    setGuestError("");

    if (!/^\d{10}$/.test(normalizedPhone)) {
      setGuestError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setGuestSubmitting(true);

    try {
      await sendGuestOtp(normalizedPhone);
      setGuestOtp("");
      setGuestError("");
    } catch (error: any) {
      console.error(
        "Guest OTP resend failed:",
        error
      );

      setGuestError(
        error?.message ||
        "Unable to resend OTP. Please try again."
      );
    } finally {
      setGuestSubmitting(false);
    }
  }

  function handleGuestPhoneChange(value: string) {
    const normalizedPhone =
      value.replace(/\D/g, "").slice(0, 10);

    setGuestPhone(normalizedPhone);
    setGuestError("");

    /*
     * Changing the mobile number invalidates the current OTP
     * session and the guest customer draft.
     */
    if (guestOtpSent) {
      setGuestOtpSent(false);
      setGuestOtp("");
      setGuestCustomerDraft(null);
      setGuestOtpVerified(false);
    }
  }



  /*
   * =========================================================
   * ADDRESS → PAYMENT
   * =========================================================
   */

  async function handleAddressContinue(
    address: any
  ) {

    setShippingError(
      ""
    );


    setSelectedAddress(
      address
    );


    /*
     * =======================================================
     * PINCODE
     * =======================================================
     */

    const pincode =
      String(
        address?.postal_code ??
        ""
      ).trim();


    if (
      !/^\d{6}$/.test(
        pincode
      )
    ) {

      setShippingError(
        "Please select a valid delivery address with a 6-digit pincode."
      );

      return;

    }


    /*
     * =======================================================
     * WALLET RE-ATTACHMENT
     * =======================================================
     *
     * A checkout quote is immutable for the payment flow.
     * Going back to Address creates a fresh quote, so an existing
     * wallet hold must never be carried over to that new quote.
     *
     * Preserve the customer's intent to use Wallet, release the
     * old quote's hold now, and create a fresh hold after the new
     * quote has been finalized.
     * =======================================================
     */

    const shouldReapplyWallet =
      walletSelected;

    if (walletHoldId) {

      const released =
        await releaseWalletHold();

      if (!released) {

        setShippingError(
          "We couldn't refresh your wallet reservation. Please try again."
        );

        return;

      }

    } else if (shouldReapplyWallet) {

      /*
       * The UI may still remember the customer's wallet choice
       * even when the previous hold has already disappeared.
       * Clear the stale amount while the new quote is created.
       */
      setWalletHoldId(null);
      setWalletAmountPaise(0);
      setWalletSelected(false);

    }


    /*
     * =======================================================
     * START SECURE SHIPPING QUOTE
     * =======================================================
     *
     * We now send product IDs + quantities to the server.
     *
     * The server fetches the real product weights from the
     * database. Frontend weight is no longer trusted.
     *
     * Products without a stored weight use the server-side
     * 0.500 kg fallback.
     *
     * We also calculate Shiprocket even when the customer
     * qualifies for free shipping. The quote is still needed
     * as the server-side shipping reference for checkout.
     * =======================================================
     */

    setCalculatingShipping(
      true
    );


    setShippingCharge(
      0
    );


    setCheckoutQuoteId(
      null
    );


    // Give React one browser paint so the loading overlay is
    // visible before the Shiprocket/network request starts.
    window.setTimeout(() => {

      checkDelivery(

        {
          pincode,

        customerId:
          customer?.id ??
          null,

        paymentMethod:
          "prepaid",

        items:
          checkoutItems.map(
            (item: typeof checkoutItems[number]) => ({
              productId:
                item.productId,

              quantity:
                item.quantity,

              buyNow:
                isBuyNow,

              ringSize:
                item.ringSize ?? null,
            })
          ),

      },

      {

        onSuccess: async (
          data
        ) => {

          const courier =
            data
              ?.data
              ?.available_courier_companies
              ?.[0];


          /*
           * No courier available
           */

          if (!courier) {

            setCalculatingShipping(
              false
            );

            setShippingCharge(
              0
            );

            setCheckoutQuoteId(
              null
            );

            setShippingError(
              "Sorry, delivery is not available for this pincode."
            );

            return;

          }


          /*
           * =================================================
           * SERVER-VERIFIED SHIPROCKET RATE
           * =================================================
           *
           * Prefer the rate returned by the secure quote.
           * Fall back to the courier response only for
           * compatibility with the existing delivery response.
           * =================================================
           */

          const quoteRate =
            Number(
              data
                ?.quote
                ?.shiprocket_rate ??
              data
                ?.verified_shipping
                ?.shiprocket_rate ??
              courier?.rate ??
              0
            );


          if (
            !Number.isFinite(
              quoteRate
            ) ||
            quoteRate < 0
          ) {

            setCalculatingShipping(
              false
            );

            setShippingCharge(
              0
            );

            setCheckoutQuoteId(
              null
            );

            setShippingError(
              "Unable to verify shipping charges. Please try again."
            );

            return;

          }


          /*
           * =================================================
           * FULL SHIPROCKET RATE
           * =================================================
           *
           * No ₹59 / ₹79 customer pricing rule anymore.
           *
           * If free shipping is unlocked, the customer pays
           * ₹0, but the secure quote still retains the real
           * Shiprocket rate.
           * =================================================
           */

          const customerShipping =
            freeShippingUnlocked
              ? 0
              : quoteRate;


          setShippingCharge(
            customerShipping
          );


          /*
           * Save the server-generated quote ID.
           */

          const quoteId =
            data
              ?.quote
              ?.id ??
            null;


          setCheckoutQuoteId(
            quoteId
          );


          /*
           * Save delivery information for UI/legacy usage.
           *
           * The quote ID is also stored here so the next
           * checkout-security step can use the same quote.
           */

          const deliveryInfo = {

            pincode,

            shippingCharge:
              quoteRate,

            customerShippingCharge:
              customerShipping,

            courier:
              courier?.courier_name ||
              "",

            checkoutQuoteId:
              quoteId,

            shipmentWeight:
              data
                ?.quote
                ?.shipment_weight ??
              data
                ?.verified_shipping
                ?.shipment_weight ??
              null,

          };


          localStorage.setItem(
            "tnm_delivery_info",
            JSON.stringify(
              deliveryInfo
            )
          );


          setShippingError(
            ""
          );


          /*
           * =================================================
           * FINALIZE SERVER-SIDE CHECKOUT TOTAL
           * =================================================
           *
           * The Shiprocket quote only contains the verified
           * shipping rate. Before Payment is shown, the server
           * now re-fetches prices and validates the selected
           * coupon/eligibility rules and stores the final
           * payable amount in checkout_quotes.
           */

          if (!quoteId) {

            setCalculatingShipping(
              false
            );

            setShippingError(
              "Unable to create a secure shipping quote. Please try again."
            );

            return;

          }


          try {

            /*
             * Apply Gift Wrap to the secure checkout quote.
             *
             * The backend reads the current Admin Gift Wrap
             * settings and determines the actual price.
             */

            await setCheckoutQuoteGiftWrap({

              quoteId,

              customerId:
                customer?.id,

              giftWrap:
                giftWrapSelected,

              giftMessage:
                giftWrapSelected
                  ? giftMessage
                  : "",

            });


            const finalized =
              await finalizeCheckoutQuote({

                quoteId,

                customerId:
                  customer?.id,

                couponId:
                  appliedCoupon?.id ??
                  null,

              });


            setCheckoutQuoteId(
              finalized.quote_id
            );


            setShippingCharge(
              finalized.shipping_charge
            );


            setVerifiedCheckoutPricing({

              subtotal:
                finalized.subtotal,

              discount:
                finalized.discount,

              shippingCharge:
                finalized.shipping_charge,

              giftWrapAmount:
                Number(
                  (finalized as any).gift_wrap_amount ??
                  (finalized as any).giftWrapAmount ??
                  0
                ),

              tax:
                finalized.tax,

              totalAmount:
                finalized.total_amount,

            });


            /*
             * Re-create the wallet reservation against the NEW
             * finalized quote when the customer had previously
             * enabled Wallet.
             *
             * The finalized server total is authoritative, so
             * the wallet amount is recalculated instead of
             * blindly reusing the old quote's amount.
             */
            if (shouldReapplyWallet) {

              await createWalletHoldForQuote(
                finalized.quote_id,
                finalized.total_amount
              );

            }


            setCalculatingShipping(
              false
            );


            setStep(
              "payment"
            );

          }

          catch (finalizeError:any) {

            console.error(
              "Checkout quote finalization failed:",
              finalizeError
            );


            setCalculatingShipping(
              false
            );


            setCheckoutQuoteId(
              null
            );


            setVerifiedCheckoutPricing(
              null
            );


            setShippingError(
              finalizeError?.message ||
              "Unable to verify your final total. Please try again."
            );

          }

        },


        onError: (
          error
        ) => {

          console.error(
            "Shipping calculation failed:",
            error
          );


          setCalculatingShipping(
            false
          );


          setShippingCharge(
            0
          );


          setCheckoutQuoteId(
            null
          );

          setVerifiedCheckoutPricing(
            null
          );


          setShippingError(
            "Sorry, delivery is not available for this pincode."
          );

        },

      }

      );

    }, 50);

  }


  /*
   * =========================================================
   * COMPLETE ORDER AFTER VERIFIED PAYMENT
   * =========================================================
   */

  async function completeOrderAfterPayment(
    payment: any
  ) {

    try {

      /*
       * Normal completion uses the live checkout state.
       * Recovery uses the exact checkout snapshot captured
       * immediately after Razorpay success.
       */
      let recoverySnapshot: any = null;

      const storedRecoverySnapshot =
        sessionStorage.getItem(
          "tnm_payment_order_recovery"
        );

      if (storedRecoverySnapshot) {

        try {

          recoverySnapshot =
            JSON.parse(
              storedRecoverySnapshot
            );

        } catch {

          recoverySnapshot = null;

        }

      }


      const recoveryQuoteId =
        payment?.verification?.checkoutQuoteId ||
        payment?.checkoutQuoteId ||
        checkoutQuoteId ||
        recoverySnapshot?.checkoutQuoteId ||
        sessionStorage.getItem(
          "tnm_last_verified_checkout_quote_id"
        );


      const recoveryAddress =
        selectedAddress ||
        recoverySnapshot?.shipping ||
        null;


      if (!recoveryQuoteId) {

        throw new Error(
          "Secure shipping quote is missing. Please contact support before making another payment."
        );

      }


      if (!recoveryAddress) {

        throw new Error(
          "Delivery address is missing. Please contact support before making another payment."
        );

      }


      const recoveryItems =
        recoverySnapshot?.items?.length
          ? recoverySnapshot.items
          : checkoutItems;


      const recoveryCustomer =
        customer ||
        recoverySnapshot?.customer ||
        null;


      const recoveryPricing =
        recoverySnapshot?.pricing ??
        null;


      const result =
        await createOrder({

          customerId:
            recoveryCustomer?.id ??
            null,

          checkoutQuoteId:
            recoveryQuoteId,

          customer: {

            name:
              `${recoveryCustomer?.first_name ?? ""} ${recoveryCustomer?.last_name ?? ""}`,

            email:
              recoveryCustomer?.email ??
              null,

            phone:
              recoveryCustomer?.phone,

          },


          shipping: {

            fullName:
              recoveryAddress.full_name,

            phone:
              recoveryAddress.phone,

            address:
              `${recoveryAddress.address_line_1} ${recoveryAddress.address_line_2 ?? ""}`,

            city:
              recoveryAddress.city,

            state:
              recoveryAddress.state,

            pincode:
              recoveryAddress.postal_code,

            landmark:
              recoveryAddress.landmark ??
              null,

          },


          items:

            recoveryItems.map(
              (item: any) => ({

                productId:
                  item.productId,

                productName:
                  item.name,

                productImage:
                  item.image ??
                  null,

                price:
                  item.price,

                quantity:
                  item.quantity,

                ringSize:
                  item.ringSize ?? null,

                total:
                  item.price *
                  item.quantity,

              })
            ),


          subtotal:
            verifiedCheckoutPricing?.subtotal ??
            recoveryPricing?.subtotal ??
            subtotal,


          discount:
            verifiedCheckoutPricing?.discount ??
            recoveryPricing?.discount ??
            discount,


          shippingCharge:
            verifiedCheckoutPricing?.shippingCharge ??
            recoveryPricing?.shippingCharge ??
            finalShippingCharge,


          tax:
            verifiedCheckoutPricing?.tax ??
            recoveryPricing?.tax ??
            0,


          totalAmount:
            verifiedCheckoutPricing?.totalAmount ??
            recoveryPricing?.totalAmount ??
            finalAmount,


          advanceAmount:
            verifiedCheckoutPricing?.totalAmount ??
            recoveryPricing?.totalAmount ??
            finalAmount,


          paymentMethod:
            "prepaid",


          paymentTransactionId:
            payment.paymentTransactionId ??
            payment.razorpay_payment_id ??
            null,

          wallet_hold_id:
            payment.walletHoldId ??
            recoverySnapshot?.walletHoldId ??
            null,

          wallet_amount_paise:
            Number(
              payment.walletAmountPaise ??
              recoverySnapshot?.walletAmountPaise ??
              0
            ),


          coupon:

            appliedCoupon

              ? {

                  id:
                    appliedCoupon.id,

                  code:
                    appliedCoupon.code,

                  discount:
                    appliedCoupon.discount,

                }

              : (
                  recoverySnapshot?.coupon ??
                  null
                ),

        });


      setOrderNumber(
        result.orderNumber
      );

      /*
       * The Guest has now successfully completed the order.
       * The temporary checkout Auth session is no longer needed,
       * so sign it out only AFTER server-side order creation has
       * succeeded.
       */
      if (guestCheckoutSessionActive) {
        try {
          const { error: signOutError } =
            await supabase.auth.signOut();

          if (signOutError) {
            console.warn(
              "[T&M GUEST] Post-order session sign-out failed:",
              signOutError
            );
          }
        } catch (signOutError) {
          console.warn(
            "[T&M GUEST] Post-order session sign-out failed:",
            signOutError
          );
        } finally {
          setGuestCheckoutSessionActive(false);
        }
      }


      if (!isBuyNow) {
        clearCart();
      }

      sessionStorage.removeItem(
        "tnm_last_verified_razorpay_payment_id"
      );

      sessionStorage.removeItem(
        "tnm_last_verified_checkout_quote_id"
      );

      sessionStorage.removeItem(
        "tnm_payment_order_recovery"
      );


      setPaymentRecoveryError(
        ""
      );


      setProcessingPayment(
        false
      );

      setWalletHoldId(null);
      setWalletAmountPaise(0);
      setWalletSelected(false);


      setOrderSuccess(
        true
      );

    }

    catch (error: any) {

      console.error(
        "Order completion failed after verified payment:",
        error
      );


      /*
       * IMPORTANT:
       * Razorpay has already succeeded. Never send the customer
       * back to Payment and never ask them to pay again here.
       */
      setProcessingPayment(
        false
      );


      setPaymentRecoveryError(
        error?.message ||
        "We couldn't complete your order yet."
      );

    }

  }


  /*
   * =========================================================
   * PAYMENT SUCCESS
   * =========================================================
   */

  async function handlePaymentSuccess(
    payment: any
  ) {

    if (processingPayment) {
      return;
    }


    setPaymentRecoveryError(
      ""
    );


    const paymentTransactionId =
      payment.paymentTransactionId ??
      payment.razorpay_payment_id ??
      null;

    const verifiedQuoteId =
      payment?.verification?.checkoutQuoteId ||
      payment?.checkoutQuoteId ||
      checkoutQuoteId ||
      sessionStorage.getItem(
        "tnm_last_verified_checkout_quote_id"
      );

    if (payment.razorpay_payment_id) {
      sessionStorage.setItem(
        "tnm_last_verified_razorpay_payment_id",
        payment.razorpay_payment_id
      );
    } else {
      sessionStorage.removeItem(
        "tnm_last_verified_razorpay_payment_id"
      );
    }

    if (!verifiedQuoteId) {
      setProcessingPayment(false);
      setPaymentRecoveryError(
        "Secure checkout quote is missing. Please contact support before making another payment."
      );
      return;
    }

    sessionStorage.setItem(
      "tnm_last_verified_checkout_quote_id",
      verifiedQuoteId
    );

    /*
     * Snapshot everything required to finish the already-paid
     * order. If React checkout state is reset/unmounted after
     * payment verification fails, retry can still complete the
     * order without asking for another payment or address.
     */
    sessionStorage.setItem(
      "tnm_payment_order_recovery",
      JSON.stringify({

        checkoutQuoteId: verifiedQuoteId,

        customer: {

          id:
            customer?.id ??
            null,

          first_name:
            customer?.first_name ??
            "",

          last_name:
            customer?.last_name ??
            "",

          email:
            customer?.email ??
            null,

          phone:
            customer?.phone ??
            null,

        },

        shipping: {

          full_name:
            selectedAddress?.full_name,

          phone:
            selectedAddress?.phone,

          address_line_1:
            selectedAddress?.address_line_1,

          address_line_2:
            selectedAddress?.address_line_2 ??
            "",

          city:
            selectedAddress?.city,

          state:
            selectedAddress?.state,

          postal_code:
            selectedAddress?.postal_code,

          landmark:
            selectedAddress?.landmark ??
            null,

        },

        items: checkoutItems,

        pricing: {

          subtotal:
            verifiedCheckoutPricing?.subtotal ??
            subtotal,

          discount:
            verifiedCheckoutPricing?.discount ??
            discount,

          shippingCharge:
            verifiedCheckoutPricing?.shippingCharge ??
            finalShippingCharge,

          giftWrapAmount:
            verifiedCheckoutPricing?.giftWrapAmount ??
            0,

          tax:
            verifiedCheckoutPricing?.tax ??
            0,

          totalAmount:
            verifiedCheckoutPricing?.totalAmount ??
            finalAmount,

        },

        coupon:
          appliedCoupon
            ? {

                id:
                  appliedCoupon.id,

                code:
                  appliedCoupon.code,

                discount:
                  appliedCoupon.discount,

              }
            : null,

        giftWrapSelected,

        giftMessage,

        paymentTransactionId:
          paymentTransactionId,

        walletHoldId:
          payment.walletHoldId ??
          null,

        walletAmountPaise:
          Number(
            payment.walletAmountPaise ??
            0
          ),

      })
    );


    setProcessingPayment(
      true
    );


    await completeOrderAfterPayment(
      payment
    );

  }


  /*
   * =========================================================
   * RETRY ORDER COMPLETION
   * =========================================================
   *
   * Uses the exact same Razorpay payment ID. The database
   * idempotency check makes this safe if the first request
   * already created the order.
   */

  async function handleRetryOrderCompletion() {

    if (processingPayment) {
      return;
    }

    const storedRecoverySnapshot =
      sessionStorage.getItem(
        "tnm_payment_order_recovery"
      );

    let recoverySnapshot: any = null;

    if (storedRecoverySnapshot) {
      try {
        recoverySnapshot =
          JSON.parse(
            storedRecoverySnapshot
          );
      } catch {
        recoverySnapshot = null;
      }
    }

    const paymentId =
      sessionStorage.getItem(
        "tnm_last_verified_razorpay_payment_id"
      ) ||
      recoverySnapshot?.paymentTransactionId ||
      null;

    if (!paymentId) {

      setPaymentRecoveryError(
        "We couldn't safely recover this payment automatically. Please contact us with your payment reference before trying to pay again."
      );

      return;

    }

    setPaymentRecoveryError("");
    setProcessingPayment(true);

    await completeOrderAfterPayment({

      paymentTransactionId:
        paymentId,

      razorpay_payment_id:
        recoverySnapshot?.walletHoldId
          ? null
          : paymentId,

      walletHoldId:
        recoverySnapshot?.walletHoldId ??
        null,

      walletAmountPaise:
        Number(
          recoverySnapshot?.walletAmountPaise ??
          0
        ),

    });

  }


  /*
   * =========================================================
   * CURRENT STEP INDEX
   * =========================================================
   */

  const currentStepIndex =
    STEPS.findIndex(
      item =>
        item.key === step
    );


  /*
   * =========================================================
   * CLOSED
   * =========================================================
   */

  if (!open) {
    return null;
  }


  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return createPortal(

    <>

      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div

        className="
          fixed
          inset-0
          z-[1000]
          bg-black/50
          backdrop-blur-md
        "

        onClick={
          handleCheckoutClose
        }

      />


      {/* =====================================================
          CHECKOUT MODAL
      ====================================================== */}

      <div

        className="
          fixed
          left-0
          top-0
          z-[1100]

          flex
          h-[100dvh]
          max-h-[100dvh]
          w-full

          flex-col

          overflow-hidden

          rounded-none

          bg-white

          shadow-2xl

          motion-safe:animate-[checkoutIn_320ms_ease-out]

          md:left-1/2
          md:top-6
          md:h-[calc(100dvh-48px)]
          md:max-h-[calc(100dvh-48px)]
          md:w-[calc(100%-48px)]
          md:max-w-[760px]
          md:-translate-x-1/2
          md:rounded-3xl
        "

      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div

          className="
            shrink-0
            border-b
            border-neutral-100
            bg-white
            px-5
            pb-4
            pt-[calc(1rem+env(safe-area-inset-top))]
            shadow-[0_1px_0_rgba(0,0,0,0.03)]

            md:px-6
            md:py-5
          "

        >

          <div

            className="
              flex
              items-center
              justify-between
            "

          >

            <h2

              className="
                text-[28px]
                font-semibold
                tracking-[-0.03em]
                text-neutral-950
                motion-safe:animate-[fadeUp_300ms_ease-out]

                md:text-2xl
              "

            >

              {
                orderSuccess
                  ? "Order Confirmed"
                  : processingPayment
                    ? "Processing Payment"
                    : "Checkout"
              }

            </h2>


            <button

              onClick={
                onClose
              }

              className="
                rounded-full
                p-2.5
                text-neutral-700
                transition
                duration-200
                hover:rotate-90
                hover:bg-neutral-100
                active:scale-90
              "

            >

              <X
                size={20}
              />

            </button>

          </div>


          {/* =================================================
              CHECKOUT STEPS
          ================================================== */}

          {
            !orderSuccess &&
            !processingPayment &&
            !paymentRecoveryError && (

              <div
                className="
                  mt-5
                  rounded-2xl
                  border
                  border-neutral-100
                  bg-neutral-50/70
                  px-3
                  py-3.5
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]

                  md:mt-6
                  md:px-4
                "
              >

                <div
                  className="
                    relative
                  "
                >

                  {/* SEPARATE CONNECTOR SEGMENTS
                      Stops at the edge of each step circle so the
                      line never runs underneath / through the circles. */}
                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-[calc(16.6667%+22px)]
                      top-5
                      h-[2px]
                      w-[calc(33.3333%-44px)]
                      rounded-full
                      bg-neutral-200
                    "
                  >
                    {currentStepIndex >= 1 && (
                      <div
                        className="
                          h-full
                          w-full
                          rounded-full
                          bg-[#C8A44D]
                          transition-all
                          duration-500
                          ease-out
                        "
                      />
                    )}
                  </div>

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-[calc(50%+22px)]
                      top-5
                      h-[2px]
                      w-[calc(33.3333%-44px)]
                      rounded-full
                      bg-neutral-200
                    "
                  >
                    {currentStepIndex >= 2 && (
                      <div
                        className="
                          h-full
                          w-full
                          rounded-full
                          bg-[#C8A44D]
                          transition-all
                          duration-500
                          ease-out
                        "
                      />
                    )}
                  </div>

                  <div
                    className="
                      relative
                      z-10
                      grid
                      grid-cols-3
                    "
                  >

                    {
                      STEPS.map(
                        (
                          item,
                          index
                        ) => {

                          const Icon =
                            item.icon;

                          const completed =
                            index <
                            currentStepIndex;

                          const active =
                            index ===
                            currentStepIndex;

                          const available =
                            index <=
                            currentStepIndex;

                          return (

                            <div
                              key={item.key}
                              className="
                                flex
                                min-w-0
                                flex-col
                                items-center
                                text-center
                              "
                            >

                              <button
                                type="button"
                                disabled={!available}
                                onClick={() => {

                                  if (!available) {
                                    return;
                                  }

                                  if (
                                    item.key ===
                                    "login"
                                  ) {
                                    if (!authCustomer) {
                                      setStep("login");
                                    }
                                    return;
                                  }

                                  if (
                                    item.key ===
                                    "address"
                                  ) {
                                    setShippingError("");
                                    setStep("address");
                                    return;
                                  }

                                  if (
                                    item.key ===
                                    "payment"
                                  ) {
                                    setStep("payment");
                                  }
                                }}
                                className={`
                                  group
                                  relative
                                  flex
                                  h-11
                                  w-11
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  transition-all
                                  duration-300
                                  motion-safe:hover:scale-105
                                  motion-safe:active:scale-95

                                  ${
                                    active
                                      ? "border-[#C8A44D] bg-[#C8A44D] text-black shadow-[0_8px_24px_rgba(200,164,77,0.30)] ring-4 ring-[#C8A44D]/10"
                                      : completed
                                        ? "border-[#C8A44D] bg-[#C8A44D]/15 text-[#9A7A22] shadow-sm"
                                        : "border-neutral-200 bg-white text-neutral-400 shadow-sm"
                                  }

                                  ${
                                    available
                                      ? "cursor-pointer"
                                      : "cursor-default"
                                  }
                                `}
                              >

                                {
                                  completed
                                    ? (
                                      <span
                                        className="
                                          text-sm
                                          font-bold
                                          motion-safe:animate-[stepCheck_300ms_ease-out]
                                        "
                                      >
                                        ✓
                                      </span>
                                    )
                                    : (
                                      <Icon
                                        size={18}
                                        strokeWidth={
                                          active
                                            ? 2.4
                                            : 2
                                        }
                                      />
                                    )
                                }

                                {
                                  active && (
                                    <span
                                      className="
                                        absolute
                                        inset-[-5px]
                                        rounded-full
                                        border
                                        border-[#C8A44D]/25
                                        motion-safe:animate-[stepPulse_2s_ease-in-out_infinite]
                                      "
                                    />
                                  )
                                }

                              </button>

                              <div
                                className="
                                  mt-2
                                  min-w-0
                                "
                              >

                                <p
                                  className={`
                                    text-[11px]
                                    font-semibold
                                    tracking-wide
                                    transition-colors
                                    duration-300

                                    ${
                                      active
                                        ? "text-neutral-950"
                                        : completed
                                          ? "text-[#9A7A22]"
                                          : "text-neutral-400"
                                    }
                                  `}
                                >
                                  {item.label}
                                </p>

                                <p
                                  className={`
                                    mt-0.5
                                    hidden
                                    text-[9px]
                                    sm:block

                                    ${
                                      active
                                        ? "text-neutral-500"
                                        : "text-neutral-400"
                                    }
                                  `}
                                >
                                  {
                                    item.key === "login"
                                      ? "Secure access"
                                      : item.key === "address"
                                        ? "Delivery details"
                                        : "Complete order"
                                  }
                                </p>

                              </div>

                            </div>

                          );
                        }
                      )
                    }

                  </div>

                </div>

              </div>

            )
          }

        </div>


        {/* ===================================================
            PAYMENT PROCESSING OVERLAY
        ==================================================== */}

        {
          processingPayment && (

            <div
              className="
                absolute
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                rounded-none
                bg-white
                px-6
                backdrop-blur-[6px]
                motion-safe:animate-[fadeIn_180ms_ease-out]
                md:rounded-3xl
              "
            >

              <div
                className="
                  w-full
                  max-w-[370px]
                  text-center
                  motion-safe:animate-[scaleIn_260ms_ease-out]
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C8A44D]/10
                    text-[#9A7A22]
                    ring-8
                    ring-[#C8A44D]/[0.06]
                  "
                >

                  <Loader2
                    size={32}
                    strokeWidth={2.2}
                    className="animate-spin"
                  />

                </div>


                <h3
                  className="
                    mt-7
                    text-xl
                    font-semibold
                    tracking-[-0.02em]
                    text-neutral-950
                  "
                >
                  Payment successful
                </h3>


                <p
                  className="
                    mt-2
                    text-base
                    font-medium
                    text-neutral-700
                  "
                >
                  Completing your order...
                </p>


                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-[310px]
                    text-sm
                    leading-5
                    text-neutral-500
                  "
                >
                  We're securely confirming your payment and placing your order.
                </p>


                <div
                  className="
                    mx-auto
                    mt-7
                    h-1.5
                    w-40
                    overflow-hidden
                    rounded-full
                    bg-neutral-100
                  "
                >

                  <div
                    className="
                      h-full
                      w-1/2
                      rounded-full
                      bg-[#C8A44D]
                      motion-safe:animate-[loadingSlide_1.2s_ease-in-out_infinite]
                    "
                  />

                </div>


                <div
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-full
                    border
                    border-neutral-100
                    bg-neutral-50
                    px-4
                    py-2
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-neutral-500
                  "
                >

                  <ShieldCheck
                    size={14}
                    className="text-green-600"
                  />

                  Please don't close or refresh

                </div>

              </div>

            </div>

          )
        }


        {/* ===================================================
            PAYMENT RECOVERY STATE
        ==================================================== */}

        {
          paymentRecoveryError &&
          !processingPayment &&
          !orderSuccess && (

            <div
              className="
                absolute
                inset-0
                z-[120]
                flex
                items-center
                justify-center
                bg-white
                px-6
                md:rounded-3xl
              "
            >

              <div
                className="
                  w-full
                  max-w-[390px]
                  text-center
                  motion-safe:animate-[scaleIn_260ms_ease-out]
                "
              >

                <div
                  className="
                    mx-auto
                    flex
                    h-20
                    w-20
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-50
                    text-amber-700
                    ring-8
                    ring-amber-50/70
                  "
                >

                  <ShieldCheck
                    size={34}
                    strokeWidth={2}
                  />

                </div>


                <h3
                  className="
                    mt-7
                    text-xl
                    font-semibold
                    tracking-[-0.02em]
                    text-neutral-950
                  "
                >
                  Payment received
                </h3>


                <p
                  className="
                    mt-2
                    text-base
                    font-medium
                    text-neutral-800
                  "
                >
                  We're completing your order securely.
                </p>


                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-[330px]
                    text-sm
                    leading-5
                    text-neutral-500
                  "
                >
                  Your payment was successful, but we couldn't finish the order confirmation yet. Please don't make another payment.
                </p>


                <button
                  type="button"
                  onClick={
                    handleRetryOrderCompletion
                  }
                  className="
                    mt-7
                    inline-flex
                    w-full
                    items-center
                    justify-center
                    rounded-xl
                    bg-black
                    px-5
                    py-3.5
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-neutral-800
                    active:scale-[0.98]
                  "
                >
                  Retry Order Confirmation
                </button>


                <p
                  className="
                    mt-4
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.1em]
                    text-neutral-400
                  "
                >
                  Do not make another payment
                </p>

              </div>

            </div>

          )
        }


        {/* ===================================================
            CALCULATING CHECKOUT OVERLAY
        ==================================================== */}

        {
          calculatingShipping && (

            <div
              className="
                absolute
                inset-0
                z-[50]
                flex
                items-center
                justify-center
                rounded-none
                bg-white/90
                px-6
                backdrop-blur-[4px]
                motion-safe:animate-[fadeIn_180ms_ease-out]
                md:rounded-3xl
              "
            >

              <div
                className="
                  w-full
                  max-w-[350px]
                  rounded-3xl
                  border
                  border-neutral-200
                  bg-white
                  px-6
                  py-7
                  text-center
                  shadow-[0_24px_70px_rgba(0,0,0,0.14)]
                  motion-safe:animate-[scaleIn_240ms_ease-out]
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
                    text-[#9A7A22]
                  "
                >
                  <Loader2
                    size={25}
                    className="animate-spin"
                  />
                </div>

                <h3
                  className="
                    mt-5
                    text-base
                    font-semibold
                    text-neutral-950
                  "
                >
                  Calculating your final total
                </h3>

                <p
                  className="
                    mt-1.5
                    text-sm
                    leading-5
                    text-neutral-500
                  "
                >
                  Checking delivery charges and securing your best available shipping rate.
                </p>

                <div
                  className="
                    mx-auto
                    mt-5
                    h-1.5
                    w-32
                    overflow-hidden
                    rounded-full
                    bg-neutral-100
                  "
                >
                  <div
                    className="
                      h-full
                      w-1/2
                      rounded-full
                      bg-[#C8A44D]
                      motion-safe:animate-[loadingSlide_1.2s_ease-in-out_infinite]
                    "
                  />
                </div>

                <p
                  className="
                    mt-4
                    text-[11px]
                    font-medium
                    uppercase
                    tracking-[0.12em]
                    text-neutral-400
                  "
                >
                  Almost there
                </p>

              </div>

            </div>

          )
        }


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div
          ref={checkoutContentRef}

          className="
            relative
            min-h-0
            flex-1
            overflow-y-auto
            overscroll-contain
            scroll-smooth
            px-5
            pb-8
            pt-6
            [scrollbar-width:thin]

            md:px-6
            md:py-7
          "

        >

          {/* =================================================
              ORDER SUMMARY
          ================================================== */}

          {
            !orderSuccess &&
            !isAddingNewAddress && (

              <div
                className="
                  mb-6
                  rounded-2xl
                  border
                  border-neutral-200
                  bg-gradient-to-br
                  from-white
                  via-neutral-50
                  to-[#C8A44D]/[0.045]
                  p-4
                  shadow-[0_8px_30px_rgba(0,0,0,0.045)]
                  motion-safe:animate-[fadeUp_350ms_ease-out]
                "
              >

                <div
                  className="
                    mb-4
                    flex
                    items-center
                    justify-between
                  "
                >
                  <h3
                    className="
                      text-base
                      font-semibold
                      tracking-[-0.02em]
                      text-neutral-950
                    "
                  >
                    Order Summary
                  </h3>

                  <span
                    className="
                      rounded-full
                      bg-neutral-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-neutral-500
                    "
                  >
                    {checkoutItems.length} {checkoutItems.length === 1 ? "Item" : "Items"}
                  </span>
                </div>

                <div
                  className="
                    space-y-2.5
                    text-sm
                  "
                >

                  {/* TOTAL MRP */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span className="text-neutral-500">
                      Total MRP
                    </span>
                    <span className="font-medium text-neutral-800">
                      ₹{totalMrp.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* ITEM DISCOUNT */}
                  {itemDiscount > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        text-green-600
                      "
                    >
                      <span>Item Discount</span>
                      <span>
                        -₹{itemDiscount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {/* SPECIAL OFFER DISCOUNT */}
                  {specialOfferDiscount > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        text-[#A07D16]
                      "
                    >
                      <span>Special Offer Discount</span>
                      <span>
                        -₹{specialOfferDiscount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {step !== "payment" &&
                    isGuestCheckoutCustomer &&
                    guestContinueWithoutSpecialPrice &&
                    hasMemberOnlySpecialPrice && (
                      <button
                        type="button"
                        onClick={() =>
                          openMemberUpgradeDialog(
                            "special_price"
                          )
                        }
                        className="
                          mt-1
                          w-full
                          rounded-xl
                          border
                          border-[#C8A44D]/30
                          bg-[#fffaf0]
                          px-3
                          py-2.5
                          text-left
                          text-xs
                          font-semibold
                          text-[#80651d]
                          transition
                          hover:bg-[#fff7df]
                          active:scale-[0.99]
                        "
                      >
                        ✨ Click here to unlock the Member Special Price
                      </button>
                    )}

                  {/* SUBTOTAL */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      border-t
                      border-neutral-200
                      pt-2.5
                      font-medium
                    "
                  >
                    <span>Subtotal</span>
                    <span>
                      ₹{displayedSubtotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                  {/* BUY NOW COUPON */}
                  {isBuyNow && step !== "payment" && (
                    <div className="space-y-2 pt-1">
                      {buyNowCoupon ? (
                        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-xs text-green-700">
                          <span>
                            Coupon Applied: <strong>{buyNowCoupon.code}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={removeBuyNowCoupon}
                            className="font-semibold underline underline-offset-2"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-neutral-200 bg-white p-3">
                          <div className="flex gap-2">
                            <input
                              value={buyNowCouponCode}
                              onChange={(event) => {
                                setBuyNowCouponCode(event.target.value.toUpperCase());
                                setBuyNowCouponError("");
                              }}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  applyBuyNowCoupon(buyNowCouponCode);
                                }
                              }}
                              placeholder="Enter coupon code"
                              className="min-w-0 flex-1 rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#C8A44D]"
                              disabled={buyNowCouponLoading}
                            />
                            <button
                              type="button"
                              onClick={() => applyBuyNowCoupon(buyNowCouponCode)}
                              disabled={buyNowCouponLoading}
                              className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              {buyNowCouponLoading ? "Applying..." : "Apply"}
                            </button>
                          </div>

                          {!buyNowCheckingCouponCount &&
                            buyNowAvailableCouponCount > 0 && (
                              <button
                                type="button"
                                onClick={handleViewAvailableCoupons}
                                className="mt-2 text-xs font-semibold text-[#9A7A22] underline underline-offset-2 transition hover:text-[#C8A44D]"
                              >
                                {buyNowAvailableCouponCount}{" "}
                                {buyNowAvailableCouponCount === 1
                                  ? "offer available for you"
                                  : "offers available for you"}
                              </button>
                            )}

                          {buyNowCouponError && (
                            <p className="mt-2 text-xs text-red-600">
                              {buyNowCouponError}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* BUY NOW GIFT WRAP */}
                  {isBuyNow && step !== "payment" && giftWrapSettings?.enabled && (
                    <div className="rounded-xl border border-neutral-200 bg-white px-3 py-3">
                      <label className="flex cursor-pointer items-center justify-between gap-3">
                        <span>
                          <span className="block text-sm font-medium text-neutral-800">🎁 Add Gift Wrap</span>
                          <span className="mt-0.5 block text-xs text-neutral-500">₹{Number(giftWrapSettings.price ?? 0).toLocaleString("en-IN")}</span>
                        </span>
                        <input
                          type="checkbox"
                          checked={buyNowGiftWrapSelected}
                          onChange={(event) => setBuyNowGiftWrapSelected(event.target.checked)}
                          className="h-4 w-4 accent-[#C8A44D]"
                        />
                      </label>

                      {buyNowGiftWrapSelected && (
                        <textarea
                          value={buyNowGiftMessage}
                          onChange={(event) => setBuyNowGiftMessage(event.target.value)}
                          placeholder="Gift message (optional)"
                          rows={2}
                          maxLength={250}
                          className="mt-3 w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#C8A44D]"
                        />
                      )}
                    </div>
                  )}

                  {/* COUPON DISCOUNT */}
                  {displayedCouponDiscount > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        text-green-600
                      "
                    >
                      <span>Coupon Discount</span>
                      <span>
                        -₹{displayedCouponDiscount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {/* APPLIED COUPON */}
                  {appliedCoupon && (
                    <div
                      className="
                        rounded-xl
                        border
                        border-green-200
                        bg-green-50
                        px-3
                        py-2
                        text-xs
                        text-green-700
                      "
                    >
                      Coupon Applied:
                      {" "}
                      <strong>
                        {appliedCoupon.code}
                      </strong>
                    </div>
                  )}

                  {/* SHIPPING */}
                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >
                    <span className="text-neutral-500">
                      Shipping
                    </span>
                    <span
                      className={
                        freeShippingUnlocked
                          ? "font-semibold text-green-600"
                          : "text-neutral-800"
                      }
                    >
                      {freeShippingUnlocked
                        ? "FREE"
                        : step === "payment"
                          ? `₹${(
                              verifiedCheckoutPricing?.shippingCharge ??
                              finalShippingCharge
                            ).toLocaleString("en-IN", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "Calculated at next step"}
                    </span>
                  </div>

                  {/* GIFT WRAP */}
                  {displayedGiftWrapAmount > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span className="text-neutral-500">
                        🎁 Gift Wrap
                      </span>
                      <span>
                        ₹{displayedGiftWrapAmount.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {/* TAX */}
                  {displayedTax > 0 && (
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                      "
                    >
                      <span className="text-neutral-500">
                        Tax
                      </span>
                      <span>
                        ₹{displayedTax.toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {/* FINAL TOTAL */}
                  <div
                    className="
                      mt-1
                      flex
                      items-center
                      justify-between
                      border-t
                      border-neutral-200
                      pt-3
                      font-semibold
                    "
                  >
                    <span>Total</span>
                    <span
                      className="
                        text-base
                        text-[#9A7A22]
                      "
                    >
                      ₹{displayedTotal.toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>

                </div>

              </div>

            )
          }

          {/* =================================================
              CUTE LOGIN SCROLL HINT
          ================================================== */}

          {
            !orderSuccess &&
            !authCustomer &&
            step === "login" &&
            showLoginScrollHint && (

              <button
                type="button"
                onClick={scrollToLoginSection}
                aria-label="Scroll down to login"
                className="
                  group
                  sticky
                  bottom-4
                  z-30
                  mx-auto
                  mt-[-2px]
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-[#C8A44D]/30
                  bg-white/95
                  px-4
                  py-2.5
                  text-[12px]
                  font-semibold
                  text-neutral-800
                  shadow-[0_12px_32px_rgba(0,0,0,0.13)]
                  backdrop-blur-md
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:border-[#C8A44D]/60
                  hover:shadow-[0_16px_36px_rgba(0,0,0,0.16)]
                  active:scale-95
                "
              >

                <span
                  className="
                    flex
                    h-7
                    w-7
                    items-center
                    justify-center
                    rounded-full
                    bg-[#C8A44D]/12
                    text-[#9A7A22]
                    motion-safe:animate-[cuteArrowBounce_1.35s_ease-in-out_infinite]
                  "
                >
                  <ArrowDown
                    size={16}
                    strokeWidth={2.5}
                  />
                </span>

                <span>
                  Scroll down to login
                </span>

                <span
                  aria-hidden="true"
                  className="
                    text-[#C8A44D]
                    motion-safe:animate-[hintSpark_1.8s_ease-in-out_infinite]
                  "
                >
                  ✦
                </span>

              </button>

            )
          }


          {/* =================================================
              SHIPPING ERROR
          ================================================== */}

          {
            shippingError && (

              <div

                className="
                  mb-5
                  rounded-xl
                  bg-red-50
                  px-4
                  py-3
                  text-sm
                  text-red-600
                "

              >

                {
                  shippingError
                }

              </div>

            )
          }


          {/* =================================================
              SHIPPING LOADING
          ================================================== */}

          {
            calculatingShipping && (

              <div

                className="
                  mb-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-neutral-50
                  px-4
                  py-3
                  text-sm
                  text-neutral-600
                "

              >

                <Loader2

                  size={17}

                  className="
                    animate-spin
                  "

                />

                Calculating shipping charges...

              </div>

            )
          }


          {/* =================================================
              ORDER SUCCESS
          ================================================== */}

          {
            orderSuccess && (

              <OrderSuccess

                orderNumber={
                  orderNumber
                }

                onClose={
                  handleCheckoutClose
                }

                hasOrderEmail={
                  Boolean(
                    customer?.email ??
                    authCustomer?.email
                  )
                }

                customerPhone={
                  customer?.phone ??
                  authCustomer?.phone ??
                  selectedAddress?.phone ??
                  null
                }

              />

            )
          }


          {/* =================================================
              LOGIN / MEMBER / GUEST
          ================================================== */}

          {
            !orderSuccess &&
            step === "login" && (

              <div
                ref={loginSectionRef}
                className="scroll-mt-5 pb-3"
              >

                {/* -------------------------------------------------
                    LOGIN CHOICE
                    Only the Login area is redesigned. The checkout
                    shell, Address, Payment and all existing logic
                    remain unchanged.
                -------------------------------------------------- */}

                {loginChoice === null && (
                  <div
                    className="
                      relative
                      overflow-hidden
                      rounded-[30px]
                      border
                      border-[#C8A44D]/15
                      bg-gradient-to-b
                      from-[#fffdf8]
                      via-white
                      to-[#faf8f2]
                      px-4
                      pb-6
                      pt-5
                      shadow-[0_18px_55px_rgba(0,0,0,0.055)]
                      motion-safe:animate-[loginChoiceIn_500ms_cubic-bezier(.22,1,.36,1)]
                      sm:px-6
                      sm:pt-6
                    "
                  >

                    {/* soft decorative glow */}
                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -right-16
                        -top-20
                        h-40
                        w-40
                        rounded-full
                        bg-[#C8A44D]/[0.10]
                        blur-3xl
                        motion-safe:animate-[loginGlow_5s_ease-in-out_infinite]
                      "
                    />

                    <span
                      aria-hidden="true"
                      className="
                        pointer-events-none
                        absolute
                        -bottom-20
                        -left-16
                        h-36
                        w-36
                        rounded-full
                        bg-[#C8A44D]/[0.07]
                        blur-3xl
                        motion-safe:animate-[loginGlow_6s_ease-in-out_infinite_reverse]
                      "
                    />

                    {/* icon */}
                    <div
                      className="
                        relative
                        mx-auto
                        flex
                        h-[74px]
                        w-[74px]
                        items-center
                        justify-center
                        rounded-full
                        border
                        border-[#C8A44D]/20
                        bg-gradient-to-br
                        from-[#fffdf6]
                        to-[#f5ecd5]
                        text-[#9A7A22]
                        shadow-[0_12px_35px_rgba(200,164,77,0.16)]
                        ring-8
                        ring-[#C8A44D]/[0.035]
                        motion-safe:animate-[loginIconFloat_3.8s_ease-in-out_infinite]
                      "
                    >
                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          inset-[-6px]
                          rounded-full
                          border
                          border-[#C8A44D]/10
                          motion-safe:animate-[loginRing_2.8s_ease-out_infinite]
                        "
                      />

                      <UserRound
                        size={32}
                        strokeWidth={1.9}
                      />

                      <span
                        aria-hidden="true"
                        className="
                          absolute
                          -right-1
                          top-0
                          text-[15px]
                          text-[#C8A44D]
                          motion-safe:animate-[loginSparkle_2.2s_ease-in-out_infinite]
                        "
                      >
                        ✦
                      </span>
                    </div>

                    <div className="relative text-center">

                      <h3
                        className="
                          mt-5
                          text-[25px]
                          font-semibold
                          tracking-[-0.035em]
                          text-neutral-950
                          sm:text-[27px]
                        "
                      >
                        How would you like to continue?
                      </h3>

                      <p
                        className="
                          mx-auto
                          mt-2
                          max-w-[430px]
                          text-[13px]
                          leading-5
                          text-neutral-500
                          sm:text-sm
                        "
                      >
                        Choose the easiest way to complete your order.
                      </p>

                    </div>

                    {/* choice cards */}
                    <div
                      className="
                        relative
                        mt-6
                        grid
                        gap-3
                        sm:mt-7
                        sm:grid-cols-2
                      "
                    >

                      {/* MEMBER */}
                      <button
                        type="button"
                        onClick={() => {
                          setGuestError("");
                          setLoginChoice("member");
                        }}
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-[22px]
                          border
                          border-[#C8A44D]/20
                          bg-white
                          p-4
                          text-left
                          shadow-[0_8px_28px_rgba(0,0,0,0.045)]
                          transition-all
                          duration-300
                          ease-out
                          hover:-translate-y-1
                          hover:border-[#C8A44D]/55
                          hover:shadow-[0_18px_40px_rgba(200,164,77,0.13)]
                          active:scale-[0.985]
                          motion-safe:animate-[loginCardIn_520ms_cubic-bezier(.22,1,.36,1)_120ms_both]
                        "
                      >

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            -right-8
                            -top-8
                            h-24
                            w-24
                            rounded-full
                            bg-[#C8A44D]/[0.07]
                            blur-2xl
                            transition-transform
                            duration-500
                            group-hover:scale-150
                          "
                        />

                        <div className="relative flex items-start gap-3.5">

                          <span
                            className="
                              flex
                              h-12
                              w-12
                              shrink-0
                              items-center
                              justify-center
                              rounded-[15px]
                              bg-gradient-to-br
                              from-[#fff9e9]
                              to-[#f6edd8]
                              text-[#9A7A22]
                              shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]
                              transition-all
                              duration-300
                              group-hover:scale-105
                              group-hover:rotate-[-3deg]
                            "
                          >
                            <UserRound
                              size={22}
                              strokeWidth={2}
                            />
                          </span>

                          <span className="min-w-0 flex-1">

                            <span
                              className="
                                flex
                                items-center
                                gap-2
                                text-[16px]
                                font-semibold
                                tracking-[-0.015em]
                                text-neutral-950
                              "
                            >
                              I'm a Member

                              <span
                                className="
                                  rounded-full
                                  bg-[#C8A44D]/10
                                  px-2
                                  py-0.5
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.08em]
                                  text-[#9A7A22]
                                "
                              >
                                Saved
                              </span>
                            </span>

                            <span
                              className="
                                mt-1.5
                                block
                                text-xs
                                leading-5
                                text-neutral-500
                              "
                            >
                              Sign in to use your saved details and order history.
                            </span>

                          </span>

                        </div>

                        <span
                          className="
                            relative
                            mt-4
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-[#9A7A22]
                            transition-all
                            duration-300
                            group-hover:gap-2.5
                          "
                        >
                          Continue as Member
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>

                      </button>


                      {/* GUEST */}
                      <button
                        type="button"
                        onClick={() => {
                          setGuestError("");
                          setLoginChoice("guest");
                        }}
                        className="
                          group
                          relative
                          overflow-hidden
                          rounded-[22px]
                          border
                          border-neutral-200
                          bg-white
                          p-4
                          text-left
                          shadow-[0_8px_28px_rgba(0,0,0,0.045)]
                          transition-all
                          duration-300
                          ease-out
                          hover:-translate-y-1
                          hover:border-neutral-300
                          hover:shadow-[0_18px_40px_rgba(0,0,0,0.09)]
                          active:scale-[0.985]
                          motion-safe:animate-[loginCardIn_520ms_cubic-bezier(.22,1,.36,1)_220ms_both]
                        "
                      >

                        <span
                          aria-hidden="true"
                          className="
                            pointer-events-none
                            absolute
                            -right-8
                            -top-8
                            h-24
                            w-24
                            rounded-full
                            bg-neutral-100
                            blur-2xl
                            transition-transform
                            duration-500
                            group-hover:scale-150
                          "
                        />

                        <div className="relative flex items-start gap-3.5">

                          <span
                            className="
                              flex
                              h-12
                              w-12
                              shrink-0
                              items-center
                              justify-center
                              rounded-[15px]
                              bg-gradient-to-br
                              from-neutral-50
                              to-neutral-100
                              text-neutral-700
                              shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]
                              transition-all
                              duration-300
                              group-hover:scale-105
                              group-hover:rotate-[3deg]
                            "
                          >
                            <Smartphone
                              size={22}
                              strokeWidth={2}
                            />
                          </span>

                          <span className="min-w-0 flex-1">

                            <span
                              className="
                                block
                                text-[16px]
                                font-semibold
                                tracking-[-0.015em]
                                text-neutral-950
                              "
                            >
                              Continue as Guest
                            </span>

                            <span
                              className="
                                mt-1.5
                                block
                                text-xs
                                leading-5
                                text-neutral-500
                              "
                            >
                              Checkout quickly without creating an account.
                            </span>

                          </span>

                        </div>

                        <span
                          className="
                            relative
                            mt-4
                            flex
                            items-center
                            gap-1.5
                            text-xs
                            font-semibold
                            text-neutral-700
                            transition-all
                            duration-300
                            group-hover:gap-2.5
                          "
                        >
                          Continue as Guest
                          <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </span>

                      </button>

                    </div>

                    {/* secure note */}
                    <div
                      className="
                        relative
                        mt-5
                        flex
                        items-center
                        justify-center
                        gap-2
                        text-[11px]
                        font-medium
                        text-neutral-400
                        motion-safe:animate-[loginFade_700ms_ease-out_500ms_both]
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
                          bg-neutral-100
                        "
                      >
                        <ShieldCheck
                          size={13}
                          className="text-neutral-500"
                        />
                      </span>
                      Your details are kept secure
                    </div>

                  </div>
                )}


                {loginChoice === "member" && (
                  <div
                    className="
                      motion-safe:animate-[loginPanelIn_420ms_cubic-bezier(.22,1,.36,1)]
                    "
                  >

                    <button
                      type="button"
                      onClick={() => setLoginChoice(null)}
                      className="
                        group
                        mb-5
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-neutral-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-neutral-600
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-x-0.5
                        hover:border-[#C8A44D]/35
                        hover:text-[#9A7A22]
                        active:scale-95
                      "
                    >
                      <span
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                      >
                        ←
                      </span>
                      Choose another option
                    </button>

                    <div
                      className="
                        rounded-[28px]
                        border
                        border-[#C8A44D]/15
                        bg-gradient-to-b
                        from-[#fffdf8]
                        via-white
                        to-neutral-50
                        px-4
                        pb-5
                        pt-6
                        shadow-[0_16px_48px_rgba(0,0,0,0.055)]
                        sm:px-6
                      "
                    >

                      <div
                        className="
                          mx-auto
                          flex
                          h-[68px]
                          w-[68px]
                          items-center
                          justify-center
                          rounded-full
                          bg-gradient-to-br
                          from-[#fff9e9]
                          to-[#f5ead0]
                          text-[#9A7A22]
                          shadow-[0_10px_30px_rgba(200,164,77,0.15)]
                          ring-8
                          ring-[#C8A44D]/[0.035]
                          motion-safe:animate-[loginIconFloat_3.8s_ease-in-out_infinite]
                        "
                      >
                        <UserRound
                          size={31}
                          strokeWidth={1.9}
                        />
                      </div>

                      <h3
                        className="
                          mt-5
                          text-center
                          text-[24px]
                          font-semibold
                          tracking-[-0.035em]
                          text-neutral-950
                        "
                      >
                        Welcome back
                      </h3>

                      <p
                        className="
                          mt-1.5
                          text-center
                          text-sm
                          leading-5
                          text-neutral-500
                        "
                      >
                        Sign in securely with your mobile number.
                      </p>

                      <LoginStep
                        onSuccess={
                          handleLoginSuccess
                        }
                      />

                    </div>

                  </div>
                )}


                {loginChoice === "guest" && (
                  <div
                    className="
                      motion-safe:animate-[loginPanelIn_420ms_cubic-bezier(.22,1,.36,1)]
                    "
                  >

                    <button
                      type="button"
                      onClick={() => {
                        setGuestError("");
                        setLoginChoice(null);
                      }}
                      className="
                        group
                        mb-5
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-full
                        border
                        border-neutral-200
                        bg-white
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-neutral-600
                        shadow-sm
                        transition-all
                        duration-200
                        hover:-translate-x-0.5
                        hover:border-[#C8A44D]/35
                        hover:text-[#9A7A22]
                        active:scale-95
                      "
                    >
                      <span
                        className="transition-transform duration-200 group-hover:-translate-x-0.5"
                      >
                        ←
                      </span>
                      Choose another option
                    </button>

                    <div
                      className="
                        rounded-[28px]
                        border
                        border-neutral-200
                        bg-gradient-to-b
                        from-white
                        via-white
                        to-neutral-50
                        p-5
                        shadow-[0_16px_48px_rgba(0,0,0,0.055)]
                        sm:p-6
                      "
                    >

                      <div className="flex items-center gap-3">

                        <div
                          className="
                            flex
                            h-12
                            w-12
                            shrink-0
                            items-center
                            justify-center
                            rounded-[15px]
                            bg-neutral-100
                            text-neutral-700
                            shadow-sm
                            motion-safe:animate-[loginIconPop_420ms_cubic-bezier(.22,1,.36,1)]
                          "
                        >
                          <Smartphone
                            size={23}
                            strokeWidth={2}
                          />
                        </div>

                        <div>
                          <h3
                            className="
                              text-xl
                              font-semibold
                              tracking-[-0.025em]
                              text-neutral-950
                            "
                          >
                            Guest checkout
                          </h3>

                          <p
                            className="
                              mt-1
                              text-sm
                              leading-5
                              text-neutral-500
                            "
                          >
                            Just a few details and you're ready to go.
                          </p>
                        </div>

                      </div>


                      <div
                        className="
                          mt-6
                          space-y-4
                        "
                      >

                        <label className="block">
                          <span
                            className="
                              mb-1.5
                              block
                              text-xs
                              font-semibold
                              text-neutral-700
                            "
                          >
                            Full Name
                          </span>

                          <div className="relative">
                            <UserRound
                              size={17}
                              className="
                                pointer-events-none
                                absolute
                                left-3.5
                                top-1/2
                                -translate-y-1/2
                                text-neutral-400
                              "
                            />

                            <input
                              type="text"
                              value={guestName}
                              onChange={(event) => {
                                setGuestName(event.target.value);
                                setGuestError("");
                              }}
                              placeholder="Enter your full name"
                              autoComplete="name"
                              className="
                                w-full
                                rounded-[14px]
                                border
                                border-neutral-200
                                bg-white
                                py-3.5
                                pl-10
                                pr-3
                                text-sm
                                text-neutral-900
                                outline-none
                                transition-all
                                duration-200
                                focus:border-[#C8A44D]
                                focus:ring-4
                                focus:ring-[#C8A44D]/10
                              "
                            />
                          </div>
                        </label>


                        <label className="block">
                          <span
                            className="
                              mb-1.5
                              block
                              text-xs
                              font-semibold
                              text-neutral-700
                            "
                          >
                            Mobile Number
                          </span>

                          <div
                            className="
                              flex
                              overflow-hidden
                              rounded-[14px]
                              border
                              border-neutral-200
                              bg-white
                              transition-all
                              duration-200
                              focus-within:border-[#C8A44D]
                              focus-within:ring-4
                              focus-within:ring-[#C8A44D]/10
                            "
                          >
                            <span
                              className="
                                flex
                                shrink-0
                                items-center
                                border-r
                                border-neutral-200
                                bg-neutral-50
                                px-3.5
                                text-sm
                                font-medium
                                text-neutral-600
                              "
                            >
                              +91
                            </span>

                            <input
                              type="tel"
                              inputMode="numeric"
                              value={guestPhone}
                              onChange={(event) => {
                                handleGuestPhoneChange(
                                  event.target.value
                                );
                              }}
                              placeholder="Enter mobile number"
                              autoComplete="tel"
                              className="
                                min-w-0
                                flex-1
                                bg-transparent
                                px-3.5
                                py-3.5
                                text-sm
                                outline-none
                              "
                            />
                          </div>
                        </label>


                        <label className="block">
                          <div
                            className="
                              mb-1.5
                              flex
                              items-center
                              justify-between
                              gap-3
                            "
                          >
                            <span
                              className="
                                text-xs
                                font-semibold
                                text-neutral-700
                              "
                            >
                              Email Address
                            </span>

                            <span
                              className="
                                rounded-full
                                bg-neutral-100
                                px-2
                                py-0.5
                                text-[10px]
                                font-medium
                                text-neutral-400
                              "
                            >
                              Optional
                            </span>
                          </div>

                          <div className="relative">
                            <Mail
                              size={17}
                              className="
                                pointer-events-none
                                absolute
                                left-3.5
                                top-1/2
                                -translate-y-1/2
                                text-neutral-400
                              "
                            />

                            <input
                              type="email"
                              value={guestEmail}
                              onChange={(event) => {
                                setGuestEmail(event.target.value);
                                setGuestError("");
                              }}
                              placeholder="For order updates"
                              autoComplete="email"
                              className="
                                w-full
                                rounded-[14px]
                                border
                                border-neutral-200
                                bg-white
                                py-3.5
                                pl-10
                                pr-3
                                text-sm
                                text-neutral-900
                                outline-none
                                transition-all
                                duration-200
                                focus:border-[#C8A44D]
                                focus:ring-4
                                focus:ring-[#C8A44D]/10
                              "
                            />
                          </div>
                        </label>

                      </div>


                      {guestError && (
                        <div
                          className="
                            mt-4
                            rounded-[14px]
                            border
                            border-red-100
                            bg-red-50
                            px-3.5
                            py-3
                            text-xs
                            leading-5
                            text-red-600
                            motion-safe:animate-[loginShake_350ms_ease-out]
                          "
                        >
                          {guestError}
                        </div>
                      )}


                      {!guestOtpSent ? (
                        <button
                          type="button"
                          onClick={handleGuestContinue}
                          disabled={guestSubmitting}
                          className="
                            group
                            relative
                            mt-5
                            flex
                            w-full
                            items-center
                            justify-center
                            gap-2
                            overflow-hidden
                            rounded-[14px]
                            bg-black
                            px-5
                            py-3.5
                            text-sm
                            font-semibold
                            text-white
                            shadow-[0_12px_30px_rgba(0,0,0,0.13)]
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            hover:bg-neutral-800
                            active:scale-[0.985]
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                          "
                        >
                          <span
                            aria-hidden="true"
                            className="
                              pointer-events-none
                              absolute
                              inset-y-0
                              left-[-45%]
                              w-1/3
                              skew-x-[-18deg]
                              bg-white/10
                              transition-transform
                              duration-700
                              group-hover:translate-x-[430%]
                            "
                          />

                          {guestSubmitting ? (
                            <>
                              <Loader2
                                size={17}
                                className="animate-spin"
                              />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              Send OTP & Continue
                              <span
                                aria-hidden="true"
                                className="transition-transform duration-200 group-hover:translate-x-1"
                              >
                                →
                              </span>
                            </>
                          )}
                        </button>
                      ) : guestOtpVerified ? (
                        <div
                          className="
                            mt-5
                            rounded-[22px]
                            border
                            border-[#C8A44D]/20
                            bg-gradient-to-br
                            from-[#fffdf8]
                            via-white
                            to-[#faf8f2]
                            p-5
                            text-center
                            shadow-[0_12px_35px_rgba(200,164,77,0.10)]
                            motion-safe:animate-[loginPanelIn_380ms_cubic-bezier(.22,1,.36,1)]
                          "
                        >
                          <div
                            className="
                              mx-auto
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-full
                              bg-green-100
                              text-green-600
                              text-xl
                              font-bold
                              motion-safe:animate-[loginIconPop_420ms_cubic-bezier(.22,1,.36,1)]
                            "
                          >
                            ✓
                          </div>

                          <h3 className="mt-4 text-xl font-semibold tracking-[-0.025em] text-neutral-950">
                            Make it more rewarding with T&M ✨
                          </h3>

                          <p className="mx-auto mt-2 max-w-[430px] text-sm leading-6 text-neutral-500">
                            Become a T&M Member and enjoy <strong className="font-semibold text-neutral-700">exclusive discounts, members-only offers, early access to new launches & special perks</strong>.
                          </p>

                          {guestError && (
                            <div className="mt-4 rounded-[14px] border border-red-100 bg-red-50 px-3.5 py-3 text-xs leading-5 text-red-600 motion-safe:animate-[loginShake_350ms_ease-out]">
                              {guestError}
                            </div>
                          )}

                          <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                            <button
                              type="button"
                              onClick={() => handleGuestMemberChoice("member")}
                              disabled={guestMembershipSubmitting}
                              className="rounded-[14px] bg-black px-4 py-3.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(0,0,0,0.13)] transition hover:-translate-y-0.5 hover:bg-neutral-800 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {guestMembershipSubmitting ? (
                                <span className="inline-flex items-center justify-center gap-2">
                                  <Loader2 size={16} className="animate-spin" />
                                  Activating...
                                </span>
                              ) : (
                                "Yes, I’d love to join"
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleGuestMemberChoice("guest")}
                              disabled={guestMembershipSubmitting}
                              className="rounded-[14px] border border-neutral-200 bg-white px-4 py-3.5 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Continue as Guest
                            </button>
                          </div>

                          <p className="mt-4 text-[11px] text-neutral-400">
                            You can continue without becoming a member.
                          </p>
                        </div>
                      ) : (
                        <div
                          className="
                            mt-5
                            rounded-[18px]
                            border
                            border-[#C8A44D]/20
                            bg-[#fffdf8]
                            p-4
                            motion-safe:animate-[loginPanelIn_320ms_cubic-bezier(.22,1,.36,1)]
                          "
                        >
                          <div className="flex items-start gap-3">
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
                                text-[#9A7A22]
                              "
                            >
                              <Smartphone size={18} />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-neutral-900">
                                Verify your mobile number
                              </p>
                              <p className="mt-1 text-xs leading-5 text-neutral-500">
                                We sent a 6-digit OTP to +91 {guestPhone}.
                              </p>
                            </div>
                          </div>

                          <label className="mt-4 block">
                            <span className="mb-1.5 block text-xs font-semibold text-neutral-700">
                              Enter OTP
                            </span>

                            <input
                              type="tel"
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              maxLength={6}
                              value={guestOtp}
                              onChange={(event) => {
                                setGuestOtp(
                                  event.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 6)
                                );
                                setGuestError("");
                              }}
                              placeholder="Enter 6-digit OTP"
                              className="
                                w-full
                                rounded-[14px]
                                border
                                border-neutral-200
                                bg-white
                                px-4
                                py-3.5
                                text-center
                                text-lg
                                font-semibold
                                tracking-[0.35em]
                                text-neutral-900
                                outline-none
                                transition-all
                                focus:border-[#C8A44D]
                                focus:ring-4
                                focus:ring-[#C8A44D]/10
                              "
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleVerifyGuestOtp}
                            disabled={
                              guestOtpVerifying ||
                              guestOtp.replace(/\D/g, "").length !== 6
                            }
                            className="
                              mt-3
                              flex
                              w-full
                              items-center
                              justify-center
                              gap-2
                              rounded-[14px]
                              bg-black
                              px-5
                              py-3.5
                              text-sm
                              font-semibold
                              text-white
                              shadow-[0_12px_30px_rgba(0,0,0,0.13)]
                              transition-all
                              hover:bg-neutral-800
                              active:scale-[0.985]
                              disabled:cursor-not-allowed
                              disabled:opacity-50
                            "
                          >
                            {guestOtpVerifying ? (
                              <>
                                <Loader2
                                  size={17}
                                  className="animate-spin"
                                />
                                Verifying OTP...
                              </>
                            ) : (
                              <>
                                Verify OTP & Continue
                                <span aria-hidden="true">→</span>
                              </>
                            )}
                          </button>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => {
                                setGuestOtpSent(false);
                                setGuestOtp("");
                                setGuestError("");
                                setGuestCustomerDraft(null);
                              }}
                              disabled={guestSubmitting || guestOtpVerifying}
                              className="
                                text-xs
                                font-semibold
                                text-neutral-500
                                underline
                                underline-offset-2
                                transition
                                hover:text-neutral-800
                                disabled:opacity-50
                              "
                            >
                              Change mobile
                            </button>

                            <button
                              type="button"
                              onClick={handleResendGuestOtp}
                              disabled={guestSubmitting || guestOtpVerifying}
                              className="
                                text-xs
                                font-semibold
                                text-[#9A7A22]
                                underline
                                underline-offset-2
                                transition
                                hover:text-[#C8A44D]
                                disabled:opacity-50
                              "
                            >
                              {guestSubmitting ? "Sending..." : "Resend OTP"}
                            </button>
                          </div>
                        </div>
                      )}



                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-center
                          gap-2
                          text-[11px]
                          font-medium
                          text-neutral-400
                        "
                      >
                        <ShieldCheck
                          size={14}
                          className="text-neutral-500"
                        />
                        Your details are safe and secure with us
                      </div>

                    </div>

                  </div>
                )}

              </div>

            )
          }


          {/* =================================================
              ADDRESS
          ================================================== */}

          {
            !orderSuccess &&
            step === "address" && (

              <AddressStep

                customer={
                  customer
                }

                onContinue={
                  handleAddressContinue
                }

                onAddingAddressChange={
                  setIsAddingNewAddress
                }

              />

            )
          }


          {/* =================================================
              PAYMENT
          ================================================== */}

          {
            !orderSuccess &&
            step === "payment" && (

              <>

                {/* =============================================
                    PAYMENT PAGE OFFER PROGRESS
                ============================================== */}

                <div
                  className="
                    mb-6
                    space-y-5
                    motion-safe:animate-[fadeUp_350ms_ease-out]
                  "
                >

                  {/* =========================================
                      FREE GIFT
                  ========================================== */}

                  <div>

                    <div

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                      "

                    >

                      <span>
                        🎁
                      </span>


                      {
                        giftUnlocked ? (

                          <>

                            <span>
                              Free Gift Unlocked
                            </span>


                            <span

                              className="
                                ml-1

                                flex
                                h-5
                                w-5

                                items-center
                                justify-center

                                rounded-full

                                bg-green-100

                                text-green-600

                                font-bold

                                text-xs
                              "

                            >

                              ✓

                            </span>

                          </>

                        ) : (

                          <span>

                            Add ₹
                            {
                              giftRemaining
                            }
                            {" "}
                            more to unlock Free Gift

                          </span>

                        )
                      }

                    </div>


                    {
                      !giftUnlocked && (

                        <div

                          className="
                            mt-2

                            h-2

                            overflow-hidden

                            rounded-full

                            bg-neutral-200
                          "

                        >

                          <div

                            className="
                              h-full

                              rounded-full

                              bg-black

                              transition-all
                              duration-700
                              ease-out
                            "

                            style={{
                              width:
                                `${giftProgress}%`,
                            }}

                          />

                        </div>

                      )
                    }

                  </div>


                  {/* =========================================
                      FREE SHIPPING
                  ========================================== */}

                  <div>

                    <div

                      className="
                        flex
                        items-center
                        gap-2

                        text-sm
                        font-medium
                      "

                    >

                      <span>
                        🚚
                      </span>


                      {
                        freeShippingUnlocked ? (

                          <>

                            <span>
                              Free Shipping Unlocked
                            </span>


                            <span

                              className="
                                ml-1

                                flex
                                h-5
                                w-5

                                items-center
                                justify-center

                                rounded-full

                                bg-green-100

                                text-green-600

                                font-bold

                                text-xs
                              "

                            >

                              ✓

                            </span>

                          </>

                        ) : (

                          <span>

                            Add ₹
                            {
                              shippingRemaining
                            }
                            {" "}
                            more to unlock Free Shipping

                          </span>

                        )
                      }

                    </div>


                    {
                      !freeShippingUnlocked && (

                        <div

                          className="
                            mt-2

                            h-2

                            overflow-hidden

                            rounded-full

                            bg-neutral-200
                          "

                        >

                          <div

                            className="
                              h-full

                              rounded-full

                              bg-black

                              transition-all
                              duration-700
                              ease-out
                            "

                            style={{
                              width:
                                `${shippingProgress}%`,
                            }}

                          />

                        </div>

                      )
                    }

                  </div>

                </div>


                {/* =============================================
                    T&M WALLET
                ============================================== */}

                {
                  !isGuestCheckoutCustomer &&
                  customer?.id && (

                    <div
                      className={`
                        group
                        relative
                        mb-5
                        overflow-hidden
                        rounded-[24px]
                        border
                        p-4
                        shadow-[0_14px_40px_rgba(0,0,0,0.055)]
                        transition-all
                        duration-300
                        motion-safe:animate-[fadeUp_400ms_ease-out]

                        sm:p-5

                        ${
                          walletSelected
                            ? "border-[#C8A44D]/45 bg-gradient-to-br from-[#fffdf7] via-white to-[#f8f2e2] shadow-[0_16px_42px_rgba(200,164,77,0.13)]"
                            : "border-neutral-200 bg-gradient-to-br from-white via-neutral-50/70 to-[#faf8f1]"
                        }
                      `}
                    >

                      {/* Premium ambient glow */}
                      <span
                        aria-hidden="true"
                        className={`
                          pointer-events-none
                          absolute
                          -right-16
                          -top-16
                          h-36
                          w-36
                          rounded-full
                          bg-[#C8A44D]/[0.10]
                          blur-3xl
                          transition-opacity
                          duration-500
                          ${
                            walletSelected
                              ? "opacity-100"
                              : "opacity-60"
                          }
                        `}
                      />

                      <div className="relative">

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
                              gap-3.5
                            "
                          >

                            <div
                              className={`
                                relative
                                flex
                                h-12
                                w-12
                                shrink-0
                                items-center
                                justify-center
                                rounded-[16px]
                                border
                                text-white
                                shadow-[0_8px_22px_rgba(0,0,0,0.14)]
                                transition-all
                                duration-300
                                ${
                                  walletSelected
                                    ? "border-[#D9BA69] bg-gradient-to-br from-[#171717] to-black ring-4 ring-[#C8A44D]/10"
                                    : "border-black bg-black"
                                }
                              `}
                            >
                              <Wallet
                                size={21}
                                strokeWidth={1.9}
                              />

                              {walletSelected && (
                                <span
                                  aria-hidden="true"
                                  className="
                                    absolute
                                    -right-1.5
                                    -top-1.5
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-full
                                    border-2
                                    border-white
                                    bg-[#C8A44D]
                                    text-[10px]
                                    font-bold
                                    text-black
                                    shadow-sm
                                    motion-safe:animate-[loginIconPop_300ms_ease-out]
                                  "
                                >
                                  ✓
                                </span>
                              )}

                            </div>

                            <div className="min-w-0">

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
                                    text-[15px]
                                    font-semibold
                                    tracking-[-0.015em]
                                    text-neutral-950
                                  "
                                >
                                  T&M Wallet
                                </p>

                                <span
                                  className="
                                    rounded-full
                                    border
                                    border-[#C8A44D]/20
                                    bg-[#C8A44D]/10
                                    px-2
                                    py-0.5
                                    text-[9px]
                                    font-semibold
                                    uppercase
                                    tracking-[0.09em]
                                    text-[#80651d]
                                  "
                                >
                                  Instant savings
                                </span>

                              </div>

                              <p
                                className="
                                  mt-1
                                  text-xs
                                  text-neutral-500
                                "
                              >
                                {
                                  walletLoading
                                    ? "Checking your wallet balance..."
                                    : `Balance: ₹${(
                                        Number(walletBalancePaise || 0) /
                                        100
                                      ).toLocaleString("en-IN", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}`
                                }
                              </p>

                            </div>

                          </div>

                          <button
                            type="button"
                            onClick={toggleWallet}
                            disabled={
                              walletLoading ||
                              walletApplying ||
                              walletBalancePaise <= 0
                            }
                            className={`
                              relative
                              h-7
                              w-[50px]
                              shrink-0
                              rounded-full
                              border
                              p-0.5
                              transition-all
                              duration-300
                              focus:outline-none
                              focus:ring-4
                              focus:ring-[#C8A44D]/15
                              disabled:cursor-not-allowed
                              disabled:opacity-50

                              ${
                                walletSelected
                                  ? "border-[#C8A44D] bg-[#C8A44D] shadow-[0_5px_18px_rgba(200,164,77,0.28)]"
                                  : "border-neutral-300 bg-neutral-200"
                              }
                            `}
                            aria-label={
                              walletSelected
                                ? "Remove wallet credit"
                                : "Use wallet credit"
                            }
                          >

                            <span
                              className={`
                                absolute
                                top-1/2
                                flex
                                h-6
                                w-6
                                -translate-y-1/2
                                items-center
                                justify-center
                                rounded-full
                                bg-white
                                shadow-[0_2px_7px_rgba(0,0,0,0.18)]
                                transition-transform
                                duration-300
                                ${
                                  walletSelected
                                    ? "translate-x-[21px]"
                                    : "translate-x-0"
                                }
                              `}
                            >
                              {walletApplying ? (
                                <Loader2
                                  size={12}
                                  className="animate-spin text-[#9A7A22]"
                                />
                              ) : (
                                <span
                                  className={`
                                    h-1.5
                                    w-1.5
                                    rounded-full
                                    ${
                                      walletSelected
                                        ? "bg-[#C8A44D]"
                                        : "bg-neutral-300"
                                    }
                                  `}
                                />
                              )}
                            </span>

                          </button>

                        </div>


                        {walletSelected && walletAmountPaise > 0 && (
                          <div
                            className="
                              relative
                              mt-4
                              overflow-hidden
                              rounded-[18px]
                              border
                              border-[#C8A44D]/20
                              bg-white/75
                              shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]
                              motion-safe:animate-[fadeUp_280ms_ease-out]
                            "
                          >

                            <div
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                px-3.5
                                py-3
                              "
                            >

                              <div className="min-w-0">

                                <p
                                  className="
                                    text-xs
                                    font-medium
                                    text-neutral-500
                                  "
                                >
                                  Wallet savings
                                </p>

                                <p
                                  className="
                                    mt-0.5
                                    text-sm
                                    font-semibold
                                    text-neutral-950
                                  "
                                >
                                  You save ₹{(
                                    Number(walletAmountPaise) /
                                    100
                                  ).toLocaleString("en-IN", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  })}
                                </p>

                              </div>

                              <div
                                className="
                                  shrink-0
                                  rounded-full
                                  bg-green-50
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-semibold
                                  uppercase
                                  tracking-[0.08em]
                                  text-green-700
                                "
                              >
                                Applied
                              </div>

                            </div>

                            <div
                              className="
                                border-t
                                border-[#C8A44D]/10
                                px-3.5
                                py-2.5
                                text-[11px]
                                text-neutral-500
                              "
                            >
                              {Math.max(
                                0,
                                displayedTotal -
                                  Number(walletAmountPaise) / 100
                              ) > 0 ? (
                                <span>
                                  Remaining to pay online:{" "}
                                  <strong className="font-semibold text-neutral-800">
                                    ₹{Math.max(
                                      0,
                                      displayedTotal -
                                        Number(walletAmountPaise) / 100
                                    ).toLocaleString("en-IN", {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}
                                  </strong>
                                </span>
                              ) : (
                                <span className="font-medium text-green-700">
                                  ✓ Your wallet covers the full order total
                                </span>
                              )}
                            </div>

                          </div>
                        )}


                        {!walletSelected &&
                          !walletLoading &&
                          walletBalancePaise > 0 && (
                            <button
                              type="button"
                              onClick={toggleWallet}
                              disabled={walletApplying}
                              className="
                                relative
                                mt-3
                                flex
                                w-full
                                items-center
                                justify-between
                                rounded-[15px]
                                border
                                border-[#C8A44D]/15
                                bg-white/70
                                px-3.5
                                py-2.5
                                text-left
                                transition-all
                                duration-200
                                hover:border-[#C8A44D]/35
                                hover:bg-white
                                active:scale-[0.99]
                              "
                            >

                              <span
                                className="
                                  text-xs
                                  font-medium
                                  text-neutral-600
                                "
                              >
                                Use wallet balance on this order
                              </span>

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  text-[#9A7A22]
                                "
                              >
                                Save ₹{(
                                  Number(
                                    Math.min(
                                      walletBalancePaise,
                                      Math.max(
                                        0,
                                        Math.round(
                                          Number(displayedTotal || 0) * 100
                                        )
                                      )
                                    )
                                  ) / 100
                                ).toLocaleString("en-IN", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>

                            </button>
                          )
                        }


                        {walletApplying && (
                          <div
                            className="
                              mt-3
                              flex
                              items-center
                              gap-2
                              text-[11px]
                              font-medium
                              text-[#80651d]
                            "
                          >
                            <Loader2
                              size={13}
                              className="animate-spin"
                            />
                            Securing your wallet savings...
                          </div>
                        )}


                        {walletError && (
                          <div
                            className="
                              mt-3
                              rounded-[13px]
                              border
                              border-red-100
                              bg-red-50
                              px-3
                              py-2.5
                              text-xs
                              leading-5
                              text-red-600
                            "
                          >
                            {walletError}
                          </div>
                        )}

                      </div>

                    </div>

                  )
                }


                {/* =============================================
                    PAYMENT COMPONENT
                ============================================== */}

                <PaymentStep

                  totalAmount={
                    verifiedCheckoutPricing?.totalAmount ??
                    finalAmount
                  }

                  checkoutQuoteId={checkoutQuoteId ?? ""}

                  walletAmountPaise={
                    walletSelected
                      ? walletAmountPaise
                      : 0
                  }

                  onPaymentSuccessStart={() => {
    setProcessingPayment(true);
  }}
  onSuccess={handlePaymentSuccess}
/>

              </>

            )
          }

        </div>


        {/* ===================================================
            SECURITY FOOTER
        ==================================================== */}

        {
          !orderSuccess &&
          !processingPayment &&
          !paymentRecoveryError && (

            <div

              className="
                shrink-0
                border-t
                border-neutral-100
                bg-white/95
                px-5
                pb-[calc(0.9rem+env(safe-area-inset-bottom))]
                pt-3
                shadow-[0_-8px_24px_rgba(0,0,0,0.045)]
                backdrop-blur-md

                md:px-6
                md:py-4
              "

            >

              <div

                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[13px]
                  font-medium
                  text-neutral-600
                "

              >

                <ShieldCheck
                  size={18}
                />

                Your data is safe and secure with us

              </div>

            </div>

          )
        }

      </div>

      {memberUpgradeDialogOpen && (
        <div
          className="
            fixed
            inset-0
            z-[1400]
            flex
            items-center
            justify-center
            bg-black/45
            px-4
            backdrop-blur-sm
            motion-safe:animate-[fadeIn_180ms_ease-out]
          "
          onClick={() => {
            if (!memberUpgradeSubmitting) {
              continueAsGuestAfterMemberPrompt();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="member-upgrade-title"
            onClick={(event) => event.stopPropagation()}
            className="
              w-full
              max-w-[390px]
              overflow-hidden
              rounded-[26px]
              border
              border-[#C8A44D]/20
              bg-white
              p-5
              shadow-[0_30px_90px_rgba(0,0,0,0.22)]
              motion-safe:animate-[scaleIn_240ms_cubic-bezier(.22,1,.36,1)]
              sm:p-6
            "
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#C8A44D]/10 text-2xl">
              {memberUpgradeReason === "coupon" ? "🎟️" : "✨"}
            </div>

            <h3
              id="member-upgrade-title"
              className="
                mt-4
                text-center
                text-xl
                font-semibold
                tracking-[-0.025em]
                text-neutral-950
              "
            >
              {memberUpgradeReason === "coupon"
                ? "This coupon is for Members"
                : "Unlock the Member Price"}
            </h3>

            <p className="mx-auto mt-2 max-w-[330px] text-center text-sm leading-5 text-neutral-500">
              {memberUpgradeReason === "coupon"
                ? "This coupon is available to T&M Members. Become a Member now and we'll apply it for you."
                : "This product has an exclusive Member price. Become a T&M Member to unlock the special price."}
            </p>

            <div className="mt-5 rounded-2xl bg-[#fffaf0] px-4 py-3 text-center text-xs leading-5 text-[#80651d]">
              Exclusive discounts, members-only offers, early access & special perks.
            </div>

            <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleMemberUpgradeFromDialog}
                disabled={memberUpgradeSubmitting}
                className="
                  inline-flex
                  min-h-12
                  items-center
                  justify-center
                  gap-2
                  rounded-[14px]
                  bg-black
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-neutral-800
                  active:scale-[0.985]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {memberUpgradeSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Activating...
                  </>
                ) : (
                  "Yes, become a Member"
                )}
              </button>

              <button
                type="button"
                onClick={continueAsGuestAfterMemberPrompt}
                disabled={memberUpgradeSubmitting}
                className="
                  min-h-12
                  rounded-[14px]
                  border
                  border-neutral-200
                  bg-white
                  px-4
                  py-3
                  text-sm
                  font-semibold
                  text-neutral-700
                  transition
                  hover:bg-neutral-50
                  active:scale-[0.985]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                Continue as Guest
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] font-medium uppercase tracking-[0.1em] text-neutral-400">
              You can always continue without membership
            </p>
          </div>
        </div>
      )}

      {isBuyNow && step !== "payment" && (
        <CouponModal
          open={buyNowCouponModalOpen}
          onClose={() => setBuyNowCouponModalOpen(false)}
          onApply={applyBuyNowCoupon}
          cartTotal={subtotal}
          cartItems={checkoutItems}
          appliedCoupon={buyNowCoupon}
          customerType={isGuestCustomer ? "guest" : "member"}
          customerId={
            customer?.id ??
            guestCustomerDraft?.id ??
            authCustomer?.id ??
            null
          }
        />
      )}

      {/* Component-local motion used by the mobile-first checkout shell. */}
      <style>
        {`
          @keyframes checkoutIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeUp {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes softFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @keyframes cuteArrowBounce {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(4px);
            }
          }

          @keyframes hintSpark {
            0%, 100% {
              opacity: 0.45;
              transform: scale(0.9) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.08) rotate(8deg);
            }
          }

          @keyframes stepPulse {
            0%, 100% {
              opacity: 0.35;
              transform: scale(1);
            }
            50% {
              opacity: 0.8;
              transform: scale(1.06);
            }
          }

          @keyframes stepCheck {
            from {
              opacity: 0;
              transform: scale(0.6) rotate(-12deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.96) translateY(6px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes loadingSlide {
            0% {
              transform: translateX(-130%);
            }
            50% {
              transform: translateX(70%);
            }
            100% {
              transform: translateX(260%);
            }
          }

          @keyframes loginChoiceIn {
            from {
              opacity: 0;
              transform: translateY(14px) scale(0.985);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes loginCardIn {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loginIconFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-5px);
            }
          }

          @keyframes loginIconPop {
            from {
              opacity: 0;
              transform: scale(0.75) rotate(-5deg);
            }
            to {
              opacity: 1;
              transform: scale(1) rotate(0);
            }
          }

          @keyframes loginRing {
            0% {
              opacity: 0.65;
              transform: scale(0.94);
            }
            70%, 100% {
              opacity: 0;
              transform: scale(1.12);
            }
          }

          @keyframes loginSparkle {
            0%, 100% {
              opacity: 0.35;
              transform: scale(0.8) rotate(0deg);
            }
            50% {
              opacity: 1;
              transform: scale(1.15) rotate(12deg);
            }
          }

          @keyframes loginGlow {
            0%, 100% {
              transform: translate3d(0, 0, 0) scale(1);
              opacity: 0.65;
            }
            50% {
              transform: translate3d(-8px, 7px, 0) scale(1.08);
              opacity: 1;
            }
          }

          @keyframes loginFade {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes loginPanelIn {
            from {
              opacity: 0;
              transform: translateY(12px) scale(0.99);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes loginShake {
            0%, 100% {
              transform: translateX(0);
            }
            25% {
              transform: translateX(-4px);
            }
            75% {
              transform: translateX(4px);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>

    </>,

    document.body

  );
}