import {
  create,
} from "zustand";

import {
  persist,
} from "zustand/middleware";

import {
  supabase,
} from "@/shared/lib/supabase";


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

  isCartOpen: boolean;


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

        isCartOpen: false,


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
                      item.productId

                        ? {

                            ...cartItem,

                            quantity:
                              requestedQuantity,

                            stock,

                          }

                        : cartItem
                  ),

              });


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
                "Coupon removed because minimum order value is not met",

            });


            return;

          }


          set({

            items:
              updatedItems,

          });

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
                  "Coupon removed because minimum order value is not met",

              });

            } else {

              set({

                items:
                  updatedItems,

              });

            }


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
                  "Coupon removed because minimum order value is not met",

              });

            } else {

              set({

                items:
                  updatedItems,

              });

            }


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
      }

    )

  );