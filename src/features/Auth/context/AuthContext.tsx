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
) {

  const normalizedPhone =
    normalizePhone(
      phone
    );

  if (!normalizedPhone) {

    return null;

  }

  try {

    const customer =
      await getCustomerByPhone(
        normalizedPhone
      );

    return customer;

  } catch (
    error
  ) {

    console.error(
      "Failed to fetch customer:",
      error
    );

    return null;

  }

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
   *
   * THIS is what AuthDialog calls after the test OTP.
   *
   * It updates React state immediately.
   * =======================================================
   */

  async function loginWithPhone(
    phone: string
  ) {

    const normalizedPhone =
      normalizePhone(
        phone
      );


    if (!normalizedPhone) {

      return null;

    }


    if (
      isTestAuthEnabled
    ) {

      /*
       * Save test login.
       */

      localStorage.setItem(
        "tnm_test_phone",
        normalizedPhone
      );


      /*
       * Fetch customer.
       */

      const customerData =
        await fetchCustomer(
          normalizedPhone
        );


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
         * MOST IMPORTANT:
         *
         * This immediately updates every component
         * using useAuth().
         */

        setCustomer(
          customerData
        );

      }


      return customerData;

    }


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

          }

          return;

        }


        /*
         * No test phone = logged out.
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
     * Test mode deliberately ignores Supabase auth.
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
           *
           * The test login is controlled by
           * loginWithPhone(), not Supabase.
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
     * Clear test authentication.
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
       * Also clear any old Supabase session.
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
     * Real logout.
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
   * =======================================================
   * PROVIDER
   * =======================================================
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