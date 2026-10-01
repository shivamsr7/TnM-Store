import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import "./BirthdayMonth.css";

const GIRLFRIEND_NAME = "Tannu";
const YOUR_NAME = "Shivam";
const BIRTHDAY_DATE = "25 October";

const PHOTO_PLACEHOLDERS = [
  { number: "01", label: "a little glow", src: "/Beauty1.jpeg" },
  { number: "02", label: "that beautiful smile", src: "/Beauty5.JPG" },
  { number: "03", label: "one of my favourites", src: "/Beauty8.JPG" },
  { number: "04", label: "you, being you", src: "/Beauty9.JPG" },
  { number: "05", label: "another pretty moment", src: "/Beauty10.PNG" },
  { number: "06", label: "just beautiful", src: "/Beauty11.jpg" },
];

const SPECIAL_VIDEO = "/birthday_day02_video.mp4";
const AUDIO = "/AUDIO.m4a";
const BACKGROUND_AUDIO = "/Omere.mp3";

const MEMORY_IMAGES = [
  { src: "/IMG01.jpg", caption: "one of my favourite views of you" },
  { src: "/IMG03.jpg", caption: "another little moment I want to keep" },
  { src: "/Family.jpg", caption: "the people and moments that make you, you" },
  { src: "/Shivam_Tannu.jpeg", caption: "us — one of my favourite places to be" },
  { src: "/Tannu1.jpeg", caption: "that smile I could look at forever" },
  { src: "/Tannu2.jpeg", caption: "another memory worth keeping close" },
  { src: "/TannuShivam.JPG", caption: "just us, exactly as we are" },
];

const MEMORY_VIDEOS = [
  { src: "/TannuSing.mov", title: "a little moment I could watch again" },
  { src: "/Video.MOV", title: "one more memory, just for you" },
];



const US_IMAGES = [
  { src: "/Us1.jpeg", caption: "you + me, my favourite combination" },
  { src: "/UsImage2.JPG", caption: "one of those moments I wish I could pause" },
  { src: "/UsImage3.JPG", caption: "just us, being us" },
  { src: "/UsImage4.JPG", caption: "a little piece of our story" },
];

const US_VIDEOS = [
  { src: "/UsVideo1.MOV", title: "us, in motion" },
  { src: "/UsVideo3.MOV", title: "another little us moment" },
  { src: "/UsVideo4.MOV", title: "one I want to remember" },
  { src: "/UsVideo5.MOV", title: "just because I love this" },
  { src: "/UsVideo6.MOV", title: "one more for the memories" },
];

const FALLING_HEARTS = [
  { left: "7%", delay: "0s", duration: "17s", size: "12px", drift: "-18px" },
  { left: "18%", delay: "5s", duration: "21s", size: "9px", drift: "24px" },
  { left: "31%", delay: "2s", duration: "19s", size: "14px", drift: "-12px" },
  { left: "45%", delay: "8s", duration: "23s", size: "10px", drift: "18px" },
  { left: "58%", delay: "3s", duration: "20s", size: "13px", drift: "-22px" },
  { left: "71%", delay: "10s", duration: "24s", size: "9px", drift: "16px" },
  { left: "84%", delay: "6s", duration: "18s", size: "12px", drift: "-16px" },
  { left: "94%", delay: "12s", duration: "22s", size: "8px", drift: "22px" },
];


const TYPED_MESSAGE =
  "Your birthday is on the 25th. But why should I wait until the 25th to make you feel special? So this is just another tiny day in your birthday month… made a little more beautiful because it is yours.";

function FallingHearts() {
  return (
    <div className="falling-hearts" aria-hidden="true">
      {FALLING_HEARTS.map((heart, index) => (
        <span
          key={index}
          className="falling-heart"
          style={{
            left: heart.left,
            animationDelay: heart.delay,
            animationDuration: heart.duration,
            ["--heart-size" as string]: heart.size,
            ["--heart-drift" as string]: heart.drift,
          }}
        />
      ))}
    </div>
  );
}

function Typewriter({ text, speed = 28 }: { text: string; speed?: number }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(timer);
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return (
    <p className="typewriter">
      {shown}
      <span className="typing-cursor" aria-hidden="true" />
    </p>
  );
}

