import {
  create,
} from "zustand";

import {
  persist,
} from "zustand/middleware";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  getCustomerByPhone,
} from "@/features/customers/services/customer.service";


/*
 * =========================================================
 * CART ITEM
 * =========================================================
 */

export interface CartItem {

  id: string;

  productId: string;

  name: string;

  price: number;

  image?: string;

  quantity: number;

  /**
   * Selected ring size.
   * null/undefined for non-ring products.
   */
  ringSize?: string | null;

  /*
   * Latest database stock.
   *
   * null means stock has not been checked yet.
   * Infinity means inventory tracking is disabled.
   */

  stock: number | null;

}


/*
 * =========================================================
 * APPLIED COUPON
 * =========================================================
 */

export interface AppliedCoupon {

  id: string;

  code: string;

  title?: string;

  discount: number;

  freeShipping: boolean;

  freeGift: boolean;

  minimumOrderAmount: number;

}


/*
 * =========================================================
 * CART STORE
 * =========================================================
 */

interface CartStore {

  items: CartItem[];

  /** Customer ID whose server cart is currently loaded. */
  cartOwnerId: string | null;

  isCartOpen: boolean;


  // Gift Wrap

  giftWrapSelected: boolean;

  giftMessage: string;

  setGiftWrapSelected: (
    selected: boolean
  ) => void;

  setGiftMessage: (
    message: string
  ) => void;

  clearGiftWrap: () => void;


  // Coupon

  appliedCoupon:
    AppliedCoupon | null;

  discount: number;

  couponErrorMessage: string;


  // Stock

  stockErrorMessage: string;

  isStockChecking: boolean;


  /*
   * Cart actions
   */

  addItem: (
    item: CartItem
  ) => Promise<boolean>;


  removeItem: (
    id: string
  ) => void;


  updateQuantity: (
    id: string,
    quantity: number
  ) => Promise<boolean>;


  /*
   * Stock refresh
   */

  refreshCartStock: () => Promise<void>;


  clearCart: () => void;


  openCart: () => void;

  closeCart: () => void;


  /*
   * Totals
   */

  getTotal: () => number;

  getFinalTotal: () => number;

  getCartCount: () => number;


  /*
   * Coupon
   */

  applyCoupon: (
    coupon: AppliedCoupon
  ) => void;

  removeCoupon: () => void;

  clearCouponMessage: () => void;


  /*
   * Stock message
   */

  clearStockError: () => void;

}


/*
 * =========================================================
 * GET PRODUCT STOCK
 * =========================================================
 *
 * Fetches the CURRENT stock directly from Supabase.
 *
 * This is intentionally not based on the product data that
 * was originally loaded into the product card.
 * =========================================================
 */

const getProductStock = async (
  productId: string
): Promise<number | null> => {

  const {
    data,
    error,
  } = await supabase

    .from("products")

    .select(
      "stock, track_inventory, status"
    )

    .eq(
      "id",
      productId
    )

    .maybeSingle();


  if (error) {

    console.error(
      "Failed to fetch product stock:",
      error
    );

    return null;

  }


  if (!data) {

    return null;

  }


  /*
   * Inventory tracking disabled.
   *
   * In this case there is no quantity limit.
   */

  if (
    data.track_inventory === false
  ) {

    return Infinity;

  }


  return Math.max(
    Number(
      data.stock ?? 0
    ),
    0
  );

};


/*
 * =========================================================
 * SUPABASE CART SYNC
 * =========================================================
 */

function normalizePhone(
  phone?: string | null
) {

  if (!phone) {

    return "";

  }

  return phone
    .replace(/\D/g, "")
    .slice(-10);

}


async function getCustomerIdFromSession(
  phone?: string | null
): Promise<string | null> {

  const normalizedPhone =
    normalizePhone(phone);

  if (!normalizedPhone) {

    return null;

  }

  try {

    const customer =
      await getCustomerByPhone(
        normalizedPhone
      );

    return customer?.id ?? null;

  } catch (error) {

    console.error(
      "Failed to resolve customer for cart sync:",
      error
    );

    return null;

  }

}


