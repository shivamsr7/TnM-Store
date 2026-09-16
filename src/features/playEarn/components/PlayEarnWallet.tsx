import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import {
  playEarnWalletService,
  type PlayEarnWallet,
  type PlayEarnWalletTransaction,
} from "@/features/playEarn/services/playEarnWallet.service";

function formatRupees(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTransactionLabel(
  transaction: PlayEarnWalletTransaction
) {
  if (transaction.reference_type === "three_numbers") {
    return "3 Numbers reward";
  }

  if (transaction.transaction_type === "expiry") {
    return "Reward expired";
  }

  if (transaction.description) {
    return transaction.description;
  }

  if (transaction.transaction_type === "credit") {
    return "Play & Earn reward";
  }

  if (transaction.transaction_type === "debit") {
    return "Reward used";
  }

  if (transaction.transaction_type === "admin_adjustment") {
    return "Wallet adjustment";
  }

  return "Play & Earn transaction";
}

function isCreditTransaction(
  transaction: PlayEarnWalletTransaction
) {
  return (
    transaction.transaction_type === "credit" ||
    transaction.transaction_type === "admin_adjustment" &&
      transaction.amount_paise > 0
  );
}

export default function PlayEarnWallet() {
  const [wallet, setWallet] = useState<PlayEarnWallet | null>(null);
  const [transactions, setTransactions] = useState<
    PlayEarnWalletTransaction[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [refreshing, setRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState("");

  const loadWallet = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      try {
        if (silent) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError("");

        /*
         * IMPORTANT:
         * Only getWallet() is called here.
         *
         * getWallet() creates the Play & Earn wallet if
         * it doesn't exist yet and also returns balance_paise.
         *
         * We intentionally DO NOT call getBalance() separately,
         * otherwise two simultaneous wallet-creation requests can
         * cause the unique customer constraint error.
         */
        const walletData =
          await playEarnWalletService.getWallet();

        setWallet(walletData);

        /*
         * Transaction history is independent of wallet creation.
         */
        try {
          const transactionData =
            await playEarnWalletService.getTransactions();

          setTransactions(transactionData);
        } catch (transactionError) {
          console.error(
            "Failed to load Play & Earn transactions:",
            transactionError
          );

          /*
           * Wallet itself should still remain usable even if
           * transaction history temporarily fails.
           */
          if (!silent) {
            setTransactions([]);
          }
        }

        if (silent) {
          setRefreshMessage("Wallet updated");
          window.setTimeout(() => {
            setRefreshMessage("");
          }, 1800);
        }
      } catch (walletError) {
        console.error(
          "Failed to load Play & Earn wallet:",
          walletError
        );

        if (silent) {
          setRefreshMessage("Unable to update wallet");
          window.setTimeout(() => {
            setRefreshMessage("");
          }, 2200);
        } else {
          setError(
            walletError instanceof Error
              ? walletError.message
              : "Unable to load Play & Earn Wallet"
          );
        }
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    []
  );

  const refreshWallet = useCallback(() => {
    if (refreshing) return;
    void loadWallet({ silent: true });
  }, [loadWallet, refreshing]);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  /*
   * Refresh automatically after a game reward is successfully
   * credited. This keeps the wallet UI in sync without a page reload.
   */
  useEffect(() => {
    const handleWalletUpdated = () => {
      refreshWallet();
    };

    window.addEventListener(
      "play-earn-wallet-updated",
      handleWalletUpdated
    );

    return () => {
      window.removeEventListener(
        "play-earn-wallet-updated",
        handleWalletUpdated
      );
    };
  }, [refreshWallet]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <section className="space-y-5">
        {/* Wallet skeleton */}
        <div className="animate-pulse rounded-3xl border border-[#e7c66a] bg-gradient-to-br from-[#321044] via-[#5b174f] to-[#8d2450] p-6">
          <div className="h-3 w-36 rounded bg-white/20" />

          <div className="mt-5 h-10 w-28 rounded bg-white/20" />

          <div className="mt-3 h-3 w-48 rounded bg-white/10" />
        </div>

        {/* History skeleton */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5">
          <div className="h-5 w-36 animate-pulse rounded bg-gray-100" />

          <div className="mt-5 space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gray-100" />

                  <div>
                    <div className="h-3 w-28 rounded bg-gray-100" />
                    <div className="mt-2 h-2.5 w-20 rounded bg-gray-100" />
                  </div>
                </div>

                <div className="h-4 w-14 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error) {
    return (
      <section className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-xl">
          ⚠️
        </div>

        <h3 className="mt-4 text-base font-bold text-gray-950">
          Unable to load your rewards
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-5 text-gray-500">
          {error}
        </p>

        <button
          type="button"
          onClick={() => void loadWallet()}
          className="mt-5 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
        >
          Try Again
        </button>
      </section>
    );
  }

  /* ============================================================
     WALLET
  ============================================================ */

  const balancePaise = wallet?.balance_paise ?? 0;

  return (
    <section className="space-y-5">
      {/* ======================================================
          WALLET CARD
      ======================================================= */}

      <div className="relative overflow-hidden rounded-3xl border border-[#e7c66a] bg-gradient-to-br from-[#321044] via-[#5b174f] to-[#8d2450] p-6 text-white shadow-[0_18px_40px_rgba(72,20,68,0.18)]">
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#ffd96b]/10"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full bg-pink-400/10 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f7d98a]">
                Play & Earn Wallet
              </p>

              <p className="mt-2 text-sm text-white/65">
                Your game rewards
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#f1cd70]/40 bg-white/10 text-xl">
              🎁
            </div>
          </div>

          {/* Balance */}
          <div className="mt-7">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-medium text-white/55">
                Available Rewards
              </p>

              <div className="flex items-center gap-2">
                {refreshMessage && (
                  <span
                    className="text-[10px] font-semibold text-[#f7d98a] transition-opacity"
                    role="status"
                    aria-live="polite"
                  >
                    {refreshMessage}
                  </span>
                )}

                <button
                  type="button"
                  onClick={refreshWallet}
                  disabled={refreshing}
                  aria-label="Refresh Play & Earn Wallet"
                  title="Refresh wallet"
                  className="
                    flex h-8 w-8 items-center justify-center
                    rounded-full border border-white/15
                    bg-white/5 text-white/75
                    transition-all duration-200
                    hover:border-[#f1cd70]/50 hover:bg-white/10 hover:text-white
                    active:scale-95
                    disabled:cursor-not-allowed disabled:opacity-60
                  "
                >
                  <RefreshCw
                    className={refreshing ? "h-4 w-4 animate-spin" : "h-4 w-4"}
                    strokeWidth={2}
                  />
                </button>
              </div>
            </div>

            <p className="mt-1 text-4xl font-black tracking-tight">
              {formatRupees(balancePaise)}
            </p>

            <p className="mt-1 text-[10px] text-white/35">
              {refreshing ? "Updating wallet…" : "Tap ↻ to update"}
            </p>
          </div>

          {/* Footer */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2 text-xs text-white/65">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Wallet Active
            </div>

            <div className="text-xs text-white/45">
              Separate from your regular wallet
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          REWARD HISTORY
      ======================================================= */}

      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-purple-600">
                Wallet Activity
              </p>

              <h2 className="mt-1 text-lg font-black text-gray-950">
                Reward History
              </h2>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-lg">
              ✨
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-2xl">
              🎮
            </div>

            <h3 className="mt-4 text-sm font-bold text-gray-950">
              No rewards yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-gray-500">
              Play our games and your eligible rewards will
              appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {transactions.map((transaction) => {
              const credit = isCreditTransaction(transaction);

              return (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between gap-4 px-5 py-4"
                >
                  {/* Left */}
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={[
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base",
                        credit
                          ? "bg-emerald-50"
                          : "bg-gray-100",
                      ].join(" ")}
                    >
                      {credit ? "🎁" : "↗️"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-gray-950">
                        {getTransactionLabel(transaction)}
                      </p>

                      <p className="mt-0.5 text-[11px] text-gray-400">
                        {formatDate(transaction.created_at)}
                      </p>

                      {transaction.expires_at &&
                        transaction.transaction_type ===
                          "credit" && (
                          <p className="mt-1 text-[10px] text-amber-600">
                            Expires{" "}
                            {formatDate(
                              transaction.expires_at
                            )}
                          </p>
                        )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="shrink-0 text-right">
                    <p
                      className={[
                        "text-sm font-black",
                        credit
                          ? "text-emerald-600"
                          : "text-gray-700",
                      ].join(" ")}
                    >
                      {credit ? "+" : "-"}
                      {formatRupees(
                        transaction.amount_paise
                      )}
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-400">
                      Balance{" "}
                      {formatRupees(
                        transaction.balance_after_paise
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Separate wallet note */}
      <p className="text-center text-[11px] leading-5 text-gray-400">
        Play & Earn rewards are separate from your regular wallet.
      </p>
    </section>
  );
}