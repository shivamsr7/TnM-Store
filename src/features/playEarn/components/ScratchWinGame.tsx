import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Gift,
  LockKeyhole,
  Sparkles,
  WalletCards,
} from "lucide-react";

import {
  getMyScratchWinToday,
  playScratchWin,
  type ScratchWinResult,
} from "../services/scratchWin.service";

interface ScratchWinGameProps {
  onReward?: (result: ScratchWinResult) => void;
}

const SCRATCH_THRESHOLD = 45;
const SCRATCH_BRUSH_RADIUS = 25;
const CARD_HEIGHT = 190;

/* ============================================================
   HELPERS
============================================================ */

function formatReward(amount: number) {
  return Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function formatExpiry(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getTomorrowLabel() {
  const tomorrow = new Date();

  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  return tomorrow.toLocaleDateString(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "short",
    }
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function ScratchWinGame({
  onReward,
}: ScratchWinGameProps) {
  const canvasRef =
    useRef<HTMLCanvasElement | null>(null);

  const scratchingRef =
    useRef(false);

  const hasRevealedRef =
    useRef(false);

  const [
    result,
    setResult,
  ] = useState<ScratchWinResult | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    checkingToday,
    setCheckingToday,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  );

  const [
    progress,
    setProgress,
  ] = useState(0);

  const [
    canScratch,
    setCanScratch,
  ] = useState(false);

  const [
    alreadyPlayed,
    setAlreadyPlayed,
  ] = useState(false);

  const [
    justRevealed,
    setJustRevealed,
  ] = useState(false);


  /* ==========================================================
     LOAD TODAY'S RESULT

     IMPORTANT:
     Do NOT put `onReward` in this effect dependency.
     Loading an existing result must not cause the parent
     to re-render and restart this effect.
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    async function loadTodayResult() {
      setCheckingToday(true);
      setError(null);

      try {
        const todayResult =
          await getMyScratchWinToday();

        if (!mounted) {
          return;
        }

        /*
         * Customer has already played today.
         */

        if (todayResult) {
          setResult(todayResult);

          setAlreadyPlayed(true);

          setCanScratch(false);

          setProgress(100);

          setJustRevealed(false);

          hasRevealedRef.current = true;
        } else {
          /*
           * No play today.
           */

          setResult(null);

          setAlreadyPlayed(false);

          setCanScratch(false);

          setProgress(0);

          setJustRevealed(false);

          hasRevealedRef.current = false;
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load today's Scratch & Win result."
        );
      } finally {
        if (mounted) {
          setCheckingToday(false);
        }
      }
    }

    void loadTodayResult();

    return () => {
      mounted = false;
    };
  }, []);


  /* ==========================================================
     START GAME
  ========================================================== */

  const handleStart =
    useCallback(
      async () => {
        /*
         * Never allow a second game.
         */

        if (
          loading ||
          checkingToday ||
          result ||
          alreadyPlayed ||
          canScratch
        ) {
          return;
        }

        setLoading(true);

        setError(null);

        setJustRevealed(false);

        try {
          const scratchResult =
            await playScratchWin();

          setResult(
            scratchResult
          );

          setProgress(0);

          setCanScratch(true);

          /*
           * The server has consumed today's play,
           * but the visual card is still waiting
           * for the customer to scratch it.
           */
          setAlreadyPlayed(false);

          hasRevealedRef.current =
            false;

          /*
           * This callback is ONLY triggered for
           * an actual new play.
           */
          onReward?.(
            scratchResult
          );
        } catch (err) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to start Scratch & Win."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        loading,
        checkingToday,
        result,
        alreadyPlayed,
        canScratch,
        onReward,
      ]
    );


  /* ==========================================================
     CANVAS / SCRATCH ENGINE
  ========================================================== */

  useEffect(() => {
    /*
     * Don't create a scratch layer for an
     * already completed result.
     */

    if (
      !result ||
      !canScratch ||
      alreadyPlayed
    ) {
      return;
    }

    const canvas =
      canvasRef.current;

    if (!canvas) {
      return;
    }

    const parent =
      canvas.parentElement;

    if (!parent) {
      return;
    }

    const width =
      parent.clientWidth;

    if (width <= 0) {
      return;
    }

    const height =
      CARD_HEIGHT;

    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    canvas.width =
      Math.floor(
        width * dpr
      );

    canvas.height =
      Math.floor(
        height * dpr
      );

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    const ctx =
      canvas.getContext(
        "2d"
      );

    if (!ctx) {
      return;
    }

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    /* ========================================================
       PREMIUM SCRATCH SURFACE
    ======================================================== */

    const gradient =
      ctx.createLinearGradient(
        0,
        0,
        width,
        height
      );

    gradient.addColorStop(
      0,
      "#f8f4ed"
    );

    gradient.addColorStop(
      0.3,
      "#ded6ca"
    );

    gradient.addColorStop(
      0.55,
      "#c9c0b3"
    );

    gradient.addColorStop(
      0.8,
      "#e8e1d7"
    );

    gradient.addColorStop(
      1,
      "#f6f1e9"
    );

    ctx.fillStyle =
      gradient;

    ctx.fillRect(
      0,
      0,
      width,
      height
    );


    /* ========================================================
       DIAGONAL PATTERN
    ======================================================== */

    ctx.save();

    ctx.globalAlpha =
      0.14;

    for (
      let x = -height;
      x < width + height;
      x += 26
    ) {
      ctx.save();

      ctx.translate(
        x,
        0
      );

      ctx.rotate(
        Math.PI / 4
      );

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        0,
        -height,
        7,
        height * 2
      );

      ctx.restore();
    }

    ctx.restore();


    /* ========================================================
       DECORATIVE DOTS
    ======================================================== */

    ctx.save();

    ctx.globalAlpha =
      0.2;

    for (
      let x = 18;
      x < width;
      x += 32
    ) {
      for (
        let y = 20;
        y < height;
        y += 32
      ) {
        ctx.beginPath();

        ctx.arc(
          x,
          y,
          1.2,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "#8e8376";

        ctx.fill();
      }
    }

    ctx.restore();


    /* ========================================================
       CENTER BADGE
    ======================================================== */

    ctx.save();

    ctx.fillStyle =
      "rgba(255,255,255,0.42)";

    ctx.beginPath();

    ctx.roundRect(
      width / 2 - 105,
      height / 2 - 48,
      210,
      96,
      18
    );

    ctx.fill();

    ctx.strokeStyle =
      "rgba(120,105,90,0.25)";

    ctx.lineWidth = 1;

    ctx.stroke();

    ctx.restore();


    /* ========================================================
       MAIN TEXT
    ======================================================== */

    ctx.fillStyle =
      "#443b32";

    ctx.font =
      "800 18px Arial, sans-serif";

    ctx.textAlign =
      "center";

    ctx.textBaseline =
      "middle";

    ctx.fillText(
      "SCRATCH TO REVEAL",
      width / 2,
      height / 2 - 12
    );


    /* ========================================================
       SUBTITLE
    ======================================================== */

    ctx.font =
      "500 11px Arial, sans-serif";

    ctx.fillStyle =
      "#756b60";

    ctx.fillText(
      "Your surprise is underneath",
      width / 2,
      height / 2 + 15
    );


    /* ========================================================
       SPARKLE DECORATIONS
    ======================================================== */

    ctx.font =
      "16px Arial, sans-serif";

    ctx.fillStyle =
      "rgba(150,120,80,0.55)";

    ctx.fillText(
      "✦",
      width / 2 - 88,
      height / 2 - 13
    );

    ctx.fillText(
      "✦",
      width / 2 + 88,
      height / 2 - 13
    );


    /* ========================================================
       BORDER
    ======================================================== */

    ctx.strokeStyle =
      "rgba(117,102,87,0.35)";

    ctx.lineWidth = 1;

    ctx.strokeRect(
      0.5,
      0.5,
      width - 1,
      height - 1
    );


    /* ========================================================
       POINTER POSITION
    ======================================================== */

    const getPoint =
      (
        event: PointerEvent
      ) => {
        const rect =
          canvas.getBoundingClientRect();

        return {
          x:
            event.clientX -
            rect.left,

          y:
            event.clientY -
            rect.top,
        };
      };


    /* ========================================================
       CHECK SCRATCH PROGRESS
    ======================================================== */

    const checkProgress =
      () => {
        if (
          hasRevealedRef.current
        ) {
          return;
        }

        const imageData =
          ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          );

        let transparent =
          0;

        const total =
          imageData.data.length / 4;

        /*
         * Sample every 4th pixel to keep
         * mobile performance smooth.
         */

        const stride = 4;

        for (
          let i = 3;
          i < imageData.data.length;
          i += 4 * stride
        ) {
          if (
            imageData.data[i] <
            128
          ) {
            transparent++;
          }
        }

        const sampledTotal =
          Math.ceil(
            total / stride
          );

        const percentage =
          (
            transparent /
            sampledTotal
          ) * 100;

        setProgress(
          Math.min(
            percentage,
            100
          )
        );


        /*
         * Reveal at 45%.
         */

        if (
          percentage >=
            SCRATCH_THRESHOLD &&
          !hasRevealedRef.current
        ) {
          hasRevealedRef.current =
            true;

          scratchingRef.current =
            false;

          setCanScratch(
            false
          );

          setProgress(
            100
          );

          /*
           * Remove scratch layer.
           */

          ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
          );

          /*
           * Trigger reveal animation.
           */

          setJustRevealed(
            true
          );
        }
      };


    /* ========================================================
       SCRATCH
    ======================================================== */

    const scratch =
      (
        event: PointerEvent
      ) => {
        if (
          !scratchingRef.current ||
          hasRevealedRef.current
        ) {
          return;
        }

        const point =
          getPoint(event);


        /*
         * Destination-out removes
         * the scratch layer.
         */

        ctx.globalCompositeOperation =
          "destination-out";


        /*
         * Soft brush.
         */

        const brush =
          ctx.createRadialGradient(
            point.x,
            point.y,
            4,
            point.x,
            point.y,
            SCRATCH_BRUSH_RADIUS
          );

        brush.addColorStop(
          0,
          "rgba(0,0,0,1)"
        );

        brush.addColorStop(
          0.7,
          "rgba(0,0,0,0.95)"
        );

        brush.addColorStop(
          1,
          "rgba(0,0,0,0.65)"
        );

        ctx.fillStyle =
          brush;

        ctx.beginPath();

        ctx.arc(
          point.x,
          point.y,
          SCRATCH_BRUSH_RADIUS,
          0,
          Math.PI * 2
        );

        ctx.fill();

        checkProgress();
      };


    /* ========================================================
       START SCRATCH
    ======================================================== */

    const startScratch =
      (
        event: PointerEvent
      ) => {
        if (
          hasRevealedRef.current
        ) {
          return;
        }

        scratchingRef.current =
          true;

        try {
          canvas.setPointerCapture(
            event.pointerId
          );
        } catch {
          // Ignore pointer capture errors.
        }

        scratch(event);
      };


    /* ========================================================
       STOP SCRATCH
    ======================================================== */

    const stopScratch =
      () => {
        scratchingRef.current =
          false;
      };


    /* ========================================================
       EVENTS
    ======================================================== */

    canvas.addEventListener(
      "pointerdown",
      startScratch
    );

    canvas.addEventListener(
      "pointermove",
      scratch
    );

    canvas.addEventListener(
      "pointerup",
      stopScratch
    );

    canvas.addEventListener(
      "pointercancel",
      stopScratch
    );

    canvas.addEventListener(
      "pointerleave",
      stopScratch
    );


    return () => {
      canvas.removeEventListener(
        "pointerdown",
        startScratch
      );

      canvas.removeEventListener(
        "pointermove",
        scratch
      );

      canvas.removeEventListener(
        "pointerup",
        stopScratch
      );

      canvas.removeEventListener(
        "pointercancel",
        stopScratch
      );

      canvas.removeEventListener(
        "pointerleave",
        stopScratch
      );
    };
  }, [
    result,
    canScratch,
    alreadyPlayed,
  ]);


  /* ==========================================================
     DERIVED STATE
  ========================================================== */

  const isWin =
    Boolean(
      result &&
      result.is_win &&
      result.reward_paise > 0
    );

  const tomorrowLabel =
    getTomorrowLabel();


  /* ==========================================================
     LOADING STATE
  ========================================================== */

  if (checkingToday) {
    return (
      <section className="w-full">
        <div
          className="
            mx-auto
            w-full
            max-w-md
            overflow-hidden
            rounded-[28px]
            border
            border-zinc-200
            bg-white
            shadow-sm
          "
        >
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
                rounded-2xl
                bg-purple-50
              "
            >
              <Sparkles
                className="
                  h-7
                  w-7
                  animate-pulse
                  text-purple-600
                "
              />
            </div>

            <h3
              className="
                mt-5
                text-lg
                font-bold
                text-zinc-900
              "
            >
              Checking your chance…
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-zinc-500
              "
            >
              Let's see if today's reward is waiting for you.
            </p>
          </div>
        </div>
      </section>
    );
  }


  /* ==========================================================
     MAIN RENDER
  ========================================================== */

  return (
    <section className="w-full">
      <div
        className="
          mx-auto
          w-full
          max-w-md
          overflow-hidden
          rounded-[28px]
          border
          border-zinc-200
          bg-white
          shadow-sm
        "
      >

        {/* ===================================================
            HEADER
        ==================================================== */}

        <div
          className="
            px-5
            pt-6
            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-3
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-2xl
              bg-gradient-to-br
              from-purple-100
              to-pink-100
            "
          >
            <Sparkles
              className="
                h-6
                w-6
                text-purple-700
              "
            />
          </div>

          <h2
            className="
              text-xl
              font-bold
              tracking-tight
              text-zinc-900
            "
          >
            Scratch & Win
          </h2>

          <p
            className="
              mt-1
              text-sm
              text-zinc-500
            "
          >
            {alreadyPlayed
              ? "Today's result is already unlocked"
              : "Scratch the card and reveal your reward"}
          </p>
        </div>


        {/* ===================================================
            CONTENT
        ==================================================== */}

        <div className="px-5 py-6">

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div
              className="
                mb-4
                rounded-2xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                text-red-600
              "
            >
              {error}
            </div>
          )}


          {/* =================================================
              NO RESULT YET
          ================================================== */}

          {!result && (
            <div
              className="
                rounded-[24px]
                border
                border-purple-100
                bg-gradient-to-br
                from-purple-50
                via-white
                to-pink-50
                p-6
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-white
                  shadow-sm
                "
              >
                <Gift
                  className="
                    h-8
                    w-8
                    text-purple-700
                  "
                />
              </div>


              <p
                className="
                  mt-5
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.28em]
                  text-purple-600
                "
              >
                ONE CHANCE · ONE REVEAL
              </p>


              <h3
                className="
                  mt-3
                  text-2xl
                  font-black
                  tracking-tight
                  text-zinc-950
                "
              >
                Something special is waiting
              </h3>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-sm
                  text-sm
                  leading-6
                  text-zinc-500
                "
              >
                Start today's game and scratch your
                card to discover your surprise.
              </p>


              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                className="
                  mt-6
                  w-full
                  rounded-2xl
                  bg-gradient-to-r
                  from-purple-700
                  to-purple-600
                  px-5
                  py-3.5
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-purple-200/70
                  transition-all
                  duration-200
                  hover:-translate-y-0.5
                  hover:shadow-xl
                  active:translate-y-0
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Preparing your card..."
                  : "Start Scratching"}
              </button>

            </div>
          )}


          {/* =================================================
              RESULT
          ================================================== */}

          {result && (
            <div>

              {/* =============================================
                  RESULT CARD
              ============================================== */}

              <div
                className={[
                  "relative overflow-hidden rounded-[24px] border transition-all duration-500",
                  isWin
                    ? "border-[#ead18a] bg-gradient-to-br from-[#fffaf0] via-white to-[#fff1f7]"
                    : "border-zinc-200 bg-gradient-to-br from-zinc-50 to-white",
                  justRevealed
                    ? "scale-[1.015] shadow-xl"
                    : "shadow-sm",
                ].join(" ")}
              >

                {/* =========================================
                    WIN CELEBRATION
                ========================================== */}

                {justRevealed &&
                  isWin && (
                    <>
                      <div
                        className="
                          pointer-events-none
                          absolute
                          inset-0
                          animate-pulse
                          bg-gradient-to-r
                          from-transparent
                          via-white/50
                          to-transparent
                        "
                      />

                      <div
                        className="
                          pointer-events-none
                          absolute
                          left-[12%]
                          top-[18%]
                          animate-bounce
                          text-lg
                        "
                      >
                        ✦
                      </div>

                      <div
                        className="
                          pointer-events-none
                          absolute
                          right-[14%]
                          top-[28%]
                          animate-pulse
                          text-sm
                        "
                      >
                        ✨
                      </div>

                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-[20%]
                          left-[20%]
                          animate-pulse
                          text-xs
                        "
                      >
                        ✦
                      </div>

                      <div
                        className="
                          pointer-events-none
                          absolute
                          bottom-[24%]
                          right-[20%]
                          animate-bounce
                          text-sm
                        "
                      >
                        ✨
                      </div>
                    </>
                  )}


                <div
                  className="
                    relative
                    flex
                    h-[190px]
                    flex-col
                    items-center
                    justify-center
                    px-5
                    text-center
                  "
                >

                  {/* =======================================
                      WIN
                  ======================================== */}

                  {isWin ? (
                    <>
                      <div
                        className={[
                          "flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-md",
                          justRevealed
                            ? "animate-bounce"
                            : "",
                        ].join(" ")}
                      >
                        <WalletCards
                          className="
                            h-7
                            w-7
                            text-[#a06a16]
                          "
                        />
                      </div>


                      <p
                        className="
                          mt-3
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.25em]
                          text-[#a06a16]
                        "
                      >
                        {justRevealed
                          ? "You Won!"
                          : "Today's Reward"}
                      </p>


                      <div
                        className="
                          mt-1
                          text-4xl
                          font-black
                          tracking-tight
                          text-[#c52663]
                        "
                      >
                        ₹
                        {formatReward(
                          result.reward_inr
                        )}
                      </div>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-zinc-500
                        "
                      >
                        Added to your Play & Earn Wallet
                      </p>
                    </>
                  ) : (

                    /* =====================================
                       BETTER LUCK
                    ====================================== */

                    <>
                      <div
                        className={[
                          "flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100",
                          justRevealed
                            ? "animate-pulse"
                            : "",
                        ].join(" ")}
                      >
                        <Sparkles
                          className="
                            h-7
                            w-7
                            text-zinc-700
                          "
                        />
                      </div>


                      <p
                        className="
                          mt-3
                          text-[10px]
                          font-black
                          uppercase
                          tracking-[0.25em]
                          text-zinc-500
                        "
                      >
                        Today's Result
                      </p>


                      <div
                        className="
                          mt-1
                          text-xl
                          font-black
                          text-zinc-900
                        "
                      >
                        Better Luck Next Time
                      </div>


                      <p
                        className="
                          mt-1
                          text-sm
                          text-zinc-500
                        "
                      >
                        Your next chance is tomorrow.
                      </p>
                    </>
                  )}

                </div>


                {/* =========================================
                    SCRATCH LAYER
                ========================================== */}

                {canScratch && (
                  <canvas
                    ref={canvasRef}
                    className="
                      absolute
                      inset-0
                      h-full
                      w-full
                      touch-none
                      cursor-grab
                      active:cursor-grabbing
                    "
                  />
                )}

              </div>


              {/* =============================================
                  SCRATCH PROGRESS
              ============================================== */}

              {canScratch && (
                <div className="mt-4">

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-xs
                      text-zinc-500
                    "
                  >
                    <span>
                      Keep scratching to reveal
                    </span>

                    <span
                      className="
                        font-semibold
                        text-zinc-700
                      "
                    >
                      {Math.round(
                        progress
                      )}%
                    </span>
                  </div>


                  <div
                    className="
                      mt-1.5
                      h-1.5
                      overflow-hidden
                      rounded-full
                      bg-zinc-100
                    "
                  >
                    <div
                      className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-purple-600
                        to-pink-500
                        transition-all
                      "
                      style={{
                        width:
                          `${Math.min(
                            progress,
                            100
                          )}%`,
                      }}
                    />
                  </div>

                </div>
              )}


              {/* =============================================
                  ALREADY PLAYED
              ============================================== */}

              {alreadyPlayed && (
                <div
                  className="
                    mt-4
                    overflow-hidden
                    rounded-2xl
                    border
                    border-purple-100
                    bg-gradient-to-r
                    from-purple-50
                    via-white
                    to-pink-50
                  "
                >

                  <div
                    className="
                      flex
                      items-start
                      gap-3
                      px-4
                      py-4
                    "
                  >

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        bg-white
                        shadow-sm
                      "
                    >
                      <LockKeyhole
                        className="
                          h-5
                          w-5
                          text-purple-600
                        "
                      />
                    </div>


                    <div className="min-w-0">

                      <p
                        className="
                          text-sm
                          font-bold
                          text-zinc-900
                        "
                      >
                        You've already played today ✨
                      </p>


                      <p
                        className="
                          mt-1
                          text-xs
                          leading-5
                          text-zinc-500
                        "
                      >
                        Your Scratch & Win chance is
                        locked for today. Come back
                        tomorrow for a fresh chance.
                      </p>


                      <div
                        className="
                          mt-2
                          inline-flex
                          items-center
                          rounded-full
                          border
                          border-purple-100
                          bg-white
                          px-3
                          py-1.5
                          text-[11px]
                          font-semibold
                          text-purple-700
                        "
                      >
                        Next chance · {tomorrowLabel}
                      </div>

                    </div>

                  </div>


                  {/* Locked button */}

                  <div
                    className="
                      border-t
                      border-purple-100
                      px-4
                      py-3
                    "
                  >

                    <button
                      type="button"
                      disabled
                      className="
                        flex
                        w-full
                        cursor-not-allowed
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-zinc-100
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-zinc-500
                      "
                    >
                      <LockKeyhole
                        className="h-4 w-4"
                      />

                      Already Played Today
                    </button>

                  </div>

                </div>
              )}


              {/* =============================================
                  EXPIRY / COMPLETED INFO
              ============================================== */}

              {!canScratch && (
                <div
                  className="
                    mt-4
                    rounded-2xl
                    border
                    border-zinc-100
                    bg-zinc-50
                    px-4
                    py-4
                    text-center
                  "
                >

                  {isWin &&
                    result.expires_at && (
                      <p
                        className="
                          text-xs
                          text-zinc-500
                        "
                      >
                        Your reward expires on{" "}

                        <span
                          className="
                            font-bold
                            text-zinc-800
                          "
                        >
                          {formatExpiry(
                            result.expires_at
                          )}
                        </span>
                      </p>
                    )}


                  {!alreadyPlayed && (
                    <p
                      className="
                        mt-2
                        text-xs
                        font-medium
                        text-zinc-600
                      "
                    >
                      {result.remaining_plays === 0
                        ? "You've used your Scratch & Win chance for today."
                        : `${result.remaining_plays} chance remaining today.`}
                    </p>
                  )}

                </div>
              )}

            </div>
          )}

        </div>


        {/* ===================================================
            FOOTER
        ==================================================== */}

        <div
          className="
            border-t
            border-zinc-100
            px-5
            py-4
            text-center
          "
        >
          <p
            className="
              text-xs
              leading-5
              text-zinc-400
            "
          >
            ✨ Rewards are credited to your separate
            Play & Earn Wallet.
          </p>
        </div>

      </div>
    </section>
  );
}