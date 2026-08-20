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
 * TEMPORARY
 *
 * Real OTP authentication is intentionally disabled
 * while we are testing the customer login flow.
 *
 * IMPORTANT:
 *
 * We are NOT using import.meta.env.DEV here because
 * the mobile browser may be accessing a production build
 * or another environment where DEV = false.
 *
 * Once testing is complete, change this back to false
 * and implement real OTP authentication.
 *
 * =========================================================
 */

const isTestAuthEnabled = true;


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
 * FETCH CUSTOMER
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
   * This directly calls the customer service.
   *
   * We do NOT swallow errors here.
   */

  const customer =
    await getCustomerByPhone(
      normalizedPhone
    );


  return customer as Customer | null;

}


/*
 * =========================================================
 * AUTH PROVIDER
 * =========================================================
 */

export function AuthProvider({

  children,

}: {

  children: React.ReactNode;

}) {


  /*
   * =======================================================
   * STATE
   * =======================================================
   */

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
   * LOGIN WITH PHONE
   * =======================================================
   */

  async function loginWithPhone(
    phone: string
  ): Promise<Customer | null> {

    const normalizedPhone =
      normalizePhone(
        phone
      );


    /*
     * Invalid phone
     */

    if (
      !normalizedPhone
    ) {

      return null;

    }


    /*
     * =====================================================
     * TEST LOGIN
     * =====================================================
     *
     * TEMPORARY:
     *
     * No real OTP authentication.
     *
     * We directly look up the customer.
     * =====================================================
     */

    if (
      isTestAuthEnabled
    ) {

      console.log(
        "[T&M AUTH] TEST LOGIN"
      );


      console.log(
        "[T&M AUTH] Phone:",
        normalizedPhone
      );


      /*
       * Save test login.
       */

      localStorage.setItem(
        "tnm_test_phone",
        normalizedPhone
      );


      /*
       * Fetch active customer.
       */

      const customerData =
        await fetchCustomer(
          normalizedPhone
        );


      /*
       * Existing customer found.
       */

      if (
        customerData
      ) {

        console.log(
          "[T&M AUTH] CUSTOMER FOUND ✅"
        );


        console.log(
          "[T&M AUTH] Customer ID:",
          customerData.id
        );


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
         * Immediately update global React state.
         *
         * This makes the header/account UI update
         * without refreshing the page.
         */

        setCustomer(
          customerData
        );


        return customerData;

      }


      /*
       * No customer found.
       */

      console.log(
        "[T&M AUTH] CUSTOMER NOT FOUND ❌"
      );


      return null;

    }


    /*
     * =====================================================
     * REAL AUTH
     * =====================================================
     *
     * This will be implemented when real OTP
     * authentication is enabled.
     * =====================================================
     */

    return null;

  }


  /*
   * =======================================================
   * LOAD SESSION
   * =======================================================
   */

  async function loadSession() {

    try {

      /*
       * =====================================================
       * TEST AUTH
       * =====================================================
       */

      if (
        isTestAuthEnabled
      ) {

        const testPhone =
          getTestPhone();


        /*
         * No saved test login.
         */

        if (
          !testPhone
        ) {

          setCustomer(
            null
          );


          localStorage.removeItem(
            "tnm_customer"
          );


          return;

        }


        /*
         * Fetch existing customer.
         */

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
           * Saved phone no longer has
           * an active customer.
           */

          setCustomer(
            null
          );


          localStorage.removeItem(
            "tnm_customer"
          );

        }


        return;

      }


      /*
       * =====================================================
       * REAL SUPABASE AUTH
       * =====================================================
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
     * Supabase auth listener.
     *
     * Test authentication does NOT depend on this.
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
           * TEST AUTH
           *
           * Ignore Supabase auth events.
           */

          if (
            isTestAuthEnabled
          ) {

            return;

          }


          /*
           * =================================================
           * REAL AUTH
           * =================================================
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

      /*
       * Remove test login.
       */

      localStorage.removeItem(
        "tnm_test_phone"
      );


      localStorage.removeItem(
        "tnm_customer"
      );


      /*
       * Immediately clear React state.
       */

      setCustomer(
        null
      );


      /*
       * Clear any accidental Supabase session too.
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