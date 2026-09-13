import { supabase } from "@/shared/lib/supabase";

const VISITOR_KEY = "tnm_visitor_id";
const SESSION_KEY = "tnm_session_id";

export type AnalyticsEventType =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "order_placed";

interface TrackEventPayload {
  eventType?: AnalyticsEventType;
  pagePath: string;
  productId?: string | null;
  quantity?: number | null;
  referrer?: string | null;
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2)}`;
}

function getVisitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);

    if (!id) {
      id = createId("visitor");
      localStorage.setItem(VISITOR_KEY, id);
    }

    return id;
  } catch {
    return null;
  }
}

function getSessionId() {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);

    if (!id) {
      id = createId("session");
      sessionStorage.setItem(SESSION_KEY, id);
    }

    return id;
  } catch {
    return null;
  }
}

function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  if (window.innerWidth < 768) return "mobile";
  if (window.innerWidth < 1024) return "tablet";
  return "desktop";
}

class AnalyticsService {
  private visitorId: string | null = null;
  private sessionId: string | null = null;

  private init() {
    this.visitorId ??= getVisitorId();
    this.sessionId ??= getSessionId();
  }

  async trackEvent(payload: TrackEventPayload) {
    if (typeof window === "undefined") return;

    this.init();

    if (!this.visitorId || !this.sessionId) return;

    try {
      const { error } = await supabase
        .from("website_analytics_events")
        .insert({
          visitor_id: this.visitorId,
          session_id: this.sessionId,
          event_type: payload.eventType ?? "page_view",
          page_path: (
            payload.pagePath || window.location.pathname
          ).slice(0, 500),
          product_id: payload.productId ?? null,
          referrer:
            payload.referrer ??
            document.referrer?.slice(0, 1000) ??
            null,
          device_type: getDeviceType(),
        });

      if (error) {
        console.error("Analytics tracking failed:", error);
      }
    } catch (error) {
      console.error("Analytics tracking failed:", error);
    }
  }

  async trackPageView(pagePath = window.location.pathname) {
    return this.trackEvent({
      eventType: "page_view",
      pagePath,
    });
  }

  async trackProductView(
    productId: string,
    pagePath = window.location.pathname
  ) {
    if (!productId) return;

    return this.trackEvent({
      eventType: "product_view",
      pagePath,
      productId,
    });
  }

  async trackAddToCart(
    productId: string,
    quantity = 1,
    pagePath = window.location.pathname
  ) {
    if (!productId) return;

    return this.trackEvent({
      eventType: "add_to_cart",
      pagePath,
      productId,
      quantity,
    });
  }

  async trackCheckoutStarted(
    productId?: string | null,
    quantity = 1,
    pagePath = window.location.pathname
  ) {
    return this.trackEvent({
      eventType: "checkout_started",
      pagePath,
      productId: productId ?? null,
      quantity,
    });
  }

  async trackOrderPlaced(
    pagePath = window.location.pathname
  ) {
    return this.trackEvent({
      eventType: "order_placed",
      pagePath,
    });
  }

  /**
   * Updates the anonymous live-presence heartbeat.
   * The admin dashboard considers visitors active when their
   * heartbeat is newer than 2 minutes.
   */
  async trackPresence(
    pagePath = window.location.pathname,
    productId: string | null = null,
    activityType:
      | "browsing"
      | "viewing_product"
      | "add_to_cart"
      | "checkout_started"
      | "order_placed" = "browsing",
    activityLabel: string | null = null
  ) {
    if (typeof window === "undefined") return;

    this.init();

    if (!this.visitorId || !this.sessionId) return;

    try {
      const { error } = await supabase.rpc(
        "upsert_website_analytics_presence",
        {
          p_visitor_id: this.visitorId,
          p_session_id: this.sessionId,
          p_page_path: (pagePath || window.location.pathname).slice(0, 500),
          p_product_id: productId,
          p_device_type: getDeviceType(),
          p_activity_type: activityType,
          p_activity_label: activityLabel?.slice(0, 300) ?? null,
        }
      );

      if (error) {
        console.error("Live presence tracking failed:", error);
      }
    } catch (error) {
      console.error("Live presence tracking failed:", error);
    }
  }
  async trackBrowsing(
    pagePath = window.location.pathname
  ) {
    return this.trackPresence(
      pagePath,
      null,
      "browsing",
      null
    );
  }

  async trackViewingProduct(
    productId: string,
    productName?: string | null,
    pagePath = window.location.pathname
  ) {
    if (!productId) return;

    return this.trackPresence(
      pagePath,
      productId,
      "viewing_product",
      productName
        ? `Viewing ${productName}`
        : "Viewing product"
    );
  }

  async trackCartActivity(
    productId: string,
    productName?: string | null,
    quantity = 1,
    pagePath = window.location.pathname
  ) {
    if (!productId) return;

    return this.trackPresence(
      pagePath,
      productId,
      "add_to_cart",
      productName
        ? `Added ${productName} × ${quantity} to cart`
        : `Added item × ${quantity} to cart`
    );
  }

  async trackCheckoutActivity(
    productId?: string | null,
    productName?: string | null,
    quantity = 1,
    pagePath = window.location.pathname
  ) {
    return this.trackPresence(
      pagePath,
      productId ?? null,
      "checkout_started",
      productName
        ? `Started checkout with ${productName} × ${quantity}`
        : "Started checkout"
    );
  }

  async trackOrderActivity(
    orderNumber?: string | null,
    pagePath = window.location.pathname
  ) {
    return this.trackPresence(
      pagePath,
      null,
      "order_placed",
      orderNumber
        ? `Order ${orderNumber} placed`
        : "Order placed"
    );
  }
  /**
   * Refreshes the live-presence heartbeat without changing
   * the visitor's latest meaningful activity.
   */
  async refreshPresence(
    pagePath = window.location.pathname,
    productId: string | null = null
  ) {
    if (typeof window === "undefined") return;

    this.init();

    if (!this.visitorId || !this.sessionId) return;

    try {
      const { error } = await supabase.rpc(
        "refresh_website_analytics_presence",
        {
          p_visitor_id: this.visitorId,
          p_session_id: this.sessionId,
          p_page_path: (pagePath || window.location.pathname).slice(0, 500),
          p_product_id: productId,
          p_device_type: getDeviceType(),
        }
      );

      if (error) {
        console.error("Live presence refresh failed:", error);
      }
    } catch (error) {
      console.error("Live presence refresh failed:", error);
    }
  }

}

export const analyticsService = new AnalyticsService();