function ScratchCard({ onReveal }: { onReveal: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [revealed, setRevealed] = useState(false);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    gradient.addColorStop(0, "#d6b1a8");
    gradient.addColorStop(1, "#ae817b");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, rect.width, rect.height);

    for (let i = 0; i < 28; i++) {
      ctx.fillStyle = `rgba(255,255,255,${0.08 + (i % 4) * 0.025})`;
      ctx.beginPath();
      ctx.arc((i * 83) % rect.width, (i * 47) % rect.height, 1 + (i % 3), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fffaf6";
    ctx.font = "600 16px Georgia, serif";
    ctx.fillText("scratch my little secret", rect.width / 2, rect.height / 2 - 6);
    ctx.font = "11px Arial, sans-serif";
    ctx.fillStyle = "rgba(255,250,246,.82)";
    ctx.fillText("with your finger ✨", rect.width / 2, rect.height / 2 + 18);
  }, []);

  const scratch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed) return;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(clientX - rect.left, clientY - rect.top, 23, 0, Math.PI * 2);
    ctx.fill();

    const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let transparent = 0;
    for (let i = 3; i < pixels.length; i += 16) {
      if (pixels[i] < 80) transparent++;
    }

    if (transparent > (pixels.length / 16) * 0.54) {
      setRevealed(true);
      onReveal();
    }
  };

  const pointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    drawingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    scratch(e.clientX, e.clientY);
  };

  return (
    <div className={`scratch-wrap ${revealed ? "is-revealed" : ""}`}>
      <div className="scratch-message">
        <span className="scratch-small">YOU FOUND IT ♡</span>
        <strong>You won my heart<br /><span className="heart-red">♥</span></strong>
        <span>And somehow, I’d choose you all over again.</span>
      </div>

      {revealed && (
        <div className="rose-bouquet" aria-hidden="true">
          <div className="bouquet-glow" />
          <div className="rose rose-a"><i /><i /><i /></div>
          <div className="rose rose-b"><i /><i /><i /></div>
          <div className="rose rose-c"><i /><i /><i /></div>
          <div className="rose rose-d"><i /><i /><i /></div>
          <div className="rose rose-e"><i /><i /><i /></div>
          <div className="stem stem-a" />
          <div className="stem stem-b" />
          <div className="stem stem-c" />
          <div className="stem stem-d" />
          <div className="leaf leaf-a" />
          <div className="leaf leaf-b" />
          <div className="leaf leaf-c" />
          <div className="bouquet-ribbon">♡</div>
        </div>
      )}
      {!revealed && (
        <canvas
          ref={canvasRef}
          className="scratch-layer"
          onPointerDown={pointerDown}
          onPointerMove={(e) => drawingRef.current && scratch(e.clientX, e.clientY)}
          onPointerUp={() => (drawingRef.current = false)}
          onPointerCancel={() => (drawingRef.current = false)}
        />
      )}
    </div>
  );
}

