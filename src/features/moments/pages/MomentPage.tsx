import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useParams } from "react-router-dom";
import { momentsService, type MomentData } from "../services/moments.service";
import TinyDoorAnimation, { type TinyDoorAnimationHandle } from "../components/TinyDoorAnimation";

type Scene =
  | "door"
  | "world"
  | "stars"
  | "memories"
  | "cloud"
  | "gift"
  | "question"
  | "night"
  | "voice"
  | "house";

type Memory = {
  image?: string;
  caption?: string;
};

const sceneOrder: Scene[] = [
  "door",
  "world",
  "stars",
  "memories",
  "cloud",
  "gift",
  "question",
  "night",
  "voice",
  "house",
];

const videos: Partial<Record<Scene, string>> = {
  // Put lightweight original animation assets in /public/moments/.
  // Missing files are intentionally harmless: the scene still renders.
  door: "/moments/tiny-door.mp4",
  world: "/moments/garden-day.mp4",
  stars: "/moments/glowing-stars.mp4",
  memories: "/moments/memory-garden.mp4",
  cloud: "/moments/cloud-puff.mp4",
  gift: "/moments/gift-tree.mp4",
  question: "/moments/mailbox.mp4",
  night: "/moments/night-transition.mp4",
  voice: "/moments/bedroom-window.mp4",
  house: "/moments/little-house.mp4",
};

const sceneCopy: Record<Scene, { eyebrow: string; title: string }> = {
  door: {
    eyebrow: "A tiny surprise",
    title: "Someone left something here for you.",
  },
  world: {
    eyebrow: "Welcome",
    title: "I made this little world for you.",
  },
  stars: {
    eyebrow: "Three little things",
    title: "Tap the stars. I have a few things to tell you.",
  },
  memories: {
    eyebrow: "Us",
    title: "Some of my favourite little moments.",
  },
  cloud: {
    eyebrow: "Okay…",
    title: "I have a confession.",
  },
  gift: {
    eyebrow: "And then I saw this",
    title: "I knew it had to be yours.",
  },
  question: {
    eyebrow: "One question",
    title: "Before you go…",
  },
  night: {
    eyebrow: "If I could keep one moment",
    title: "I would keep this one.",
  },
  voice: {
    eyebrow: "One last little thing",
    title: "Press play when you're ready.",
  },
  house: {
    eyebrow: "That's all",
    title: "This little world ends here…",
  },
};

