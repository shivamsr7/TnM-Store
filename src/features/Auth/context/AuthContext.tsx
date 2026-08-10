import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/shared/lib/supabase";

import {
  getCustomerByPhone,
} from "@/features/customers/services/customer.service";


/*
 * =========================================================
 * CUSTOMER
 * =========================================================
 */

export interface Customer {

  id: string;

  first_name: string;

  last_name?: string | null;

  email?: string | null;

  phone?: string | null;

  avatar?: string | null;

  status?: string;

  email_verified?: boolean;

  phone_verified?: boolean;

  notes?: string | null;

  last_login_at?: string | null;

  created_at?: string;

  updated_at?: string;

  deleted_at?: string | null;

}


/*
 * =========================================================
 * AUTH CONTEXT TYPE
 * =========================================================
 */

interface AuthContextType {

  customer: Customer | null;

  loading: boolean;

  loginWithPhone: (
    phone: string
  ) => Promise<Customer | null>;

  logout: () => Promise<void>;

}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(
    undefined
  );


/*
 * =========================================================
 * TEST AUTH
 * =========================================================
 *
 * During development we are intentionally bypassing
 * real OTP authentication.
 *
 * Production will use real Supabase authentication.
 * =========================================================
 */

const isTestAuthEnabled =
  import.meta.env.DEV;


/*
 * =========================================================
 * NORMALIZE PHONE
 * =========================================================
 */

function normalizePhone(
  phone?: string | null
) {

  if (!phone) {

    return "";

  }

  return phone
    .replace(
      /\D/g,
      ""
    )
    .slice(-10);

}


/*
 * =========================================================
 * GET TEST PHONE
 * =========================================================
 */

function getTestPhone() {

  if (
    !isTestAuthEnabled
  ) {

    return "";

  }

  return normalizePhone(
    localStorage.getItem(
      "tnm_test_phone"
    )
  );

}


/*
 * =========================================================
 * LOAD CUSTOMER
 * =========================================================
 */

async function fetchCustomer(
  phone: string
): Promise<Customer | null> {

  const normalizedPhone =
    normalizePhone(
      phone
    );


  if (
    !normalizedPhone
  ) {

    return null;

  }


  /*
   * IMPORTANT:
   *
   * Do NOT swallow errors here.
   *
   * Previously an error from getCustomerByPhone()
   * was converted into null, which made a database
   * error look exactly like:
   *
   * "Customer not found"
   */

  const customer =
    await getCustomerByPhone(
      normalizedPhone
    );


  return customer as Customer | null;

}


/*
 * =========================================================
 * PROVIDER
 * =========================================================
 */