function SurpriseAnimation({
  playing,
  onPlay,
  audioProgress,
  audioEnded,
  activePhotoIndex,
  onPhotoSelect,
}: {
  playing: boolean;
  onPlay: () => void;
  onFinish: () => void;
  audioProgress: number;
  audioEnded: boolean;
  activePhotoIndex: number;
  onPhotoSelect: (index: number) => void;
}) {
  const orbitPhotos = useMemo(() => PHOTO_PLACEHOLDERS, []);

  return (
    <section className="screen surprise-screen">
      <div className="surprise-kicker">A LITTLE SOMETHING I MADE FOR YOU</div>

      <div className={`orbit-scene ${playing ? "is-playing" : ""}`}>
        <div className="orbit-ring ring-one" />
        <div className="orbit-ring ring-two" />
        <div className="orbit-ring ring-three" />

        <div className="surprise-heart">
          <span className="heart-glow" />
          <span className="heart-symbol">♡</span>
          <small>{playing ? "for you" : "one little surprise"}</small>
        </div>

        {orbitPhotos.map((photo, index) => (
          <button
            type="button"
            className={`orbit-photo orbit-photo-${index + 1} ${
              index === activePhotoIndex ? "is-active" : ""
            }`}
            key={photo.number}
            onClick={() => onPhotoSelect(index)}
            aria-label={`Focus memory ${photo.number}: ${photo.label}`}
          >
            <img
              className="orbit-photo-image"
              src={photo.src}
              alt={photo.label}
              draggable={false}
            />
            <span>{photo.number}</span>
            <small>{photo.label}</small>
          </button>
        ))}
      </div>

      {!playing ? (
        <>
          <h2>Before the final surprise…</h2>
          <p className="surprise-copy">
            I want you to press one little button.
            <br />
            Then just sit back and let me show you a few things I love about you.
          </p>

          <button className="big-play-button" onClick={onPlay} aria-label="Play your surprise">
            <span>▶</span>
          </button>

          <div className="play-caption">
            <span>tap to play</span>
            <small>there's a little audio note inside</small>
          </div>
        </>
      ) : (
        <>
          <h2 className="playing-title">Just stay here for a moment…</h2>
          <p className="surprise-copy">
            Let the little memories circle around you.
            <br />
            You don't have to do anything. 🤍
          </p>

          <div className="audio-status">
            <div className="mini-equalizer">
              <i /><i /><i /><i /><i />
            </div>
            <span>{audioEnded ? "audio note finished" : "my little audio note"}</span>
            <b>{audioEnded ? "♡" : `${Math.max(0, Math.ceil((1 - audioProgress / 100) * 15))}s`}</b>
          </div>


        </>
      )}
    </section>
  );
}



function UsTogether({
  onNext,
  onVideoPlay,
  onVideoStop,
}: {
  onNext: () => void;
  onVideoPlay: () => void;
  onVideoStop: () => void;
}) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActive((current) => (current + 1) % US_IMAGES.length);
    }, 3600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="screen us-together-screen">
      <div className="us-together-kicker">A LITTLE CHAPTER OF US</div>

      <h2>
        Us,
        <br />
        <em>together.</em>
      </h2>

      <p className="us-together-intro">
        Some pictures are just pictures. These ones feel like little pieces
        of home. 🤍
      </p>

      <div className="us-cinema">
        <div className="us-cinema-glow" />

        <div className="us-photo-stage">
          {US_IMAGES.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={`us-photo-card ${index === active ? "is-main" : ""}`}
              onClick={() => setActive(index)}
              aria-label={`Show memory ${index + 1}`}
            >
              <img
                src={image.src}
                alt={image.caption}
                draggable={false}
              />
              <span>{String(index + 1).padStart(2, "0")}</span>
            </button>
          ))}

          <div className="us-photo-caption" key={US_IMAGES[active].src}>
            <span>♡</span>
            <p>{US_IMAGES[active].caption}</p>
          </div>
        </div>

        <div className="us-photo-dots" aria-label="Choose a memory">
          {US_IMAGES.map((image, index) => (
            <button
              key={image.src}
              type="button"
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              aria-label={`Memory ${index + 1}`}
            />
          ))}
        </div>
      </div>

      <div className="us-film-heading">
        <span>AND THEN THERE'S US, IN MOTION</span>
        <small>little clips I never want to forget</small>
      </div>

      <div className="us-film-strip">
        {US_VIDEOS.map((video, index) => (
          <article className="us-film-card" key={video.src}>
            <div className="us-film-number">{String(index + 1).padStart(2, "0")}</div>
            <video
              src={video.src}
              controls
              playsInline
              preload="metadata"
              onPlay={onVideoPlay}
              onPause={onVideoStop}
              onEnded={onVideoStop}
            />
            <p>{video.title}</p>
          </article>
        ))}
      </div>

      <button className="primary-btn compact us-next-btn" onClick={onNext}>
        <span>now, one more little surprise</span>
        <b>→</b>
      </button>
    </section>
  );
}