function AnimatedScene({
  scene,
  className = "",
}: {
  scene: Scene;
  className?: string;
}) {
  const src = videos[scene];

  if (!src) return null;

  return (
    <video
      className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}


function InteractiveLottie({
  name,
  className = "",
  loop = true,
  autoplay = true,
}: {
  name: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let animation: {
      destroy?: () => void;
    } | null = null;
    let cancelled = false;

    async function mount() {
      if (!ref.current) return;

      try {
        const lottie = await import("lottie-web");
        if (cancelled || !ref.current) return;

        animation = lottie.default.loadAnimation({
          container: ref.current,
          renderer: "svg",
          loop,
          autoplay,
          path: `/moments/lottie/${name}.json`,
          rendererSettings: {
            progressiveLoad: true,
            preserveAspectRatio: "xMidYMid meet",
          },
        });
      } catch {
        // Lottie is an enhancement. The surrounding React/MP4 scene remains usable.
      }
    }

    void mount();

    return () => {
      cancelled = true;
      animation?.destroy?.();
    };
  }, [name, loop, autoplay]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute ${className}`}
    />
  );
}

function Sparkles({ count = 12 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-white/80 shadow-[0_0_12px_rgba(255,255,255,.9)]"
          style={{
            left: `${8 + ((i * 37) % 84)}%`,
            top: `${10 + ((i * 53) % 78)}%`,
          }}
          animate={{
            opacity: [0.15, 0.95, 0.15],
            scale: [0.65, 1.2, 0.65],
            y: [0, -8, 0],
          }}
          transition={{
            duration: 2.4 + (i % 4) * 0.45,
            repeat: Infinity,
            delay: i * 0.13,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function SceneShell({
  scene,
  children,
  onNext,
  nextLabel = "Continue",
  disabled = false,
}: {
  scene: Scene;
  children: React.ReactNode;
  onNext?: () => void;
  nextLabel?: string;
  disabled?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.main
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, y: -14 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-[100svh] overflow-hidden bg-[#fff8f5] text-[#473b3d]"
    >
      <AnimatedScene scene={scene} />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,245,.20),rgba(255,248,245,.74)_72%,rgba(255,248,245,.94))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,rgba(70,48,55,.045)_72%,rgba(70,48,55,.10)_100%)]" />
      <Sparkles count={scene === "stars" || scene === "night" ? 18 : 10} />

      <InteractiveLottie name="ambient-sparkles" className="inset-0 z-[2] h-full w-full" />
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[560px] flex-col px-5 pb-8 pt-8">
        <div className="mb-4 flex justify-center gap-1.5 opacity-70">
          {sceneOrder.map((item) => (
            <span
              key={item}
              className={`h-1 rounded-full transition-all duration-500 ${
                item === scene ? "w-6 bg-[#473b3d]" : "w-1.5 bg-[#473b3d]/20"
              }`}
            />
          ))}
        </div>
        <div className="flex-1">{children}</div>

        {onNext && (
          <motion.button
            type="button"
            onClick={onNext}
            disabled={disabled}
            whileTap={disabled ? undefined : { scale: 0.97 }}
            whileHover={disabled ? undefined : { y: -2 }}
            className="mx-auto mt-5 rounded-full bg-[#473b3d] px-7 py-3.5 text-sm font-medium text-white shadow-lg shadow-[#473b3d]/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {nextLabel}
          </motion.button>
        )}
      </div>
    </motion.main>
  );
}

export default function MomentPage() {
  const { token } = useParams<{ token: string }>();
  const reduceMotion = useReducedMotion();

  const [moment, setMoment] = useState<MomentData | null>(null);
  const [scene, setScene] = useState<Scene>("door");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [starIndex, setStarIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const doorRef = useRef<TinyDoorAnimationHandle>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!token) {
        setError("This moment link is incomplete.");
        setLoading(false);
        return;
      }

      try {
        const data = await momentsService.getMomentByToken(token);
        if (!cancelled) {
          setMoment(data);
          setLoading(false);
          void momentsService.trackMomentEvent(token, "page_view", { entry_scene: "door" });
        }
      } catch {
        if (!cancelled) {
          setError("This little moment is no longer available.");
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const memories = useMemo<Memory[]>(() => {
    const raw = moment?.metadata?.memories;
    if (!Array.isArray(raw)) return [];

    return raw
      .map((item) => {
        if (typeof item === "string") return { image: item };
        if (item && typeof item === "object") {
          const value = item as Record<string, unknown>;
          return {
            image: typeof value.image === "string" ? value.image : undefined,
            caption:
              typeof value.caption === "string" ? value.caption : undefined,
          };
        }
        return {};
      })
      .filter((item) => item.image);
  }, [moment]);

  const productImage =
    typeof moment?.metadata?.productImage === "string"
      ? moment.metadata.productImage
      : undefined;

  const productName =
    typeof moment?.metadata?.productName === "string"
      ? moment.metadata.productName
      : undefined;

  const voiceNoteUrl =
    typeof moment?.metadata?.voiceNoteUrl === "string"
      ? moment.metadata.voiceNoteUrl
      : undefined;

  const favouriteMemory = memories[0]?.image;

  const go = (next: Scene) => {
    setScene(next);
    if (token) {
      void momentsService.trackMomentEvent(token, next === "gift"
            ? "gift_revealed"
            : next === "house"
              ? "secret_discovered"
              : "message_revealed", { scene: next });
    }
  };

  const playVoice = async () => {
    if (!voiceNoteUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(voiceNoteUrl);
      audioRef.current.addEventListener("ended", () => setVoicePlaying(false));
    }

    if (voicePlaying) {
      audioRef.current.pause();
      setVoicePlaying(false);
    } else {
      await audioRef.current.play();
      setVoicePlaying(true);
      if (token) {
        void momentsService.trackMomentEvent(token, "message_revealed", { type: "voice_note" });
      }
    }
  };

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#fff8f5]">
        <motion.div
          animate={reduceMotion ? undefined : { scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 1.6, repeat: Infinity }}
          className="text-4xl"
        >
          🌷
        </motion.div>
      </div>
    );
  }

  if (error || !moment) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-[#fff8f5] px-6 text-center">
        <div>
          <div className="mb-4 text-5xl">🌙</div>
          <h1 className="text-xl font-semibold">{error ?? "Not found"}</h1>
          <p className="mt-2 text-sm text-[#7a6d70]">
            This little surprise may have expired.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {scene === "door" && (
        <SceneShell key="door" scene="door">
          <div className="relative flex min-h-[82svh] flex-col items-center justify-center overflow-hidden text-center">
            {/* Tiny garden details behind the door */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.7, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute left-[7%] top-[24%] text-3xl"
            >
              🌷
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.65, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="pointer-events-none absolute right-[8%] top-[29%] text-2xl"
            >
              🌼
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="pointer-events-none absolute bottom-[24%] left-[12%] text-2xl"
            >
              🌸
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 1, delay: 0.35 }}
              className="pointer-events-none absolute bottom-[22%] right-[13%] text-3xl"
            >
              🌷
            </motion.div>

            <div className="relative z-10 mb-2 h-[min(68vw,430px)] w-[min(68vw,430px)] sm:h-[430px] sm:w-[430px]">
              <TinyDoorAnimation
                ref={doorRef}
                className="h-full w-full"
                onOpen={() => {
                  window.setTimeout(() => {
                    go("world");
                  }, 700);
                }}
              />

              {/* Invisible interaction target keeps the experience natural on mobile. */}
              <button
                type="button"
                aria-label="Open the little door"
                onClick={() => doorRef.current?.play()}
                className="absolute inset-[22%] z-30 rounded-[32px] outline-none focus-visible:ring-2 focus-visible:ring-[#8f6b65]/50"
              />
            </div>

            <div className="relative z-20 -mt-2 px-5">
              <p className="text-xs uppercase tracking-[0.25em] text-[#92777c]">
                {sceneCopy.door.eyebrow}
              </p>

              <h1 className="mt-3 max-w-sm text-3xl font-semibold leading-tight">
                {sceneCopy.door.title}
              </h1>

              <p className="mt-4 text-sm text-[#7a6d70]">
                Tap the little door ✨
              </p>

              <motion.button
                type="button"
                onClick={() => doorRef.current?.play()}
                whileTap={{ scale: 0.95 }}
                className="mt-5 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-[#5b3d38] shadow-xl shadow-[#a8848c]/15 ring-1 ring-black/5 transition"
              >
                Open it
              </motion.button>
            </div>
          </div>
        </SceneShell>
      )}

      {scene === "world" && (
        <SceneShell
          key="world"
          scene="world"
          onNext={() => go("stars")}
          nextLabel="Show me ✨"
        >
          <div className="flex min-h-[80svh] flex-col items-center justify-end pb-16 text-center">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="rounded-[28px] bg-white/62 px-6 py-5 shadow-xl shadow-[#9c7378]/10 backdrop-blur-md"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[#92777c]">
                {sceneCopy.world.eyebrow}
              </p>
              <h1 className="mt-2 text-3xl font-semibold">{sceneCopy.world.title}</h1>
              <p className="mt-3 text-sm leading-6 text-[#75686b]">
                No big speech. Just a few tiny things that reminded me of you.
              </p>
            </motion.div>
          </div>
        </SceneShell>
      )}

      {scene === "stars" && (
        <SceneShell key="stars" scene="stars">
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.stars.eyebrow}
            </p>
            <h1 className="mt-3 max-w-md text-3xl font-semibold leading-tight">
              {sceneCopy.stars.title}
            </h1>

            <div className="mt-12 flex items-center gap-5">
              {[0, 1, 2].map((i) => (
                <motion.button
                  key={i}
                  type="button"
                  onClick={() => {
                    setStarIndex(i);
                    if (token) {
                      void momentsService.trackMomentEvent(token, "message_revealed", { type: "star", index: i });
                    }
                  }}
                  whileHover={{ y: -6, rotate: i % 2 ? 5 : -5 }}
                  whileTap={{ scale: 0.9 }}
                  animate={
                    reduceMotion
                      ? undefined
                      : { y: [0, -7, 0], rotate: [0, i % 2 ? 4 : -4, 0] }
                  }
                  transition={{
                    duration: 2.2 + i * 0.3,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-white/75 text-4xl shadow-xl backdrop-blur-md"
                >
                  ✨
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {starIndex !== null && (
                <InteractiveLottie name={`star-burst-${starIndex + 1}`} className="left-1/2 top-[43%] z-20 h-32 w-32 -translate-x-1/2 -translate-y-1/2" loop={false} />
              )}
              {starIndex !== null && (
                <motion.div
                  key={starIndex}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-10 max-w-sm rounded-[26px] bg-white/72 px-6 py-5 shadow-xl backdrop-blur-md"
                >
                  <p className="text-lg font-medium leading-7">
                    {[
                      `The first thing I noticed about you… was how easily you make ordinary moments feel special.`,
                      `The thing you do that secretly makes me smile… is probably more things than you realise. 😌`,
                      `The reason I knew this gift had to be yours… is simply because I looked at it and thought, “Yep. Her.” ❤️`,
                    ][starIndex]}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go("memories")}
              className="mt-8 text-sm font-medium text-[#735b60] underline underline-offset-4"
            >
              I found them all →
            </button>
          </div>
        </SceneShell>
      )}

      {scene === "memories" && (
        <SceneShell
          key="memories"
          scene="memories"
          onNext={() => go("cloud")}
          nextLabel="One more thing ☁️"
        >
          <div className="flex min-h-[80svh] flex-col justify-center">
            <div className="text-center">
              <p className="text-xs uppercase tracking-[0.25em] text-[#92777c]">
                {sceneCopy.memories.eyebrow}
              </p>
              <h1 className="mt-3 text-3xl font-semibold">
                {sceneCopy.memories.title}
              </h1>
            </div>

            {memories.length > 0 ? (
              <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-5">
                {memories.map((memory, i) => (
                  <motion.figure
                    key={`${memory.image}-${i}`}
                    whileHover={{ y: -5, rotate: i % 2 ? 1 : -1 }}
                    className="min-w-[82%] snap-center rounded-[26px] bg-white p-3 shadow-xl shadow-[#8d7076]/10"
                  >
                    <img
                      src={memory.image}
                      alt={memory.caption || "A memory"}
                      className="aspect-[4/5] w-full rounded-[19px] object-cover"
                    />
                    {memory.caption && (
                      <figcaption className="px-2 pb-2 pt-3 text-center text-sm text-[#6f6164]">
                        {memory.caption}
                      </figcaption>
                    )}
                  </motion.figure>
                ))}
              </div>
            ) : (
              <div className="mx-auto mt-10 rounded-[26px] bg-white/80 p-8 text-center shadow-lg backdrop-blur">
                <div className="text-4xl">📸</div>
                <p className="mt-3 text-sm text-[#75686b]">
                  Our favourite memories belong here.
                </p>
              </div>
            )}
          </div>
        </SceneShell>
      )}

      {scene === "cloud" && (
        <SceneShell
          key="cloud"
          scene="cloud"
          onNext={() => go("gift")}
          nextLabel="Okay… show me the gift 🎀"
        >
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <motion.div
              animate={
                reduceMotion ? undefined : { x: [-8, 8, -8], y: [0, -5, 0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="text-8xl"
            >
              ☁️
            </motion.div>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.cloud.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{sceneCopy.cloud.title}</h1>

            <div className="mt-8 max-w-md rounded-[28px] bg-white/72 px-6 py-6 text-left shadow-xl backdrop-blur-md">
              <p className="font-serif text-xl leading-8 text-[#59494d]">
                {moment.personal_message ||
                  "I don't say it enough, but having you in my life makes it a little more beautiful."}
              </p>
              <p className="mt-5 text-right text-sm text-[#92777c]">
                — {moment.sender_name || "your favourite person"}
              </p>
            </div>
          </div>
        </SceneShell>
      )}

      {scene === "gift" && (
        <SceneShell
          key="gift"
          scene="gift"
          onNext={() => go("question")}
          nextLabel="There’s one question 😌"
        >
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <motion.div
              animate={
                reduceMotion
                  ? undefined
                  : { y: [0, -10, 0], rotate: [-2, 2, -2] }
              }
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative"
            >
              <div className="text-[100px] leading-none">🌳</div>

              {productImage && (
                <>
                  <InteractiveLottie name="gift-sparkle" className="left-1/2 top-[22%] z-20 h-44 w-44 -translate-x-1/2" loop={false} />
                  <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 170 }}
                  className="absolute left-1/2 top-[42%] w-32 -translate-x-1/2 rounded-2xl bg-white p-2 shadow-2xl"
                >
                    <img
                      src={productImage}
                      alt={productName || "The jewellery gift"}
                      className="aspect-square w-full rounded-xl object-contain"
                    />
                  </motion.div>
                </>
              )}
            </motion.div>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.gift.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{sceneCopy.gift.title}</h1>

            {productName && (
              <p className="mt-3 text-sm text-[#75686b]">{productName}</p>
            )}

            <p className="mt-6 max-w-sm text-base leading-7 text-[#6f6164]">
              I saw it and immediately thought of you. That felt like a pretty
              good reason.
            </p>
          </div>
        </SceneShell>
      )}

      {scene === "question" && (
        <SceneShell key="question" scene="question">
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <motion.div
              animate={
                reduceMotion ? undefined : { y: [0, -6, 0], rotate: [0, 2, 0] }
              }
              transition={{ duration: 2.8, repeat: Infinity }}
              className="text-8xl"
            >
              📬
            </motion.div>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.question.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{sceneCopy.question.title}</h1>
            <p className="mt-3 text-sm text-[#75686b]">Who loves you more?</p>

            <div className="mt-8 grid w-full max-w-sm gap-3">
              {[
                ["A", "Me ❤️"],
                ["B", "Obviously me 😌"],
                ["C", "Both… but say me 😂"],
              ].map(([key, label]) => (
                <motion.button
                  key={key}
                  type="button"
                  onClick={() => {
                    setAnswer(key);
                    if (token) {
                      void momentsService.trackMomentEvent(token, "heart_game_completed", { answer: key });
                    }
                  }}
                  whileTap={{ scale: 0.97 }}
                  className={`rounded-2xl px-5 py-4 text-left text-sm font-medium shadow-lg transition ${
                    answer === key
                      ? "bg-[#473b3d] text-white"
                      : "bg-white/85 text-[#473b3d] backdrop-blur"
                  }`}
                >
                  {label}
                </motion.button>
              ))}
            </div>

            <AnimatePresence>
              {answer && (
                <InteractiveLottie name="heart-pop" className="left-1/2 top-[53%] z-20 h-40 w-40 -translate-x-1/2" loop={false} />
              )}
              {answer && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="mt-7 text-3xl"
                >
                  💕✨💕
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="button"
              onClick={() => go("night")}
              className="mt-7 text-sm font-medium text-[#735b60] underline underline-offset-4"
            >
              Fine, I’ll accept that answer →
            </button>
          </div>
        </SceneShell>
      )}

      {scene === "night" && (
        <SceneShell
          key="night"
          scene="night"
          onNext={() => go("voice")}
          nextLabel={voiceNoteUrl ? "There’s a voice note 🎧" : "One last thing 🌙"}
        >
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">
              {sceneCopy.night.eyebrow}
            </p>
            <h1 className="mt-3 max-w-md text-3xl font-semibold text-white">
              {sceneCopy.night.title}
            </h1>

            {favouriteMemory ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: -2 }}
                className="mt-9 w-[78%] max-w-sm rounded-[24px] bg-white p-3 shadow-2xl"
              >
                <img
                  src={favouriteMemory}
                  alt="Favourite memory"
                  className="aspect-[4/5] w-full rounded-[17px] object-cover"
                />
              </motion.div>
            ) : (
              <div className="mt-9 text-7xl">🌙</div>
            )}

            <p className="mt-7 max-w-sm text-sm leading-6 text-white/80">
              If I could keep one little moment with you forever, I think I’d
              choose one that looks a lot like this.
            </p>
          </div>
        </SceneShell>
      )}

      {scene === "voice" && (
        <SceneShell
          key="voice"
          scene="voice"
          onNext={() => go("house")}
          nextLabel="Take me to the little house 🏠"
        >
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <div className="text-8xl">🌙</div>
            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.voice.eyebrow}
            </p>
            <h1 className="mt-3 text-3xl font-semibold">{sceneCopy.voice.title}</h1>

            {voiceNoteUrl ? (
              <motion.button
                type="button"
                onClick={() => void playVoice()}
                whileTap={{ scale: 0.95 }}
                animate={
                  voicePlaying && !reduceMotion
                    ? { scale: [1, 1.05, 1] }
                    : undefined
                }
                transition={{ duration: 1.2, repeat: Infinity }}
                className="mt-10 flex h-28 w-28 items-center justify-center rounded-full bg-white text-4xl shadow-2xl ring-1 ring-black/5"
              >
                {voicePlaying ? "⏸️" : "▶️"}
              </motion.button>
            ) : (
              <div className="mt-10 rounded-[26px] bg-white/80 px-6 py-5 text-sm text-[#75686b] shadow-xl backdrop-blur">
                He left this part just for you. ❤️
              </div>
            )}

            {voicePlaying && (
              <motion.div
                className="mt-7 flex gap-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((bar) => (
                  <motion.span
                    key={bar}
                    className="w-1.5 rounded-full bg-[#8c7076]"
                    animate={reduceMotion ? undefined : { height: [8, 25, 12, 30, 10] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: bar * 0.08,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </SceneShell>
      )}

      {scene === "house" && (
        <SceneShell key="house" scene="house">
          <div className="flex min-h-[82svh] flex-col items-center justify-center text-center">
            <InteractiveLottie name="fireflies" className="inset-x-0 top-[22%] z-20 mx-auto h-64 w-64" />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, type: "spring" }}
              className="text-[110px] leading-none"
            >
              🏠
            </motion.div>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-[#92777c]">
              {sceneCopy.house.eyebrow}
            </p>
            <h1 className="mt-3 max-w-md text-3xl font-semibold">
              {sceneCopy.house.title}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-5 max-w-md font-serif text-2xl leading-9 text-[#59494d]"
            >
              …but ours doesn’t. ❤️
            </motion.p>

            <p className="mt-5 text-sm text-[#75686b]">
              See you in the next little adventure.
            </p>

            <p className="mt-9 text-sm font-medium text-[#59494d]">
              — {moment.sender_name || "Your favourite person"}
            </p>

            <p className="mt-12 text-[10px] tracking-wide text-[#b09da1]">
              made possible by T&M Moments
            </p>
          </div>
        </SceneShell>
      )}
    </AnimatePresence>
  );
}
