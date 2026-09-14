import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  ArrowDown,
  ArrowUp,
  Loader2,
  X,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import PlayEarnWallet from "@/features/playEarn/components/PlayEarnWallet";
import ScratchWinGame from "@/features/playEarn/components/ScratchWinGame";
import { supabase } from "@/shared/lib/supabase";


/* ============================================================
   TYPES
============================================================ */

type GameKey =
  | "three_numbers"
  | "scratch_win"
  | "daily_poll";


interface GameSetting {
  id: string;
  game_key: GameKey;
  display_name: string;
  enabled: boolean;
  daily_limit: number | null;
  reward_expiry_days: number;
  reward_config: Record<string, unknown>;
}

interface PlayEarnCheckoutSettings {
  redemption_enabled: boolean;
  minimum_order_value_paise: number;
  maximum_redemption_paise: number | null;
  maximum_redemption_percent: number;
  minimum_wallet_balance_paise: number;
  allow_on_sale_products: boolean;
  allow_on_discounted_products: boolean;
  allow_with_coupon: boolean;
  allow_with_regular_wallet: boolean;
  allow_shipping_charges: boolean;
  allow_cod: boolean;
  allow_online_payment: boolean;
  daily_redemption_limit_paise: number | null;
  monthly_redemption_limit_paise: number | null;
}


/* ============================================================
   GAME METADATA
============================================================ */

const GAME_META: Record<
  GameKey,
  {
    icon: string;
    title: string;
    description: string;
    accent: "pink" | "purple" | "gold";
    actionLabel: string;
    badge: string;
  }
> = {
  three_numbers: {
    icon: "🎰",
    title: "3 Numbers",
    description:
      "Pull the lever and match all three numbers to win.",
    accent: "pink",
    actionLabel: "Play Now",
    badge: "Live Now",
  },

  scratch_win: {
    icon: "🎁",
    title: "Scratch & Win",
    description:
      "Scratch your card and reveal your surprise reward.",
    accent: "purple",
    actionLabel: "Play Now",
    badge: "Live Now",
  },

  daily_poll: {
    icon: "🗳️",
    title: "Daily Poll",
    description:
      "Vote every day and build your 7-day streak.",
    accent: "gold",
    actionLabel: "Coming Soon",
    badge: "Coming Soon",
  },
};


/* ============================================================
   MAIN PAGE
============================================================ */

