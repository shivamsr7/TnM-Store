import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Gamepad2,
  Gift,
  LockKeyhole,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/shared/lib/supabase";

type GameKey = "three_numbers" | "scratch_win" | "daily_poll";

interface GameSetting {
  game_key: string;
  enabled?: boolean | null;
}

interface GameMeta {
  icon: typeof Gamepad2;
  title: string;
  description: string;
  accent: "gold" | "purple" | "pink";
  comingSoon?: boolean;
}

const GAME_META: Record<GameKey, GameMeta> = {
  three_numbers: {
    icon: Gamepad2,
    title: "3 Numbers",
    description: "Pick your numbers and test your luck.",
    accent: "gold",
  },
  scratch_win: {
    icon: Gift,
    title: "Scratch & Win",
    description: "Scratch your card and reveal your surprise.",
    accent: "purple",
  },
  daily_poll: {
    icon: Trophy,
    title: "Daily Poll",
    description: "Vote every day and build your 7-day streak.",
    accent: "pink",
    comingSoon: true,
  },
};

const DEFAULT_ENABLED: Record<GameKey, boolean> = {
  three_numbers: true,
  scratch_win: true,
  daily_poll: true,
};

function normalizeSettings(data: unknown): GameSetting[] {
  if (!Array.isArray(data)) return [];

  return data
    .map((row) => ({
      game_key: String(row?.game_key ?? ""),
      enabled: Boolean(row?.enabled),
    }))
    .filter((row) => row.game_key);
}

export default function PlayEarnHomeSection() {
  const [settings, setSettings] = useState<GameSetting[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      const { data, error } = await supabase.rpc(
        "get_play_earn_game_settings",
      );

      if (!mounted || error) return;

      setSettings(normalizeSettings(data));
    };

    void loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const enabledMap = useMemo(() => {
    const map = { ...DEFAULT_ENABLED };

    for (const setting of settings) {
      if (setting.game_key in map) {
        map[setting.game_key as GameKey] = Boolean(setting.enabled);
      }
    }

    // Daily Poll remains visible as a Coming Soon teaser until launched.
    map.daily_poll = true;

    return map;
  }, [settings]);

  const games = (Object.keys(GAME_META) as GameKey[]).filter(
    (gameKey) => enabledMap[gameKey],
  );

  return (
    <section className="relative overflow-hidden bg-[#050505]">
      {/* Very subtle background treatment */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_45%,rgba(200,164,77,0.07),transparent_28%),radial-gradient(circle_at_88%_60%,rgba(139,92,246,0.055),transparent_30%)]" />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-6 lg:px-8 lg:py-20">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#C8A44D]">
            <Sparkles size={12} strokeWidth={1.8} />
            <span>Member Exclusive</span>
          </div>

          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Play &{" "}
            <span className="text-[#D4AF37]">Earn</span>
          </h2>

          <div className="mx-auto mt-4 h-px w-12 bg-[#D4AF37]" />

          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/60 sm:text-[15px]">
            A little extra fun for our members. Play exclusive games and enjoy
            rewards along the way.
          </p>
        </div>

        {/* Game cards */}
        <div className="mx-auto mt-10 grid max-w-6xl gap-4 md:grid-cols-3">
          {games.map((gameKey) => {
            const meta = GAME_META[gameKey];
            const Icon = meta.icon;
            const isComingSoon = Boolean(meta.comingSoon);

            const accent =
              meta.accent === "gold"
                ? {
                    icon: "#D4AF37",
                    border: "rgba(212,175,55,0.28)",
                    hoverBorder: "hover:border-[#D4AF37]/55",
                    iconBackground: "rgba(212,175,55,0.07)",
                    glow: "rgba(212,175,55,0.08)",
                  }
                : meta.accent === "purple"
                  ? {
                      icon: "#C9B8FF",
                      border: "rgba(167,139,250,0.25)",
                      hoverBorder: "hover:border-violet-400/50",
                      iconBackground: "rgba(139,92,246,0.07)",
                      glow: "rgba(139,92,246,0.08)",
                    }
                  : {
                      icon: "#EAB8F0",
                      border: "rgba(232,121,249,0.22)",
                      hoverBorder: "hover:border-fuchsia-400/45",
                      iconBackground: "rgba(232,121,249,0.06)",
                      glow: "rgba(232,121,249,0.06)",
                    };

            const card = (
              <article
                className={`group relative overflow-hidden rounded-2xl border bg-[#0A0A0A] p-5 transition-all duration-300 sm:p-6 ${
                  accent.hoverBorder
                } ${
                  isComingSoon
                    ? "opacity-70"
                    : "hover:-translate-y-1 hover:bg-[#0C0C0C] hover:shadow-[0_18px_50px_rgba(0,0,0,0.28)]"
                }`}
                style={{ borderColor: accent.border }}
              >
                {/* Small accent glow */}
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full blur-3xl"
                  style={{ backgroundColor: accent.glow }}
                />

                <div className="relative flex items-start gap-4">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10"
                    style={{
                      color: accent.icon,
                      backgroundColor: accent.iconBackground,
                    }}
                  >
                    <Icon size={21} strokeWidth={1.7} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[17px] font-semibold text-white">
                        {meta.title}
                      </h3>

                      {isComingSoon ? (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                          <LockKeyhole size={10} />
                          Soon
                        </span>
                      ) : (
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/5 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          Live
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-sm leading-6 text-white/60">
                      {meta.description}
                    </p>

                    <div className="mt-6 flex items-center justify-end border-t border-white/10 pt-4">
                      {isComingSoon ? (
                        <span className="text-xs font-medium text-white/40">
                          Stay tuned
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition-all duration-300 group-hover:gap-3 group-hover:text-white"
                          style={{ color: accent.icon }}
                        >
                          Play now
                          <ArrowRight size={14} />
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-1/2 h-px w-0 -translate-x-1/2 bg-[#D4AF37] transition-all duration-300 group-hover:w-1/2" />
              </article>
            );

            return isComingSoon ? (
              <div key={gameKey}>{card}</div>
            ) : (
              <Link
                key={gameKey}
                to="/play-and-earn"
                className="block outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#050505]"
              >
                {card}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-9 flex flex-col items-center">
          <Link
            to="/play-and-earn"
            className="group inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-semibold text-black transition-all duration-300 hover:bg-[#E2C45A] hover:shadow-[0_10px_30px_rgba(212,175,55,0.18)]"
          >
            Explore Play & Earn
            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>

          <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-white/30">
            Exclusive for T&M members
          </p>
        </div>
      </div>
    </section>
  );
}
