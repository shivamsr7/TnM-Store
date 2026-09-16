import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type SetStateAction,
} from "react";
import { useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  KeyRound,
  Mail,
  Pause,
  Play,
  Sparkles,
  Volume2,
} from "lucide-react";
import {
  momentsService,
  type MomentData,
} from "@/features/moments/services/moments.service";

/**
 * T&M MOMENTS — SIGNATURE ₹99
 * "A Little World Made For You"
 *
 * Optional metadata:
 * {
 *   memories: [
 *     {
 *       imageUrl: string,
 *       title?: string,
 *       caption?: string,
 *       secret?: string
 *     }
 *   ],
 *   productImageUrl?: string,
 *   productName?: string,
 *   voiceNoteUrl?: string,
 *   backgroundMusicUrl?: string
 * }
 */

type Scene =
  | "loading"
  | "arrival"
  | "envelope"
  | "inside"
  | "memory"
  | "hiddenNote"
  | "constellation"
  | "key"
  | "jewel"
  | "letter";

type Memory = {
  imageUrl: string;
  title: string;
  caption: string;
  secret: string;
};

type Metadata = {
  memories?: Array<{
    imageUrl?: string;
    image_url?: string;
    title?: string;
    caption?: string;
    secret?: string;
  }>;
  productImageUrl?: string;
  product_image_url?: string;
  productName?: string;
  product_name?: string;
  voiceNoteUrl?: string;
  voice_note_url?: string;
  backgroundMusicUrl?: string;
  background_music_url?: string;
};

const fallbackMemories: Memory[] = [
  {
    imageUrl: "",
    title: "that smile",
    caption: "Some smiles deserve to be kept forever.",
    secret: "I could look at this forever.",
  },
  {
    imageUrl: "",
    title: "that day",
    caption: "One ordinary moment that became ours.",
    secret: "I'd choose this day again.",
  },
  {
    imageUrl: "",
    title: "that feeling",
    caption: "The kind that needs no explanation.",
    secret: "Still one of my favourite feelings.",
  },
  {
    imageUrl: "",
    title: "you & me",
    caption: "My favourite little story.",
    secret: "And it is still being written.",
  },
  {
    imageUrl: "",
    title: "still us",
    caption: "Some things only get better with time.",
    secret: "I would still choose you.",
  },
];

const sleep = (ms: number) =>
  new Promise((resolve) => window.setTimeout(resolve, ms));

