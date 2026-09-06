import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  CheckCircle2,
  Clock3,
  Mail,
  Package,
  RotateCcw,
  Search,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from "lucide-react";

import logo from "@/assets/logo/mainLogo.png";
import { useAuth } from "@/features/Auth/context/AuthContext";
import {
  trackOrder,
  type OrderTrackingResult,
  type TrackingActivity,
} from "@/features/orders/services/orderTracking.service";

import { saveOrderEmail } from "@/features/orders/services/order.service";

const STEPS = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "packed", label: "Packed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Check },
] as const;

const STATUS_ORDER = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "delivered",
];

function getStatusHeading(status: string) {
  switch (status) {
    case "pending":
      return "Your order has been placed";
    case "confirmed":
      return "Your order is confirmed";
    case "packed":
      return "Your order is packed";
    case "shipped":
      return "Your order is on its way";
    case "delivered":
      return "Your order has arrived";
    case "cancelled":
      return "Order cancelled";
    case "returned":
      return "Order returned";
    case "refunded":
      return "Order refunded";
    default:
      return "Your order status";
  }
}

function getStepIndex(status: string) {
  return STATUS_ORDER.indexOf(status);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function activityIcon(activity: TrackingActivity) {
  switch (activity.event_type) {
    case "tracking_added":
    case "tracking_updated":
      return Truck;
    case "order_cancelled":
      return XCircle;
    case "returned":
    case "refunded":
      return RotateCcw;
    default:
      return CheckCircle2;
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function OrderTrackingDialog({
  open,
  onClose,
}: Props) {
  const { customer } = useAuth();

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<OrderTrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [guestEmail, setGuestEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [keepAsPermanentEmail, setKeepAsPermanentEmail] = useState(false);

  const isLoggedIn = Boolean(customer);

  useEffect(() => {
    if (!open) return;

    const scrollContainer = document.querySelector(
      '[aria-label="Track your order"] .overflow-y-auto'
    ) as HTMLElement | null;

    if (!scrollContainer) return;

    const updateScrollButton = () => {
      const hasMoreContent =
        scrollContainer.scrollHeight > scrollContainer.clientHeight + 8;
      const isNearBottom =
        scrollContainer.scrollTop + scrollContainer.clientHeight >=
        scrollContainer.scrollHeight - 24;

      setShowScrollButton(hasMoreContent && !isNearBottom);
    };

    updateScrollButton();
    scrollContainer.addEventListener("scroll", updateScrollButton, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollButton);

    return () => {
      scrollContainer.removeEventListener("scroll", updateScrollButton);
      window.removeEventListener("resize", updateScrollButton);
    };
  }, [open, result]);

  function scrollToBottom() {
    const scrollContainer = document.querySelector(
      '[aria-label="Track your order"] .overflow-y-auto'
    ) as HTMLElement | null;

    if (!scrollContainer) return;

    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: "smooth",
    });
  }

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setError("");
      setLoading(false);
      setShowScrollButton(false);
      setOrderNumber("");
      setPhone("");
      setGuestEmail("");
      setEmailSaving(false);
      setEmailSaved(false);
      setEmailError("");
    }
  }, [open]);

  async function submit(event: FormEvent) {
    event.preventDefault();

    const trimmedOrder = orderNumber.trim();

    if (!trimmedOrder) {
      setError("Please enter your order number.");
      return;
    }

    if (!isLoggedIn && phone.replace(/\D/g, "").length !== 10) {
      setError("Please enter the 10-digit phone number used for your order.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const tracking = await trackOrder(
        trimmedOrder,
        isLoggedIn ? undefined : phone
      );

      setResult(tracking);
      setGuestEmail("");
      setEmailSaved(false);
      setEmailError("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "We couldn't verify those order details."
      );
    } finally {
      setLoading(false);
    }
  }

  function backToSearch() {
    setResult(null);
    setError("");
    setGuestEmail("");
    setEmailSaving(false);
    setEmailSaved(false);
    setEmailError("");
    setEmailEditorOpen(false);
    setKeepAsPermanentEmail(false);
  }

  async function handleEmailSubmit() {
    const email = guestEmail.trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!result) return;

    setEmailSaving(true);
    setEmailError("");

    try {
      const authenticatedCustomerPhone =
        typeof customer?.phone === "string" ? customer.phone : "";

      const verificationPhone = isLoggedIn
        ? authenticatedCustomerPhone
        : phone;

      await saveOrderEmail({
        orderNumber: result.order.order_number,
        email,
        phone: verificationPhone || null,
        updateCustomerEmail: keepAsPermanentEmail,
      });

      setEmailSaved(true);
      setGuestEmail("");

      setResult((current) => {
        if (!current) return current;

        return {
          ...current,
          order: {
            ...current.order,
            customer_email: email,
          } as typeof current.order,
        };
      });
    } catch (err) {
      console.error("Failed to save order email:", err);

      setEmailError(
        err instanceof Error
          ? err.message
          : "We couldn't save your email. Please try again."
      );
    } finally {
      setEmailSaving(false);
    }
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="tracking-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1200] flex h-[100dvh] w-full items-center justify-center bg-[#fffdf8]/45 p-0 backdrop-blur-md sm:p-5 md:p-8"
        role="dialog"
        aria-modal="true"
        aria-label="Track your order"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.985 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="relative flex max-h-[calc(100dvh-20px)] w-full max-w-[640px] flex-col overflow-hidden rounded-[30px] border border-[#C8A44D]/30 bg-[#fffdf8] shadow-[0_30px_100px_rgba(50,35,10,0.24)] sm:max-h-[calc(100dvh-48px)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-32 bg-[radial-gradient(circle_at_50%_-30%,rgba(200,164,77,0.18),transparent_68%)]" />

          <div className="relative z-30 flex shrink-0 items-center justify-between border-b border-[#C8A44D]/20 bg-white/95 px-5 py-4 backdrop-blur-sm sm:px-6">
            {result ? (
              <button
                type="button"
                onClick={backToSearch}
                className="inline-flex items-center gap-2 text-xs text-[#8a7340] transition hover:text-[#5f4b20]"
              >
                <ArrowLeft className="h-4 w-4" />
                Track another order
              </button>
            ) : (
              <div className="text-xs uppercase tracking-[0.16em] text-[#C8A44D]">
                T&M Jewels
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close order tracking"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A44D]/20 bg-[#C8A44D]/[0.06] text-[#5f4b20] transition hover:bg-[#C8A44D]/[0.10] hover:text-[#5f4b20]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {!result ? (
              <div className="relative px-5 py-8 sm:px-8 sm:py-9">
                <div className="text-center">
                  <img
                    src={logo}
                    alt="T&M Jewels"
                    className="mx-auto h-auto w-24 object-contain"
                  />

                  <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#C8A44D]/25 bg-[#C8A44D]/[0.07] px-3.5 py-1.5 text-[10px] font-medium tracking-[0.18em] text-[#9B7625]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    SECURE ORDER TRACKING
                  </div>

                  <h2 className="mt-4 font-serif text-3xl font-medium tracking-[-0.025em] text-[#4b3a19] sm:text-[34px]">
                    Track your <span className="text-[#B88A24]">order</span>
                  </h2>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-[#8a7340]">
                    Enter your order details to see the latest status and
                    activity.
                  </p>
                </div>

                <form onSubmit={submit} className="mx-auto mt-8 max-w-[470px] rounded-[22px] border border-[#C8A44D]/15 bg-white/80 p-4 shadow-[0_12px_35px_rgba(70,50,15,0.05)] sm:p-5">
                  <label className="mb-2.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#806632]">
                    Order Number
                  </label>

                  <div className="relative">
                    <Package className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8A44D]" />
                    <input
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      placeholder="e.g. TNM-1024"
                      autoComplete="off"
                      className="h-13 w-full rounded-xl border border-[#C8A44D]/20 bg-white pl-11 pr-4 text-sm text-[#4f4024] outline-none transition placeholder:text-[#7a6a4b] focus:border-[#C8A44D]/60"
                    />
                  </div>

                  {!isLoggedIn && (
                    <>
                      <label className="mb-2 mt-4 block text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a7340]">
                        Phone Number
                      </label>

                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8A44D]" />
                        <input
                          value={phone}
                          onChange={(e) =>
                            setPhone(
                              e.target.value.replace(/\D/g, "").slice(0, 10)
                            )
                          }
                          placeholder="10-digit mobile number"
                          inputMode="numeric"
                          autoComplete="tel"
                          className="h-13 w-full rounded-xl border border-[#C8A44D]/20 bg-white pl-11 pr-4 text-sm text-[#4f4024] outline-none transition placeholder:text-[#7a6a4b] focus:border-[#C8A44D]/60"
                        />
                      </div>
                    </>
                  )}

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden rounded-xl border border-red-700/20 bg-red-50 px-3.5 py-2.5 text-xs text-red-700"
                      >
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-[#C8A44D] text-sm font-medium text-black transition hover:bg-[#d8b45e] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Track My Order
                        <Search className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[#7a6a4b]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Your order details are protected.
                </div>
              </div>
            ) : (
              <div className="px-5 py-6 sm:px-7 sm:py-7">
                <div className="text-center">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#C8A44D]">
                    Order #{result.order.order_number}
                  </p>

                  <h2 className="mt-2 font-serif text-2xl text-[#9B7625] sm:text-3xl">
                    {getStatusHeading(result.order.order_status)}
                  </h2>

                  <p className="mt-1 text-xs font-medium text-[#6b5a3a]">
                    Placed on {formatDate(result.order.created_at)}
                  </p>
                </div>

                {["cancelled", "returned", "refunded"].includes(
                  result.order.order_status
                ) ? (
                  <SpecialStatus status={result.order.order_status} />
                ) : (
                  <StatusTracker status={result.order.order_status} />
                )}

                {(() => {
                  const orderEmail = (
                    result.order as typeof result.order & {
                      customer_email?: string | null;
                    }
                  ).customer_email;

                  if (emailSaved) return null;

                  const showEditor = !orderEmail || emailEditorOpen;

                  return (
                    <>
                      {!showEditor && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35 }}
                          className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              initial={{ scale: 0.7 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.35 }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100"
                            >
                              <Mail size={17} className="text-green-600" />
                            </motion.div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-900">
                                Email updates
                              </p>

                              <p className="mt-1 break-all text-xs text-neutral-500">
                                Order updates will be sent to{" "}
                                <span className="font-medium text-neutral-700">
                                  {orderEmail}
                                </span>
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setEmailEditorOpen(true);
                                setGuestEmail(orderEmail || "");
                                setEmailError("");
                                setKeepAsPermanentEmail(false);
                              }}
                              className="shrink-0 rounded-lg border border-green-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A44D] hover:text-neutral-900 hover:shadow-sm"
                            >
                              Update email
                            </button>
                          </div>
                        </motion.div>
                      )}

                      {showEditor && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.99 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="mt-5 rounded-2xl border border-[#C8A44D]/25 bg-[#fffaf0] p-4 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <motion.div
                              animate={{ rotate: [0, -8, 8, 0] }}
                              transition={{ duration: 0.45 }}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C8A44D]/10 text-[#9B7625]"
                            >
                              <Mail size={17} />
                            </motion.div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-neutral-900">
                                {orderEmail
                                  ? "Update email for order updates"
                                  : "Want order updates by email?"}
                              </p>

                              <p className="mt-1 text-xs leading-relaxed text-neutral-500">
                                {orderEmail
                                  ? "Change the email address you'd like us to use for this order."
                                  : "Add your email to receive your order confirmation and future shipping and delivery updates."}
                              </p>
                            </div>

                            {orderEmail && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEmailEditorOpen(false);
                                  setGuestEmail("");
                                  setEmailError("");
                                }}
                                disabled={emailSaving}
                                className="text-xs font-medium text-neutral-500 transition hover:text-neutral-900 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>

                          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                            <input
                              type="email"
                              value={guestEmail}
                              onChange={(event) => {
                                setGuestEmail(event.target.value);
                                if (emailError) setEmailError("");
                              }}
                              placeholder="Enter your email address"
                              autoComplete="email"
                              disabled={emailSaving}
                              className="h-11 min-w-0 flex-1 rounded-xl border border-neutral-200 bg-white px-3 text-sm text-neutral-900 outline-none transition-all duration-300 placeholder:text-neutral-400 focus:border-[#C8A44D] focus:ring-2 focus:ring-[#C8A44D]/15 disabled:cursor-not-allowed disabled:bg-neutral-100"
                            />

                            <button
                              type="button"
                              onClick={handleEmailSubmit}
                              disabled={emailSaving}
                              className="h-11 shrink-0 rounded-xl bg-[#C8A44D] px-4 text-sm font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d8b45e] hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {emailSaving
                                ? "Saving..."
                                : orderEmail
                                  ? "Save Updates"
                                  : "Get Updates"}
                            </button>
                          </div>

                          <div className="mt-3 rounded-xl border border-neutral-200/80 bg-white/70 p-3 transition-all duration-300">
                            <p className="text-xs font-medium text-neutral-800">
                              How should we use this email?
                            </p>

                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-neutral-200 bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A44D]/50">
                                <input
                                  type="radio"
                                  name="tracking-email-scope"
                                  checked={!keepAsPermanentEmail}
                                  onChange={() => setKeepAsPermanentEmail(false)}
                                  disabled={emailSaving}
                                  className="mt-0.5 accent-[#C8A44D]"
                                />

                                <span>
                                  <span className="block text-xs font-medium text-neutral-900">
                                    This order only
                                  </span>
                                  <span className="mt-0.5 block text-[10px] leading-relaxed text-neutral-400">
                                    We'll use it only for this order.
                                  </span>
                                </span>
                              </label>

                              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-neutral-200 bg-white p-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A44D]/50">
                                <input
                                  type="radio"
                                  name="tracking-email-scope"
                                  checked={keepAsPermanentEmail}
                                  onChange={() => setKeepAsPermanentEmail(true)}
                                  disabled={emailSaving}
                                  className="mt-0.5 accent-[#C8A44D]"
                                />

                                <span>
                                  <span className="block text-xs font-medium text-neutral-900">
                                    Use for future orders
                                  </span>
                                  <span className="mt-0.5 block text-[10px] leading-relaxed text-neutral-400">
                                    We'll save it to your customer profile too.
                                  </span>
                                </span>
                              </label>
                            </div>
                          </div>

                          <AnimatePresence>
                            {emailError && (
                              <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 overflow-hidden text-xs text-red-600"
                              >
                                {emailError}
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <p className="mt-2 text-[10px] leading-relaxed text-neutral-400">
                            We'll only use this email for order-related updates.
                          </p>
                        </motion.div>
                      )}
                    </>
                  );
                })()}

                {emailSaved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                        <Check className="h-4 w-4 text-green-600" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          Email updates enabled
                        </p>

                        <p className="mt-1 text-xs text-neutral-500">
                          We'll send order-related updates to your email.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <section className="mt-6 rounded-2xl border border-[#C8A44D]/20 bg-white p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-xl text-[#9B7625]">Order activity</h3>
                      <p className="mt-1 text-[11px] text-[#6b5a3a]">
                        Latest updates from your order.
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A44D]/20 bg-[#C8A44D]/[0.06]">
                      <Clock3 className="h-4 w-4 text-[#C8A44D]" />
                    </div>
                  </div>

                  <div className="mt-6">
                    {result.activities.length === 0 ? (
                      <p className="text-sm text-[#6b5a3a]">
                        Your order activity will appear here as updates are
                        made.
                      </p>
                    ) : (
                      result.activities.map((activity, index) => (
                        <ActivityRow
                          key={activity.id}
                          activity={activity}
                          last={index === result.activities.length - 1}
                        />
                      ))
                    )}
                  </div>
                </section>

                {result.order.tracking_number && (
                  <div className="mt-4 rounded-2xl border border-[#C8A44D]/20 bg-[#C8A44D]/[0.05] px-4 py-3.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[9px] uppercase tracking-[0.14em] text-[#6b5a3a]">
                          Shipment
                        </p>
                        <p className="mt-0.5 truncate text-sm">
                          {result.order.courier_name || "Courier"}
                        </p>
                      </div>

                      <p className="shrink-0 font-mono text-xs text-[#C8A44D]">
                        {result.order.tracking_number}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <AnimatePresence>
            {showScrollButton && result && (
              <motion.button
                type="button"
                onClick={scrollToBottom}
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                aria-label="Scroll to latest order activity"
                title="Scroll to latest activity"
                className="absolute bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[#C8A44D]/35 bg-[#C8A44D] text-black shadow-[0_8px_24px_rgba(80,55,15,0.22)] transition hover:bg-[#d8b45e] focus:outline-none focus:ring-2 focus:ring-[#C8A44D]/40 sm:bottom-6 sm:right-6"
              >
                <ChevronDown className="h-5 w-5" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function StatusTracker({ status }: { status: string }) {
  const currentIndex = getStepIndex(status);

  return (
    <div className="mt-6 rounded-2xl border border-[#C8A44D]/20 bg-white px-3 py-6 sm:px-5">
      <div className="relative flex min-w-0 justify-between">
        <div className="absolute left-[10%] right-[10%] top-5 h-px bg-[#e8dfcc]" />

        <motion.div
          className="absolute left-[10%] top-5 h-px bg-[#C8A44D]"
          initial={{ width: 0 }}
          animate={{
            width:
              currentIndex <= 0
                ? "0%"
                : `${(currentIndex / 4) * 80}%`,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />

        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const complete = index <= currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={step.key}
              className="relative z-10 flex w-1/5 flex-col items-center text-center"
            >
              <motion.div
                animate={{ scale: active ? 1.06 : 1 }}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full border",
                  complete
                    ? "border-[#C8A44D] bg-[#C8A44D] text-black"
                    : "border-[#C8A44D]/20 bg-[#fffdf8] text-[#7a6a4b]",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </motion.div>

              <p
                className={[
                  "mt-2 text-[9px] leading-4 sm:text-[11px]",
                  active ? "text-[#C8A44D]" : "text-[#6b5a3a]",
                ].join(" ")}
              >
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityRow({
  activity,
  last,
}: {
  activity: TrackingActivity;
  last: boolean;
}) {
  const Icon = activityIcon(activity);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex gap-3.5"
    >
      <div className="flex flex-col items-center">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#C8A44D]/25 bg-[#C8A44D]/[0.08] text-[#C8A44D]">
          <Icon className="h-4 w-4" />
        </div>

        {!last && (
          <div className="my-1 min-h-7 w-px flex-1 bg-[#e8dfcc]" />
        )}
      </div>

      <div className="min-w-0 pb-6">
        <p className="text-sm font-semibold text-[#3f321c]">{activity.title}</p>

        {activity.description && (
          <p className="mt-1 text-xs leading-5 text-[#6b5a3a]">
            {activity.description}
          </p>
        )}

        <p className="mt-1.5 text-[10px] font-medium text-[#7a6a4b]">
          {formatDateTime(activity.created_at)}
        </p>
      </div>
    </motion.div>
  );
}

function SpecialStatus({ status }: { status: string }) {
  const config: Record<
    string,
    {
      title: string;
      text: string;
      Icon: typeof XCircle;
    }
  > = {
    cancelled: {
      title: "This order was cancelled",
      text: "The activity timeline below contains the latest cancellation update.",
      Icon: XCircle,
    },
    returned: {
      title: "This order was returned",
      text: "The activity timeline below contains the latest return updates.",
      Icon: RotateCcw,
    },
    refunded: {
      title: "This order was refunded",
      text: "The activity timeline below contains the latest refund updates.",
      Icon: CheckCircle2,
    },
  };

  const item = config[status] || config.cancelled;

  return (
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#C8A44D]/20 bg-[#fffaf0] p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#C8A44D]/20 bg-[#C8A44D]/[0.06]">
        <item.Icon className="h-4 w-4 text-[#C8A44D]" />
      </div>

      <div>
        <h3 className="font-serif text-lg text-[#9B7625]">{item.title}</h3>
        <p className="mt-1 text-xs leading-5 text-[#6b5a3a]">{item.text}</p>
      </div>
    </div>
  );
}
