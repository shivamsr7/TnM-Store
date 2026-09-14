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
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    void loadGameSettings();
  }, [loadGameSettings]);


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
          HOW IT WORKS
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
            max-w-5xl
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
              How it works
            </p>


            <h2
              className="
                mt-2
                text-2xl
                font-black
                text-gray-950
              "
            >
              Simple. Fun. Rewarding.
            </h2>

          </div>


          <div
            className="
              mt-8
              grid
              gap-4
              sm:grid-cols-3
            "
          >

            <HowItWorksStep
              number="01"
              icon="🎮"
              title="Choose a game"
              description="Pick any available Play & Earn game."
            />


            <HowItWorksStep
              number="02"
              icon="✨"
              title="Play"
              description="Play according to the game's rules."
            />


            <HowItWorksStep
              number="03"
              icon="💰"
              title="Earn rewards"
              description="Eligible rewards are added to your Play & Earn Wallet."
            />

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

interface HowItWorksStepProps {
  number: string;
  icon: string;
  title: string;
  description: string;
}


function HowItWorksStep({
  number,
  icon,
  title,
  description,
}: HowItWorksStepProps) {

  return (
    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-gray-50
        p-5
      "
    >

      <div
        className="
          flex
          items-center
          justify-between
        "
      >

        <span
          className="
            text-xs
            font-black
            tracking-[0.2em]
            text-gray-300
          "
        >
          {number}
        </span>


        <span className="text-xl">
          {icon}
        </span>

      </div>


      <h3
        className="
          mt-5
          font-bold
          text-gray-950
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-1
          text-sm
          leading-5
          text-gray-500
        "
      >
        {description}
      </p>

    </div>
  );
}