export default function MomentPage() {
  const { token } = useParams<{ token: string }>();
  const momentToken = token ?? "";

  const [moment, setMoment] = useState<MomentData | null>(null);
  const [scene, setScene] = useState<Scene>("loading");
  const [error, setError] = useState(false);

  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicStarted, setMusicStarted] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  const [sealPressed, setSealPressed] = useState(false);
  const [envelopeOpen, setEnvelopeOpen] = useState(false);

  const [memoryIndex, setMemoryIndex] = useState(0);
  const [photoOffset, setPhotoOffset] = useState({ x: 0, y: 0 });
  const [photoDragging, setPhotoDragging] = useState(false);
  const photoStart = useRef({ x: 0, y: 0 });
  const [kissed, setKissed] = useState(false);
  const [photoFlash, setPhotoFlash] = useState(false);


  const [constellationFound, setConstellationFound] = useState<number[]>(
    []
  );
  const [keyProgress, setKeyProgress] = useState(0);
  const keyStart = useRef<number | null>(null);

  const [voicePlaying, setVoicePlaying] = useState(false);
  const voiceRef = useRef<HTMLAudioElement | null>(null);

  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  const particles = useMemo(
    () =>
      Array.from({ length: 26 }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 6,
        duration: 8 + Math.random() * 9,
        size: 1 + Math.random() * 2.5,
      })),
    []
  );

  const metadata = useMemo<Metadata>(() => {
    const raw = moment?.metadata;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    return raw as Metadata;
  }, [moment]);

  const memories = useMemo<Memory[]>(() => {
    const source = Array.isArray(metadata.memories)
      ? metadata.memories
      : [];

    const parsed = source
      .map((item) => ({
        imageUrl:
          item.imageUrl?.trim() ||
          item.image_url?.trim() ||
          "",
        title: item.title?.trim() || "a little moment",
        caption:
          item.caption?.trim() ||
          "Some moments are worth keeping.",
        secret:
          item.secret?.trim() ||
          "Some things are better kept close.",
      }))
      .filter(
        (item) =>
          item.imageUrl ||
          item.title ||
          item.caption
      );

    return parsed.length ? parsed : fallbackMemories;
  }, [metadata.memories]);

  const productImageUrl =
    metadata.productImageUrl?.trim() ||
    metadata.product_image_url?.trim() ||
    "";

  const productName =
    metadata.productName?.trim() ||
    metadata.product_name?.trim() ||
    "A little something from T&M";

  const voiceNoteUrl =
    metadata.voiceNoteUrl?.trim() ||
    metadata.voice_note_url?.trim() ||
    "";

  const backgroundMusicUrl =
    metadata.backgroundMusicUrl?.trim() ||
    metadata.background_music_url?.trim() ||
    "/audio/tm-moments-romantic.mp3";

  const currentMemory = memories[memoryIndex];
  const memoryCount = memories.length;

  useEffect(() => {
    if (!momentToken) {
      setError(true);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const data =
          await momentsService.getMomentByToken(momentToken);

        if (cancelled) return;

        if (!data) {
          setError(true);
          return;
        }

        setMoment(data);
        setScene("arrival");

        void momentsService.trackMomentEvent(
          momentToken,
          "moment_opened"
        );
      } catch {
        if (!cancelled) setError(true);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [momentToken]);

  useEffect(() => {
    return () => {
      musicRef.current?.pause();
      voiceRef.current?.pause();
    };
  }, []);

  const track = (
    eventType:
      | "moment_opened"
      | "envelope_opened"
      | "message_revealed"
      | "heart_found"
      | "heart_game_completed"
      | "gift_revealed"
      | "secret_discovered"
  ) => {
    if (!momentToken) return;
    void momentsService.trackMomentEvent(
      momentToken,
      eventType
    );
  };

  const startMusic = async () => {
    if (!backgroundMusicUrl) return;

    if (!musicRef.current) {
      const audio = new Audio(backgroundMusicUrl);
      audio.loop = true;
      audio.volume = 0.18;
      musicRef.current = audio;
    }

    try {
      await musicRef.current.play();
      setMusicPlaying(true);
      setMusicStarted(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  const toggleMusic = async () => {
    if (!musicRef.current) {
      await startMusic();
      return;
    }

    if (musicPlaying) {
      musicRef.current.pause();
      setMusicPlaying(false);
      return;
    }

    try {
      await musicRef.current.play();
      setMusicPlaying(true);
      setMusicStarted(true);
    } catch {
      setMusicPlaying(false);
    }
  };

  const begin = async () => {
    await startMusic();
    setScene("envelope");
  };

  const openEnvelope = async () => {
    if (!sealPressed) return;

    setEnvelopeOpen(true);
    track("envelope_opened");
    await sleep(1250);
    setScene("inside");
  };

  const pressSeal = () => {
    setSealPressed(true);
  };

  const goToMemories = async () => {
    await sleep(450);
    setScene("memory");
  };

  const resetPhoto = () => {
    setPhotoOffset({ x: 0, y: 0 });
    setPhotoDragging(false);
  };

  const nextMemory = () => {
    if (memoryIndex >= memoryCount - 1) return;

    setKissed(false);
    setPhotoFlash(false);
    resetPhoto();

    setMemoryIndex((value) =>
      Math.min(value + 1, memoryCount - 1)
    );
  };

  const previousMemory = () => {
    if (memoryIndex <= 0) return;

    setKissed(false);
    setPhotoFlash(false);
    resetPhoto();

    setMemoryIndex((value) => Math.max(value - 1, 0));
  };

  const onPhotoDown = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    photoStart.current = {
      x: event.clientX - photoOffset.x,
      y: event.clientY - photoOffset.y,
    };
    setPhotoDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPhotoMove = (
    event: ReactPointerEvent<HTMLDivElement>
  ) => {
    if (!photoDragging) return;

    const x = event.clientX - photoStart.current.x;
    const y = event.clientY - photoStart.current.y;

    setPhotoOffset({
      x: Math.max(-60, Math.min(60, x)),
      y: Math.max(-48, Math.min(48, y)),
    });
  };

  const onPhotoUp = () => {
    setPhotoDragging(false);
    setPhotoOffset((value) => ({
      x: value.x * 0.18,
      y: value.y * 0.18,
    }));
  };

  const kissPhoto = () => {
    if (kissed) return;

    setKissed(true);
    setPhotoFlash(true);
    track("heart_found");

    window.setTimeout(() => setPhotoFlash(false), 700);
  };

  const revealPhotoNote = () => {
    track("message_revealed");
  };

  const finishMemories = () => {
    setConstellationFound([]);
    setScene("hiddenNote");
    track("message_revealed");
  };

  // Continue from the hidden memory note into the final secret lock.
  const goToSecret = () => {
    setConstellationFound([]);
    setScene("constellation");
    track("secret_discovered");
  };

  const discoverConstellation = (index: number) => {
    setConstellationFound((current) =>
      current.includes(index)
        ? current
        : [...current, index]
    );
    track("heart_found");
  };

  const constellationComplete =
    constellationFound.length >= Math.min(5, memoryCount);

  const goToKey = () => {
    setScene("key");
    track("heart_game_completed");
  };

  const onKeyDown = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    keyStart.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onKeyMove = (
    event: ReactPointerEvent<HTMLButtonElement>
  ) => {
    if (keyStart.current === null) return;

    const distance = Math.abs(
      event.clientX - keyStart.current
    );

    setKeyProgress(Math.min(1, distance / 190));
  };

  const onKeyUp = () => {
    keyStart.current = null;
  };

  const unlock = () => {
    if (keyProgress < 0.84) return;

    setKeyProgress(1);
    window.setTimeout(() => {
      setScene("jewel");
      track("gift_revealed");
    }, 900);
  };

  const toggleVoice = async () => {
    if (!voiceNoteUrl) return;

    if (!voiceRef.current) {
      const audio = new Audio(voiceNoteUrl);
      voiceRef.current = audio;
      audio.onended = () => setVoicePlaying(false);
    }

    if (voicePlaying) {
      voiceRef.current.pause();
      setVoicePlaying(false);
      return;
    }

    try {
      await voiceRef.current.play();
      setVoicePlaying(true);
    } catch {
      setVoicePlaying(false);
    }
  };

  if (scene === "loading") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={false}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.6 }}
          className="text-center"
        >
          <SlowHeart />
          <p className="mt-6 text-[8px] uppercase tracking-[0.65em] text-white/25">
            T&M MOMENTS
          </p>
        </motion.div>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <div className="w-full max-w-md rounded-[2rem] bg-[#f7eee3] p-10 text-center text-[#4a1723] shadow-2xl">
          <h1 className="font-serif text-2xl">
            This moment is unavailable.
          </h1>
          <p className="mt-4 text-sm leading-7 text-[#4a1723]/55">
            This private link may have expired or is no longer valid.
          </p>
        </div>
      </Shell>
    );
  }

  if (scene === "arrival") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
        hideMusic={!musicStarted}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.7 }}
          className="relative flex min-h-[78svh] w-full max-w-5xl items-center justify-center"
        >
          <AmbientRings />

          <div className="relative z-10 text-center">
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.7,
                duration: 1.1,
              }}
              className="text-[9px] uppercase tracking-[0.65em] text-white/30"
            >
              A private little world
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 1.05,
                duration: 1.3,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mt-7 font-serif text-5xl leading-tight text-[#fff6eb] md:text-7xl"
            >
              Made for{" "}
              <span className="italic text-[#e2b0a9]">
                {moment?.recipient_name || "you"}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 1.9,
                duration: 1.2,
              }}
              className="mx-auto mt-7 max-w-md text-sm leading-7 text-white/40"
            >
              Take your time.
              <br />
              There are a few things waiting to be discovered.
            </motion.p>

            <motion.button
              type="button"
              whileHover={{ scale: 1.035 }}
              whileTap={{ scale: 0.95 }}
              onClick={begin}
              className="relative mt-14"
              aria-label="Begin the moment"
            >
              <motion.span
                animate={{
                  scale: [1, 1.18, 1],
                  opacity: [0.2, 0, 0.2],
                }}
                transition={{
                  duration: 3.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -inset-9 rounded-full border border-[#d5a55d]/25"
              />
              <span className="relative flex h-20 w-20 items-center justify-center rounded-full border border-[#d5a55d]/35 bg-[#8d2036]/75 shadow-[0_0_70px_rgba(160,55,75,0.25)]">
                <Heart className="h-8 w-8 fill-[#f8dadd] text-[#f8dadd]" />
              </span>
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                delay: 2.3,
                duration: 1,
              }}
              className="mt-8 text-[8px] uppercase tracking-[0.45em] text-white/20"
            >
              tap when you're ready
            </motion.p>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "envelope") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{ opacity: 0, y: 45 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.3,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-[760px]"
        >
          <div className="relative min-h-[720px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f4e8d8] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />

            <div className="relative flex min-h-[720px] flex-col items-center justify-center px-8">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.5,
                  duration: 1,
                }}
                className="absolute top-10 text-[9px] uppercase tracking-[0.55em] text-[#4a1723]/30"
              >
                Someone left this for you
              </motion.p>

              <motion.div
                animate={{
                  y: [0, -4, 0],
                  rotate: [-1, 1, -1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative w-[min(82vw,430px)]"
              >
                <div className="absolute -inset-7 rounded-[1.8rem] bg-[#6d1728]/10 blur-3xl" />

                <div className="relative aspect-[1.45/1] rounded-[1.4rem] bg-[#7d1d31] shadow-[0_38px_70px_rgba(70,15,25,0.3)]">
                  <div className="absolute inset-0 overflow-hidden rounded-[1.4rem]">
                    <div className="absolute left-0 top-0 h-1/2 w-1/2 origin-top-left rotate-[24deg] border-r border-[#c49250]/20 bg-[#8e263a]" />
                    <div className="absolute right-0 top-0 h-1/2 w-1/2 origin-top-right -rotate-[24deg] border-l border-[#c49250]/20 bg-[#8e263a]" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#751a2d]" />

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.92 }}
                    onClick={pressSeal}
                    className={`absolute left-1/2 top-1/2 z-10 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#a51f36] shadow-[0_15px_30px_rgba(60,10,20,0.3)] transition-opacity duration-1000 ${
                      envelopeOpen
                        ? "opacity-0"
                        : "opacity-100"
                    }`}
                    aria-label="Open the wax seal"
                  >
                    <Heart className="h-8 w-8 fill-[#f7d7db] text-[#f7d7db]" />
                  </motion.button>

                  <AnimatePresence>
                    {sealPressed && !envelopeOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          scale: 0.7,
                        }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{
                          duration: 0.9,
                        }}
                        className="absolute inset-0 z-20 flex items-center justify-center bg-[#7d1d31]/92"
                      >
                        <motion.button
                          type="button"
                          onClick={openEnvelope}
                          whileTap={{ scale: 0.96 }}
                          className="rounded-full border border-[#d5a55d]/30 bg-[#f4e8d8] px-7 py-3 text-[9px] uppercase tracking-[0.3em] text-[#4a1723]"
                        >
                          Open my heart
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.8,
                  duration: 1,
                }}
                className="mt-12 font-serif text-3xl text-[#4a1723]"
              >
                For {moment?.recipient_name || "you"}
              </motion.h2>

              <p className="mt-3 text-xs text-[#4a1723]/40">
                Start with the little red heart.
              </p>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "inside") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4 }}
          className="w-full max-w-[900px]"
        >
          <div className="relative min-h-[720px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f4e8d8] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />

            <div className="relative min-h-[720px] px-7 py-12 md:px-14">
              <p className="text-center text-[9px] uppercase tracking-[0.55em] text-[#4a1723]/30">
                inside
              </p>

              <div className="relative mx-auto mt-10 min-h-[560px] max-w-[720px]">
                <motion.div
                  initial={{ opacity: 0, rotate: -4, x: -90 }}
                  animate={{ opacity: 1, rotate: -4, x: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute left-[5%] top-[8%] hidden h-40 w-56 rounded-xl border border-[#b1844b]/20 bg-[#fffaf3] p-3 shadow-2xl sm:block"
                >
                  <div className="h-full rounded-lg bg-gradient-to-br from-[#e7c6bd] to-[#c4878b]" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, rotate: 3, x: 90 }}
                  animate={{ opacity: 1, rotate: 3, x: 0 }}
                  transition={{
                    delay: 0.45,
                    duration: 1.2,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute right-[5%] top-[20%] hidden h-44 w-60 rounded-xl border border-[#b1844b]/20 bg-[#fffaf3] p-3 shadow-2xl sm:block"
                >
                  <div className="h-full rounded-lg bg-gradient-to-br from-[#d9b1a8] to-[#b86e7b]" />
                </motion.div>

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 80,
                    rotate: -1,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    rotate: -1,
                  }}
                  transition={{
                    delay: 0.7,
                    duration: 1.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="absolute left-1/2 top-1/2 w-[min(88vw,470px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.4rem] border border-[#b1844b]/20 bg-[#fffaf3] p-7 text-center shadow-[0_40px_80px_rgba(70,30,25,0.18)]"
                >
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#a51f36] shadow-lg">
                    <Heart className="h-7 w-7 fill-[#f8dadd] text-[#f8dadd]" />
                  </div>

                  <p className="mt-7 text-[9px] uppercase tracking-[0.4em] text-[#a51f36]/50">
                    a little world
                  </p>

                  <h2 className="mt-4 font-serif text-3xl leading-tight text-[#4a1723]">
                    I kept a few memories
                    <br />
                    here for you.
                  </h2>

                  <p className="mx-auto mt-5 max-w-sm text-sm leading-7 text-[#4a1723]/45">
                    Start with one. You might find something hidden along the way.
                  </p>

                  <button
                    type="button"
                    onClick={goToMemories}
                    className="mt-8 rounded-full bg-[#4a1723] px-7 py-3 text-[9px] uppercase tracking-[0.3em] text-white shadow-lg"
                  >
                    Find them
                  </button>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, rotate: 8, x: 80 }}
                  animate={{ opacity: 1, rotate: 8, x: 0 }}
                  transition={{
                    delay: 0.6,
                    duration: 1.2,
                  }}
                  className="absolute bottom-[7%] right-[8%] hidden h-24 w-40 rounded-lg border border-[#b1844b]/20 bg-[#f9eee3] shadow-xl sm:block"
                >
                  <div className="p-4 text-right">
                    <Mail className="ml-auto h-6 w-6 text-[#a51f36]/40" />
                    <p className="mt-2 text-[7px] uppercase tracking-[0.3em] text-[#4a1723]/25">
                      keep looking
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "memory") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="w-full max-w-6xl"
        >
          <div className="relative min-h-[760px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f4e8d8] px-5 py-10 shadow-[0_55px_120px_rgba(0,0,0,0.43)] md:px-12">
            <PaperTexture />

            <div className="relative flex items-center justify-between">
              <p className="text-[9px] uppercase tracking-[0.55em] text-[#4a1723]/30">
                memories
              </p>
              <p className="font-serif text-sm italic text-[#4a1723]/25">
                {memoryIndex + 1} of {memoryCount}
              </p>
            </div>

            <div className="relative mt-5 grid min-h-[650px] items-center gap-12 md:grid-cols-[1.15fr_0.85fr] md:gap-20">
              <AnimatePresence mode="wait">
                <motion.div
                  key={memoryIndex}
                  initial={{
                    opacity: 0,
                    x: 70,
                    rotate: 5,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    rotate: -1.5,
                  }}
                  exit={{
                    opacity: 0,
                    x: -70,
                    rotate: -5,
                  }}
                  transition={{
                    duration: 1,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="relative mx-auto w-full max-w-[500px]"
                >
                  <div
                    onPointerDown={onPhotoDown}
                    onPointerMove={onPhotoMove}
                    onPointerUp={onPhotoUp}
                    onPointerCancel={onPhotoUp}
                    className="relative cursor-grab select-none active:cursor-grabbing"
                    style={{
                      transform: `translate(${photoOffset.x}px, ${photoOffset.y}px)`,
                      transition: photoDragging
                        ? "none"
                        : "transform 900ms cubic-bezier(.22,1,.36,1)",
                    }}
                  >
                    <div className="absolute -inset-5 rounded-[1.8rem] bg-black/10 blur-2xl" />

                    <div className="relative rounded-[1.25rem] border border-[#b1844b]/25 bg-[#fffaf3] p-4 pb-8 shadow-[0_40px_75px_rgba(70,30,25,0.2)]">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-[0.8rem] bg-gradient-to-br from-[#ead4c5] to-[#c88e91]">
                        {currentMemory.imageUrl ? (
                          <img
                            src={currentMemory.imageUrl}
                            alt={currentMemory.title}
                            draggable={false}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <PhotoPlaceholder
                            title={currentMemory.title}
                          />
                        )}

                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />

                        <AnimatePresence>
                          {photoFlash && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{
                                opacity: [0, 0.85, 0],
                              }}
                              transition={{
                                duration: 0.7,
                              }}
                              className="pointer-events-none absolute inset-0 bg-white"
                            />
                          )}
                        </AnimatePresence>

                        <AnimatePresence>
                          {kissed &&
                            Array.from({
                              length: 5,
                            }).map((_, index) => (
                              <motion.div
                                key={index}
                                initial={{
                                  opacity: 0,
                                  x: 0,
                                  y: 0,
                                  scale: 0.4,
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  x:
                                    Math.cos(index * 1.3) * 80,
                                  y:
                                    -80 -
                                    Math.sin(index * 1.3) *
                                      50,
                                  scale: [0.4, 1, 0.7],
                                }}
                                transition={{
                                  duration: 1.9,
                                  delay: index * 0.1,
                                  ease: "easeOut",
                                }}
                                className="absolute bottom-1/3 left-1/2"
                              >
                                <Heart className="h-5 w-5 fill-[#c52b45] text-[#c52b45]" />
                              </motion.div>
                            ))}
                        </AnimatePresence>

                        <button
                          type="button"
                          onPointerDown={(event) =>
                            event.stopPropagation()
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            kissPhoto();
                          }}
                          className="absolute bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full border border-white/35 bg-[#6f1a2d]/80 shadow-xl backdrop-blur"
                          aria-label="Steal a kiss"
                        >
                          <Heart
                            className={`h-5 w-5 ${
                              kissed
                                ? "fill-[#f4b8c0] text-[#f4b8c0]"
                                : "text-white"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="px-2 pt-5">
                        <p className="text-[9px] uppercase tracking-[0.42em] text-[#a51f36]/55">
                          {currentMemory.title}
                        </p>
                        <p className="mt-3 font-serif text-xl leading-7 text-[#4a1723]">
                          {currentMemory.caption}
                        </p>
                      </div>

                      <div className="absolute -right-3 -top-3 flex h-11 w-11 rotate-12 items-center justify-center rounded-full bg-[#a51f36] shadow-lg">
                        <Heart className="h-4 w-4 fill-[#f7d7db] text-[#f7d7db]" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="relative mx-auto w-full max-w-[340px] text-center md:text-left">
                <p className="text-[9px] uppercase tracking-[0.45em] text-[#a51f36]/55">
                  {kissed
                    ? "you found the soft spot"
                    : "a little memory"}
                </p>

                <h2 className="mt-5 font-serif text-4xl leading-tight text-[#4a1723]">
                  {memoryIndex === 0
                    ? "You remember this?"
                    : memoryIndex === 1
                      ? "Some moments stay."
                      : memoryIndex === 2
                        ? "Look a little closer."
                        : "Still my favourite."}
                </h2>

                <p className="mt-5 text-sm leading-7 text-[#4a1723]/50">
                  Move the photograph gently.
                  <br />
                  Touch the heart if you want to steal a kiss.
                </p>

                <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
                  <button
                    type="button"
                    onClick={revealPhotoNote}
                    className="rounded-full border border-[#a51f36]/15 bg-white/55 px-5 py-3 text-[9px] uppercase tracking-[0.28em] text-[#4a1723]/65"
                  >
                    Look closer
                  </button>

                  <button
                    type="button"
                    onClick={kissPhoto}
                    className="rounded-full bg-[#a51f36] px-5 py-3 text-[9px] uppercase tracking-[0.28em] text-white"
                  >
                    Steal a kiss
                  </button>
                </div>

                <div className="mt-10 flex items-center justify-center gap-4 md:justify-start">
                  <button
                    type="button"
                    onClick={previousMemory}
                    disabled={memoryIndex === 0}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4a1723]/10 bg-white/45 text-[#4a1723]/50 disabled:opacity-20"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {memories.map((_, index) => (
                      <span
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-1000 ${
                          index === memoryIndex
                            ? "w-7 bg-[#a51f36]"
                            : "w-1.5 bg-[#4a1723]/15"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={nextMemory}
                    disabled={memoryIndex === memoryCount - 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#4a1723]/10 bg-white/45 text-[#4a1723]/50 disabled:opacity-20"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {memoryIndex === memoryCount - 1 && (
                  <motion.button
                    type="button"
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 1,
                    }}
                    onClick={finishMemories}
                    className="mt-9 rounded-full bg-[#4a1723] px-7 py-3 text-[9px] uppercase tracking-[0.3em] text-white shadow-lg"
                  >
                    There's more
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "hiddenNote") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 45,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1.25,
          }}
          className="w-full max-w-[720px]"
        >
          <div className="relative min-h-[700px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f4e8d8] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />

            <div className="relative flex min-h-[700px] flex-col items-center justify-center px-8 text-center">
              <p className="absolute top-10 text-[9px] uppercase tracking-[0.55em] text-[#4a1723]/30">
                tucked underneath
              </p>

              <motion.div
                initial={{
                  y: 45,
                  rotate: -3,
                }}
                animate={{
                  y: 0,
                  rotate: -1,
                }}
                transition={{
                  duration: 1.2,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative w-full max-w-[410px]"
              >
                <div className="absolute -inset-4 rounded-2xl bg-black/10 blur-2xl" />

                <div className="relative rounded-xl border border-[#b1844b]/20 bg-[#fffaf3] p-4 pb-6 shadow-2xl">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-gradient-to-br from-[#ead4c5] to-[#c88e91]">
                    {currentMemory.imageUrl ? (
                      <img
                        src={currentMemory.imageUrl}
                        alt={currentMemory.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <PhotoPlaceholder
                        title={currentMemory.title}
                      />
                    )}
                  </div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{
                      y: 0,
                      opacity: 1,
                    }}
                    transition={{
                      delay: 0.6,
                      duration: 1,
                    }}
                    className="mt-5 rounded-xl bg-[#f3e4d4] px-5 py-6"
                  >
                    <p className="font-serif text-xl italic leading-8 text-[#4a1723]/65">
                      “{currentMemory.secret}”
                    </p>
                  </motion.div>
                </div>
              </motion.div>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1.25,
                  duration: 1,
                }}
                className="mt-10 font-serif text-3xl text-[#4a1723]"
              >
                And that's only a little piece of us.
              </motion.h2>

              <motion.button
                type="button"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 1.75,
                  duration: 1,
                }}
                onClick={goToSecret}
                className="group mt-9 rounded-full bg-[#4a1723] px-8 py-3.5 text-[9px] uppercase tracking-[0.32em] text-white shadow-[0_16px_40px_rgba(74,23,35,0.18)]"
              >
                <span className="inline-flex items-center gap-2">
                  Find what comes next
                  <Sparkles className="h-3 w-3 opacity-50 transition-transform duration-700 group-hover:rotate-45" />
                </span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }


  if (scene === "constellation") {
    const constellationPoints = [
      { x: 18, y: 30, rotate: -8 },
      { x: 72, y: 24, rotate: 7 },
      { x: 50, y: 48, rotate: -2 },
      { x: 26, y: 70, rotate: 6 },
      { x: 78, y: 72, rotate: -5 },
    ];

    const requiredPoints = Math.min(5, memoryCount);

    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[820px]"
        >
          <div className="relative min-h-[720px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/20 bg-[#250914] shadow-[0_55px_120px_rgba(0,0,0,0.5)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(185,72,103,0.24),transparent_38%),radial-gradient(circle_at_15%_80%,rgba(214,165,93,0.08),transparent_30%)]" />

            <motion.div
              className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d45b80]/10 blur-[80px]"
              animate={{ scale: [1, 1.12, 1], opacity: [0.45, 0.7, 0.45] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10 flex min-h-[720px] flex-col items-center justify-center px-6 py-16 text-center">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9 }}
                className="mb-6 flex items-center gap-2 text-[#e5bf78]/55"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[8px] uppercase tracking-[0.48em]">
                  a tiny secret
                </span>
                <Sparkles className="h-3.5 w-3.5" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 1 }}
                className="max-w-xl font-serif text-4xl leading-tight text-[#fff7ed] md:text-5xl"
              >
                Find the little stars
                <br />
                <span className="italic text-[#e2b0a9]">that belong to you.</span>
              </motion.h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/42">
                Tap them one by one.
                <br />
                There may be something hiding in the pattern.
              </p>

              <div className="relative mt-10 h-[300px] w-full max-w-[560px] overflow-hidden rounded-[2rem] border border-white/8 bg-white/[0.025]">
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    d="M18 30 L72 24 L50 48 L26 70 L78 72"
                    fill="none"
                    stroke="rgba(229,191,120,0.18)"
                    strokeWidth="0.35"
                    strokeDasharray="2 3"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: constellationFound.length ? 1 : 0, opacity: constellationFound.length ? 1 : 0.2 }}
                    transition={{ duration: 1.2, ease: "easeInOut" }}
                  />
                </svg>

                {constellationPoints.map((point, index) => {
                  const found = constellationFound.includes(index);
                  const memory = memories[index % memoryCount];

                  return (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Discover star ${index + 1}`}
                      onClick={() => discoverConstellation(index)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 touch-manipulation"
                      style={{ left: `${point.x}%`, top: `${point.y}%` }}
                    >
                      <motion.span
                        animate={
                          found
                            ? { scale: [1, 1.22, 1], opacity: 1 }
                            : { scale: [0.92, 1.08, 0.92], opacity: [0.48, 0.9, 0.48] }
                        }
                        transition={{
                          duration: found ? 0.8 : 2.8,
                          repeat: found ? 0 : Infinity,
                          delay: index * 0.18,
                          ease: "easeInOut",
                        }}
                        className={`relative flex h-14 w-14 items-center justify-center rounded-full border ${
                          found
                            ? "border-[#e5bf78]/65 bg-[#e5bf78]/15 shadow-[0_0_38px_rgba(229,191,120,0.32)]"
                            : "border-white/10 bg-white/[0.035]"
                        }`}
                      >
                        {found && memory.imageUrl ? (
                          <img
                            src={memory.imageUrl}
                            alt=""
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <Sparkles
                            className={`h-4 w-4 ${
                              found ? "text-[#f2d89d]" : "text-[#e5bf78]/65"
                            }`}
                          />
                        )}
                      </motion.span>
                    </button>
                  );
                })}

                <AnimatePresence>
                  {constellationComplete && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.04, 1] }}
                        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                        className="rounded-full border border-[#e5bf78]/35 bg-[#3a101e]/90 px-6 py-3 shadow-2xl backdrop-blur"
                      >
                        <p className="font-serif text-lg italic text-[#f4d9c9]">
                          You found us. ♡
                        </p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-7 flex items-center gap-2">
                {Array.from({ length: requiredPoints }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 rounded-full transition-all duration-700 ${
                      constellationFound.includes(index)
                        ? "w-7 bg-[#e5bf78]"
                        : "w-1.5 bg-white/15"
                    }`}
                  />
                ))}
              </div>

              <AnimatePresence>
                {constellationComplete && (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    onClick={goToKey}
                    className="mt-8 rounded-full border border-[#e5bf78]/25 bg-[#e5bf78]/10 px-8 py-3.5 text-[9px] uppercase tracking-[0.32em] text-[#f4e3c3] shadow-[0_0_35px_rgba(229,191,120,0.12)]"
                  >
                    I found the secret
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "key") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.95,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            duration: 1.3,
          }}
          className="w-full max-w-[760px]"
        >
          <div className="relative min-h-[720px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f4e8d8] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />

            <div className="relative flex min-h-[720px] flex-col items-center justify-center px-8 text-center">
              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 1.3,
                }}
                className="relative mb-11 flex h-52 w-52 items-center justify-center rounded-full border border-[#b1844b]/25 bg-[#fff9f0] shadow-[0_35px_75px_rgba(70,25,25,0.15)]"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="flex h-28 w-28 items-center justify-center rounded-full bg-[#a51f36] shadow-xl"
                >
                  <Heart className="h-14 w-14 fill-[#f8dadd] text-[#f8dadd]" />
                </motion.div>
              </motion.div>

              <p className="text-[9px] uppercase tracking-[0.5em] text-[#a51f36]/55">
                one last little secret
              </p>

              <h2 className="mt-5 font-serif text-4xl text-[#4a1723]">
                I kept something for you.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-[#4a1723]/50">
                There is a tiny key.
                <br />
                Turn it slowly.
              </p>

              <button
                type="button"
                onPointerDown={onKeyDown}
                onPointerMove={onKeyMove}
                onPointerUp={onKeyUp}
                onPointerCancel={onKeyUp}
                onClick={unlock}
                className="relative mt-10 h-16 w-80 touch-none overflow-hidden rounded-full border border-[#a51f36]/15 bg-[#fffaf3] shadow-inner"
              >
                <motion.span
                  animate={{
                    x: keyProgress * 215,
                    rotate: keyProgress * 160,
                  }}
                  transition={{
                    duration: 0.45,
                    ease: "easeOut",
                  }}
                  className="absolute left-2 top-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#a51f36] shadow-lg"
                >
                  <KeyRound className="h-4 w-4 text-white" />
                </motion.span>

                <span className="text-[9px] uppercase tracking-[0.35em] text-[#4a1723]/35">
                  slide slowly
                </span>
              </button>

              <AnimatePresence>
                {keyProgress > 0.82 && (
                  <motion.p
                    initial={{
                      opacity: 0,
                    }}
                    animate={{
                      opacity: 1,
                    }}
                    className="mt-6 font-serif text-lg italic text-[#a51f36]/65"
                  >
                    almost…
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "jewel") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{
            duration: 1.5,
          }}
          className="w-full max-w-[900px]"
        >
          <div className="relative min-h-[760px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-gradient-to-b from-[#f7ecdf] to-[#e3c9ab] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />

            <motion.div
              initial={{
                scale: 0.4,
                opacity: 0,
              }}
              animate={{
                scale: 1.6,
                opacity: 1,
              }}
              transition={{
                duration: 2.4,
                ease: "easeOut",
              }}
              className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#b1844b]/12 blur-[110px]"
            />

            <div className="relative flex min-h-[760px] flex-col items-center justify-center px-8 text-center">
              {Array.from({ length: 22 }).map((_, index) => (
                <motion.span
                  key={index}
                  initial={{
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0, 1, 0],
                    x:
                      Math.cos(
                        (index / 22) * Math.PI * 2
                      ) *
                      (100 + (index % 5) * 30),
                    y:
                      Math.sin(
                        (index / 22) * Math.PI * 2
                      ) *
                      (100 + (index % 4) * 28),
                  }}
                  transition={{
                    duration: 4,
                    delay: index * 0.08,
                    ease: "easeOut",
                  }}
                  className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-[#b1844b]"
                />
              ))}

              <motion.div
                initial={{
                  y: 170,
                  opacity: 0,
                  scale: 0.6,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  delay: 0.6,
                  duration: 1.8,
                  type: "spring",
                  stiffness: 45,
                  damping: 16,
                }}
                className="relative z-10 h-72 w-72 overflow-hidden rounded-[2.1rem] border border-[#b1844b]/30 bg-[#fff9f0] p-5 shadow-[0_50px_90px_rgba(70,30,25,0.2)]"
              >
                <div className="relative flex h-full items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-[#f6ecdf] to-[#d8bea0]">
                  {productImageUrl ? (
                    <motion.img
                      initial={{
                        opacity: 0,
                        scale: 1.08,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                      }}
                      transition={{
                        delay: 1,
                        duration: 1.7,
                      }}
                      src={productImageUrl}
                      alt={productName}
                      className="h-full w-full object-contain p-5"
                    />
                  ) : (
                    <motion.div
                      animate={{
                        y: [0, -6, 0],
                        rotate: [-1, 1, -1],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="flex h-32 w-32 items-center justify-center rounded-full bg-[#a51f36]"
                    >
                      <Heart className="h-16 w-16 fill-[#f7d7db] text-[#f7d7db]" />
                    </motion.div>
                  )}
                </div>
              </motion.div>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 1.7,
                  duration: 1,
                }}
                className="relative z-10 mt-10 text-[9px] uppercase tracking-[0.55em] text-[#a51f36]/55"
              >
                chosen with love
              </motion.p>

              <motion.h2
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 2,
                  duration: 1,
                }}
                className="relative z-10 mt-5 font-serif text-4xl text-[#4a1723]"
              >
                {productImageUrl
                  ? productName
                  : "Just for you."}
              </motion.h2>

              <motion.p
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 2.35,
                  duration: 1,
                }}
                className="relative z-10 mt-4 text-sm text-[#4a1723]/50"
              >
                Something beautiful, for someone beautiful.
              </motion.p>

              <motion.div
                initial={{
                  opacity: 0,
                  y: 15,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 2.8,
                  duration: 1,
                }}
                className="relative z-10 mt-10 flex flex-col items-center gap-4 sm:flex-row"
              >
                <button
                  type="button"
                  onClick={() => setScene("letter")}
                  className="rounded-full bg-[#4a1723] px-8 py-3.5 text-[9px] uppercase tracking-[0.3em] text-white shadow-lg"
                >
                  Open the final letter
                </button>

                {voiceNoteUrl && (
                  <button
                    type="button"
                    onClick={toggleVoice}
                    className="flex items-center gap-2 rounded-full border border-[#4a1723]/10 bg-white/60 px-5 py-3.5 text-[9px] uppercase tracking-[0.25em] text-[#4a1723]/65"
                  >
                    {voicePlaying ? (
                      <Pause className="h-3.5 w-3.5" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    Voice note
                  </button>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  if (scene === "letter") {
    return (
      <Shell
        particles={particles}
        cursor={cursor}
        setCursor={setCursor}
        musicPlaying={musicPlaying}
        onMusicToggle={toggleMusic}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 45,
            rotate: -1,
          }}
          animate={{
            opacity: 1,
            y: 0,
            rotate: 0,
          }}
          transition={{
            duration: 1.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="w-full max-w-[680px]"
        >
          <div className="relative min-h-[740px] overflow-hidden rounded-[2.7rem] border border-[#d2a969]/25 bg-[#f7eee2] shadow-[0_55px_120px_rgba(0,0,0,0.43)]">
            <PaperTexture />
            <FloatingHearts />

            <div className="relative flex min-h-[740px] flex-col items-center justify-center px-10 py-16 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{
                  scale: [0, 1.12, 1],
                }}
                transition={{
                  duration: 1.3,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-[#a51f36] shadow-[0_25px_55px_rgba(100,15,30,0.22)]"
              >
                <Heart className="h-10 w-10 fill-[#f8dadd] text-[#f8dadd]" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  delay: 0.75,
                  duration: 1,
                }}
                className="relative z-10 mt-9 text-[9px] uppercase tracking-[0.5em] text-[#a51f36]/55"
              >
                for {moment?.recipient_name || "you"}
              </motion.p>

              <motion.h1
                initial={{
                  opacity: 0,
                  y: 18,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1.05,
                  duration: 1.1,
                }}
                className="relative z-10 mt-5 font-serif text-5xl leading-tight text-[#4a1723]"
              >
                Happy
                <br />
                Anniversary
              </motion.h1>

              {moment?.personal_message && (
                <motion.p
                  initial={{
                    opacity: 0,
                    y: 18,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 1.5,
                    duration: 1.2,
                  }}
                  className="relative z-10 mt-10 max-w-md whitespace-pre-line font-serif text-xl italic leading-9 text-[#4a1723]/65"
                >
                  “{moment.personal_message}”
                </motion.p>
              )}

              {moment?.sender_name && (
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  transition={{
                    delay: 2,
                    duration: 1,
                  }}
                  className="relative z-10 mt-11"
                >
                  <div className="mx-auto mb-3 h-px w-12 bg-[#b1844b]/45" />
                  <p className="font-serif text-base text-[#4a1723]/50">
                    With love,
                  </p>
                  <p className="mt-1 font-serif text-xl text-[#4a1723]">
                    {moment.sender_name}
                  </p>
                </motion.div>
              )}

              {voiceNoteUrl && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{
                    delay: 2.45,
                    duration: 1,
                  }}
                  onClick={toggleVoice}
                  className="relative z-10 mt-9 flex items-center gap-2 rounded-full border border-[#a51f36]/15 bg-white/50 px-5 py-3 text-[9px] uppercase tracking-[0.25em] text-[#4a1723]/60"
                >
                  {voicePlaying ? (
                    <Pause className="h-3.5 w-3.5" />
                  ) : (
                    <Volume2 className="h-3.5 w-3.5" />
                  )}
                  {voicePlaying
                    ? "Playing your note"
                    : "Listen to their voice"}
                </motion.button>
              )}

              <p className="absolute bottom-9 text-[8px] uppercase tracking-[0.55em] text-[#4a1723]/25">
                T&M JEWELS
              </p>
            </div>
          </div>
        </motion.div>
      </Shell>
    );
  }

  return null;
}

function Shell({
  children,
  particles,
  cursor,
  setCursor,
  musicPlaying,
  onMusicToggle,
  hideMusic = false,
}: {
  children: ReactNode;
  particles: Array<{
    id: number;
    left: number;
    top: number;
    delay: number;
    duration: number;
    size: number;
  }>;
  cursor: { x: number; y: number };
  setCursor: Dispatch<
    SetStateAction<{ x: number; y: number }>
  >;
  musicPlaying: boolean;
  onMusicToggle: () => void;
  hideMusic?: boolean;
}) {
  return (
    <main
      className="relative min-h-[100svh] overflow-hidden bg-[#22050e]"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return;

        const rect =
          event.currentTarget.getBoundingClientRect();

        setCursor({
          x:
            ((event.clientX - rect.left) /
              rect.width) *
            100,
          y:
            ((event.clientY - rect.top) /
              rect.height) *
            100,
        });
      }}
    >
      <motion.div
        className="pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-[#8f2638]/10 blur-[150px]"
        animate={{
          left: `${cursor.x - 20}%`,
          top: `${cursor.y - 20}%`,
        }}
        transition={{
          type: "spring",
          stiffness: 16,
          damping: 32,
        }}
      />

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(145,35,58,0.18),transparent_60%)]" />

      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.38, 0],
            y: [0, -42],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="pointer-events-none absolute rounded-full bg-[#d7b16a]"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: particle.size,
            height: particle.size,
          }}
        />
      ))}

      <div className="absolute left-7 top-7 z-40 text-[8px] uppercase tracking-[0.6em] text-white/20">
        T&M MOMENTS
      </div>

      {!hideMusic && (
        <button
          type="button"
          onClick={onMusicToggle}
          className="absolute right-6 top-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-white/45 backdrop-blur"
          aria-label={
            musicPlaying
              ? "Pause music"
              : "Play music"
          }
        >
          {musicPlaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Volume2 className="h-3.5 w-3.5" />
          )}
          <span className="hidden text-[8px] uppercase tracking-[0.25em] sm:inline">
            {musicPlaying ? "music" : "sound"}
          </span>
        </button>
      )}

      <div className="relative z-10 flex min-h-[100svh] items-center justify-center px-4 py-20 md:px-7">
        {children}
      </div>
    </main>
  );
}

function SlowHeart() {
  return (
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
      }}
      transition={{
        duration: 2.8,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#8d2036]"
    >
      <Heart className="h-6 w-6 fill-[#f8dadd] text-[#f8dadd]" />
    </motion.div>
  );
}

function AmbientRings() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        animate={{
          scale: [1, 1.09, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-80 w-80 rounded-full border border-[#d5a55d]/20"
      />

      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.05, 0.13, 0.05],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          delay: 0.7,
          ease: "easeInOut",
        }}
        className="absolute h-[480px] w-[480px] rounded-full border border-[#d5a55d]/10"
      />
    </div>
  );
}

function PaperTexture() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(#74414b_0.5px,transparent_0.5px)] [background-size:10px_10px]" />
      <div className="pointer-events-none absolute inset-3 rounded-[2rem] border border-[#b1844b]/15" />
    </>
  );
}

function PhotoPlaceholder({
  title,
}: {
  title: string;
}) {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#f6e7d6,transparent_40%),linear-gradient(135deg,#e2c0b5,#c48f91)]">
      <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-[#8f2638]/15 blur-3xl" />

      <div className="relative text-center">
        <Heart className="mx-auto h-14 w-14 fill-[#a51f36]/70 text-[#a51f36]/70" />
        <p className="mt-4 font-serif text-lg italic text-[#4a1723]/60">
          {title}
        </p>
      </div>
    </div>
  );
}

function FloatingHearts() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 9 }).map((_, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            y: 35,
            x: 0,
            scale: 0.5,
          }}
          animate={{
            opacity: [0, 0.34, 0],
            y: [35, -210],
            x: Math.cos(index * 0.85) * 150,
            scale: [0.5, 1, 0.7],
          }}
          transition={{
            duration: 7 + index * 0.2,
            delay: index * 0.3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute left-1/2 top-1/2"
        >
          <Heart className="h-4 w-4 fill-[#a51f36]/20 text-[#a51f36]/20" />
        </motion.div>
      ))}
    </div>
  );
}
