import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  CassetteTape,
  ChevronDown,
  Film,
  Heart,
  LockKeyhole,
  Moon,
  Play,
  Sparkles,
  Star,
  Ticket,
  Volume2,
  X,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { momentsService } from "../services/moments.service";

type Memory = {
  image?: string;
  url?: string;
  caption?: string;
  title?: string;
};

type MomentMeta = {
  productImage?: string;
  productName?: string;
  productUrl?: string;
  backgroundMusicUrl?: string;
  voiceNoteUrl?: string;
  memories?: Memory[];
  scratchMessage?: string;
  promise?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizAnswer?: number;
  heroTagline?: string;
  customEnding?: string;
};

type Moment = {
  id: string;
  occasion: string;
  template_key: string;
  recipient_name?: string | null;
  sender_name?: string | null;
  personal_message?: string | null;
  metadata?: MomentMeta | null;
};

const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

const clamp = (value: string | null | undefined, fallback: string) =>
  value?.trim() ? value.trim() : fallback;

const defaultQuiz = [
  "5 MINUTES 😌",
  "15 MINUTES 😂",
  "30 MINUTES 😭",
  "YOU KNOW HIM TOO WELL ❤️",
];

const defaultMemories: Memory[] = [];

const spring = {
  type: "spring" as const,
  stiffness: 120,
  damping: 18,
  mass: 0.8,
};

const fadeUp = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -18 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
};

function Marquee({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 overflow-hidden opacity-40">
      <div className="flex min-w-max gap-8 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.42em] text-amber-100/80">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i}>{text} ✦</span>
        ))}
      </div>
    </div>
  );
}

function Petals({ count = 18 }: { count?: number }) {
  const reduce = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: (i % 7) * 0.35,
        duration: 5 + (i % 4),
        rotate: (i * 47) % 180,
        size: 6 + (i % 4) * 2,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p) => (
        <motion.span
          key={p.id}
          className="absolute top-[-20px] rounded-[100%_0_100%_0] bg-rose-200/70"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 0.65,
            rotate: p.rotate,
          }}
          animate={
            reduce
              ? undefined
              : { y: ["0vh", "112vh"], x: [0, 24, -18, 12], rotate: [p.rotate, p.rotate + 260] }
          }
          transition={
            reduce
              ? undefined
              : { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }
          }
        />
      ))}
    </div>
  );
}

function FilmGrain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.075] mix-blend-screen"
      style={{
        backgroundImage:
          "radial-gradient(circle at 20% 30%, white 0 0.6px, transparent 0.8px), radial-gradient(circle at 70% 60%, white 0 0.5px, transparent 0.8px)",
        backgroundSize: "7px 7px, 11px 11px",
      }}
    />
  );
}

function Bulbs({ count = 12 }: { count?: number }) {
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <motion.span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-amber-100 shadow-[0_0_15px_rgba(255,230,170,.95)]"
          animate={{ opacity: [0.45, 1, 0.55] }}
          transition={{ duration: 1.4, delay: i * 0.08, repeat: Infinity }}
        />
      ))}
    </div>
  );
}

function CinemaFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-5xl overflow-hidden rounded-[32px] border border-amber-100/15 bg-black/20 shadow-[0_35px_120px_rgba(0,0,0,.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function FilmStrip({ memories }: { memories: Memory[] }) {
  if (!memories.length) return null;

  return (
    <div className="relative mx-auto mt-8 w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-3 shadow-2xl">
      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none]">
        {memories.map((memory, i) => {
          const image = memory.image || memory.url;
          return (
            <motion.div
              key={`${image}-${i}`}
              className="relative min-w-[170px] overflow-hidden rounded-xl border border-white/10 bg-black/40"
              initial={{ opacity: 0, y: 18, rotate: i % 2 ? 1 : -1 }}
              animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
              transition={{ ...spring, delay: i * 0.08 }}
            >
              {image ? (
                <img
                  src={image}
                  alt={memory.caption || memory.title || `Memory ${i + 1}`}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-white/5 text-xs text-white/40">
                  Memory {i + 1}
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 pt-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-100/70">
                  Scene {String(i + 1).padStart(2, "0")}
                </p>
                {memory.caption || memory.title ? (
                  <p className="mt-1 text-sm text-white">{memory.caption || memory.title}</p>
                ) : null}
              </div>
              <div className="pointer-events-none absolute inset-x-2 top-2 flex justify-between">
                {Array.from({ length: 6 }).map((_, j) => (
                  <span key={j} className="h-1.5 w-2 rounded-sm bg-white/70" />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function MomentPage() {
  const { token } = useParams<{ token: string }>();
  const reduce = useReducedMotion();

  const [moment, setMoment] = useState<Moment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState(0);
  const [quizChoice, setQuizChoice] = useState<number | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const [posterEntered, setPosterEntered] = useState(false);
  const [showFinal, setShowFinal] = useState(false);

  const musicRef = useRef<HTMLAudioElement | null>(null);
  const voiceRef = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setError("This moment link is missing.");
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const data = await momentsService.getMomentByToken(token);
        if (!mounted) return;
        setMoment(data as Moment);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "This moment could not be opened.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [token]);

  const meta = (moment?.metadata || {}) as MomentMeta;
  const herName = clamp(moment?.recipient_name, "My favourite person");
  const hisName = clamp(moment?.sender_name, "Your favourite idiot");
  const personalMessage = clamp(
    moment?.personal_message,
    "I wanted to make you one tiny surprise… because you deserve more than just a gift.",
  );
  const memories = meta.memories || defaultMemories;
  const quizOptions = meta.quizOptions?.length ? meta.quizOptions : defaultQuiz;
  const quizQuestion =
    meta.quizQuestion || "How long would he survive without calling you?";
  const productImage = meta.productImage;
  const productName = meta.productName || "The piece I saw and thought of you";
  const scratchMessage =
    meta.scratchMessage ||
    "You make ordinary days feel like the kind of scenes I never want to delete.";
  const promise =
    meta.promise ||
    "I promise to keep collecting tiny reasons to love you — even on the days we drive each other crazy.";
  const heroTagline = meta.heroTagline || "The guy who somehow became my favourite person.";
  const customEnding =
    meta.customEnding ||
    "More dates. More fights. More stupid jokes. More memories. More us.";

  const track = async (
    eventType:
      | "message_revealed"
      | "heart_game_completed"
      | "gift_revealed"
      | "secret_discovered"
      | "cta_clicked",
    eventData?: Record<string, unknown>,
  ) => {
    if (!moment) return;
    try {
      await momentsService.trackMomentEvent(moment.id, eventType, eventData);
    } catch {
      // Tracking should never interrupt the experience.
    }
  };

  useEffect(() => {
    if (!meta.backgroundMusicUrl) return;
    const audio = new Audio(meta.backgroundMusicUrl);
    audio.loop = true;
    audio.volume = 0.18;
    musicRef.current = audio;

    return () => {
      audio.pause();
      audio.src = "";
      musicRef.current = null;
    };
  }, [meta.backgroundMusicUrl]);

  useEffect(() => {
    if (scene === 7 && meta.voiceNoteUrl && voiceRef.current) {
      voiceRef.current.pause();
      voiceRef.current.currentTime = 0;
      setVoicePlaying(false);
    }
  }, [scene, meta.voiceNoteUrl]);

  const toggleMusic = async () => {
    if (!musicRef.current) return;
    try {
      if (musicOn) {
        musicRef.current.pause();
        setMusicOn(false);
      } else {
        await musicRef.current.play();
        setMusicOn(true);
      }
    } catch {
      setMusicOn(false);
    }
  };

  const go = (next: number) => {
    setScene(Math.max(0, Math.min(10, next)));
    requestAnimationFrame(() => sceneRef.current?.scrollTo({ top: 0, behavior: "smooth" }));
  };

  const next = () => go(scene + 1);
  const previous = () => go(scene - 1);

  const toggleVoice = async () => {
    const audio = voiceRef.current;
    if (!audio) return;
    try {
      if (voicePlaying) {
        audio.pause();
        setVoicePlaying(false);
      } else {
        await audio.play();
        setVoicePlaying(true);
        track("message_revealed", { source: "voice_note" });
      }
    } catch {
      setVoicePlaying(false);
    }
  };

  const openSecret = () => {
    setSecretOpen(true);
    track("secret_discovered");
  };

  const selectQuiz = (index: number) => {
    setQuizChoice(index);
    track("heart_game_completed", { choice: index, answer: meta.quizAnswer ?? null });
  };

  const finish = () => {
    setShowFinal(true);
    track("cta_clicked", { action: "call_him" });
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#160b10] text-white">
        <div className="text-center">
          <motion.div
            className="mx-auto mb-5 h-12 w-12 rounded-full border border-amber-100/30 border-t-amber-100"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xs uppercase tracking-[0.35em] text-amber-100/60">
            Preparing the screening
          </p>
        </div>
      </main>
    );
  }

  if (error || !moment) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#160b10] px-6 text-white">
        <div className="max-w-md text-center">
          <Film className="mx-auto mb-5 h-10 w-10 text-amber-100/60" />
          <h1 className="font-serif text-3xl">This screening is unavailable.</h1>
          <p className="mt-3 text-sm leading-6 text-white/55">
            {error || "The moment may have expired or the link may be incorrect."}
          </p>
        </div>
      </main>
    );
  }

  const sceneContent = [
    // 0: countdown
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#09070a] px-6 text-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(185,98,72,.22),transparent_30%),radial-gradient(circle_at_50%_70%,rgba(255,186,84,.08),transparent_35%)]" />
      <FilmGrain />
      <div className="relative z-10">
        <motion.p
          className="mb-8 text-[10px] font-semibold uppercase tracking-[0.5em] text-amber-100/45"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          A special screening for {herName}
        </motion.p>
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            className="font-serif text-[clamp(8rem,30vw,18rem)] leading-none text-amber-50"
            initial={{ opacity: 0, scale: 1.35, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(8px)" }}
            transition={{ duration: 0.7 }}
          >
            3
          </motion.div>
        </AnimatePresence>
        <p className="mt-8 text-xs uppercase tracking-[0.35em] text-white/35">
          lights down · heart ready
        </p>
      </div>
      <motion.div
        className="absolute bottom-12 left-1/2 h-px w-24 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-100/60 to-transparent"
        animate={{ opacity: [0.2, 1, 0.2], scaleX: [0.6, 1, 0.6] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      />
      <button
        onClick={() => go(1)}
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.3em] text-white/25 transition hover:text-white/60"
      >
        tap to begin
      </button>
    </section>,

    // 1: curtains + poster
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#24090f] px-5 py-12">
      <Marquee text="SPECIAL SCREENING" />
      <FilmGrain />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(245,177,88,.22),transparent_26%),linear-gradient(180deg,#2b0a12,#11070b)]" />
      <Petals count={14} />

      <motion.div
        className="absolute inset-y-0 left-0 z-20 w-1/2 origin-left bg-[linear-gradient(90deg,#500b16,#8b1627_45%,#390811)] shadow-[20px_0_50px_rgba(0,0,0,.45)]"
        animate={posterEntered ? { x: "-100%" } : { x: "0%" }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
      />
      <motion.div
        className="absolute inset-y-0 right-0 z-20 w-1/2 origin-right bg-[linear-gradient(270deg,#500b16,#8b1627_45%,#390811)] shadow-[-20px_0_50px_rgba(0,0,0,.45)]"
        animate={posterEntered ? { x: "100%" } : { x: "0%" }}
        transition={{ duration: 1.1, ease: [0.77, 0, 0.175, 1] }}
      />

      <CinemaFrame className="z-10 max-w-2xl bg-[#f4dfb8] p-3">
        <div className="relative min-h-[640px] overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_50%_25%,#f9b46b,#d05a65_48%,#572033_100%)] p-7 text-[#39151d]">
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(255,255,255,.2),transparent)]" />
          <div className="relative flex h-full min-h-[580px] flex-col items-center justify-between">
            <div className="w-full">
              <Bulbs />
              <div className="mt-5 flex items-center justify-between text-[9px] font-bold uppercase tracking-[0.35em]">
                <span>Special Screening</span>
                <span>2026</span>
              </div>
            </div>

            <div className="my-8 text-center">
              <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#6c2832]/70">
                A TINY LOVE STORY BY
              </p>
              <h1 className="mt-5 font-serif text-[clamp(4rem,16vw,7.5rem)] leading-[0.78] tracking-[-0.06em]">
                HUMARI
                <br />
                <span className="italic">FILM</span>
              </h1>
              <div className="mx-auto mt-7 h-px w-32 bg-[#6c2832]/30" />
              <p className="mt-5 font-serif text-xl italic">
                starring {herName}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#6c2832]/65">
                & {hisName}
              </p>
            </div>

            <button
              onClick={() => {
                setPosterEntered(true);
                next();
              }}
              className="group rounded-full border border-[#6c2832]/30 bg-white/25 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur transition hover:bg-white/40"
            >
              Enter the film
              <ArrowRight className="ml-2 inline-block h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </CinemaFrame>
    </section>,

    // 2: reel
    <section className="relative min-h-[100svh] overflow-hidden bg-[#100d12] px-5 py-16 text-white">
      <FilmGrain />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(255,190,120,.12),transparent_25%)]" />
      <div className="relative z-10 mx-auto flex min-h-[85svh] max-w-5xl flex-col justify-center">
        <motion.div {...fadeUp} className="text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-amber-100/45">
            Scene 01 · The beginning
          </p>
          <h2 className="mt-4 font-serif text-[clamp(2.8rem,8vw,6.5rem)] leading-[0.9]">
            Every good story
            <br />
            starts somewhere.
          </h2>
        </motion.div>

        <div className="relative mx-auto mt-12 w-full max-w-4xl">
          <motion.div
            className="absolute -left-7 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border-[14px] border-[#222028] bg-[#0b0a0d] p-5 shadow-2xl md:block"
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/10">
              <div className="h-9 w-9 rounded-full border border-white/20" />
            </div>
          </motion.div>

          <div className="rounded-[28px] border border-white/10 bg-[#1a171e] p-3 shadow-[0_30px_100px_rgba(0,0,0,.5)]">
            <div className="flex gap-3 overflow-x-auto rounded-2xl bg-[#0d0b0f] p-4 [scrollbar-width:none]">
              {memories.length ? (
                memories.map((m, i) => {
                  const image = m.image || m.url;
                  return (
                    <div key={i} className="relative min-w-[220px] md:min-w-[280px]">
                      {image ? (
                        <img
                          src={image}
                          alt={m.caption || `Memory ${i + 1}`}
                          className="aspect-[4/3] w-full rounded-xl object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="aspect-[4/3] rounded-xl bg-white/5" />
                      )}
                      <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/90 p-4 pt-12">
                        <p className="text-[9px] uppercase tracking-[0.25em] text-amber-100/50">
                          Scene {String(i + 1).padStart(2, "0")}
                        </p>
                        <p className="mt-1 font-serif text-lg">
                          {m.caption || m.title || "One of my favourite frames."}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex min-h-[300px] w-full items-center justify-center rounded-xl border border-dashed border-white/10 px-8 text-center">
                  <div>
                    <Camera className="mx-auto h-8 w-8 text-amber-100/30" />
                    <p className="mt-4 font-serif text-2xl">Your memories belong here.</p>
                    <p className="mt-2 text-sm text-white/40">
                      Add real couple photos to turn this reel into your story.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="absolute -right-5 -bottom-6 hidden rounded-full border-[14px] border-[#222028] bg-[#0b0a0d] p-5 shadow-2xl md:block"
            animate={reduce ? undefined : { rotate: -360 }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          >
            <div className="h-20 w-20 rounded-full border border-white/10" />
          </motion.div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center font-serif text-xl italic text-white/65">
          “And then somehow… you became my favourite person.”
        </p>
        <button
          onClick={next}
          className="mx-auto mt-7 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] transition hover:bg-white/10"
        >
          Continue the story <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
        </button>
      </div>
    </section>,

    // 3: dance stage quiz
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#e85e72] px-5 py-14 text-[#3b1020]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,246,205,.55),transparent_18%),radial-gradient(circle_at_80%_70%,rgba(255,195,78,.35),transparent_22%),linear-gradient(135deg,#ff9b73,#d94978)]" />
      <Petals count={12} />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="mb-8 flex justify-between text-[9px] font-bold uppercase tracking-[0.32em] text-[#541526]/65">
          <span>Scene 02</span>
          <span>Dance break 💃</span>
        </div>

        <div className="relative overflow-hidden rounded-[36px] border border-white/30 bg-[#fff1cf]/85 p-5 shadow-[0_35px_100px_rgba(92,17,47,.25)] backdrop-blur">
          <div className="rounded-[28px] border-2 border-[#a94350]/20 p-6 md:p-12">
            <div className="text-center">
              <Bulbs count={10} />
              <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.4em] text-[#7b2c3e]/65">
                How well do you know your hero?
              </p>
              <h2 className="mx-auto mt-4 max-w-2xl font-serif text-[clamp(2.7rem,7vw,5.5rem)] leading-[0.92]">
                {quizQuestion}
              </h2>
            </div>

            <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
              {quizOptions.map((option, i) => (
                <button
                  key={i}
                  onClick={() => selectQuiz(i)}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border-2 px-5 py-5 text-left text-sm font-bold transition",
                    quizChoice === i
                      ? "border-[#7e253c] bg-[#7e253c] text-white shadow-xl"
                      : "border-[#7e253c]/15 bg-white/55 hover:-translate-y-0.5 hover:bg-white",
                  )}
                >
                  <span className="mr-3 font-serif text-lg opacity-45">0{i + 1}</span>
                  {option}
                </button>
              ))}
            </div>

            <AnimatePresence>
              {quizChoice !== null && (
                <motion.div
                  {...fadeUp}
                  className="mx-auto mt-7 max-w-xl rounded-2xl bg-[#7e253c] px-5 py-4 text-center text-white"
                >
                  <p className="font-serif text-2xl">
                    {meta.quizAnswer === undefined || quizChoice === meta.quizAnswer
                      ? "CORRECT! ❤️"
                      : "Okay… you still know him pretty well. 😂"}
                  </p>
                  <p className="mt-1 text-xs text-white/65">
                    {meta.quizAnswer === undefined
                      ? "Honestly, there are no wrong answers in our film."
                      : "The director has decided to keep the official answer classified."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={next}
              disabled={quizChoice === null}
              className="mx-auto mt-8 flex items-center rounded-full bg-[#3b1020] px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] text-white transition disabled:cursor-not-allowed disabled:opacity-25"
            >
              Next scene <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>,

    // 4: hero entrance
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-[#0b1118] px-6 pb-16 text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,17,24,.05),#080b11_92%),radial-gradient(circle_at_72%_18%,rgba(255,172,104,.55),transparent_18%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[54%] bg-[linear-gradient(180deg,transparent,rgba(9,14,22,.7)),linear-gradient(90deg,#131822,#263343_50%,#10151d)] [clip-path:polygon(0_34%,18%_28%,35%_39%,52%_25%,68%_34%,84%_20%,100%_31%,100%_100%,0_100%)]" />
      <motion.div
        className="absolute right-[18%] top-[17%] h-2 w-2 rounded-full bg-amber-100 shadow-[0_0_30px_10px_rgba(255,206,132,.7)]"
        animate={reduce ? undefined : { opacity: [0.5, 1, 0.55] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-amber-100/45">
          Scene 03 · Hero entry
        </p>
        <div className="mt-7 max-w-2xl">
          <motion.p
            className="font-serif text-[clamp(3rem,9vw,7rem)] leading-[0.88]"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9 }}
          >
            And then…
          </motion.p>
          <motion.p
            className="mt-4 font-serif text-[clamp(2rem,6vw,4.5rem)] italic text-amber-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
          >
            there was him.
          </motion.p>
          <motion.div
            className="mt-8 h-px w-24 bg-amber-100/30"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.8, duration: 0.7 }}
          />
          <motion.h2
            className="mt-5 text-xl font-semibold text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
          >
            {hisName}
          </motion.h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-white/45">{heroTagline}</p>
        </div>

        <button
          onClick={next}
          className="mt-10 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur transition hover:bg-white/10"
        >
          Roll camera <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
        </button>
      </div>
    </section>,

    // 5: vanity jewelry
    <section className="relative min-h-[100svh] overflow-hidden bg-[#f1d8c2] px-5 py-14 text-[#4b1d27]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#fff6df,transparent_34%),linear-gradient(180deg,#e7c5ac,#a86769)]" />
      <div className="relative z-10 mx-auto flex min-h-[88svh] max-w-5xl items-center">
        <div className="grid w-full items-center gap-8 lg:grid-cols-[.75fr_1.25fr]">
          <motion.div {...fadeUp}>
            <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#6f3742]/65">
              Scene 04 · Behind the scenes
            </p>
            <h2 className="mt-4 font-serif text-[clamp(3rem,7vw,6rem)] leading-[0.88]">
              Why this one?
            </h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#5e3540]/70">
              I saw it… and immediately thought of you.
            </p>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-xl"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="rounded-[38px] border-[10px] border-[#b88373]/45 bg-[#d9b09f] p-4 shadow-[0_40px_100px_rgba(72,28,37,.25)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] border-4 border-[#f8e7ce]/60 bg-[radial-gradient(circle_at_50%_40%,#fff7ea,#d9ad9c)]">
                <div className="absolute inset-x-0 top-0 flex justify-center gap-2 p-4">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <span
                      key={i}
                      className="h-2.5 w-2.5 rounded-full bg-amber-50 shadow-[0_0_12px_rgba(255,238,190,.9)]"
                    />
                  ))}
                </div>
                <div className="absolute inset-x-0 top-1/2 h-px bg-[#8e5c5c]/15" />
                <div className="absolute left-1/2 top-1/2 flex w-[76%] -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                  {productImage ? (
                    <img
                      src={productImage}
                      alt={productName}
                      className="max-h-[330px] w-full object-contain drop-shadow-[0_30px_25px_rgba(64,24,30,.2)]"
                      loading="eager"
                    />
                  ) : (
                    <div className="flex aspect-square w-full items-center justify-center rounded-full border border-[#7f4c56]/15 bg-white/20 text-center">
                      <div>
                        <Sparkles className="mx-auto h-9 w-9 text-[#7f4c56]/35" />
                        <p className="mt-3 text-xs text-[#7f4c56]/45">Jewelry image</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-7 left-1/2 w-[78%] -translate-x-1/2 rounded-xl bg-[#fff4dd]/70 p-4 text-center shadow-lg backdrop-blur">
                  <p className="font-serif text-lg italic">“{productName}”</p>
                </div>
              </div>
            </div>

            <motion.div
              className="absolute -bottom-5 -left-3 rounded-xl bg-[#fff5e2] px-5 py-4 shadow-xl"
              initial={{ rotate: -8, y: 20, opacity: 0 }}
              animate={{ rotate: -6, y: 0, opacity: 1 }}
              transition={{ delay: 0.55, ...spring }}
            >
              <p className="font-[cursive] text-lg text-[#6e3a46]">
                {personalMessage.length > 80 ? "I saw this and thought of you. ❤️" : personalMessage}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>,

    // 6: sunset terrace
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#f28b73] px-5 py-14 text-[#5a2631]">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#f7b08b 0%,#ef8c83 42%,#765070 100%)]" />
      <motion.div
        className="absolute right-[12%] top-[16%] h-32 w-32 rounded-full bg-[#ffe0a0] shadow-[0_0_80px_30px_rgba(255,220,155,.25)]"
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-[#2d283b] [clip-path:polygon(0_32%,14%_20%,25%_40%,37%_26%,50%_38%,63%_18%,76%_34%,88%_23%,100%_36%,100%_100%,0_100%)]" />
      <Petals count={15} />

      <div className="relative z-10 mx-auto w-full max-w-5xl">
        <p className="text-center text-[10px] font-bold uppercase tracking-[0.42em] text-[#652d3b]/55">
          Scene 05 · The slow-motion part
        </p>
        <h2 className="mt-4 text-center font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[0.86]">
          If our story
          <br />
          had a song…
        </h2>

        <div className="mx-auto mt-9 max-w-3xl rotate-[-1deg] rounded-[26px] bg-[#f7ead5] p-3 shadow-[0_35px_100px_rgba(65,25,48,.3)]">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[18px] bg-[#d3a08e]">
            {memories[0]?.image || memories[0]?.url ? (
              <img
                src={memories[0].image || memories[0].url}
                alt="A favourite memory"
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#dcae98,#82556b)] text-center text-white/60">
                <div>
                  <Moon className="mx-auto h-9 w-9" />
                  <p className="mt-3 text-sm">Your favourite frame goes here.</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 right-5 font-serif text-xl italic text-white md:text-3xl">
              {memories[0]?.caption || "This would be the slow-motion part."}
            </p>
          </div>
        </div>

        <p className="mx-auto mt-7 max-w-2xl text-center font-serif text-xl italic text-[#542a35]/70">
          “Every Bollywood movie has that one scene where everything else disappears.”
        </p>

        <button
          onClick={next}
          className="mx-auto mt-7 block rounded-full border border-[#652d3b]/20 bg-white/20 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur transition hover:bg-white/35"
        >
          Keep watching <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
        </button>
      </div>
    </section>,

    // 7: secret drawer
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#191217] px-5 py-14 text-white">
      <FilmGrain />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(245,167,101,.16),transparent_28%)]" />
      <div className="relative z-10 mx-auto w-full max-w-3xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-amber-100/45">
          Scene 06 · Deleted scene
        </p>
        <h2 className="mt-5 font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.88]">
          You weren't
          <br />
          supposed to see this.
        </h2>

        <motion.div
          className="mx-auto mt-12 max-w-md"
          animate={secretOpen ? { y: 4 } : undefined}
        >
          <div className="relative rounded-[24px] border border-amber-100/10 bg-[#6e3034] p-5 shadow-[0_35px_100px_rgba(0,0,0,.55)]">
            <div className="rounded-[16px] border border-amber-100/15 bg-[#3d1a22] p-8">
              <LockKeyhole className="mx-auto h-9 w-9 text-amber-100/55" />
              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-100/50">
                Director's private drawer
              </p>
              <button
                onClick={openSecret}
                className="mt-6 rounded-full bg-amber-50 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.25em] text-[#4b1d27] transition hover:scale-[1.02]"
              >
                {secretOpen ? "Opened ❤️" : "Open anyway"}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {secretOpen && (
              <motion.div
                {...fadeUp}
                className="relative -mt-2 rounded-b-[24px] bg-[#f4e4c9] px-7 py-8 text-[#4a202a] shadow-2xl"
              >
                <p className="font-[cursive] text-2xl leading-9">{scratchMessage}</p>
                <div className="mx-auto mt-5 h-px w-20 bg-[#4a202a]/15" />
                <p className="mt-4 text-xs leading-6 text-[#6c3b45]/70">{promise}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <button
          onClick={next}
          disabled={!secretOpen}
          className="mt-8 rounded-full border border-white/10 bg-white/5 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] transition hover:bg-white/10 disabled:opacity-25"
        >
          Next scene <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
        </button>
      </div>
    </section>,

    // 8: cassette voice
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-[#d6a875] px-5 py-14 text-[#39222a]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,244,199,.6),transparent_24%),linear-gradient(135deg,#f0c88e,#b26d73)]" />
      <div className="relative z-10 mx-auto w-full max-w-4xl">
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-[#5b3039]/55">
            Scene 07 · One last take
          </p>
          <h2 className="mt-5 font-serif text-[clamp(3rem,8vw,6rem)] leading-[0.86]">
            He recorded
            <br />
            this for you.
          </h2>
        </div>

        <div className="mx-auto mt-12 max-w-xl rotate-[1deg]">
          <div className="rounded-[28px] border border-[#673c43]/20 bg-[#8c5b58] p-4 shadow-[0_40px_100px_rgba(67,32,39,.3)]">
            <div className="relative overflow-hidden rounded-[20px] bg-[#e9c89d] p-7">
              <div className="flex items-center justify-between border-b border-[#61353c]/15 pb-4 text-[9px] font-bold uppercase tracking-[0.3em]">
                <span>HUMARI FILM</span>
                <span>SIDE A</span>
              </div>
              <div className="mt-7 flex items-center gap-6">
                <motion.div
                  className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-[12px] border-[#54323a] bg-[#d8b17e]"
                  animate={voicePlaying && !reduce ? { rotate: 360 } : undefined}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <div className="h-7 w-7 rounded-full border-4 border-[#54323a]" />
                </motion.div>
                <div className="min-w-0">
                  <p className="font-serif text-2xl italic">For {herName}</p>
                  <p className="mt-1 text-xs text-[#633b43]/65">
                    A message from {hisName}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleVoice}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-[#54323a] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.28em] text-white transition hover:bg-[#40242b]"
              >
                {voicePlaying ? (
                  <>
                    <Volume2 className="h-4 w-4" /> Playing…
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" /> Play his voice
                  </>
                )}
              </button>
              {meta.voiceNoteUrl ? (
                <audio
                  ref={voiceRef}
                  src={meta.voiceNoteUrl}
                  onEnded={() => setVoicePlaying(false)}
                />
              ) : (
                <p className="mt-4 text-center text-[11px] text-[#633b43]/50">
                  Add his real voice note in the moment data to enable this scene.
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={next}
          className="mx-auto mt-8 block rounded-full border border-[#5b3039]/20 bg-white/20 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.28em] backdrop-blur transition hover:bg-white/30"
        >
          Roll the final scene <ArrowRight className="ml-2 inline h-3.5 w-3.5" />
        </button>
      </div>
    </section>,

    // 9: climax montage
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#09080b] px-5 py-14 text-white">
      <FilmGrain />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(171,59,66,.2),transparent_32%)]" />
      <Petals count={10} />
      <div className="relative z-10 w-full max-w-5xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.42em] text-amber-100/40">
          Final scene
        </p>

        <div className="relative mx-auto mt-12 h-[430px] max-w-4xl overflow-hidden rounded-[28px] border border-white/10 bg-[#111016]">
          <motion.div
            className="absolute inset-0"
            animate={
              reduce
                ? undefined
                : { opacity: [0.35, 1, 0.45, 1, 0.5], scale: [1, 1.03, 1, 1.02, 1] }
            }
            transition={{ duration: 5, ease: "easeInOut" }}
          >
            {memories.length ? (
              <div className="grid h-full grid-cols-3 gap-2 p-2 opacity-70">
                {memories.slice(0, 6).map((m, i) => {
                  const image = m.image || m.url;
                  return image ? (
                    <img
                      key={i}
                      src={image}
                      alt=""
                      className={cn(
                        "h-full w-full object-cover",
                        i % 3 === 1 ? "translate-y-5" : "-translate-y-2",
                      )}
                      loading="lazy"
                    />
                  ) : (
                    <div key={i} className="bg-white/5" />
                  );
                })}
              </div>
            ) : (
              <div className="h-full bg-[linear-gradient(135deg,#2a1820,#100c12)]" />
            )}
          </motion.div>
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_0%,rgba(0,0,0,.25)_35%,rgba(0,0,0,.86)_100%)]" />

          <div className="absolute inset-0 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!showFinal ? (
                <motion.div
                  key="end"
                  className="text-center"
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.7 }}
                >
                  <p className="font-serif text-[clamp(4rem,12vw,8rem)] leading-none tracking-[-0.06em]">
                    THE END
                  </p>
                  <button
                    onClick={finish}
                    className="mt-7 rounded-full border border-amber-100/25 bg-amber-50/10 px-7 py-3 text-[10px] font-bold uppercase tracking-[0.3em] text-amber-50 backdrop-blur transition hover:bg-amber-50/20"
                  >
                    Or… is it?
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="baaki"
                  className="max-w-2xl px-6"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Sparkles className="mx-auto h-8 w-8 text-amber-100/70" />
                  <p className="mt-5 font-serif text-[clamp(3rem,9vw,6.5rem)] leading-[0.86] text-amber-50">
                    PICTURE ABHI
                    <br />
                    <span className="italic">BAAKI HAI.</span>
                  </p>
                  <p className="mx-auto mt-7 max-w-lg text-sm leading-7 text-white/60">
                    {customEnding}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {!showFinal && (
          <p className="mt-5 text-[9px] uppercase tracking-[0.28em] text-white/25">
            Some endings are better when they don't end.
          </p>
        )}
      </div>
    </section>,

    // 10: final ticket
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#260a13] px-5 py-14 text-[#3e1c25]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,207,133,.35),transparent_26%),linear-gradient(180deg,#521426,#17070d)]" />
      <Petals count={16} />
      <div className="relative z-10 w-full max-w-2xl">
        <div className="mb-8 text-center">
          <Bulbs count={11} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, rotate: -2 }}
          animate={{ opacity: 1, y: 0, rotate: -1 }}
          transition={{ duration: 0.9, ...spring }}
          className="relative overflow-hidden bg-[#f4dfb8] p-3 shadow-[0_40px_110px_rgba(0,0,0,.45)]"
          style={{
            clipPath:
              "polygon(0 0,100% 0,100% 47%,98% 50%,100% 53%,100% 100%,0 100%,0 53%,2% 50%,0 47%)",
          }}
        >
          <div className="border border-[#8a4c55]/20 p-8 md:p-12">
            <div className="flex items-center justify-between border-b border-[#7a414c]/15 pb-5 text-[9px] font-bold uppercase tracking-[0.3em]">
              <span>ADMIT ONE</span>
              <span>NEXT CHAPTER</span>
            </div>

            <div className="py-12 text-center">
              <Ticket className="mx-auto h-9 w-9 text-[#743d49]/45" />
              <p className="mt-5 text-[9px] font-bold uppercase tracking-[0.4em] text-[#743d49]/55">
                HUMARI FILM
              </p>
              <h1 className="mt-4 font-serif text-[clamp(3.5rem,10vw,7rem)] leading-[0.82]">
                Next
                <br />
                Chapter
              </h1>
              <div className="mx-auto mt-7 h-px w-24 bg-[#743d49]/20" />
              <p className="mt-6 font-serif text-xl italic">Runtime: Forever</p>
              <p className="mt-2 text-xs text-[#743d49]/55">Status: Coming Soon</p>
            </div>

            <button
              onClick={async () => {
                await track("cta_clicked", { action: "call_him_final" });
                window.location.href = "tel:";
              }}
              className="group mx-auto flex items-center rounded-full bg-[#3e1c25] px-8 py-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[#fff1d1] transition hover:-translate-y-0.5"
            >
              Call him
              <Heart className="ml-2 h-3.5 w-3.5 fill-current transition group-hover:scale-110" />
            </button>

            <p className="mt-6 text-center text-xs text-[#743d49]/50">
              Your hero is probably waiting.
            </p>
          </div>
        </motion.div>

        <p className="mt-8 text-center text-[9px] uppercase tracking-[0.3em] text-white/25">
          A tiny T&M Moments experience
        </p>
      </div>
    </section>,
  ];

  return (
    <main className="min-h-screen bg-[#09070a] font-sans text-white selection:bg-rose-300/30">
      <audio ref={musicRef} />
      <div ref={sceneRef} className="relative min-h-screen overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={scene}
            initial={reduce ? { opacity: 1 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.45 }}
          >
            {sceneContent[scene]}
          </motion.div>
        </AnimatePresence>

        {scene > 0 && scene < 10 && (
          <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/45 p-1.5 shadow-2xl backdrop-blur-xl">
            <button
              onClick={previous}
              aria-label="Previous scene"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="px-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
              {String(scene).padStart(2, "0")} / 10
            </div>
            <button
              onClick={next}
              aria-label="Next scene"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/15"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="fixed right-4 top-4 z-50 flex gap-2">
          {meta.backgroundMusicUrl && (
            <button
              onClick={toggleMusic}
              aria-label={musicOn ? "Mute music" : "Play music"}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/60 backdrop-blur-xl transition hover:bg-black/50 hover:text-white"
            >
              {musicOn ? <Volume2 className="h-4 w-4" /> : <CassetteTape className="h-4 w-4" />}
            </button>
          )}
        </div>

        <div className="pointer-events-none fixed left-4 top-4 z-50 flex h-10 items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 backdrop-blur-xl">
          <Star className="h-3.5 w-3.5 text-amber-100/60" />
          <span className="text-[8px] font-bold uppercase tracking-[0.25em] text-white/35">
            {herName}
          </span>
        </div>
      </div>
    </main>
  );
}