export default function PlayEarnPage() {
  const navigate = useNavigate();

  const [
    scratchWinOpen,
    setScratchWinOpen,
  ] = useState(false);

  const [
    gameSettings,
    setGameSettings,
  ] = useState<GameSetting[]>([]);

  const [
    settingsLoading,
    setSettingsLoading,
  ] = useState(true);

  const [
    settingsError,
    setSettingsError,
  ] = useState<string | null>(null);

  const [
    checkoutSettings,
    setCheckoutSettings,
  ] = useState<PlayEarnCheckoutSettings | null>(null);

  const [
    checkoutSettingsLoading,
    setCheckoutSettingsLoading,
  ] = useState(true);


  /* ==========================================================
     LOAD GAME SETTINGS
  ========================================================== */

  const loadGameSettings =
    useCallback(async () => {
      setSettingsLoading(true);
      setSettingsError(null);

      try {
        const {
          data,
          error,
        } = await supabase.rpc(
          "get_play_earn_game_settings"
        );

        if (error) {
          throw new Error(
            error.message ||
              "Unable to load Play & Earn games."
          );
        }

        const rows = Array.isArray(data)
          ? data
          : data
            ? [data]
            : [];

        const normalized =
          rows
            .filter(Boolean)
            .map((row) => ({
              id: String(row.id),
              game_key:
                row.game_key as GameKey,
              display_name:
                String(
                  row.display_name ?? ""
                ),
              enabled:
                Boolean(row.enabled),
              daily_limit:
                row.daily_limit === null ||
                row.daily_limit === undefined
                  ? null
                  : Number(row.daily_limit),
              reward_expiry_days:
                Number(
                  row.reward_expiry_days ?? 7
                ),
              reward_config:
                row.reward_config &&
                typeof row.reward_config ===
                  "object"
                  ? row.reward_config
                  : {},
            }))
            .filter((game) =>
              [
                "three_numbers",
                "scratch_win",
                "daily_poll",
              ].includes(game.game_key)
            );

        setGameSettings(normalized);
      } catch (err) {
        setSettingsError(
          err instanceof Error
            ? err.message
            : "Unable to load Play & Earn games."
        );
      } finally {
        setSettingsLoading(false);
      }
    }, []);


  /* ==========================================================
     LOAD CHECKOUT / WALLET RULES
  ========================================================== */

  const loadCheckoutSettings =
    useCallback(async () => {
      setCheckoutSettingsLoading(true);

      try {
        const {
          data,
          error,
        } = await supabase.rpc(
          "get_play_earn_checkout_settings",
        );

        if (error) {
          throw new Error(
            error.message ||
              "Unable to load Play & Earn wallet rules.",
          );
        }

        if (!data) {
          throw new Error(
            "Play & Earn wallet rules are unavailable.",
          );
        }

        const row =
          Array.isArray(data)
            ? data[0]
            : data;

        if (!row) {
          throw new Error(
            "Play & Earn wallet rules are unavailable.",
          );
        }

        setCheckoutSettings({
          redemption_enabled:
            Boolean(row.redemption_enabled),
          minimum_order_value_paise:
            Number(
              row.minimum_order_value_paise ?? 0,
            ),
          maximum_redemption_paise:
            row.maximum_redemption_paise === null ||
            row.maximum_redemption_paise === undefined
              ? null
              : Number(row.maximum_redemption_paise),
          maximum_redemption_percent:
            Number(
              row.maximum_redemption_percent ?? 0,
            ),
          minimum_wallet_balance_paise:
            Number(
              row.minimum_wallet_balance_paise ?? 0,
            ),
          allow_on_sale_products:
            Boolean(row.allow_on_sale_products),
          allow_on_discounted_products:
            Boolean(row.allow_on_discounted_products),
          allow_with_coupon:
            Boolean(row.allow_with_coupon),
          allow_with_regular_wallet:
            Boolean(row.allow_with_regular_wallet),
          allow_shipping_charges:
            Boolean(row.allow_shipping_charges),
          allow_cod:
            Boolean(row.allow_cod),
          allow_online_payment:
            Boolean(row.allow_online_payment),
          daily_redemption_limit_paise:
            row.daily_redemption_limit_paise === null ||
            row.daily_redemption_limit_paise === undefined
              ? null
              : Number(row.daily_redemption_limit_paise),
          monthly_redemption_limit_paise:
            row.monthly_redemption_limit_paise === null ||
            row.monthly_redemption_limit_paise === undefined
              ? null
              : Number(row.monthly_redemption_limit_paise),
        });
      } catch {
        setCheckoutSettings(null);
      } finally {
        setCheckoutSettingsLoading(false);
      }
    }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadGameSettings();
    void loadCheckoutSettings();
  }, [loadGameSettings, loadCheckoutSettings]);


  /* ==========================================================
     GAME HELPERS
  ========================================================== */

  const isGameEnabled = (
    gameKey: GameKey
  ) => {
    const setting =
      gameSettings.find(
        (game) =>
          game.game_key === gameKey
      );

    /*
     * Important:
     * If settings have not loaded yet, don't
     * temporarily show disabled games.
     */
    return Boolean(
      setting?.enabled
    );
  };


  const openScratchWin = () => {
    setScratchWinOpen(true);
  };


  const closeScratchWin = () => {
    setScratchWinOpen(false);
  };


  /* ==========================================================
     VISIBLE GAMES
  ========================================================== */

  /*
   * Daily Poll is intentionally shown as a placeholder.
   * It is not live yet, so its Admin enabled/disabled setting
   * must not make it playable on the customer side.
   *
   * 3 Numbers and Scratch & Win follow Admin enabled/disabled.
   */
  const visibleGames =
    (
      Object.keys(
        GAME_META
      ) as GameKey[]
    ).filter((gameKey) =>
      gameKey === "daily_poll"
        ? true
        : isGameEnabled(gameKey)
    );


  /* ==========================================================
     RULE HELPERS
  ========================================================== */

  const formatRupees = (paise: number | null | undefined) => {
    if (paise === null || paise === undefined) return "No limit";
    return `₹${Math.round(paise / 100).toLocaleString("en-IN")}`;
  };

  const formatExpiry = (days: number) => {
    if (days <= 0) return "No expiry";
    return `${days} ${days === 1 ? "day" : "days"}`;
  };

  const gameRuleItems = (
    Object.keys(GAME_META) as GameKey[]
  )
    .map((gameKey) => {
      const setting = gameSettings.find(
        (game) => game.game_key === gameKey,
      );

      if (!setting && gameKey !== "daily_poll") return null;

      const meta = GAME_META[gameKey];

      if (gameKey === "daily_poll") {
        return {
          title: meta.title,
          description:
            "Coming soon. Daily participation and 7-day streak rules will appear here when the game launches.",
        };
      }

      const daily =
        setting?.daily_limit === null ||
        setting?.daily_limit === undefined
          ? "No daily limit"
          : `${setting.daily_limit} ${setting.daily_limit === 1 ? "play" : "plays"} per day`;

      const expiry = formatExpiry(
        Number(setting?.reward_expiry_days ?? 0),
      );

      const rewardText =
        gameKey === "scratch_win"
          ? "Scratch your card to reveal a reward from the current prize pool."
          : gameKey === "three_numbers"
            ? (() => {
                const config = setting?.reward_config;
                const rewards =
                  config &&
                  typeof config === "object" &&
                  "rewards" in config &&
                  config.rewards &&
                  typeof config.rewards === "object"
                    ? config.rewards as Record<string, unknown>
                    : {};

                const values = Object.values(rewards)
                  .map((value) => Number(value))
                  .filter((value) => Number.isFinite(value) && value > 0);

                if (values.length === 0) {
                  return "Winning reward is ₹50.";
                }

                const unique = [...new Set(values)];
                return `Winning reward: ${unique
                  .map((value) => `₹${(value / 100).toFixed(0)}`)
                  .join(" / ")}.`;
              })()
            : "Rewards are based on the current game configuration.";

      return {
        title: meta.title,
        description: `${daily}. ${rewardText} Credits expire after ${expiry}.`,
      };
    })
    .filter(Boolean) as Array<{
      title: string;
      description: string;
    }>;

  const walletRuleItems = checkoutSettings
    ? [
        {
          title: "Minimum order",
          description: `${formatRupees(
            checkoutSettings.minimum_order_value_paise,
          )} minimum eligible order value.`,
        },
        {
          title: "Maximum redemption",
          description:
            checkoutSettings.maximum_redemption_paise !== null
              ? `Up to ${checkoutSettings.maximum_redemption_percent}% of eligible order value, capped at ${formatRupees(
                  checkoutSettings.maximum_redemption_paise,
                )}.`
              : `Up to ${checkoutSettings.maximum_redemption_percent}% of eligible order value.`,
        },
        {
          title: "Minimum wallet balance",
          description: `${formatRupees(
            checkoutSettings.minimum_wallet_balance_paise,
          )} must remain available to use the wallet.`,
        },
        {
          title: "Sale products",
          description: checkoutSettings.allow_on_sale_products
            ? "Play & Earn Wallet can be used on sale products."
            : "Play & Earn Wallet cannot be used on sale products.",
        },
        {
          title: "Discounted products",
          description: checkoutSettings.allow_on_discounted_products
            ? "Play & Earn Wallet can be used on discounted products."
            : "Play & Earn Wallet cannot be used on discounted products.",
        },
        {
          title: "Coupon codes",
          description: checkoutSettings.allow_with_coupon
            ? "Play & Earn Wallet can be used together with a coupon."
            : "Play & Earn Wallet cannot be combined with a coupon.",
        },
        {
          title: "Regular T&M Wallet",
          description: checkoutSettings.allow_with_regular_wallet
            ? "Both wallets can be used together."
            : "Play & Earn Wallet cannot be combined with your regular T&M Wallet.",
        },
        {
          title: "Shipping charges",
          description: checkoutSettings.allow_shipping_charges
            ? "Play & Earn Wallet can cover shipping charges."
            : "Play & Earn Wallet cannot be used for shipping charges.",
        },
        {
          title: "Payment methods",
          description: `COD: ${
            checkoutSettings.allow_cod ? "Allowed" : "Not allowed"
          }. Online payment: ${
            checkoutSettings.allow_online_payment
              ? "Allowed"
              : "Not allowed"
          }.`,
        },
        {
          title: "Daily redemption limit",
          description:
            checkoutSettings.daily_redemption_limit_paise === null
              ? "No daily redemption limit."
              : `Up to ${formatRupees(
                  checkoutSettings.daily_redemption_limit_paise,
                )} can be redeemed per day.`,
        },
        {
          title: "Monthly redemption limit",
          description:
            checkoutSettings.monthly_redemption_limit_paise === null
              ? "No monthly redemption limit."
              : `Up to ${formatRupees(
                  checkoutSettings.monthly_redemption_limit_paise,
                )} can be redeemed per month.`,
        },
      ]
    : [];

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main
      className="
        w-full
        bg-gradient-to-b
        from-[#fff8fb]
        via-white
        to-[#f8f5ff]
      "
    >

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">

        {/* Decorative background */}

        <div
          className="
            pointer-events-none
            absolute
            -left-24
            -top-24
            h-64
            w-64
            rounded-full
            bg-pink-200/30
            blur-3xl
          "
          aria-hidden="true"
        />

        <div
          className="
            pointer-events-none
            absolute
            -right-24
            top-10
            h-72
            w-72
            rounded-full
            bg-purple-200/30
            blur-3xl
          "
          aria-hidden="true"
        />


        <div
          className="
            relative
            mx-auto
            max-w-6xl
            px-4
            pb-8
            pt-10
            sm:pb-12
            sm:pt-14
          "
        >

          <div className="text-center">

            <span
              className="
                inline-flex
                items-center
                rounded-full
                border
                border-purple-200
                bg-white
                px-4
                py-2
                text-[11px]
                font-bold
                uppercase
                tracking-[0.25em]
                text-purple-700
                shadow-sm
              "
            >
              T&M Jewels
            </span>


            <h1
              className="
                mt-5
                text-4xl
                font-black
                tracking-tight
                text-gray-950
                sm:text-5xl
              "
            >
              Play & Earn
            </h1>


            <p
              className="
                mx-auto
                mt-3
                max-w-xl
                text-sm
                leading-6
                text-gray-500
                sm:text-base
              "
            >
              Take a little break, play our games and earn
              rewards in your Play & Earn Wallet.
            </p>

          </div>


          {/* =================================================
              PLAY & EARN WALLET
          ================================================== */}

          <div
            className="
              mx-auto
              mt-8
              max-w-2xl
            "
          >
            <PlayEarnWallet />
          </div>

        </div>

      </section>


      {/* =====================================================
          GAMES
      ====================================================== */}

      <section
        className="
          mx-auto
          max-w-6xl
          px-4
          pb-14
        "
      >

        <div className="mb-6">

          <p
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.25em]
              text-purple-600
            "
          >
            Choose your game
          </p>


          <h2
            className="
              mt-2
              text-2xl
              font-black
              text-gray-950
              sm:text-3xl
            "
          >
            Play. Match. Win.
          </h2>

        </div>


        {/* ===================================================
            LOADING
        ==================================================== */}

        {settingsLoading && (
          <div
            className="
              flex
              min-h-[220px]
              items-center
              justify-center
              rounded-3xl
              border
              border-gray-200
              bg-white
            "
          >
            <div
              className="
                flex
                flex-col
                items-center
                gap-3
                text-center
              "
            >
              <Loader2
                className="
                  h-7
                  w-7
                  animate-spin
                  text-purple-600
                "
              />

              <p
                className="
                  text-sm
                  font-medium
                  text-gray-500
                "
              >
                Loading available games…
              </p>
            </div>
          </div>
        )}


        {/* ===================================================
            ERROR
        ==================================================== */}

        {!settingsLoading &&
          settingsError && (
            <div
              className="
                rounded-3xl
                border
                border-red-200
                bg-red-50
                px-5
                py-6
                text-center
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-red-700
                "
              >
                Unable to load Play & Earn games.
              </p>


              <p
                className="
                  mt-1
                  text-xs
                  text-red-500
                "
              >
                Please refresh the page and try again.
              </p>


              <button
                type="button"
                onClick={() =>
                  void loadGameSettings()
                }
                className="
                  mt-4
                  rounded-xl
                  bg-red-600
                  px-5
                  py-2.5
                  text-xs
                  font-bold
                  text-white
                  transition
                  hover:bg-red-700
                "
              >
                Try Again
              </button>

            </div>
          )}


        {/* ===================================================
            VISIBLE GAMES
        ==================================================== */}

        {!settingsLoading &&
          !settingsError &&
          visibleGames.length > 0 && (
            <div
              className="
                grid
                gap-5
                md:grid-cols-3
              "
            >

              {visibleGames.map(
                (gameKey) => {
                  const meta =
                    GAME_META[
                      gameKey
                    ];

                  /*
                   * -----------------------------------------
                   * 3 NUMBERS
                   * -----------------------------------------
                   */

                  if (
                    gameKey ===
                    "three_numbers"
                  ) {
                    return (
                      <GameCard
                        key={gameKey}
                        icon={meta.icon}
                        title={meta.title}
                        description={
                          meta.description
                        }
                        badge={
                          meta.badge
                        }
                        accent={
                          meta.accent
                        }
                        actionLabel={
                          meta.actionLabel
                        }
                        onClick={() =>
                          navigate(
                            "/play-and-earn/three-numbers"
                          )
                        }
                      />
                    );
                  }


                  /*
                   * -----------------------------------------
                   * SCRATCH & WIN
                   * -----------------------------------------
                   */

                  if (
                    gameKey ===
                    "scratch_win"
                  ) {
                    return (
                      <GameCard
                        key={gameKey}
                        icon={meta.icon}
                        title={meta.title}
                        description={
                          meta.description
                        }
                        badge={
                          meta.badge
                        }
                        accent={
                          meta.accent
                        }
                        actionLabel={
                          meta.actionLabel
                        }
                        onClick={
                          openScratchWin
                        }
                      />
                    );
                  }


                  /*
                   * -----------------------------------------
                   * DAILY POLL
                   *
                   * Daily Poll is not live yet.
                   * Always show it as Coming Soon with a
                   * disabled button, regardless of Admin
                   * enabled/disabled settings.
                   * -----------------------------------------
                   */

                  if (
                    gameKey ===
                    "daily_poll"
                  ) {
                    return (
                      <GameCard
                        key={gameKey}
                        icon={meta.icon}
                        title={meta.title}
                        description={
                          meta.description
                        }
                        badge="Coming Soon"
                        accent={
                          meta.accent
                        }
                        actionLabel="Coming Soon"
                        disabled
                      />
                    );
                  }


                  return null;
                }
              )}

            </div>
          )}


        {/* ===================================================
            NO ACTIVE GAMES
        ==================================================== */}

        {!settingsLoading &&
          !settingsError &&
          visibleGames.length === 0 && (
            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                px-5
                py-12
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
                  rounded-2xl
                  bg-gray-50
                "
              >
                🎮
              </div>


              <h3
                className="
                  mt-4
                  text-lg
                  font-black
                  text-gray-950
                "
              >
                Games are taking a little break
              </h3>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                There are no Play & Earn games
                available right now. Please check
                back soon.
              </p>

            </div>
          )}

      </section>


      {/* =====================================================
          RULES
      ====================================================== */}

      <section
        className="
          border-t
          border-gray-200/80
          bg-white
        "
      >
        <div
          className="
            mx-auto
            max-w-6xl
            px-4
            py-12
            sm:py-14
          "
        >
          <div className="text-center">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.25em]
                text-purple-600
              "
            >
              Rules & guidelines
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                text-gray-950
                sm:text-3xl
              "
            >
              Know the rules before you play
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
              "
            >
              These rules are updated automatically from the current T&M
              Play & Earn settings.
            </p>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-2">
            {/* Game Rules */}
            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-gray-50
                p-5
                sm:p-6
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-purple-100
                    text-xl
                  "
                >
                  🎮
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-950">
                    Game Rules
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Current limits, rewards and expiry.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {gameRuleItems.map((rule) => (
                  <div
                    key={rule.title}
                    className="
                      rounded-2xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3.5
                    "
                  >
                    <p className="text-sm font-bold text-gray-950">
                      {rule.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      {rule.description}
                    </p>
                  </div>
                ))}

                {gameRuleItems.length === 0 && (
                  <div className="rounded-2xl border border-gray-200 bg-white px-4 py-5 text-center text-sm text-gray-500">
                    Game rules are currently unavailable.
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Rules */}
            <div
              className="
                rounded-3xl
                border
                border-[#E5D5A7]
                bg-gradient-to-br
                from-[#fffaf0]
                to-white
                p-5
                sm:p-6
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className="
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#FFF0C7]
                    text-xl
                  "
                >
                  💰
                </div>

                <div>
                  <h3 className="text-lg font-black text-gray-950">
                    Play & Earn Wallet Rules
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Current checkout redemption rules.
                  </p>
                </div>
              </div>

              {checkoutSettingsLoading ? (
                <div className="mt-5 rounded-2xl border border-[#E5D5A7] bg-white px-4 py-8 text-center">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-[#A06A16]" />
                  <p className="mt-2 text-xs text-gray-500">
                    Loading wallet rules…
                  </p>
                </div>
              ) : checkoutSettings ? (
                <div className="mt-5 space-y-3">
                  {!checkoutSettings.redemption_enabled && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5">
                      <p className="text-sm font-bold text-red-700">
                        Wallet redemption is currently unavailable.
                      </p>
                    </div>
                  )}

                  {walletRuleItems.map((rule) => (
                    <div
                      key={rule.title}
                      className="
                        rounded-2xl
                        border
                        border-[#EEE6D2]
                        bg-white
                        px-4
                        py-3.5
                      "
                    >
                      <p className="text-sm font-bold text-gray-950">
                        {rule.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        {rule.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-2xl border border-gray-200 bg-white px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-gray-700">
                    Wallet rules are temporarily unavailable.
                  </p>
                  <button
                    type="button"
                    onClick={() => void loadCheckoutSettings()}
                    className="
                      mt-3
                      rounded-xl
                      bg-[#A06A16]
                      px-4
                      py-2
                      text-xs
                      font-bold
                      text-white
                    "
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            className="
              mx-auto
              mt-7
              max-w-3xl
              rounded-2xl
              border
              border-gray-200
              bg-gray-50
              px-5
              py-4
              text-center
            "
          >
            <p className="text-xs leading-5 text-gray-500">
              Play & Earn Wallet is separate from your regular T&M Wallet.
              Only eligible rewards and eligible checkout amounts can be
              redeemed according to the current rules.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          TERMS & CONDITIONS
      ====================================================== */}

      <section
        className="
          border-t
          border-gray-200
          bg-gray-50
        "
      >
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14">
          <div className="text-center">
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.25em]
                text-purple-600
              "
            >
              Please read before playing
            </p>

            <h2
              className="
                mt-2
                text-2xl
                font-black
                text-gray-950
                sm:text-3xl
              "
            >
              Terms &amp; Conditions
            </h2>

            <p
              className="
                mx-auto
                mt-3
                max-w-2xl
                text-sm
                leading-6
                text-gray-500
              "
            >
              These terms are generated from the current Play &amp; Earn
              settings and update automatically when the rules change.
            </p>
          </div>

          <div className="mt-7 rounded-3xl border border-gray-200 bg-white p-5 sm:p-7">
            <div className="space-y-6">
              {/* Dynamic game terms */}
              {gameRuleItems.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-gray-950">
                    Game participation
                  </h3>

                  <ul className="mt-3 space-y-3">
                    {gameRuleItems.map((rule) => (
                      <li
                        key={`terms-game-${rule.title}`}
                        className="flex gap-3 text-sm leading-6 text-gray-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />
                        <span>
                          <strong className="font-semibold text-gray-800">
                            {rule.title}:
                          </strong>{" "}
                          {rule.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dynamic wallet terms */}
              {checkoutSettingsLoading ? (
                <div className="border-t border-gray-100 pt-5 text-sm text-gray-500">
                  Loading wallet terms…
                </div>
              ) : checkoutSettings ? (
                <div className="border-t border-gray-100 pt-5">
                  <h3 className="text-sm font-black text-gray-950">
                    Play &amp; Earn Wallet
                  </h3>

                  <ul className="mt-3 space-y-3">
                    {!checkoutSettings.redemption_enabled && (
                      <li className="flex gap-3 text-sm leading-6 text-gray-600">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                        <span>
                          Wallet redemption is currently unavailable.
                        </span>
                      </li>
                    )}

                    {walletRuleItems.map((rule) => (
                      <li
                        key={`terms-wallet-${rule.title}`}
                        className="flex gap-3 text-sm leading-6 text-gray-600"
                      >
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A06A16]" />
                        <span>
                          <strong className="font-semibold text-gray-800">
                            {rule.title}:
                          </strong>{" "}
                          {rule.description}
                        </span>
                      </li>
                    ))}

                    <li className="flex gap-3 text-sm leading-6 text-gray-600">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#A06A16]" />
                      <span>
                        Play &amp; Earn Wallet rewards are separate from your
                        regular T&amp;M Wallet and can only be redeemed when
                        the current checkout eligibility rules are satisfied.
                      </span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="border-t border-gray-100 pt-5 text-sm text-gray-500">
                  Wallet terms are temporarily unavailable.
                </div>
              )}

              {/* Dynamic status / policy */}
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-black text-gray-950">
                  Current rules apply
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-600">
                  Play &amp; Earn game availability, participation limits,
                  reward expiry and wallet redemption rules are controlled by
                  the current T&amp;M Play &amp; Earn settings. If a setting
                  changes, the updated rule shown on this page applies.
                </p>

                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Rewards are subject to the applicable game rules and wallet
                  eligibility requirements. A reward does not guarantee that
                  the same amount, game or redemption option will remain
                  available in the future.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          FOOTER NOTE
      ====================================================== */}

      <div
        className="
          px-4
          py-8
          text-center
        "
      >

        <p
          className="
            text-[11px]
            leading-5
            text-gray-400
          "
        >
          Play & Earn rewards are separate from your regular wallet.
        </p>

      </div>


      {/* =====================================================
          SCRATCH & WIN MODAL
      ====================================================== */}

      {scratchWinOpen && (
        <ScratchWinModal
          onClose={closeScratchWin}
        />
      )}

    </main>
  );
}


/* ============================================================
   SCRATCH & WIN MODAL
============================================================ */

interface ScratchWinModalProps {
  onClose: () => void;
}


function ScratchWinModal({
  onClose,
}: ScratchWinModalProps) {

  const [
    gameStarted,
    setGameStarted,
  ] = useState(false);


  /*
   * =========================================================
   * SCROLL CONTAINER
   * =========================================================
   */

  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );


  const [
    canScroll,
    setCanScroll,
  ] = useState(false);


  const [
    atBottom,
    setAtBottom,
  ] = useState(false);


  /*
   * =========================================================
   * CHECK SCROLL STATE
   * =========================================================
   */

  const updateScrollState =
    useCallback(() => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      const hasOverflow =
        element.scrollHeight >
        element.clientHeight + 4;

      const isBottom =
        element.scrollTop +
          element.clientHeight >=
        element.scrollHeight - 8;

      setCanScroll(
        hasOverflow
      );

      setAtBottom(
        isBottom
      );
    }, []);


  /*
   * =========================================================
   * SCROLL TO TOP / BOTTOM
   * =========================================================
   */

  const handleScrollArrow =
    () => {
      const element =
        scrollRef.current;

      if (!element) {
        return;
      }

      element.scrollTo({
        top: atBottom
          ? 0
          : element.scrollHeight,
        behavior: "smooth",
      });
    };


  /*
   * =========================================================
   * BODY SCROLL LOCK + ESC
   * =========================================================
   */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);


  /*
   * =========================================================
   * WATCH CONTENT SIZE
   * =========================================================
   */

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) {
      return;
    }

    updateScrollState();

    const handleResize =
      () => {
        updateScrollState();
      };

    element.addEventListener(
      "scroll",
      updateScrollState,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "resize",
      handleResize
    );

    const observer =
      typeof ResizeObserver !==
      "undefined"
        ? new ResizeObserver(
            updateScrollState
          )
        : null;

    observer?.observe(
      element
    );

    return () => {
      element.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      observer?.disconnect();
    };
  }, [updateScrollState]);


  /*
   * =========================================================
   * MODAL
   * =========================================================
   */

  const modal = (
    <div
      className="
        fixed
        inset-0
        z-[9999]

        flex
        items-center
        justify-center

        bg-black/60

        p-0

        backdrop-blur-sm

        sm:p-6
      "
      role="dialog"
      aria-modal="true"
      aria-label="Scratch & Win"
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
            event.currentTarget &&
          !gameStarted
        ) {
          onClose();
        }
      }}
    >

      {/* ===================================================
          OUTER MODAL
      ==================================================== */}

      <div
        className="
          relative

          flex
          w-full
          flex-col

          overflow-hidden

          bg-white

          shadow-[0_25px_80px_rgba(0,0,0,0.25)]

          h-[100dvh]
          max-h-[100dvh]

          rounded-none

          sm:h-auto
          sm:max-h-[calc(100dvh-48px)]
          sm:max-w-[560px]
          sm:rounded-[30px]
        "
        onMouseDown={(
          event
        ) => {
          event.stopPropagation();
        }}
      >

        {/* =================================================
            CLOSE BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close Scratch & Win"
          className="
            absolute
            right-4
            top-4
            z-[50]

            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center

            rounded-full

            border
            border-black/5

            bg-white/95

            text-gray-700

            shadow-md

            backdrop-blur-md

            transition-all
            duration-200

            hover:scale-105
            hover:bg-white
            hover:text-black

            active:scale-95
          "
        >
          <X
            size={21}
            strokeWidth={2}
          />
        </button>


        {/* =================================================
            SCROLLABLE CONTENT
        ================================================== */}

        <div
          ref={scrollRef}
          className="
            relative

            min-h-0
            flex-1

            overflow-y-auto
            overscroll-contain

            px-4
            py-4

            sm:px-6
            sm:py-6

            scrollbar-none

            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
          onScroll={
            updateScrollState
          }
        >

          <ScratchWinGame
            onReward={() => {
              setGameStarted(
                true
              );
            }}
          />


          {/* =================================================
              FLOATING SCROLL ARROW
          ================================================== */}

          {canScroll && (
            <button
              type="button"
              onClick={
                handleScrollArrow
              }
              aria-label={
                atBottom
                  ? "Scroll to top"
                  : "Scroll down"
              }
              className="
                sticky
                bottom-3
                ml-auto
                mt-3

                flex
                h-11
                w-11
                items-center
                justify-center

                rounded-full

                border
                border-black/5

                bg-white/95

                text-gray-800

                shadow-[0_8px_25px_rgba(0,0,0,0.16)]

                backdrop-blur-xl

                transition-all
                duration-200

                hover:-translate-y-0.5
                hover:shadow-[0_12px_30px_rgba(0,0,0,0.2)]

                active:scale-90
              "
            >
              {atBottom ? (
                <ArrowUp
                  size={19}
                  strokeWidth={2.2}
                />
              ) : (
                <ArrowDown
                  size={19}
                  strokeWidth={2.2}
                />
              )}
            </button>
          )}

        </div>

      </div>

    </div>
  );


  /*
   * =========================================================
   * REACT PORTAL
   * =========================================================
   */

  return createPortal(
    modal,
    document.body
  );
}


/* ============================================================
   GAME CARD
============================================================ */

interface GameCardProps {
  icon: string;
  title: string;
  description: string;
  badge: string;

  accent:
    | "pink"
    | "purple"
    | "gold";

  actionLabel: string;

  onClick?: () => void;

  disabled?: boolean;
}


function GameCard({
  icon,
  title,
  description,
  badge,
  accent,
  actionLabel,
  onClick,
  disabled = false,
}: GameCardProps) {

  const accentClasses = {

    pink: {
      background:
        "from-[#fff0f5] to-[#fff8fb]",

      icon:
        "bg-[#ffe0eb]",

      badge:
        "bg-[#fff0f5] text-[#b21f55] border-[#f5c3d5]",

      button:
        "bg-[#b21f55] hover:bg-[#991c4b]",
    },


    purple: {
      background:
        "from-[#f5f0ff] to-[#faf8ff]",

      icon:
        "bg-[#e9ddff]",

      badge:
        "bg-[#f5f0ff] text-purple-700 border-purple-200",

      button:
        "bg-purple-700 hover:bg-purple-800",
    },


    gold: {
      background:
        "from-[#fff9e8] to-[#fffdf5]",

      icon:
        "bg-[#ffedb3]",

      badge:
        "bg-[#fff9e8] text-[#9a6a16] border-[#ead18a]",

      button:
        "bg-[#a06a16] hover:bg-[#86570f]",
    },

  };


  const colors =
    accentClasses[accent];


  return (
    <article
      className={[
        "relative overflow-hidden rounded-3xl border border-gray-200",
        "bg-gradient-to-br",
        colors.background,
        "p-5 sm:p-6",
        "transition-all duration-200",

        disabled
          ? "opacity-80"
          : "hover:-translate-y-1 hover:shadow-lg",

      ].join(" ")}
    >

      {/* =================================================
          TOP ROW
      ================================================== */}

      <div
        className="
          flex
          items-start
          justify-between
          gap-4
        "
      >

        <div
          className={[
            "flex h-14 w-14 items-center justify-center",
            "rounded-2xl text-2xl",
            colors.icon,
          ].join(" ")}
        >
          {icon}
        </div>


        <span
          className={[
            "rounded-full border px-3 py-1",
            "text-[10px] font-bold uppercase tracking-[0.12em]",
            colors.badge,
          ].join(" ")}
        >
          {badge}
        </span>

      </div>


      {/* =================================================
          TITLE
      ================================================== */}

      <h3
        className="
          mt-6
          text-xl
          font-black
          text-gray-950
        "
      >
        {title}
      </h3>


      {/* =================================================
          DESCRIPTION
      ================================================== */}

      <p
        className="
          mt-2
          min-h-[48px]
          text-sm
          leading-6
          text-gray-500
        "
      >
        {description}
      </p>


      {/* =================================================
          BUTTON
      ================================================== */}

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "mt-6 min-h-12 w-full rounded-xl px-5 py-3",
          "text-sm font-bold text-white",
          "transition-all duration-200",
          colors.button,

          disabled
            ? "cursor-not-allowed opacity-50"
            : "active:scale-[0.98]",

        ].join(" ")}
      >
        {actionLabel}
      </button>

    </article>
  );
}


/* ============================================================
   HOW IT WORKS
============================================================ */



