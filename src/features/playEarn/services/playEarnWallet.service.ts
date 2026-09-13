import { supabase } from "@/shared/lib/supabase";

export interface PlayEarnWallet {
  id: string;
  customer_id: string;
  balance_paise: number;
  currency: string;
  status: "active" | "blocked";
  created_at: string;
  updated_at: string;
}

export interface PlayEarnWalletTransaction {
  id: string;
  wallet_id: string;
  transaction_type:
    | "credit"
    | "debit"
    | "expiry"
    | "admin_adjustment";
  amount_paise: number;
  balance_before_paise: number;
  balance_after_paise: number;
  reference_type: string | null;
  reference_id: string | null;
  description: string | null;
  expires_at: string | null;
  created_at: string;
}

export const playEarnWalletService = {
  async getWallet(): Promise<PlayEarnWallet> {
    const { data, error } = await supabase.rpc(
      "get_or_create_my_play_earn_wallet"
    );

    if (error) {
      console.error(
        "Play & Earn wallet load failed:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load Play & Earn Wallet"
      );
    }

    const wallet = Array.isArray(data)
      ? data[0]
      : data;

    if (!wallet) {
      throw new Error(
        "Play & Earn Wallet was not returned"
      );
    }

    return {
      id: wallet.id,
      customer_id: wallet.customer_id,
      balance_paise: Number(wallet.balance_paise),
      currency: wallet.currency,
      status: wallet.status,
      created_at: wallet.created_at,
      updated_at: wallet.updated_at,
    };
  },

  async getBalance(): Promise<number> {
    const { data, error } = await supabase.rpc(
      "get_my_play_earn_wallet_balance"
    );

    if (error) {
      console.error(
        "Play & Earn wallet balance load failed:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load wallet balance"
      );
    }

    const balance = Array.isArray(data)
      ? data[0]
      : data;

    if (
      balance === null ||
      balance === undefined
    ) {
      return 0;
    }

    if (
      typeof balance === "object" &&
      balance !== null &&
      "balance_paise" in balance
    ) {
      return Number(balance.balance_paise);
    }

    return Number(balance);
  },

  async getTransactions(): Promise<
    PlayEarnWalletTransaction[]
  > {
    const { data, error } = await supabase.rpc(
      "get_my_play_earn_wallet_transactions"
    );

    if (error) {
      console.error(
        "Play & Earn wallet transactions load failed:",
        error
      );

      throw new Error(
        error.message ||
          "Unable to load wallet transactions"
      );
    }

    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((transaction) => ({
      id: transaction.id,
      wallet_id: transaction.wallet_id,
      transaction_type:
        transaction.transaction_type,
      amount_paise:
        Number(transaction.amount_paise),
      balance_before_paise:
        Number(transaction.balance_before_paise),
      balance_after_paise:
        Number(transaction.balance_after_paise),
      reference_type:
        transaction.reference_type ?? null,
      reference_id:
        transaction.reference_id ?? null,
      description:
        transaction.description ?? null,
      expires_at:
        transaction.expires_at ?? null,
      created_at:
        transaction.created_at,
    }));
  },
};