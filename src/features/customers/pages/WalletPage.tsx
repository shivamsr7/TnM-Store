import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  Gift,
  Loader2,
  RefreshCcw,
  Sparkles,
  Wallet,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  useAuth,
} from "@/features/Auth/context/AuthContext";

import {
  supabase,
} from "@/shared/lib/supabase";


type WalletData = {
  id: string;
  customer_id: string;
  balance_paise: number;
  currency: string;
  status: string;
};


type WalletTransaction = {
  id: string;
  transaction_type: string;
  amount_paise: number;
  balance_before_paise: number;
  balance_after_paise: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  expires_at: string | null;
  created_at: string;
};


/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
  paise: number
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(paise || 0) / 100
  );
}


/* =========================================================
   DATE
========================================================= */

function formatDate(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(date)
  );
}


/* =========================================================
   TIME
========================================================= */

function formatTime(
  date: string
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(
    new Date(date)
  );
}


/* =========================================================
   TRANSACTION TITLE
========================================================= */

function getTransactionTitle(
  transaction: WalletTransaction
) {

  /*
   * Admin credit/debit are both stored as
   * transaction_type = admin_adjustment.
   *
   * We use reference_type to determine
   * which admin action actually happened.
   */

  if (
    transaction.reference_type ===
    "admin_credit"
  ) {
    return "Wallet Credit";
  }


  if (
    transaction.reference_type ===
    "admin_debit"
  ) {
    return "Wallet Deduction";
  }


  switch (
    transaction.transaction_type
  ) {

    case "reward":
      return "Reward Credit";

    case "referral":
      return "Referral Reward";

    case "refund":
      return "Order Refund";

    case "admin_adjustment":
      return "Wallet Adjustment";

    case "expiry":
      return "Credit Expired";

    case "debit":
      return "Used on Order";

    case "credit":
    default:
      return "Wallet Credit";

  }

}


/* =========================================================
   TRANSACTION ICON
========================================================= */

function getTransactionIcon(
  transaction: WalletTransaction
) {

  /*
   * Admin deduction
   */

  if (
    transaction.reference_type ===
    "admin_debit"
  ) {
    return (
      <ArrowDownLeft
        size={17}
      />
    );
  }


  /*
   * Expired credit
   */

  if (
    transaction.transaction_type ===
    "expiry"
  ) {
    return (
      <ArrowDownLeft
        size={17}
      />
    );
  }


  /*
   * Normal order debit
   */

  if (
    transaction.transaction_type ===
    "debit"
  ) {
    return (
      <ArrowDownLeft
        size={17}
      />
    );
  }


  /*
   * Reward
   */

  if (
    transaction.transaction_type ===
    "reward"
  ) {
    return (
      <Gift
        size={17}
      />
    );
  }


  /*
   * Refund
   */

  if (
    transaction.transaction_type ===
    "refund"
  ) {
    return (
      <RefreshCcw
        size={17}
      />
    );
  }


  /*
   * Everything else is a credit
   */

  return (
    <ArrowUpRight
      size={17}
    />
  );

}


/* =========================================================
   TRANSACTION DIRECTION
========================================================= */

function getTransactionIsNegative(
  transaction: WalletTransaction
) {

  /*
   * IMPORTANT
   *
   * amount_paise is always POSITIVE because
   * of the database constraint:
   *
   * wallet_transactions_amount_positive
   *
   * Therefore we MUST NOT use:
   *
   * amount_paise < 0
   *
   * to determine transaction direction.
   *
   * Admin deductions are identified by:
   *
   * reference_type = admin_debit
   */


  /* Admin deduction */

  if (
    transaction.reference_type ===
    "admin_debit"
  ) {
    return true;
  }


  /* Normal wallet debit */

  if (
    transaction.transaction_type ===
    "debit"
  ) {
    return true;
  }


  /* Expired credit */

  if (
    transaction.transaction_type ===
    "expiry"
  ) {
    return true;
  }


  return false;

}


/* =========================================================
   PAGE
========================================================= */