function MemoryWall({
  onNext,
  onVideoPlay,
  onVideoStop,
}: {
  onNext: () => void;
  onVideoPlay: () => void;
  onVideoStop: () => void;
}) {
  return (
    <section className="screen memory-screen">
      <div className="memory-kicker">A FEW THINGS I WANT TO KEEP</div>

      <h2>
        Little memories,
        <br />
        <em>just because they're ours.</em>
      </h2>

      <p className="memory-intro">
        I found a few moments I didn't want to leave outside this little
        birthday month. So I put them here for you. 🤍
      </p>

      <div className="memory-photo-wall">
        {MEMORY_IMAGES.map((item, index) => (
          <figure
            className={`memory-photo-card memory-photo-card-${index + 1}`}
            key={item.src}
          >
            <div className="memory-photo-image">
              <img src={item.src} alt={item.caption} loading={index > 1 ? "lazy" : "eager"} />
            </div>
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="memory-video-section">
        <div className="memory-video-heading">
          <span>AND TWO LITTLE MOVING MEMORIES</span>
          <small>tap play whenever you want to see them again</small>
        </div>

        <div className="memory-video-grid">
          {MEMORY_VIDEOS.map((item) => (
            <article className="memory-video-card" key={item.src}>
              <video
                src={item.src}
                controls
                playsInline
                preload="metadata"
                onPlay={onVideoPlay}
                onPause={onVideoStop}
                onEnded={onVideoStop}
              />
              <div className="memory-video-caption">
                <span>♡</span>
                <p>{item.title}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <button className="primary-btn compact memory-next-btn" onClick={onNext}>
        <span>okay… one more little game</span>
        <b>→</b>
      </button>
    </section>
  );
}

export default function BirthdayMonth() {
  const [step, setStep] = useState<
    "start" | "letter" | "memories" | "together" | "scratch" | "surprise" | "video" | "final"
  >("start");
  const [scratchRevealed, setScratchRevealed] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioEnded, setAudioEnded] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null);

  const pauseBackgroundAudio = () => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    audio.pause();
  };

  const resumeBackgroundAudio = async () => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;
    try {
      await audio.play();
    } catch {
      // Browsers can block unmuted autoplay until the first user gesture.
      // The click fallback below will start it once interaction is allowed.
    }
  };

  useEffect(() => {
    document.title = `${GIRLFRIEND_NAME}'s Birthday Month 🤍`;
  }, []);

  useEffect(() => {
    const audio = backgroundAudioRef.current;
    if (!audio) return;

    audio.loop = true;
    audio.volume = 0.42;

    // Start immediately. If the browser blocks autoplay, the first
    // interaction with the page will start it through the global click fallback.
    void audio.play().catch(() => {});

    const startAfterInteraction = () => {
      void audio.play().catch(() => {});
    };

    window.addEventListener("pointerdown", startAfterInteraction, { once: true });
    window.addEventListener("keydown", startAfterInteraction, { once: true });

    return () => {
      window.removeEventListener("pointerdown", startAfterInteraction);
      window.removeEventListener("keydown", startAfterInteraction);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (step !== "surprise" || !audioPlaying || audioEnded) return;

    const timer = window.setInterval(() => {
      setActivePhotoIndex((current) => (current + 1) % PHOTO_PLACEHOLDERS.length);
    }, 2590);

    return () => window.clearInterval(timer);
  }, [step, audioPlaying, audioEnded]);


  const unlockSurprise = () => {
    setAudioPlaying(false);
    setAudioProgress(100);
    setAudioEnded(true);
    setActivePhotoIndex(PHOTO_PLACEHOLDERS.length - 1);
    void resumeBackgroundAudio();
  };

  const startSurprise = async () => {
    const audio = audioRef.current;
    pauseBackgroundAudio();
    setStep("surprise");
    setAudioPlaying(true);
    setAudioEnded(false);
    setAudioProgress(0);
    setActivePhotoIndex(0);

    if (audio) {
      audio.currentTime = 0;
      try {
        await audio.play();

        // Verified source duration is 15.55s. Safety fallback only.
        window.setTimeout(() => {
          if (audio.duration && audio.currentTime < audio.duration - 0.05 && !audio.ended) return;
          unlockSurprise();
        }, 15900);
      } catch {
        setAudioPlaying(false);
      }
    }
  };

  const finishAudio = () => {
    audioRef.current?.pause();
    setAudioPlaying(false);
    void resumeBackgroundAudio();
    setStep("video");
  };

  return (
    <main className="birthday-page">
      <FallingHearts />
      <audio
        ref={backgroundAudioRef}
        src={BACKGROUND_AUDIO}
        preload="auto"
        loop
        aria-hidden="true"
      />

      <audio
        ref={audioRef}
        src={AUDIO}
        preload="metadata"
        onTimeUpdate={(e) => {
          const audio = e.currentTarget;
          const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
          setAudioProgress(progress);

          // Six placeholders take turns over the length of the 15.55s audio.
          if (audio.duration && audio.currentTime < audio.duration) {
            const index = Math.min(
              PHOTO_PLACEHOLDERS.length - 1,
              Math.floor((audio.currentTime / audio.duration) * PHOTO_PLACEHOLDERS.length)
            );
            setActivePhotoIndex(index);
          }
        }}
        onEnded={unlockSurprise}
      />

      <div className="grain" />
      <div className="ambient-orb orb-a" />
      <div className="ambient-orb orb-b" />

      {step !== "surprise" && (
        <button
          className={`music-toggle ${audioPlaying ? "playing" : ""}`}
          type="button"
          onClick={async () => {
            const audio = audioRef.current;
            if (!audio) return;
            if (audio.paused) {
              try {
                pauseBackgroundAudio();
                await audio.play();
                setAudioPlaying(true);
              } catch {}
            } else {
              audio.pause();
              setAudioPlaying(false);
              void resumeBackgroundAudio();
            }
          }}
          aria-label="Toggle birthday audio"
        >
          <span className="music-icon">{audioPlaying ? "❚❚" : "▶"}</span>
          <span className="music-label">{audioPlaying ? "playing" : "play my note"}</span>
        </button>
      )}

      <div className="audio-progress">
        <span style={{ width: `${audioProgress}%` }} />
      </div>

      {step === "surprise" && (
        <div className="global-surprise-cta">
          <div className={`unlock-state ${audioEnded ? "unlocked" : ""}`}>
            <span className="unlock-dot" />
            {audioEnded ? "SURPRISE UNLOCKED" : "LISTENING"}
          </div>

          <button
            className={`primary-btn global-surprise-button ${audioEnded ? "ready" : ""}`}
            type="button"
            onClick={finishAudio}
            disabled={!audioEnded}
          >
            <span>{audioEnded ? "I'm ready for the surprise" : "listen till the end…"}</span>
            <b>{audioEnded ? "♡" : "♪"}</b>
          </button>

          <small className="next-button-hint">
            {audioEnded
              ? "Your special surprise is waiting for you."
              : "Your surprise unlocks when the audio finishes."}
          </small>
        </div>
      )}

      {step === "start" && (
        <section className="screen start-screen">
          <div className="mini-label">ANOTHER LITTLE DAY · OCTOBER</div>

          <div className="hero-photo-frame">
            <div className="hero-photo-ring hero-photo-ring-back" />
            <div className="hero-photo-ring hero-photo-ring-front" />
            <div className="hero-photo">
              <img
                src="/IMG02.jpg"
                alt={`${GIRLFRIEND_NAME}`}
                draggable={false}
              />
            </div>
            <span className="hero-photo-heart hero-photo-heart-a">♥</span>
            <span className="hero-photo-heart hero-photo-heart-b">♥</span>
          </div>

          <div className="date-card">
            <span>YOUR DAY</span>
            <strong>25</strong>
            <small>OCTOBER</small>
          </div>
          <div className="tiny-ribbon">FOR THE GIRL WHO MAKES ORDINARY DAYS SPECIAL</div>
          <h1>It’s your month,<br /><em>{GIRLFRIEND_NAME}.</em></h1>
          <Typewriter text={TYPED_MESSAGE} speed={20} />
          <button className="primary-btn" onClick={() => setStep("letter")}>
            <span>open your little surprise</span><b>♡</b>
          </button>
        </section>
      )}

      {step === "letter" && (
        <section className="screen letter-screen">
          <div className="envelope-top"><span>♡</span><small>A PRIVATE LITTLE NOTE</small><span>♡</span></div>
          <div className="paper-card">
            <div className="paper-top">FOR YOU · BEFORE THE 25TH</div>
            <div className="tiny-stars">✦　♡　✦</div>
            <h2>Dear {GIRLFRIEND_NAME},</h2>
            <Typewriter
              text="I know it’s only another day in your birthday month… but somehow even an ordinary day feels a little more special because it belongs to you."
              speed={30}
            />
            <p className="delayed-note">
              So I thought I’d start celebrating you early.
              <br /><br />
              Not with anything huge. Just little moments, little surprises,
              and a few reminders that you are very, very loved. 🤍
            </p>
            <div className="signature">— {YOUR_NAME}</div>
          </div>
          <button className="text-btn" onClick={() => setStep("memories")}>
            I made you a tiny game next <span>→</span>
          </button>
        </section>
      )}

      {step === "memories" && (
        <MemoryWall
          onNext={() => setStep("together")}
          onVideoPlay={pauseBackgroundAudio}
          onVideoStop={resumeBackgroundAudio}
        />
      )}

      {step === "together" && (
        <UsTogether
          onNext={() => setStep("scratch")}
          onVideoPlay={pauseBackgroundAudio}
          onVideoStop={resumeBackgroundAudio}
        />
      )}

      {step === "scratch" && (
        <section className="screen scratch-screen">
          <div className="mini-label">A LITTLE GAME FOR YOU</div>
          <h2>Scratch this. ✨</h2>
          <p className="section-copy">
            Don’t peek. Use your finger and find the little secret underneath.
          </p>
          <ScratchCard onReveal={() => setScratchRevealed(true)} />
          <div className={`reveal-after ${scratchRevealed ? "show" : ""}`}>
            <span>♡</span>
            <strong>24 little days until your birthday.</strong>
            <small>And I’m not letting a single one feel ordinary.</small>
          </div>
          <button
            className="primary-btn compact"
            disabled={!scratchRevealed}
            onClick={() => setStep("surprise")}
          >
            <span>there's something else</span><b>→</b>
          </button>
        </section>
      )}

      {step === "surprise" && (
        <SurpriseAnimation
          playing={audioPlaying}
          onPlay={startSurprise}
          onFinish={finishAudio}
          audioProgress={audioProgress}
          audioEnded={audioEnded}
          activePhotoIndex={activePhotoIndex}
          onPhotoSelect={(index) => setActivePhotoIndex(index)}
        />
      )}

      {step === "video" && (
        <section className="screen final-video-screen">
          <div className="surprise-reveal">
            <span className="reveal-sparkle">✦</span>
            <p>AND NOW…</p>
            <h2>The real little surprise.</h2>
            <div className="reveal-line" />
            <span className="reveal-subtitle">This one is very special to me. 🤍</span>
          </div>

          <div className="special-video-frame">
            <video
              src={SPECIAL_VIDEO}
              controls
              playsInline
              preload="metadata"
              onPlay={pauseBackgroundAudio}
              onPause={resumeBackgroundAudio}
              onEnded={resumeBackgroundAudio}
            />
            <div className="video-badge">♡ made with love</div>
          </div>

          <p className="special-video-note">
            You, me, and one very special little dog. 🐾
          </p>

          <button className="primary-btn compact" onClick={() => setStep("final")}>
            <span>one last thing</span><b>♡</b>
          </button>
        </section>
      )}

      {step === "final" && (
        <section className="screen final-screen">
          <div className="final-glow" />
          <div className="final-photo-medallion">
            <div className="final-photo-halo final-photo-halo-back" />
            <div className="final-photo-halo final-photo-halo-front" />
            <div className="final-photo-circle">
              <img
                src="/LastImage.jpg"
                alt={`${GIRLFRIEND_NAME} — your birthday`}
                draggable={false}
              />
            </div>
            <div className="final-photo-date">
              <span>YOUR BIRTHDAY</span>
              <strong>25</strong>
              <small>OCTOBER</small>
            </div>
          </div>
          <p className="eyebrow">AND THIS IS ONLY THE BEGINNING</p>
          <h2>Happy birthday<br /><em>month, {GIRLFRIEND_NAME}. 🤍</em></h2>
          <Typewriter
            text="I hope every little day before the 25th reminds you how loved, wanted and special you are."
            speed={32}
          />
          <div className="countdown-card">
            <span>THE DAY WE'RE COUNTING TOWARDS</span>
            <strong>{BIRTHDAY_DATE}</strong>
            <small>October has a little more magic now.</small>
          </div>
          <p className="final-sign">Forever cheering for you,<br /><b>{YOUR_NAME}</b> ♡</p>
          <button className="restart-btn" onClick={() => setStep("start")}>read it again</button>
        </section>
      )}
    </main>
  );
}