async function getOrCreateCart(
  customerId: string
): Promise<string | null> {

  const {
    data: existingCart,
    error: existingError,
  } =
    await supabase
      .from("carts")
      .select("id")
      .eq("customer_id", customerId)
      .maybeSingle();

  if (existingError) {

    console.error(
      "Failed to load customer cart:",
      existingError
    );

    return null;

  }

  if (existingCart?.id) {

    return existingCart.id;

  }

  const {
    data: newCart,
    error: createError,
  } =
    await supabase
      .from("carts")
      .insert({
        customer_id: customerId,
      })
      .select("id")
      .single();

  if (createError) {

    console.error(
      "Failed to create customer cart:",
      createError
    );

    return null;

  }

  return newCart?.id ?? null;

}


async function loadCustomerCart(
  customerId: string
): Promise<CartItem[] | null> {

  const cartId =
    await getOrCreateCart(
      customerId
    );

  if (!cartId) {

    return null;

  }

  const {
    data,
    error,
  } =
    await supabase
      .from("cart_items")
      .select(
        "id, product_id, product_name, product_image, price, quantity, ring_size"
      )
      .eq("cart_id", cartId)
      .order("created_at", {
        ascending: true,
      });

  if (error) {

    console.error(
      "Failed to load customer cart items:",
      error
    );

    return null;

  }

  return (data ?? []).map(
    (item) => ({

      id:
        item.id,

      productId:
        item.product_id,

      name:
        item.product_name,

      price:
        Number(
          item.price
        ),

      image:
        item.product_image ??
        undefined,

      quantity:
        Math.max(
          Number(
            item.quantity
          ),
          1
        ),

      ringSize:
        item.ring_size ??
        null,

      stock:
        null,

    })
  );

}


function mergeCartItems(
  serverItems: CartItem[],
  localItems: CartItem[]
): CartItem[] {

  const merged =
    serverItems.map(
      (item) => ({
        ...item,
      })
    );

  localItems.forEach(
    (localItem) => {

      const existing =
        merged.find(
          (item) =>
            item.productId ===
              localItem.productId &&
            (item.ringSize ?? null) ===
              (localItem.ringSize ?? null)
        );

      if (existing) {

        existing.quantity +=
          localItem.quantity;

        return;

      }

      merged.push({

        ...localItem,

        id:
          localItem.id,

        stock:
          null,

      });

    }
  );

  return merged;

}


async function saveCustomerCart(
  customerId: string,
  items: CartItem[]
): Promise<boolean> {

  const cartId =
    await getOrCreateCart(
      customerId
    );

  if (!cartId) {

    return false;

  }

  const {
    data: existingItems,
    error: existingError,
  } =
    await supabase
      .from("cart_items")
      .select(
        "id, product_id, ring_size"
      )
      .eq("cart_id", cartId);

  if (existingError) {

    console.error(
      "Failed to read customer cart items:",
      existingError
    );

    return false;

  }

  const itemsToDelete =
    (existingItems ?? []).filter(
      (existingItem) =>
        !items.some(
          (item) =>
            item.productId ===
              existingItem.product_id &&
            (item.ringSize ?? null) ===
              (existingItem.ring_size ?? null)
        )
    );

  if (itemsToDelete.length > 0) {

    const idsToDelete =
      itemsToDelete.map(
        (item) =>
          item.id
      );

    const {
      error: deleteError,
    } =
      await supabase
        .from("cart_items")
        .delete()
        .in(
          "id",
          idsToDelete
        );

    if (deleteError) {

      console.error(
        "Failed to remove old customer cart items:",
        deleteError
      );

      return false;

    }

  }

  for (const item of items) {

    const existing =
      (existingItems ?? []).find(
        (existingItem) =>
          existingItem.product_id ===
            item.productId &&
          (existingItem.ring_size ?? null) ===
            (item.ringSize ?? null)
      );

    if (existing) {

      const {
        error,
      } =
        await supabase
          .from("cart_items")
          .update({

            product_name:
              item.name,

            product_image:
              item.image ??
              null,

            price:
              item.price,

            quantity:
              item.quantity,

            ring_size:
              item.ringSize ??
              null,

          })
          .eq(
            "id",
            existing.id
          );

      if (error) {

        console.error(
          "Failed to update customer cart item:",
          error
        );

        return false;

      }

    } else {

      const {
        error,
      } =
        await supabase
          .from("cart_items")
          .insert({

            cart_id:
              cartId,

            product_id:
              item.productId,

            product_name:
              item.name,

            product_image:
              item.image ??
              null,

            price:
              item.price,

            quantity:
              item.quantity,

            ring_size:
              item.ringSize ??
              null,

          });

      if (error) {

        console.error(
          "Failed to add customer cart item:",
          error
        );

        return false;

      }

    }

  }

  return true;

}