export default function WalletPage() {

  const {
    customer,
  } = useAuth();


  const [
    wallet,
    setWallet,
  ] = useState<WalletData | null>(
    null
  );


  const [
    transactions,
    setTransactions,
  ] = useState<WalletTransaction[]>(
    []
  );


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );


  /* =======================================================
     LOAD WALLET
  ======================================================= */

  useEffect(() => {

    let mounted = true;


    async function loadWallet() {

      if (!customer?.id) {

        if (mounted) {

          setLoading(false);

          setWallet(null);

          setTransactions([]);

        }

        return;

      }


      try {

        setLoading(true);

        setError(null);


        /*
         * Securely gets the logged-in customer's
         * wallet and creates it if necessary.
         */

        const {
          data: walletData,
          error: walletError,
        } = await supabase.rpc(
          "get_or_create_my_wallet"
        );


        if (walletError) {

          throw walletError;

        }


        const walletRecord =
          Array.isArray(walletData)
            ? walletData[0]
            : walletData;


        if (
          !walletRecord?.id
        ) {

          throw new Error(
            "Wallet could not be loaded."
          );

        }


        /*
         * Load wallet transaction history.
         *
         * RLS protects this query so the
         * customer can only access their own
         * wallet transactions.
         */

        const {
          data: transactionData,
          error: transactionError,
        } = await supabase
          .from(
            "wallet_transactions"
          )
          .select(
            `
              id,
              transaction_type,
              amount_paise,
              balance_before_paise,
              balance_after_paise,
              reference_type,
              reference_id,
              description,
              expires_at,
              created_at
            `
          )
          .eq(
            "wallet_id",
            walletRecord.id
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


        if (transactionError) {

          throw transactionError;

        }


        if (!mounted) return;


        setWallet(
          walletRecord as WalletData
        );


        setTransactions(
          (transactionData ||
            []) as WalletTransaction[]
        );

      }

      catch (err) {

        console.error(
          "T&M Wallet error:",
          err
        );


        if (!mounted) return;


        setError(
          "We couldn't load your wallet right now. Please try again."
        );

      }

      finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadWallet();


    return () => {

      mounted = false;

    };

  }, [customer?.id]);


  const balance =
    wallet?.balance_paise || 0;


  /* =======================================================
     RENDER
  ======================================================= */

  return (

    <div
      className="
        min-h-screen
        bg-black
        px-4
        pb-10
        pt-5
        text-white
        sm:px-6
        lg:px-8
      "
    >

      <div
        className="
          mx-auto
          max-w-5xl
        "
      >


        {/* =================================================
            BACK
        ================================================== */}

        <Link
          to="/account"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-neutral-400
            transition-colors
            hover:text-[#C8A44D]
          "
        >

          <ArrowLeft
            size={17}
            strokeWidth={1.8}
          />

          Back to My Account

        </Link>




        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            mt-7
          "
        >

          <p
            className="
              text-[11px]
              font-medium
              uppercase
              tracking-[0.2em]
              text-[#C8A44D]
            "
          >
            Your T&M
          </p>


          <h1
            className="
              mt-1
              text-2xl
              font-semibold
              tracking-tight
              text-white
              sm:text-3xl
            "
          >
            T&M Wallet
          </h1>


          <p
            className="
              mt-2
              max-w-xl
              text-sm
              leading-6
              text-neutral-500
            "
          >
            Your T&M store credit, rewards and
            refunds — all in one place.
          </p>

        </div>




        {/* =================================================
            WALLET CARD
        ================================================== */}

        <div
          className="
            relative
            mt-7
            overflow-hidden
            rounded-[28px]
            border
            border-[#C8A44D]/40
            bg-gradient-to-br
            from-[#1B1811]
            via-[#0F0F0F]
            to-black
            p-6
            shadow-[0_20px_70px_rgba(200,164,77,0.08)]
            sm:p-8
          "
        >

          {/* Gold glow */}

          <div
            className="
              pointer-events-none
              absolute
              -right-20
              -top-24
              h-64
              w-64
              rounded-full
              bg-[#C8A44D]/10
              blur-3xl
            "
          />


          <div
            className="
              pointer-events-none
              absolute
              -bottom-32
              -left-20
              h-56
              w-56
              rounded-full
              bg-[#C8A44D]/5
              blur-3xl
            "
          />


          <div
            className="
              relative
            "
          >

            {/* Top */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
              "
            >

              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    border
                    border-[#C8A44D]/25
                    bg-[#C8A44D]/10
                    text-[#C8A44D]
                  "
                >

                  <Wallet
                    size={22}
                    strokeWidth={1.8}
                  />

                </div>


                <div>

                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-[0.18em]
                      text-[#C8A44D]
                    "
                  >
                    T&M Wallet
                  </p>


                  <p
                    className="
                      mt-1
                      text-xs
                      text-neutral-500
                    "
                  >
                    Store Credit
                  </p>

                </div>

              </div>


              <Sparkles
                size={21}
                className="
                  text-[#C8A44D]/70
                "
              />

            </div>




            {/* Balance */}

            <div
              className="
                mt-10
              "
            >

              <p
                className="
                  text-xs
                  uppercase
                  tracking-[0.16em]
                  text-neutral-500
                "
              >
                Available Balance
              </p>


              {loading ? (

                <div
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-neutral-400
                  "
                >

                  <Loader2
                    size={20}
                    className="
                      animate-spin
                    "
                  />

                  <span
                    className="
                      text-sm
                    "
                  >
                    Loading balance...
                  </span>

                </div>

              ) : error ? (

                <p
                  className="
                    mt-3
                    text-sm
                    text-red-400
                  "
                >
                  Unable to load balance
                </p>

              ) : (

                <p
                  className="
                    mt-2
                    text-4xl
                    font-semibold
                    tracking-tight
                    text-white
                    sm:text-5xl
                  "
                >
                  {formatCurrency(balance)}
                </p>

              )}

            </div>




            {/* Bottom information */}

            <div
              className="
                mt-9
                flex
                flex-col
                gap-3
                border-t
                border-white/10
                pt-5
                sm:flex-row
                sm:items-center
                sm:justify-between
              "
            >

              <p
                className="
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                Use your wallet balance on
                eligible T&M Jewels purchases.
              </p>


              <span
                className="
                  shrink-0
                  rounded-full
                  border
                  border-[#C8A44D]/20
                  bg-[#C8A44D]/5
                  px-3
                  py-1.5
                  text-[10px]
                  font-medium
                  uppercase
                  tracking-wider
                  text-[#C8A44D]
                "
              >
                T&M Credit
              </span>

            </div>

          </div>

        </div>




        {/* =================================================
            T&M BENEFITS
        ================================================== */}

        <section
          className="
            mt-7
          "
        >

          <div>

            <p
              className="
                text-[11px]
                font-medium
                uppercase
                tracking-[0.18em]
                text-[#C8A44D]
              "
            >
              T&M Benefits
            </p>


            <h2
              className="
                mt-1
                text-lg
                font-semibold
                text-white
              "
            >
              Ways you can receive credit
            </h2>

          </div>


          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-3
              sm:grid-cols-4
            "
          >

            {/* Rewards */}

            <div
              className="
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
              "
            >

              <Gift
                size={18}
                className="
                  text-[#C8A44D]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-white
                "
              >
                Rewards
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Earn credit through
                eligible rewards.
              </p>

            </div>


            {/* Referrals */}

            <div
              className="
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
              "
            >

              <ArrowUpRight
                size={18}
                className="
                  text-[#C8A44D]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-white
                "
              >
                Referrals
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Receive referral
                benefits as credit.
              </p>

            </div>


            {/* Refunds */}

            <div
              className="
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
              "
            >

              <RefreshCcw
                size={18}
                className="
                  text-[#C8A44D]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-white
                "
              >
                Refunds
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Eligible refunds can
                return as wallet credit.
              </p>

            </div>


            {/* Special Credits */}

            <div
              className="
                rounded-2xl
                border
                border-neutral-800
                bg-[#0D0D0D]
                p-4
              "
            >

              <Sparkles
                size={18}
                className="
                  text-[#C8A44D]
                "
              />

              <p
                className="
                  mt-3
                  text-sm
                  font-medium
                  text-white
                "
              >
                Special Credits
              </p>

              <p
                className="
                  mt-1
                  text-[11px]
                  leading-4
                  text-neutral-500
                "
              >
                Promotional credits
                from T&M.
              </p>

            </div>

          </div>

        </section>




        {/* =================================================
            TRANSACTIONS
        ================================================== */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-2xl
            border
            border-neutral-800
            bg-[#0D0D0D]
          "
        >

          {/* Header */}

          <div
            className="
              border-b
              border-neutral-800
              px-4
              py-4
              sm:px-5
            "
          >

            <div>

              <p
                className="
                  text-[11px]
                  font-medium
                  uppercase
                  tracking-[0.18em]
                  text-[#C8A44D]
                "
              >
                Wallet history
              </p>


              <h2
                className="
                  mt-1
                  text-lg
                  font-semibold
                  text-white
                "
              >
                Transactions
              </h2>

            </div>

          </div>




          {/* Loading */}

          {loading ? (

            <div
              className="
                flex
                items-center
                justify-center
                gap-2
                px-5
                py-12
                text-sm
                text-neutral-500
              "
            >

              <Loader2
                size={18}
                className="
                  animate-spin
                "
              />

              Loading transactions...

            </div>

          ) : error ? (

            /* Error */

            <div
              className="
                px-5
                py-12
                text-center
              "
            >

              <p
                className="
                  text-sm
                  text-red-400
                "
              >
                {error}
              </p>

            </div>

          ) : transactions.length === 0 ? (

            /* Empty */

            <div
              className="
                px-5
                py-14
                text-center
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
                  bg-[#C8A44D]/5
                  text-[#C8A44D]/60
                "
              >

                <Wallet
                  size={24}
                />

              </div>


              <h3
                className="
                  mt-4
                  text-sm
                  font-medium
                  text-white
                "
              >
                No wallet activity yet
              </h3>


              <p
                className="
                  mx-auto
                  mt-1
                  max-w-sm
                  text-xs
                  leading-5
                  text-neutral-500
                "
              >
                Your T&M rewards, referrals,
                refunds and promotional credits
                will appear here.
              </p>

            </div>

          ) : (

            /* Transactions */

            <div>

              {transactions.map(
                (
                  transaction,
                  index
                ) => {

                  /*
                   * IMPORTANT:
                   *
                   * amount_paise is ALWAYS POSITIVE.
                   *
                   * Direction is determined using
                   * transaction_type + reference_type.
                   */

                  const negative =
                    getTransactionIsNegative(
                      transaction
                    );


                  return (

                    <div
                      key={
                        transaction.id
                      }
                      className={`
                        px-4
                        py-4
                        sm:px-5
                        ${
                          index <
                          transactions.length - 1
                            ? "border-b border-neutral-900"
                            : ""
                        }
                      `}
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        {/* Transaction Icon */}

                        <div
                          className={`
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            ${
                              negative
                                ? "bg-red-500/10 text-red-400"
                                : "bg-emerald-500/10 text-emerald-400"
                            }
                          `}
                        >

                          {getTransactionIcon(
                            transaction
                          )}

                        </div>




                        {/* Details */}

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >

                          <p
                            className="
                              truncate
                              text-sm
                              font-medium
                              text-white
                            "
                          >
                            {getTransactionTitle(
                              transaction
                            )}
                          </p>


                          {transaction.description && (
                            <p
                              className="
                                mt-1
                                text-[11px]
                                text-neutral-500
                              "
                            >
                              {transaction.description}
                            </p>
                          )}


                          <p
                            className="
                              mt-0.5
                              text-[10px]
                              text-neutral-600
                            "
                          >
                            {formatDate(
                              transaction.created_at
                            )}{" "}
                            ·{" "}
                            {formatTime(
                              transaction.created_at
                            )}
                          </p>

                        </div>




                        {/* Amount */}

                        <div
                          className="
                            shrink-0
                            text-right
                          "
                        >

                          <p
                            className={`
                              text-sm
                              font-semibold
                              ${
                                negative
                                  ? "text-red-400"
                                  : "text-emerald-400"
                              }
                            `}
                          >

                            {negative
                              ? "-"
                              : "+"}

                            {formatCurrency(
                              Math.abs(
                                transaction.amount_paise
                              )
                            )}

                          </p>


                          <p
                            className="
                              mt-1
                              text-[10px]
                              text-neutral-600
                            "
                          >
                            Balance{" "}
                            {formatCurrency(
                              transaction.balance_after_paise
                            )}
                          </p>

                        </div>

                      </div>




                      {/* Expiry */}

                      {transaction.expires_at && (
                        <div
                          className="
                            ml-[52px]
                            mt-2
                            text-[10px]
                            text-neutral-600
                          "
                        >
                          Credit expires{" "}
                          {formatDate(
                            transaction.expires_at
                          )}
                        </div>
                      )}

                    </div>

                  );

                }
              )}

            </div>

          )}

        </section>




        {/* =================================================
            NOTE
        ================================================== */}

        <div
          className="
            mt-5
            rounded-2xl
            border
            border-neutral-900
            bg-[#090909]
            px-4
            py-4
            text-center
          "
        >

          <p
            className="
              text-[11px]
              leading-5
              text-neutral-600
            "
          >
            T&M Wallet is store credit that can
            be used toward eligible purchases
            on T&M Jewels.
          </p>

        </div>

      </div>

    </div>

  );

}