export function AuthProvider({

  children,

}: {

  children: React.ReactNode;

}) {

  const [
    customer,
    setCustomer,
  ] = useState<
    Customer | null
  >(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  /*
   * =======================================================
   * TEST LOGIN
   * =======================================================
   */

  async function loginWithPhone(
    phone: string
  ): Promise<Customer | null> {

    const normalizedPhone =
      normalizePhone(
        phone
      );


    if (
      !normalizedPhone
    ) {

      return null;

    }


    /*
     * =====================================================
     * TEST AUTH
     * =====================================================
     */

    if (
      isTestAuthEnabled
    ) {

      /*
       * Save the phone so the login survives
       * a page refresh during development.
       */

      localStorage.setItem(
        "tnm_test_phone",
        normalizedPhone
      );


      /*
       * Fetch the active customer.
       */

      const customerData =
        await fetchCustomer(
          normalizedPhone
        );


      /*
       * Customer found.
       */

      if (
        customerData
      ) {

        /*
         * Persist customer.
         */

        localStorage.setItem(
          "tnm_customer",
          JSON.stringify(
            customerData
          )
        );


        /*
         * IMPORTANT:
         *
         * Immediately update React state.
         *
         * This makes the header/account UI update
         * without requiring a refresh.
         */

        setCustomer(
          customerData
        );


        return customerData;

      }


      /*
       * Customer does not exist.
       *
       * Keep test phone stored because the profile
       * creation flow may use it.
       */

      return null;

    }


    /*
     * =====================================================
     * REAL AUTH
     * =====================================================
     *
     * Real OTP/Supabase authentication will be handled
     * through the Supabase session.
     *
     * This branch is intentionally not used while
     * development test authentication is enabled.
     * =====================================================
     */

    return null;

  }


  /*
   * =======================================================
   * INITIAL LOAD
   * =======================================================
   */

  async function loadSession() {

    try {

      /*
       * ---------------------------------------------------
       * TEST MODE
       * ---------------------------------------------------
       */

      if (
        isTestAuthEnabled
      ) {

        const testPhone =
          getTestPhone();


        if (
          testPhone
        ) {

          try {

            const customerData =
              await fetchCustomer(
                testPhone
              );


            if (
              customerData
            ) {

              localStorage.setItem(
                "tnm_customer",
                JSON.stringify(
                  customerData
                )
              );


              setCustomer(
                customerData
              );

            } else {

              /*
               * The saved test phone no longer has
               * an active customer.
               */

              setCustomer(
                null
              );


              localStorage.removeItem(
                "tnm_customer"
              );

            }

          } catch (
            error
          ) {

            /*
             * Keep the real error visible in development.
             */

            console.error(
              "Failed to load test customer:",
              error
            );


            setCustomer(
              null
            );

          }


          return;

        }


        /*
         * No test phone means logged out.
         */

        setCustomer(
          null
        );


        localStorage.removeItem(
          "tnm_customer"
        );


        return;

      }


      /*
       * ---------------------------------------------------
       * REAL SUPABASE AUTH
       * ---------------------------------------------------
       */

      const {
        data,
        error,
      } =
        await supabase.auth.getSession();


      if (
        error ||
        !data.session
      ) {

        setCustomer(
          null
        );

        return;

      }


      const phone =
        normalizePhone(
          data.session.user.phone
        );


      if (
        phone
      ) {

        const customerData =
          await fetchCustomer(
            phone
          );


        setCustomer(
          customerData
        );

      } else {

        setCustomer(
          null
        );

      }

    } catch (
      error
    ) {

      console.error(
        "Auth initialization error:",
        error
      );


      setCustomer(
        null
      );

    } finally {

      setLoading(
        false
      );

    }

  }


  /*
   * =======================================================
   * AUTH INITIALIZATION
   * =======================================================
   */

  useEffect(() => {

    let mounted = true;


    loadSession();


    /*
     * Real Supabase auth listener.
     *
     * Test mode deliberately ignores Supabase auth
     * because the development login is controlled by
     * loginWithPhone().
     */

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth.onAuthStateChange(
        async (
          event,
          session
        ) => {

          if (
            !mounted
          ) {

            return;

          }


          /*
           * TEST MODE
           */

          if (
            isTestAuthEnabled
          ) {

            return;

          }


          /*
           * REAL AUTH
           */

          if (
            event ===
              "SIGNED_OUT" ||
            !session
          ) {

            setCustomer(
              null
            );


            localStorage.removeItem(
              "tnm_customer"
            );


            return;

          }


          const phone =
            normalizePhone(
              session.user.phone
            );


          if (
            phone
          ) {

            try {

              const customerData =
                await fetchCustomer(
                  phone
                );


              if (
                mounted
              ) {

                setCustomer(
                  customerData
                );

              }

            } catch (
              error
            ) {

              console.error(
                "Failed to load authenticated customer:",
                error
              );


              if (
                mounted
              ) {

                setCustomer(
                  null
                );

              }

            }

          }

        }
      );


    return () => {

      mounted = false;

      subscription.unsubscribe();

    };

  }, []);


  /*
   * =======================================================
   * LOGOUT
   * =======================================================
   */

  async function logout() {

    /*
     * =====================================================
     * TEST LOGOUT
     * =====================================================
     */

    if (
      isTestAuthEnabled
    ) {

      localStorage.removeItem(
        "tnm_test_phone"
      );


      localStorage.removeItem(
        "tnm_customer"
      );


      setCustomer(
        null
      );


      /*
       * Also clear any existing Supabase session.
       */

      try {

        await supabase.auth.signOut();

      } catch (
        error
      ) {

        console.error(
          "Supabase logout error:",
          error
        );

      }


      return;

    }


    /*
     * =====================================================
     * REAL LOGOUT
     * =====================================================
     */

    try {

      await supabase.auth.signOut();

    } finally {

      localStorage.removeItem(
        "tnm_customer"
      );


      setCustomer(
        null
      );

    }

  }


  /*
   * =========================================================
   * PROVIDER
   * =========================================================
   */

  return (

    <AuthContext.Provider
      value={{

        customer,

        loading,

        loginWithPhone,

        logout,

      }}
    >

      {children}

    </AuthContext.Provider>

  );

}


/*
 * =========================================================
 * USE AUTH
 * =========================================================
 */

export function useAuth() {

  const context =
    useContext(
      AuthContext
    );


  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }


  return context;

}