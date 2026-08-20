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

  updateCustomer: (
    customer: Customer
  ) => void;

}


const AuthContext =
  createContext<
    AuthContextType | undefined
  >(
    undefined
  );


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

  if (!normalizedPhone) {

    return null;

  }

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
   * LOAD CUSTOMER FROM AUTHENTICATED SESSION
   * =======================================================
   */

  async function loadCustomerFromSession(
    session: {
      user: {
        phone?: string | null;
      };
    } | null
  ) {

    if (!session?.user) {

      setCustomer(null);

      localStorage.removeItem(
        "tnm_customer"
      );

      return null;

    }


    const phone =
      normalizePhone(
        session.user.phone
      );


    if (!phone) {

      setCustomer(null);

      localStorage.removeItem(
        "tnm_customer"
      );

      return null;

    }


    try {

      const customerData =
        await fetchCustomer(
          phone
        );


      setCustomer(
        customerData
      );


      if (customerData) {

        localStorage.setItem(
          "tnm_customer",
          JSON.stringify(
            customerData
          )
        );

      } else {

        localStorage.removeItem(
          "tnm_customer"
        );

      }


      return customerData;

    } catch (error) {

      console.error(
        "Failed to load authenticated customer:",
        error
      );

      setCustomer(null);

      return null;

    }

  }


  /*
   * =======================================================
   * LOGIN WITH PHONE
   * =======================================================
   *
   * OTP sending and verification are handled by
   * LoginStep/AuthDialog through Supabase Auth.
   *
   * This function only confirms that a valid Supabase
   * session exists and loads the corresponding T&M
   * customer record.
   * =======================================================
   */

  async function loginWithPhone(
    phone: string
  ): Promise<Customer | null> {

    const normalizedPhone =
      normalizePhone(
        phone
      );


    if (!normalizedPhone) {

      return null;

    }


    try {

      const {
        data,
        error,
      } =
        await supabase.auth.getUser();


      if (
        error ||
        !data.user
      ) {

        console.error(
          "Authenticated Supabase user not found:",
          error
        );

        return null;

      }


      const authenticatedPhone =
        normalizePhone(
          data.user.phone
        );


      if (
        !authenticatedPhone ||
        authenticatedPhone !== normalizedPhone
      ) {

        console.error(
          "Authenticated phone does not match requested phone."
        );

        return null;

      }


      return await loadCustomerFromSession({
        user: {
          phone:
            data.user.phone,
        },
      });

    } catch (error) {

      console.error(
        "Failed to resolve authenticated customer:",
        error
      );

      return null;

    }

  }


  /*
   * =======================================================
   * LOAD SESSION
   * =======================================================
   */

  async function loadSession() {

    try {

      const {
        data,
        error,
      } =
        await supabase.auth.getSession();


      if (
        error
      ) {

        console.error(
          "Failed to load Supabase session:",
          error
        );

        setCustomer(null);

        return;

      }


      await loadCustomerFromSession(
        data.session
      );

    } catch (error) {

      console.error(
        "Auth initialization error:",
        error
      );

      setCustomer(null);

    } finally {

      setLoading(false);

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


          if (
            event === "SIGNED_OUT" ||
            !session
          ) {

            setCustomer(null);

            localStorage.removeItem(
              "tnm_customer"
            );

            return;

          }


          /*
           * SIGNED_IN / TOKEN_REFRESHED / USER_UPDATED
           *
           * All of these should resolve the current
           * authenticated user to the T&M customer.
           */

          try {

            await loadCustomerFromSession(
              session
            );

          } catch (error) {

            console.error(
              "Failed to synchronize authenticated customer:",
              error
            );

            if (mounted) {

              setCustomer(null);

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

    try {

      const {
        error,
      } =
        await supabase.auth.signOut();


      if (error) {

        throw error;

      }

    } catch (error) {

      console.error(
        "Supabase logout error:",
        error
      );

      throw error;

    } finally {

      localStorage.removeItem(
        "tnm_customer"
      );

      setCustomer(null);

    }

  }


  /*
   * =========================================================
   * UPDATE CUSTOMER
   * =========================================================
   *
   * Keeps AuthContext synchronized immediately after a
   * profile update so the account UI does not require a
   * page refresh.
   * =========================================================
   */

  function updateCustomer(
    updatedCustomer: Customer
  ) {

    setCustomer(
      updatedCustomer
    );

    localStorage.setItem(
      "tnm_customer",
      JSON.stringify(
        updatedCustomer
      )
    );

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

        updateCustomer,

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