async function syncCurrentCustomerCart() {

  try {

    const {
      data,
    } =
      await supabase.auth.getSession();

    const session =
      data.session;

    if (!session?.user) {

      return;

    }

    const customerId =
      await getCustomerIdFromSession(
        session.user.phone
      );

    if (!customerId) {

      return;

    }

    const {
      items,
    } =
      useCartStore.getState();

    await saveCustomerCart(
      customerId,
      items
    );

  } catch (error) {

    console.error(
      "Failed to synchronize customer cart:",
      error
    );

  }

}


async function synchronizeCartForSession(
  phone?: string | null
) {

  const customerId =
    await getCustomerIdFromSession(
      phone
    );

  if (!customerId) {

    return;

  }

  const state =
    useCartStore.getState();

  const localItems =
    state.cartOwnerId === customerId
      ? []
      : state.items;

  const serverItems =
    await loadCustomerCart(
      customerId
    );

  if (serverItems === null) {

    return;

  }

  let finalItems =
    serverItems;

  /*
   * If this is a different customer, or the
   * current cart is a guest cart, merge it
   * into the customer's server cart.
   */

  if (
    state.cartOwnerId !==
    customerId &&
    localItems.length > 0
  ) {

    finalItems =
      mergeCartItems(
        serverItems,
        localItems
      );

    const saved =
      await saveCustomerCart(
        customerId,
        finalItems
      );

    if (!saved) {

      return;

    }

  }

  useCartStore.setState({

    items:
      finalItems,

    cartOwnerId:
      customerId,

  });

}


let cartAuthListenerStarted =
  false;


function startCartAuthListener() {

  if (
    cartAuthListenerStarted
  ) {

    return;

  }

  cartAuthListenerStarted =
    true;

  supabase.auth.onAuthStateChange(
    (
      event,
      session
    ) => {

      /*
       * Defer database work until after the
       * auth event callback has completed.
       */

      setTimeout(
        async () => {

          /*
           * Only clear the cart on an actual sign-out.
           *
           * A null session can also occur while the app is
           * initializing as a guest. In that case the persisted
           * Zustand guest cart must remain intact.
           */
          if (event === "SIGNED_OUT") {

            useCartStore.setState({

              items: [],

              cartOwnerId:
                null,

            });

            return;

          }

          /*
           * No authenticated session = valid guest state.
           * Do not clear the persisted guest cart.
           */
          if (!session) {
            return;
          }

          await synchronizeCartForSession(
            session.user.phone
          );

        },
        0
      );

    }
  );

}


/*
 * =========================================================
 * STORE
 * =========================================================
 */

