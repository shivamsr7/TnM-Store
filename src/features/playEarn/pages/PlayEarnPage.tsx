import { useNavigate } from "react-router-dom";
import PlayEarnWallet from "@/features/playEarn/components/PlayEarnWallet";

export default function PlayEarnPage() {
  const navigate = useNavigate();

  return (
    <main className="w-full bg-gradient-to-b from-[#fff8fb] via-white to-[#f8f5ff]">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="relative overflow-hidden">
        {/* Decorative background */}
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-pink-200/30 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-10 sm:pb-12 sm:pt-14">
          <div className="text-center">
            <span className="inline-flex items-center rounded-full border border-purple-200 bg-white px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-purple-700 shadow-sm">
              T&M Jewels
            </span>

            <h1 className="mt-5 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
              Play & Earn
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
              Take a little break, play our games and earn rewards
              in your Play & Earn Wallet.
            </p>
          </div>

          {/* =================================================
              ACTUAL PLAY & EARN WALLET
          ================================================== */}

          <div className="mx-auto mt-8 max-w-2xl">
            <PlayEarnWallet />
          </div>
        </div>
      </section>

      {/* =====================================================
          GAMES
      ====================================================== */}

      <section className="mx-auto max-w-6xl px-4 pb-14">
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">
            Choose your game
          </p>

          <h2 className="mt-2 text-2xl font-black text-gray-950 sm:text-3xl">
            Play. Match. Win.
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* =================================================
              3 NUMBERS
          ================================================== */}

          <GameCard
            icon="🎰"
            title="3 Numbers"
            description="Pull the lever and match all three numbers to win."
            badge="Live Now"
            accent="pink"
            actionLabel="Play Now"
            onClick={() => navigate("/play-and-earn/three-numbers")}
          />

          {/* =================================================
              SCRATCH & WIN
          ================================================== */}

          <GameCard
            icon="🎁"
            title="Scratch & Win"
            description="Scratch your card and reveal your surprise reward."
            badge="Coming Soon"
            accent="purple"
            actionLabel="Coming Soon"
            disabled
          />

          {/* =================================================
              DAILY POLL
          ================================================== */}

          <GameCard
            icon="🗳️"
            title="Daily Poll"
            description="Vote every day and build your 7-day streak."
            badge="Coming Soon"
            accent="gold"
            actionLabel="Coming Soon"
            disabled
          />
        </div>
      </section>

      {/* =====================================================
          HOW IT WORKS
      ====================================================== */}

      <section className="border-t border-gray-200/80 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:py-14">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-purple-600">
              How it works
            </p>

            <h2 className="mt-2 text-2xl font-black text-gray-950">
              Simple. Fun. Rewarding.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
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

      <div className="px-4 py-8 text-center">
        <p className="text-[11px] leading-5 text-gray-400">
          Play & Earn rewards are separate from your regular wallet.
        </p>
      </div>
    </main>
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
  accent: "pink" | "purple" | "gold";
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
      background: "from-[#fff0f5] to-[#fff8fb]",
      icon: "bg-[#ffe0eb]",
      badge:
        "bg-[#fff0f5] text-[#b21f55] border-[#f5c3d5]",
      button:
        "bg-[#b21f55] hover:bg-[#991c4b]",
    },

    purple: {
      background: "from-[#f5f0ff] to-[#faf8ff]",
      icon: "bg-[#e9ddff]",
      badge:
        "bg-[#f5f0ff] text-purple-700 border-purple-200",
      button:
        "bg-purple-700 hover:bg-purple-800",
    },

    gold: {
      background: "from-[#fff9e8] to-[#fffdf5]",
      icon: "bg-[#ffedb3]",
      badge:
        "bg-[#fff9e8] text-[#9a6a16] border-[#ead18a]",
      button:
        "bg-[#a06a16] hover:bg-[#86570f]",
    },
  };

  const colors = accentClasses[accent];

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
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
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

      <h3 className="mt-6 text-xl font-black text-gray-950">
        {title}
      </h3>

      <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-500">
        {description}
      </p>

      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={[
          "mt-6 min-h-12 w-full rounded-xl px-5 py-3",
          "text-sm font-bold text-white",
          "transition-colors duration-200",
          colors.button,
          disabled
            ? "cursor-not-allowed opacity-50"
            : "",
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
    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black tracking-[0.2em] text-gray-300">
          {number}
        </span>

        <span className="text-xl">{icon}</span>
      </div>

      <h3 className="mt-5 font-bold text-gray-950">
        {title}
      </h3>

      <p className="mt-1 text-sm leading-5 text-gray-500">
        {description}
      </p>
    </div>
  );
}