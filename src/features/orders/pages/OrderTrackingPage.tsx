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

export default function OrderTrackingPage() {
  const { customer } = useAuth();

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<OrderTrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [guestEmail, setGuestEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailEditorOpen, setEmailEditorOpen] = useState(false);
  const [keepAsPermanentEmail, setKeepAsPermanentEmail] = useState(false);

  const isLoggedIn = Boolean(customer);

  useEffect(() => {
    if (!result) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [result]);

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
      setEmailEditorOpen(false);
      setKeepAsPermanentEmail(false);
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

  function closeTracking() {
    setResult(null);
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
      await saveOrderEmail({
        orderNumber: result.order.order_number,
        email,
        phone:
          phone ||
          customer?.phone ||
          (result.order as typeof result.order & {
            customer_phone?: string | null;
            shipping_phone?: string | null;
          }).customer_phone ||
          (result.order as typeof result.order & {
            customer_phone?: string | null;
            shipping_phone?: string | null;
          }).shipping_phone ||
          null,
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

  return (
    <main className="min-h-[calc(100dvh-80px)] bg-[#090909] text-white">
      <div className="relative isolate min-h-[calc(100dvh-80px)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(200,164,77,0.10),transparent_48%)]" />

        {/* Small search dialog */}
        <div className="relative flex min-h-[calc(100dvh-80px)] items-center justify-center px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-[470px] rounded-[26px] border border-white/10 bg-[#11110f]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.55)] backdrop-blur-xl sm:p-7"
          >
            <div className="flex justify-center">
              <img
                src={logo}
                alt="T&M Jewels"
                className="h-auto w-24 object-contain"
              />
            </div>

            <div className="mt-6 text-center">
              <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-[#C8A44D]/25 bg-[#C8A44D]/[0.07] px-3.5 py-1.5 text-[10px] tracking-[0.18em] text-[#C8A44D]">
                <ShieldCheck className="h-3.5 w-3.5" />
                SECURE ORDER TRACKING
              </div>

              <h1 className="font-serif text-3xl tracking-tight">
                Track your <span className="text-[#C8A44D]">order</span>
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-5 text-white/45">
                Enter your order number to see its latest status and activity.
              </p>
            </div>

            <form onSubmit={submit} className="mt-7">
              <label className="mb-2 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
                Order Number
              </label>

              <div className="relative">
                <Package className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C8A44D]" />
                <input
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g. TNM-1024"
                  autoComplete="off"
                  className="h-13 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-[#C8A44D]/60"
                />
              </div>

              {!isLoggedIn && (
                <>
                  <label className="mb-2 mt-4 block text-[10px] font-medium uppercase tracking-[0.14em] text-white/45">
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
                      className="h-13 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 text-sm outline-none transition placeholder:text-white/25 focus:border-[#C8A44D]/60"
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
                    className="overflow-hidden rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3.5 py-2.5 text-xs text-red-200"
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

            <div className="mt-4 flex justify-center items-center gap-2 text-[10px] text-white/25">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your order details are protected.
            </div>
          </motion.div>
        </div>

        {/* Timeline dialog */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 z-[1200] flex h-[100dvh] w-full items-center justify-center bg-black/75 p-0 backdrop-blur-md sm:p-5 md:p-8"
              role="dialog"
              aria-modal="true"
              aria-label={`Order ${result.order.order_number} tracking`}
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) closeTracking();
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.985 }}
                transition={{ duration: 0.28, ease: "easeOut" }}
                className="flex max-h-[calc(100dvh-32px)] w-full max-w-[620px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#11110f] shadow-[0_30px_100px_rgba(0,0,0,0.7)] sm:max-h-[calc(100dvh-48px)]"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                  <button
                    type="button"
                    onClick={closeTracking}
                    className="inline-flex items-center gap-2 text-xs text-white/45 transition hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Track another order
                  </button>

                  <button
                    type="button"
                    onClick={closeTracking}
                    aria-label="Close order tracking"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="min-h-0 overflow-y-auto overscroll-contain">
                  <div className="px-5 py-6 sm:px-7 sm:py-7">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#C8A44D]">
                        Order #{result.order.order_number}
                      </p>

                      <h2 className="mt-2 font-serif text-2xl sm:text-3xl">
                        {getStatusHeading(result.order.order_status)}
                      </h2>

                      <p className="mt-1 text-xs text-white/35">
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
                              className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4 text-left"
                            >
                              <div className="flex items-center gap-3">
                                <motion.div
                                  initial={{ scale: 0.7 }}
                                  animate={{ scale: 1 }}
                                  transition={{ duration: 0.35 }}
                                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10"
                                >
                                  <Mail size={17} className="text-green-400" />
                                </motion.div>

                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium text-white">
                                    Email updates
                                  </p>

                                  <p className="mt-1 break-all text-xs text-white/45">
                                    Order updates will be sent to{" "}
                                    <span className="font-medium text-white/70">
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
                                  className="shrink-0 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/65 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#C8A44D]/50 hover:text-white hover:shadow-sm"
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
                                      name="tracking-page-email-scope"
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
                                      name="tracking-page-email-scope"
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
                                    className="mt-2 overflow-hidden text-xs text-red-400"
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
                        className="mt-5 rounded-2xl border border-green-500/20 bg-green-500/[0.06] p-4 text-left"
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

                    <section className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-serif text-xl">
                            Order activity
                          </h3>
                          <p className="mt-1 text-[11px] text-white/30">
                            Latest updates from your order.
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#C8A44D]/20 bg-[#C8A44D]/[0.06]">
                          <Clock3 className="h-4 w-4 text-[#C8A44D]" />
                        </div>
                      </div>

                      <div className="mt-6">
                        {result.activities.length === 0 ? (
                          <p className="text-sm text-white/40">
                            Your order activity will appear here as updates
                            are made.
                          </p>
                        ) : (
                          result.activities.map((activity, index) => (
                            <ActivityRow
                              key={activity.id}
                              activity={activity}
                              last={
                                index === result.activities.length - 1
                              }
                            />
                          ))
                        )}
                      </div>
                    </section>

                    {result.order.tracking_number && (
                      <div className="mt-4 rounded-2xl border border-[#C8A44D]/20 bg-[#C8A44D]/[0.05] px-4 py-3.5">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <p className="text-[9px] uppercase tracking-[0.14em] text-white/35">
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
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}

function StatusTracker({ status }: { status: string }) {
  const currentIndex = getStepIndex(status);

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 px-3 py-6 sm:px-5">
      <div className="relative flex min-w-0 justify-between">
        <div className="absolute left-[10%] right-[10%] top-5 h-px bg-white/10" />

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
                animate={{
                  scale: active ? 1.06 : 1,
                }}
                className={[
                  "flex h-10 w-10 items-center justify-center rounded-full border",
                  complete
                    ? "border-[#C8A44D] bg-[#C8A44D] text-black"
                    : "border-white/10 bg-[#111] text-white/25",
                ].join(" ")}
              >
                <Icon className="h-4 w-4" />
              </motion.div>

              <p
                className={[
                  "mt-2 text-[9px] leading-4 sm:text-[11px]",
                  active ? "text-[#C8A44D]" : "text-white/35",
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
          <div className="my-1 min-h-7 w-px flex-1 bg-white/10" />
        )}
      </div>

      <div className="min-w-0 pb-6">
        <p className="text-sm font-medium">{activity.title}</p>

        {activity.description && (
          <p className="mt-1 text-xs leading-5 text-white/40">
            {activity.description}
          </p>
        )}

        <p className="mt-1.5 text-[10px] text-white/25">
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
    <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
        <item.Icon className="h-4 w-4 text-[#C8A44D]" />
      </div>

      <div>
        <h3 className="font-serif text-lg">{item.title}</h3>
        <p className="mt-1 text-xs leading-5 text-white/40">{item.text}</p>
      </div>
    </div>
  );
}