export const useCartStore =
  create<CartStore>()(

    persist(

      (set, get) => ({

        /*
         * ===================================================
         * INITIAL STATE
         * ===================================================
         */

        items: [],

        cartOwnerId: null,

        isCartOpen: false,


        giftWrapSelected: false,

        giftMessage: "",


        appliedCoupon: null,

        discount: 0,

        couponErrorMessage: "",


        stockErrorMessage: "",

        isStockChecking: false,


        /*
         * ===================================================
         * ADD ITEM
         * ===================================================
         */

        addItem: async (
          item
        ) => {

          set({

            isStockChecking: true,

            stockErrorMessage: "",

          });


          try {

            /*
             * Get latest database stock.
             */

            const stock =
              await getProductStock(
                item.productId
              );


            /*
             * Could not retrieve stock.
             */

            if (
              stock === null
            ) {

              set({

                stockErrorMessage:
                  "We couldn't check product availability. Please try again.",

              });

              return false;

            }


            /*
             * Out of stock.
             */

            if (
              stock <= 0
            ) {

              set({

                stockErrorMessage:
                  "This product is currently out of stock.",

              });

              return false;

            }


            /*
             * Find existing cart item.
             */

            const existingItem =
              get().items.find(
                (cartItem) =>
                  cartItem.productId ===
                  item.productId
              );


            const currentQuantity =
              existingItem?.quantity ?? 0;


            const requestedQuantity =
              currentQuantity +
              item.quantity;


            /*
             * Check against latest stock.
             *
             * Infinity means inventory tracking
             * is disabled.
             */

            if (
              stock !== Infinity &&
              requestedQuantity > stock
            ) {

              const message =
                stock === 1

                  ? "Only 1 available in stock."

                  : `Only ${stock} available in stock.`;


              set({

                stockErrorMessage:
                  message,

              });


              /*
               * Also keep the cart item's cached
               * stock up to date.
               */

              if (existingItem) {

                set({

                  items:
                    get().items.map(
                      (cartItem) =>
                        cartItem.productId ===
                        item.productId

                          ? {
                              ...cartItem,
                              stock,
                            }

                          : cartItem
                    ),

                });

              }


              return false;

            }


            /*
             * Existing product.
             */

            if (existingItem) {

              set({

                items:
                  get().items.map(
                    (cartItem) =>
                      cartItem.productId ===
                          item.productId &&
                      (cartItem.ringSize ?? null) ===
                          (item.ringSize ?? null)

                        ? {

                            ...cartItem,

                            quantity:
                              requestedQuantity,

                            stock,

                          }

                        : cartItem
                  ),

              });

              void syncCurrentCustomerCart();

              return true;

            }


            /*
             * New product.
             */

            set({

              items: [

                ...get().items,

                {

                  ...item,

                  quantity:
                    item.quantity,

                  stock,

                },

              ],

            });

            void syncCurrentCustomerCart();

            return true;

          } finally {

            set({

              isStockChecking:
                false,

            });

          }

        },


        /*
         * ===================================================
         * REMOVE ITEM
         * ===================================================
         */

        removeItem: (
          id
        ) => {

          const updatedItems =
            get().items.filter(
              (item) =>
                item.id !== id
            );


          const coupon =
            get().appliedCoupon;


          const newTotal =
            updatedItems.reduce(
              (
                total,
                item
              ) =>
                total +
                item.price *
                  item.quantity,
              0
            );


          /*
           * Remove coupon if minimum
           * order amount is no longer met.
           */

          if (
            coupon &&
            coupon.minimumOrderAmount &&
            newTotal <
              coupon.minimumOrderAmount
          ) {

            set({

              items:
                updatedItems,

              appliedCoupon:
                null,

              discount:
                0,

              couponErrorMessage:
                "",

            });

            void syncCurrentCustomerCart();

            return;

          }


          set({

            items:
              updatedItems,

          });

          void syncCurrentCustomerCart();

        },


        /*
         * ===================================================
         * UPDATE QUANTITY
         * ===================================================
         */

        updateQuantity: async (
          id,
          quantity
        ) => {

          /*
           * Quantity can never be zero here.
           *
           * Removing an item is handled separately.
           */

          if (
            quantity <= 0
          ) {

            return false;

          }


          const existingItem =
            get().items.find(
              (item) =>
                item.id === id
            );


          if (!existingItem) {

            return false;

          }


          /*
           * =================================================
           * DECREASE QUANTITY
           * =================================================
           *
           * No database request is needed when decreasing.
           * This makes -1 feel instant.
           * =================================================
           */

          if (
            quantity <
            existingItem.quantity
          ) {

            const updatedItems =
              get().items.map(
                (item) =>
                  item.id === id

                    ? {
                        ...item,
                        quantity,
                      }

                    : item
              );


            const coupon =
              get().appliedCoupon;


            const newTotal =
              updatedItems.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.price *
                    item.quantity,
                0
              );


            if (
              coupon &&
              coupon.minimumOrderAmount &&
              newTotal <
                coupon.minimumOrderAmount
            ) {

              set({

                items:
                  updatedItems,

                appliedCoupon:
                  null,

                discount:
                  0,

                couponErrorMessage:
                  "",

              });

            } else {

              set({

                items:
                  updatedItems,

              });

            }

            void syncCurrentCustomerCart();

            return true;

          }


          /*
           * =================================================
           * INCREASE QUANTITY
           * =================================================
           */

          set({

            isStockChecking:
              true,

            stockErrorMessage:
              "",

          });


          try {

            /*
             * Always get latest database stock.
             */

            const stock =
              await getProductStock(
                existingItem.productId
              );


            /*
             * Could not retrieve stock.
             */

            if (
              stock === null
            ) {

              set({

                stockErrorMessage:
                  "We couldn't check product availability. Please try again.",

              });


              return false;

            }


            /*
             * Update cached stock even if
             * quantity cannot be increased.
             */

            const latestItems =
              get().items.map(
                (item) =>
                  item.id === id

                    ? {
                        ...item,
                        stock,
                      }

                    : item
              );


            /*
             * Product is now out of stock.
             */

            if (
              stock <= 0
            ) {

              set({

                items:
                  latestItems,

                stockErrorMessage:
                  "This product is currently out of stock.",

              });


              return false;

            }


            /*
             * Requested quantity exceeds stock.
             */

            if (
              stock !== Infinity &&
              quantity > stock
            ) {

              /*
               * If the current quantity itself is
               * now higher than database stock,
               * automatically correct it.
               */

              const correctedQuantity =
                Math.min(
                  existingItem.quantity,
                  stock
                );


              const message =
                stock === 1

                  ? "Only 1 available in stock."

                  : `Only ${stock} available in stock.`;


              set({

                items:
                  latestItems.map(
                    (item) =>
                      item.id === id

                        ? {
                            ...item,

                            quantity:
                              correctedQuantity,

                          }

                        : item
                  ),

                stockErrorMessage:
                  message,

              });


              return false;

            }


            /*
             * Update quantity normally.
             */

            const updatedItems =
              latestItems.map(
                (item) =>
                  item.id === id

                    ? {

                        ...item,

                        quantity,

                        stock,

                      }

                    : item
              );


            const coupon =
              get().appliedCoupon;


            const newTotal =
              updatedItems.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  item.price *
                    item.quantity,
                0
              );


            if (
              coupon &&
              coupon.minimumOrderAmount &&
              newTotal <
                coupon.minimumOrderAmount
            ) {

              set({

                items:
                  updatedItems,

                appliedCoupon:
                  null,

                discount:
                  0,

                couponErrorMessage:
                  "",

              });

            } else {

              set({

                items:
                  updatedItems,

              });

            }

            void syncCurrentCustomerCart();

            return true;

          } finally {

            set({

              isStockChecking:
                false,

            });

          }

        },


        /*
         * ===================================================
         * REFRESH ALL CART STOCK
         * ===================================================
         *
         * Called whenever the cart drawer opens.
         *
         * This is important because stock can change while
         * the customer is browsing.
         * ===================================================
         */

        refreshCartStock:
          async () => {

            const currentItems =
              get().items;


            if (
              currentItems.length === 0
            ) {

              return;

            }


            set({

              isStockChecking:
                true,

              stockErrorMessage:
                "",

            });


            try {

              const results =
                await Promise.all(

                  currentItems.map(
                    async (item) => {

                      const stock =
                        await getProductStock(
                          item.productId
                        );


                      return {
                        item,
                        stock,
                      };

                    }
                  )

                );


              let hasStockAdjustment =
                false;


              let stockMessage =
                "";


              const updatedItems =
                results.map(
                  ({
                    item,
                    stock,
                  }) => {

                    /*
                     * If the product couldn't be
                     * checked, leave the previous
                     * cached stock unchanged.
                     */

                    if (
                      stock === null
                    ) {

                      return item;

                    }


                    /*
                     * Product is now completely
                     * out of stock.
                     */

                    if (
                      stock <= 0
                    ) {

                      hasStockAdjustment =
                        true;


                      if (
                        !stockMessage
                      ) {

                        stockMessage =
                          `${item.name} is currently out of stock.`;
                      }


                      return {

                        ...item,

                        stock: 0,

                        quantity: 0,

                      };

                    }


                    /*
                     * Stock is lower than the
                     * current cart quantity.
                     */

                    if (
                      stock !== Infinity &&
                      item.quantity > stock
                    ) {

                      hasStockAdjustment =
                        true;


                      if (
                        !stockMessage
                      ) {

                        stockMessage =
                          `Only ${stock} available for ${item.name}.`;
                      }


                      return {

                        ...item,

                        stock,

                        quantity:
                          stock,

                      };

                    }


                    /*
                     * Stock is sufficient.
                     */

                    return {

                      ...item,

                      stock,

                    };

                  }
                );


              /*
               * Remove items whose stock became zero.
               */

              const finalItems =
                updatedItems.filter(
                  (item) =>
                    item.quantity > 0
                );


              set({

                items:
                  finalItems,

                stockErrorMessage:
                  hasStockAdjustment
                    ? stockMessage
                    : "",

              });

              if (hasStockAdjustment) {

                void syncCurrentCustomerCart();

              }

            } finally {

              set({

                isStockChecking:
                  false,

              });

            }

          },


        /*
         * ===================================================
         * CLEAR CART
         * ===================================================
         */

        clearCart: () => {

          set({

            items: [],

            appliedCoupon:
              null,

            discount:
              0,

            couponErrorMessage:
              "",

            stockErrorMessage:
              "",

            giftWrapSelected:
              false,

            giftMessage:
              "",

          });

          void syncCurrentCustomerCart();

        },


        /*
         * ===================================================
         * GIFT WRAP
         * ===================================================
         */

        setGiftWrapSelected: (
          selected
        ) => {

          set({

            giftWrapSelected:
              selected,

            /*
             * A message without Gift Wrap has no meaning.
             * Clear it when Gift Wrap is turned off.
             */

            giftMessage:
              selected
                ? get().giftMessage
                : "",

          });

        },


        setGiftMessage: (
          message
        ) => {

          set({

            giftMessage:
              message,

          });

        },


        clearGiftWrap: () => {

          set({

            giftWrapSelected:
              false,

            giftMessage:
              "",

          });

        },


        /*
         * ===================================================
         * OPEN CART
         * ===================================================
         */

        openCart: () => {

          set({

            isCartOpen:
              true,

          });

        },


        /*
         * ===================================================
         * CLOSE CART
         * ===================================================
         */

        closeCart: () => {

          set({

            isCartOpen:
              false,

          });

        },


        /*
         * ===================================================
         * GET TOTAL
         * ===================================================
         */

        getTotal: () => {

          return get().items.reduce(
            (
              total,
              item
            ) =>
              total +
              item.price *
                item.quantity,
            0
          );

        },


        /*
         * ===================================================
         * GET FINAL TOTAL
         * ===================================================
         */

        getFinalTotal: () => {

          return Math.max(

            get().getTotal() -
              get().discount,

            0

          );

        },


        /*
         * ===================================================
         * GET CART COUNT
         * ===================================================
         */

        getCartCount: () => {

          return get().items.reduce(
            (
              total,
              item
            ) =>
              total +
              item.quantity,
            0
          );

        },


        /*
         * ===================================================
         * APPLY COUPON
         * ===================================================
         */

        applyCoupon: (
          coupon
        ) => {

          set({

            appliedCoupon:
              coupon,

            discount:
              coupon.discount,

            couponErrorMessage:
              "",

          });

        },


        /*
         * ===================================================
         * REMOVE COUPON
         * ===================================================
         */

        removeCoupon: () => {

          set({

            appliedCoupon:
              null,

            discount:
              0,

            couponErrorMessage:
              "",

          });

        },


        /*
         * ===================================================
         * CLEAR COUPON MESSAGE
         * ===================================================
         */

        clearCouponMessage: () => {

          set({

            couponErrorMessage:
              "",

          });

        },


        /*
         * ===================================================
         * CLEAR STOCK ERROR
         * ===================================================
         */

        clearStockError: () => {

          set({

            stockErrorMessage:
              "",

          });

        },

      }),

      {
        name:
          "tnm-cart",

        /*
         * Clear any legacy coupon-removal message that may
         * still exist in persisted Zustand state.
         *
         * Coupon minimum-order handling is now silent so
         * useUnlockCoupon can show the proper unlock offer.
         */
        onRehydrateStorage: () => {
          return () => {
            useCartStore.setState({
              couponErrorMessage: "",
            });
          };
        },
      }

    )

  );

/*
 * =========================================================
 * START AUTH-BASED CART SYNCHRONIZATION
 * =========================================================
 *
 * This keeps the Zustand cart and the customer's Supabase
 * cart connected without changing the existing cart UI.
 * =========================================================
 */

startCartAuthListener();
