import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { useNavigate } from "react-router-dom";
import { threeNumbersService } from "@/features/playEarn/services/threeNumbers.service";

const SPIN_DURATION = 1800;
const REEL_DELAY = 400;
const RESULT_BUFFER = 350;

type GameResult = {
  play_id: string;
  number_1: number;
  number_2: number;
  number_3: number;
  is_win: boolean;
  reward_paise: number;
  already_played: boolean;
  remaining_chances: number;
};

type SlotReelProps = {
  value: number | null;
  spinning: boolean;
  stopDelay: number;
};

function SlotReel({
  value,
  spinning,
  stopDelay,
}: SlotReelProps) {
  const reelNumbers = useMemo(() => {
    const base = Array.from({ length: 10 }, (_, index) => index);

    // Many repeated cycles make the reel look like one continuous
    // rotating drum instead of a short list that visibly loops.
    return Array.from({ length: 8 }, () => base).flat();
  }, []);

  return (
    <div
      className={[
        "relative h-24 overflow-hidden rounded-[22px]",
        "border-2 border-[#d7d9df]",
        "bg-white",
        "shadow-[inset_0_10px_18px_rgba(0,0,0,0.10),inset_0_-10px_18px_rgba(0,0,0,0.10)]",
      ].join(" ")}
    >
      {/* Center highlight */}
      <div
        className="pointer-events-none absolute inset-x-0 top-1/2 z-10 h-24 -translate-y-1/2 rounded-[20px] border border-white/80"
        aria-hidden="true"
      />

      {!spinning && value === null ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-5xl font-black text-gray-300">
            ?
          </span>
        </div>
      ) : spinning ? (
        <div
          className="flex flex-col items-center"
          style={{
            /*
             * The track contains identical repeated number cycles.
             * We travel through complete cycles and finish exactly
             * on the server-selected digit. Because the beginning
             * and every cycle are identical, there is no visible
             * jump while the drum rotates.
             */
            "--reel-end": `-${(
              (12 * 10 + (value ?? 0)) *
              6
            )}px`,
            animation: `slotSpin ${SPIN_DURATION}ms cubic-bezier(0.16, 0.78, 0.18, 1)`,
            animationDelay: `${stopDelay}ms`,
            animationFillMode: "forwards",
          } as CSSProperties}
        >
          {reelNumbers.map((number, index) => (
            <div
              key={`${number}-${index}`}
              className="flex h-24 w-full shrink-0 items-center justify-center text-5xl font-black text-[#35133f]"
            >
              {number}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <span className="text-5xl font-black text-[#35133f]">
            {value}
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   FIREWORK / CONFETTI PARTICLES
============================================================ */

function CelebrationParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 46 }, (_, index) => {
      const angle = Math.random() * 360;
      const distance = 80 + Math.random() * 180;
      const delay = Math.random() * 0.7;
      const size = 5 + Math.random() * 7;

      return {
        id: index,
        angle,
        distance,
        delay,
        size,
        shape: index % 3,
      };
    });
  }, []);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Firework burst 1 */}
      <div className="absolute left-[18%] top-[22%]">
        <div className="firework-burst">
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="firework-ray"
              style={{
                transform: `rotate(${index * 30}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Firework burst 2 */}
      <div className="absolute right-[18%] top-[18%]">
        <div
          className="firework-burst"
          style={{
            animationDelay: "0.35s",
          }}
        >
          {Array.from({ length: 12 }, (_, index) => (
            <span
              key={index}
              className="firework-ray"
              style={{
                transform: `rotate(${index * 30}deg)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Confetti */}
      {particles.map((particle) => {
        const x =
          Math.cos((particle.angle * Math.PI) / 180) *
          particle.distance;

        const y =
          Math.sin((particle.angle * Math.PI) / 180) *
          particle.distance;

        return (
          <span
            key={particle.id}
            className={[
              "absolute left-1/2 top-[42%]",
              particle.shape === 0
                ? "rounded-full"
                : particle.shape === 1
                  ? "rounded-sm"
                  : "rounded-[2px]",
              "confetti-particle",
            ].join(" ")}
            style={
              {
                width: `${particle.size}px`,
                height:
                  particle.shape === 1
                    ? `${particle.size * 1.8}px`
                    : `${particle.size}px`,
                "--x": `${x}px`,
                "--y": `${y}px`,
                "--delay": `${particle.delay}s`,
                "--rotation": `${particle.angle + 180}deg`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}

/* ============================================================
   WIN POPUP
============================================================ */

type WinPopupProps = {
  rewardPaise: number;
  onClose: () => void;
};

function WinPopup({
  rewardPaise,
  onClose,
}: WinPopupProps) {
  const reward = (rewardPaise / 100).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="three-numbers-win-title"
    >
      <CelebrationParticles />

      <div className="relative w-full max-w-md animate-[winPopupIn_420ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <div
          className="pointer-events-none absolute -inset-4 rounded-[38px] bg-pink-400/20 blur-2xl"
          aria-hidden="true"
        />

        <div className="relative overflow-hidden rounded-[32px] border border-[#e7c66a] bg-gradient-to-br from-white via-[#fffafd] to-[#fff1f7] p-7 text-center shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-9">
          <div
            className="pointer-events-none absolute -left-16 -top-16 h-36 w-36 rounded-full bg-pink-200/50 blur-3xl"
            aria-hidden="true"
          />

          <div
            className="pointer-events-none absolute -right-16 top-4 h-36 w-36 rounded-full bg-purple-200/50 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative">
            <div className="mx-auto flex h-20 w-20 animate-[celebrateBounce_900ms_ease-out] items-center justify-center rounded-full border border-[#efd17c] bg-gradient-to-br from-[#fff7d6] to-[#ffe9a3] text-4xl shadow-[0_10px_30px_rgba(215,165,42,0.2)]">
              🎉
            </div>

            <p className="mt-5 text-[11px] font-black uppercase tracking-[0.32em] text-[#a06a16]">
              Jackpot
            </p>

            <h2
              id="three-numbers-win-title"
              className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl"
            >
              You Won! 🎊
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              All three numbers matched.
            </p>

            <div className="mt-6">
              <p className="text-5xl font-black tracking-tight text-[#c52663] sm:text-6xl">
                ₹{reward}
              </p>

              <div className="mx-auto mt-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />

                <span className="text-xs font-bold text-emerald-700">
                  Added to your Play & Earn Wallet
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              autoFocus
              className="mt-7 min-h-12 w-full rounded-2xl bg-gradient-to-r from-[#c52663] to-[#a91d55] px-6 py-3.5 text-sm font-black text-white shadow-[0_10px_25px_rgba(197,38,99,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(197,38,99,0.32)] active:translate-y-0"
            >
              Awesome! 🎉
            </button>

            <p className="mt-4 text-[10px] text-gray-400">
              Keep playing if you still have chances left today.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   LOSS POPUP
============================================================ */

type LossPopupProps = {
  onClose: () => void;
};

function LossPopup({
  onClose,
}: LossPopupProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="three-numbers-loss-title"
    >
      <div className="w-full max-w-sm animate-[winPopupIn_350ms_cubic-bezier(0.2,0.8,0.2,1)]">
        <div className="rounded-[30px] border border-gray-200 bg-white p-7 text-center shadow-[0_25px_70px_rgba(0,0,0,0.25)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-3xl">
            🎰
          </div>

          <h2
            id="three-numbers-loss-title"
            className="mt-5 text-2xl font-black text-gray-950"
          >
            Better Luck Next Time!
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            The numbers didn't match this time.
          </p>

          <div className="mt-4 inline-flex rounded-full bg-purple-50 px-4 py-2 text-xs font-bold text-purple-700">
            Keep trying — you may have more chances today
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-12 w-full rounded-2xl bg-gray-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN GAME
============================================================ */

export default function ThreeNumbersGame() {
  const navigate = useNavigate();

  const [numbers, setNumbers] = useState<
    [number | null, number | null, number | null]
  >([null, null, null]);

  const [spinning, setSpinning] = useState(false);

  const [gameResult, setGameResult] =
    useState<GameResult | null>(null);

  const [error, setError] = useState("");

  const [showWinPopup, setShowWinPopup] =
    useState(false);

  const [showLossPopup, setShowLossPopup] =
    useState(false);

  const [machineShake, setMachineShake] =
    useState(false);

  const [checkingToday, setCheckingToday] =
    useState(true);

  const [remainingChances, setRemainingChances] =
    useState(5);

  const canPlay =
    !spinning &&
    !checkingToday &&
    remainingChances > 0;

  /* ==========================================================
     CHECK TODAY'S PLAY ON PAGE LOAD
  =========================================================== */

  useEffect(() => {
    let mounted = true;

    const checkTodayPlay = async () => {
      try {
        setCheckingToday(true);
        setError("");

        const todayStats =
          await threeNumbersService.getTodayStats();

        if (!mounted) {
          return;
        }

        setRemainingChances(
          Math.max(0, todayStats.remaining_chances)
        );

        const hasTodayPlay =
          todayStats.total_plays > 0 &&
          todayStats.last_play_id !== null &&
          todayStats.last_number_1 !== null &&
          todayStats.last_number_2 !== null &&
          todayStats.last_number_3 !== null &&
          todayStats.last_is_win !== null;

        if (hasTodayPlay) {
          const restoredResult: GameResult = {
            play_id: todayStats.last_play_id!,
            number_1: todayStats.last_number_1!,
            number_2: todayStats.last_number_2!,
            number_3: todayStats.last_number_3!,
            is_win: todayStats.last_is_win!,
            reward_paise: todayStats.last_reward_paise,
            already_played: false,
            remaining_chances: todayStats.remaining_chances,
          };

          setNumbers([
            restoredResult.number_1,
            restoredResult.number_2,
            restoredResult.number_3,
          ]);

          setGameResult(restoredResult);
        }

      } catch (checkError) {
        console.error(
          "Failed to check today's 3 Numbers play:",
          checkError
        );

        if (mounted) {
          setError(
            checkError instanceof Error
              ? checkError.message
              : "Unable to check today's game status"
          );
        }
      } finally {
        if (mounted) {
          setCheckingToday(false);
        }
      }
    };

    void checkTodayPlay();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     PLAY
  =========================================================== */

  const handlePlay = async () => {
    if (!canPlay) {
      return;
    }

    try {
      setError("");
      setGameResult(null);
      setShowWinPopup(false);
      setShowLossPopup(false);

      setSpinning(true);
      setMachineShake(true);

      /*
       * Server generates the actual result.
       */
      const result =
        await threeNumbersService.play();

      /*
       * IMPORTANT:
       *
       * If the server says today's chances are exhausted,
       * DO NOT start the reel animation.
       *
       * This protects against repeated clicks and also
       * handles direct API calls correctly.
       */
      if (result.already_played) {
        setNumbers([
          result.number_1,
          result.number_2,
          result.number_3,
        ]);

        setGameResult(result);
        setRemainingChances(result.remaining_chances);
        setSpinning(false);
        setMachineShake(false);

        return;
      }

      /*
       * Normal play. The server tells us exactly how many
       * chances remain after this spin.
       */
      setRemainingChances(result.remaining_chances);

      window.setTimeout(() => {
        setMachineShake(false);
      }, SPIN_DURATION + 500);

      /*
       * Reel 1 stops.
       */
      window.setTimeout(() => {
        setNumbers([
          result.number_1,
          null,
          null,
        ]);
      }, SPIN_DURATION);

      /*
       * Reel 2 stops.
       */
      window.setTimeout(() => {
        setNumbers([
          result.number_1,
          result.number_2,
          null,
        ]);
      }, SPIN_DURATION + REEL_DELAY);

      /*
       * Reel 3 stops.
       */
      window.setTimeout(() => {
        setNumbers([
          result.number_1,
          result.number_2,
          result.number_3,
        ]);

        setSpinning(false);
        setGameResult(result);

        /*
         * Give the final reel a moment to settle.
         */
        window.setTimeout(() => {
          if (result.is_win) {
            setShowWinPopup(true);
          } else {
            setShowLossPopup(true);
          }
        }, RESULT_BUFFER);
      }, SPIN_DURATION + REEL_DELAY * 2);
    } catch (playError) {
      console.error(
        "3 Numbers game error:",
        playError
      );

      setSpinning(false);
      setMachineShake(false);

      setError(
        playError instanceof Error
          ? playError.message
          : "Unable to play 3 Numbers"
      );
    }
  };

  /* ==========================================================
     RENDER
  =========================================================== */

  return (
    <>
      <style>
        {`
          @keyframes slotSpin {
            0% {
              transform: translate3d(0, 0, 0);
            }

            12% {
              transform: translate3d(0, -18%, 0);
            }

            30% {
              transform: translate3d(0, -43%, 0);
            }

            50% {
              transform: translate3d(0, -68%, 0);
            }

            70% {
              transform: translate3d(0, -84%, 0);
            }

            88% {
              transform: translate3d(0, -94%, 0);
            }

            100% {
              transform: translate3d(0, var(--reel-end), 0);
            }
          }

          @keyframes machineShake {
            0%, 100% {
              transform: translateX(0);
            }

            20% {
              transform: translateX(-4px) rotate(-0.4deg);
            }

            40% {
              transform: translateX(4px) rotate(0.4deg);
            }

            60% {
              transform: translateX(-3px) rotate(-0.3deg);
            }

            80% {
              transform: translateX(3px) rotate(0.3deg);
            }
          }

          @keyframes winPopupIn {
            0% {
              opacity: 0;
              transform: scale(0.82) translateY(20px);
            }

            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }

          @keyframes celebrateBounce {
            0% {
              opacity: 0;
              transform: scale(0.3) rotate(-15deg);
            }

            60% {
              opacity: 1;
              transform: scale(1.12) rotate(5deg);
            }

            100% {
              transform: scale(1) rotate(0);
            }
          }

          @keyframes fireworkBurst {
            0% {
              opacity: 0;
              transform: scale(0.2);
            }

            20% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform: scale(1.25);
            }
          }

          @keyframes fireworkRay {
            0% {
              height: 0;
              opacity: 0;
            }

            20% {
              opacity: 1;
            }

            100% {
              height: 55px;
              opacity: 0;
            }
          }

          @keyframes confettiFall {
            0% {
              opacity: 0;
              transform:
                translate(-50%, -50%)
                scale(0.5)
                rotate(0deg);
            }

            15% {
              opacity: 1;
            }

            100% {
              opacity: 0;
              transform:
                translate(
                  calc(-50% + var(--x)),
                  calc(-50% + var(--y))
                )
                rotate(var(--rotation));
            }
          }

          .firework-burst {
            position: relative;
            width: 10px;
            height: 10px;
            animation: fireworkBurst 1.5s ease-out infinite;
          }

          .firework-ray {
            position: absolute;
            left: 4px;
            top: 4px;
            width: 3px;
            height: 0;
            border-radius: 999px;
            background: #f3c94f;
            transform-origin: 50% 0;
            animation: fireworkRay 1.25s ease-out infinite;
          }

          .confetti-particle {
            opacity: 0;
            background: #c52663;
            animation:
              confettiFall 1.9s
              cubic-bezier(0.2, 0.7, 0.3, 1)
              var(--delay)
              forwards;
          }

          .confetti-particle:nth-child(3n) {
            background: #f0bd3b;
          }

          .confetti-particle:nth-child(4n) {
            background: #7b3fb8;
          }

          .confetti-particle:nth-child(5n) {
            background: #ef5b87;
          }

          @media (prefers-reduced-motion: reduce) {
            .firework-burst,
            .firework-ray,
            .confetti-particle {
              animation: none !important;
            }
          }
        `}
      </style>

      <main className="min-h-screen w-full bg-gradient-to-b from-[#fff8fb] via-white to-[#f8f5ff] px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl">
          {/* ==================================================
              BACK BUTTON
          =================================================== */}

          <button
            type="button"
            onClick={() =>
              navigate("/play-and-earn")
            }
            className="mb-5 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold text-gray-600 transition hover:text-gray-950"
          >
            <span className="text-lg">←</span>
            Back to Play & Earn
          </button>

          {/* ==================================================
              TITLE
          =================================================== */}

          <div className="mb-7 text-center">
            <span className="inline-flex items-center rounded-full border border-[#e7c66a] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#a06a16] shadow-sm">
              Daily Game
            </span>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
              3 Numbers
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
              Pull the lever and match all three numbers
              to win a reward.
            </p>
          </div>

          {/* ==================================================
              SLOT MACHINE
          =================================================== */}

          <div
            className={[
              "relative mx-auto max-w-3xl",
              machineShake
                ? "animate-[machineShake_280ms_ease-in-out_infinite]"
                : "",
            ].join(" ")}
          >
            <div className="relative overflow-hidden rounded-[38px] border-2 border-[#d7a936] bg-gradient-to-br from-[#42124b] via-[#67164f] to-[#92244f] px-5 pb-7 pt-7 shadow-[0_25px_60px_rgba(65,18,75,0.25)] sm:px-10 sm:pb-10 sm:pt-9">
              {/* Decorative glow */}
              <div
                className="pointer-events-none absolute -left-20 -top-20 h-52 w-52 rounded-full bg-pink-300/10 blur-3xl"
                aria-hidden="true"
              />

              <div
                className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-purple-300/10 blur-3xl"
                aria-hidden="true"
              />

              {/* Machine title */}
              <div className="relative text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#f5d477]">
                  T&M Jewels
                </p>

                <h2 className="mt-2 text-2xl font-black tracking-[0.12em] text-white sm:text-3xl">
                  LUCKY 3
                </h2>
              </div>

              {/* Reels */}
              <div className="relative mt-7">
                <div className="rounded-[28px] border-2 border-[#efc85f] bg-gradient-to-b from-[#dcae3e] to-[#9a681e] p-3 shadow-[0_12px_25px_rgba(0,0,0,0.22)] sm:p-4">
                  <div className="rounded-[23px] border-2 border-[#6b3d22] bg-[#281d27] p-3 sm:p-4">
                    <div className="grid grid-cols-3 gap-3 sm:gap-4">
                      <SlotReel
                        value={numbers[0]}
                        spinning={spinning}
                        stopDelay={0}
                      />

                      <SlotReel
                        value={numbers[1]}
                        spinning={spinning}
                        stopDelay={REEL_DELAY}
                      />

                      <SlotReel
                        value={numbers[2]}
                        spinning={spinning}
                        stopDelay={
                          REEL_DELAY * 2
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Side arrow */}
                <div
                  className="absolute -left-1 top-1/2 hidden h-0 w-0 -translate-y-1/2 border-b-[12px] border-r-[16px] border-t-[12px] border-b-transparent border-r-[#efc85f] border-t-transparent sm:block"
                  aria-hidden="true"
                />
              </div>

              {/* Lever */}
              <div
                className="absolute right-3 top-1/2 hidden -translate-y-[38%] sm:block"
                aria-hidden="true"
              >
                <div className="relative h-44 w-14">
                  <div className="absolute left-1/2 top-7 h-28 w-4 -translate-x-1/2 rotate-[-8deg] rounded-full bg-gradient-to-r from-[#8e5d16] via-[#f4c54e] to-[#9b681b] shadow-[2px_3px_6px_rgba(0,0,0,0.3)]" />

                  <div className="absolute left-1/2 top-0 h-11 w-11 -translate-x-1/2 rounded-full border-2 border-[#a66f1e] bg-gradient-to-br from-[#ffe27a] via-[#e8ad2d] to-[#a96d18] shadow-[0_5px_10px_rgba(0,0,0,0.3)]" />

                  <div className="absolute bottom-0 left-1/2 h-10 w-14 -translate-x-1/2 rounded-2xl border border-[#b57b20] bg-gradient-to-b from-[#f1bd42] to-[#a66d18] shadow-[0_5px_10px_rgba(0,0,0,0.25)]" />
                </div>
              </div>

              {/* Pull button */}
              <div className="relative mt-7 flex justify-center">
                <button
                  type="button"
                  onClick={handlePlay}
                  disabled={!canPlay}
                  className={[
                    "min-h-16 min-w-[220px] rounded-2xl",
                    "border-2 border-[#f5d477]",
                    "px-8 py-4",
                    "text-sm font-black uppercase tracking-[0.2em]",
                    "text-white",
                    "shadow-[0_8px_0_rgba(89,19,56,0.7),0_14px_25px_rgba(0,0,0,0.2)]",
                    "transition-all duration-150",
                    canPlay
                      ? "bg-gradient-to-b from-[#f04776] to-[#c52663] hover:-translate-y-0.5 hover:shadow-[0_10px_0_rgba(89,19,56,0.7),0_18px_30px_rgba(0,0,0,0.22)] active:translate-y-1 active:shadow-[0_4px_0_rgba(89,19,56,0.7)]"
                      : remainingChances === 0
                        ? "cursor-not-allowed border-[#b77a46] bg-gradient-to-b from-[#6d3a5f] to-[#542b4d] text-white/75 opacity-100 shadow-[0_6px_0_rgba(48,18,43,0.45)]"
                        : "cursor-not-allowed bg-gray-500/60 opacity-60",
                  ].join(" ")}
                >
                  {checkingToday
                    ? "CHECKING..."
                    : spinning
                      ? "GOOD LUCK..."
                      : remainingChances === 0
                        ? "🔒 NO CHANCES LEFT"
                        : "PULL TO PLAY"}
                </button>
              </div>

              <div className="relative mt-5 flex flex-col items-center text-center">
                {remainingChances === 0 ? (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#d7a936]/70 bg-black/15 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#f5d477]/15 text-xs">
                        🔒
                      </span>

                      <span className="text-sm font-black tracking-wide text-white">
                        No chances left today
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] font-medium text-white/60">
                      5 new chances unlock tomorrow
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-2 rounded-full border border-[#f5d477]/70 bg-black/15 px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                      <span className="text-sm">✨</span>

                      <span className="text-sm font-black tracking-wide text-white">
                        Chances left: {remainingChances}/5
                      </span>
                    </div>

                    <p className="mt-2 text-[11px] font-medium text-white/60">
                      5 chances refresh every day
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Machine feet */}
            <div className="mx-auto flex max-w-3xl justify-between px-16">
              <div className="h-4 w-20 rounded-b-xl bg-[#571d43]" />
              <div className="h-4 w-20 rounded-b-xl bg-[#571d43]" />
            </div>
          </div>

          {/* ==================================================
              ERROR
          =================================================== */}

          {error && (
            <div className="mx-auto mt-7 max-w-2xl rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center">
              <p className="text-sm font-medium text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => setError("")}
                className="mt-3 rounded-lg bg-gray-950 px-4 py-2 text-xs font-bold text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* ==================================================
              RESULT CARD
          =================================================== */}

          {gameResult && !spinning && (
            <div
              className={[
                "mx-auto mt-7 max-w-2xl overflow-hidden rounded-3xl border p-6 text-center sm:p-8",
                gameResult.is_win
                  ? "border-[#e7c66a] bg-gradient-to-br from-[#fff9e8] via-white to-[#fff0f6]"
                  : "border-gray-200 bg-white",
              ].join(" ")}
            >
              {gameResult.is_win ? (
                <>
                  <div className="text-4xl">🎉</div>

                  <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#a06a16]">
                    Jackpot
                  </p>

                  <h2 className="mt-2 text-3xl font-black text-gray-950">
                    You Won!
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    All three numbers matched.
                  </p>

                  <p className="mt-4 text-5xl font-black text-[#c52663]">
                    ₹
                    {(
                      gameResult.reward_paise / 100
                    ).toLocaleString("en-IN")}
                  </p>

                  <p className="mt-2 text-xs text-gray-500">
                    Added to your Play & Earn Wallet
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl">🎰</div>

                  <h2 className="mt-3 text-2xl font-black text-gray-950">
                    Better Luck Next Time!
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Your numbers didn't match this time.
                  </p>

                  <p className="mt-4 text-xs font-bold text-purple-600">
                    {remainingChances > 0
                      ? `You have ${remainingChances} chance${remainingChances === 1 ? "" : "s"} left today.`
                      : "Your 5 chances are used for today. Come back tomorrow."}
                  </p>
                </>
              )}
            </div>
          )}

          {/* ==================================================
              FOOTER INFO
          =================================================== */}

          <div className="mx-auto mt-7 max-w-2xl text-center">
            <p className="text-[10px] leading-5 text-gray-400">
              Results are generated securely on the server.
              Your Play & Earn rewards are separate from
              your regular wallet.
            </p>
          </div>
        </div>
      </main>

      {/* ======================================================
          WIN POPUP
      ======================================================= */}

      {showWinPopup &&
        gameResult?.is_win &&
        gameResult.reward_paise > 0 && (
          <WinPopup
            rewardPaise={gameResult.reward_paise}
            onClose={() => setShowWinPopup(false)}
          />
        )}

      {/* ======================================================
          LOSS POPUP
      ======================================================= */}

      {showLossPopup &&
        gameResult &&
        !gameResult.is_win && (
          <LossPopup
            onClose={() => setShowLossPopup(false)}
          />
        )}
    </>
  );
}