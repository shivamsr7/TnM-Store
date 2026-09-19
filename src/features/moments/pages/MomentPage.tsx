import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { momentsService } from "@/features/moments/services/moments.service";
import MainLogo from "@/assets/logo/mainLogo.png";
import "./thankYouMoment.clickStory.css";

type Scene = "intro" | "letter" | "product" | "love" | "happiness" | "final";

type LoveCard = {
  icon: string;
  title: string;
  description: string;
};

type MomentProduct = {
  id?: string;
  name: string;
  image_url: string;
};

type ExperienceConfig = {
  intro: {
    kicker: string;
    title: string;
    subtitle: string;
  };
  letter: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    highlight: string;
    closing: string;
  };
  product: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
  };
  love: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    cards: LoveCard[];
  };
  happiness: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    messages: string[];
  };
  final: {
    kicker: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
  };
  instagramUrl: string;
  exploreUrl: string;
};

const DEFAULT_EXPERIENCE: ExperienceConfig = {
  intro: {
    kicker: "PSST…",
    title: "You made it here 👀",
    subtitle: "And we have a tiny surprise waiting just for you.",
  },
  letter: {
    kicker: "A LITTLE NOTE FROM T&M",
    titleLine1: "Thank",
    titleLine2: "You",
    highlight:
      "We hope it makes you feel a little more beautiful, a little more confident, and gives you a reason to smile every time you wear it. ♡",
    closing:
      "Thank you for supporting our small business and letting T&M be a tiny part of your special moments.",
  },
  product: {
    kicker: "AND THIS LITTLE SPARKLE…",
    titleLine1: "It found",
    titleLine2: "you.",
    description:
      "Somewhere between our little T&M world and your doorstep, this piece became yours.",
  },
  love: {
    kicker: "A FEW LITTLE THINGS",
    titleLine1: "Packed with",
    titleLine2: "love.",
    cards: [
      {
        icon: "♡",
        title: "Made with love",
        description: "Every order matters to us.",
      },
      {
        icon: "✦",
        title: "Made to sparkle",
        description: "A little extra shine for you.",
      },
      {
        icon: "∞",
        title: "Made for memories",
        description: "Wear it. Love it. Remember it.",
      },
    ],
  },
  happiness: {
    kicker: "A LITTLE EXTRA FOR YOU",
    titleLine1: "Tap for a little",
    titleLine2: "happiness ✨",
    description:
      "Because a thank-you should come with a tiny surprise.",
    messages: [
      "You have excellent taste. ♡",
      "Someone at T&M smiled while packing your order. ✨",
      "Your jewellery has officially found its new home. 💌",
      "Okay… now go look in the mirror. You deserve the sparkle. ✨",
      "A little T&M magic is now yours. ♡",
    ],
  },
  final: {
    kicker: "AND ONE LAST THING…",
    titleLine1: "Keep shining,",
    titleLine2: "beautiful. ♡",
    subtitle:
      "Here’s to more sparkle, more smiles, and many more beautiful moments together.",
  },
  instagramUrl: "https://www.instagram.com/tnm_jewels/",
  exploreUrl: "/",
};

const scenes: Scene[] = [
  "intro",
  "letter",
  "product",
  "love",
  "happiness",
  "final",
];

export default function MomentPage() {
  const { token = "" } = useParams<{ token: string }>();

  const [moment, setMoment] = useState<any>(null);
  const [scene, setScene] = useState<Scene>("intro");
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [happinessMessage, setHappinessMessage] = useState("");
  const [showHappiness, setShowHappiness] = useState(false);
  const [burstKey, setBurstKey] = useState(0);
  const [envelopeOpening, setEnvelopeOpening] = useState(false);

  useEffect(() => {
    let alive = true;

    if (!token) {
      setLoading(false);
      setInvalid(true);
      return;
    }

    const loadMoment = async () => {
      try {
        const data = await momentsService.getMomentByToken(token);

        if (!alive) return;

        setMoment(data);
        setInvalid(!data);
      } catch {
        if (alive) setInvalid(true);
      } finally {
        if (alive) setLoading(false);
      }
    };

    loadMoment();

    void momentsService.trackMomentEvent(token, "page_view", {
      entry_scene: "tnm_thank_you_click_story",
    });

    return () => {
      alive = false;
    };
  }, [token]);

  const recipientName = moment?.recipient_name?.trim() || "";

  const rawPersonalMessage = moment?.personal_message?.trim() || "";

  const experience = useMemo<ExperienceConfig>(() => {
    const saved = moment?.metadata?.experience;

    if (!saved || typeof saved !== "object") {
      return DEFAULT_EXPERIENCE;
    }

    const value = saved as Partial<ExperienceConfig>;

    return {
      ...DEFAULT_EXPERIENCE,
      ...value,
      intro: {
        ...DEFAULT_EXPERIENCE.intro,
        ...(value.intro || {}),
      },
      letter: {
        ...DEFAULT_EXPERIENCE.letter,
        ...(value.letter || {}),
      },
      product: {
        ...DEFAULT_EXPERIENCE.product,
        ...(value.product || {}),
      },
      love: {
        ...DEFAULT_EXPERIENCE.love,
        ...(value.love || {}),
        cards:
          Array.isArray(value.love?.cards) && value.love.cards.length
            ? value.love.cards.map((card: any) => ({
                icon: typeof card?.icon === "string" ? card.icon : "♡",
                title:
                  typeof card?.title === "string"
                    ? card.title
                    : "Made with love",
                description:
                  typeof card?.description === "string"
                    ? card.description
                    : typeof card?.text === "string"
                      ? card.text
                      : "",
              }))
            : DEFAULT_EXPERIENCE.love.cards,
      },
      happiness: {
        ...DEFAULT_EXPERIENCE.happiness,
        ...(value.happiness || {}),
        messages:
          Array.isArray(value.happiness?.messages) &&
          value.happiness.messages.length
            ? value.happiness.messages
            : DEFAULT_EXPERIENCE.happiness.messages,
      },
      final: {
        ...DEFAULT_EXPERIENCE.final,
        ...(value.final || {}),
      },
      instagramUrl:
        typeof value.instagramUrl === "string" && value.instagramUrl.trim()
          ? value.instagramUrl
          : DEFAULT_EXPERIENCE.instagramUrl,
      exploreUrl:
        typeof value.exploreUrl === "string" && value.exploreUrl.trim()
          ? value.exploreUrl
          : DEFAULT_EXPERIENCE.exploreUrl,
    };
  }, [moment]);

  const message = (
    rawPersonalMessage
      .replace(/^[^.!?]*chapter together\.[^.!?]*remembering\.[^\n]*\s*/i, "")
      .trim() ||
    "Thank you for bringing a little piece of T&M into your world. Every order we pack carries a little piece of our dream, wrapped with care and sent your way."
  );

  const products = useMemo<MomentProduct[]>(() => {
    const metadataProducts = moment?.metadata?.products;

    if (Array.isArray(metadataProducts) && metadataProducts.length) {
      return metadataProducts
        .map((product: any, index: number) => ({
          id:
            typeof product?.id === "string"
              ? product.id
              : `moment-product-${index}`,
          name:
            typeof product?.name === "string" && product.name.trim()
              ? product.name.trim()
              : "Your T&M piece",
          image_url:
            typeof product?.image_url === "string"
              ? product.image_url
              : typeof product?.imageUrl === "string"
                ? product.imageUrl
                : "",
        }))
        .filter((product) => product.image_url || product.name);
    }

    const legacyImage =
      moment?.metadata?.product_image_url ??
      moment?.metadata?.productImageUrl ??
      "";

    const legacyName =
      moment?.metadata?.product_name ??
      moment?.metadata?.productName ??
      "Your T&M piece";

    if (legacyImage || legacyName) {
      return [
        {
          id: "legacy-product",
          name: legacyName,
          image_url: legacyImage,
        },
      ];
    }

    return [];
  }, [moment]);

  const productCount = products.length;

  const sceneIndex = scenes.indexOf(scene);
  const sceneNumber = String(sceneIndex + 1).padStart(2, "0");
  const isFirst = sceneIndex === 0;
  const isLast = sceneIndex === scenes.length - 1;

  const goToScene = (nextScene: Scene) => {
    if (transitioning || nextScene === scene) return;

    setTransitioning(true);
    setShowHappiness(false);

    window.setTimeout(() => {
      setScene(nextScene);

      window.setTimeout(() => {
        setTransitioning(false);
      }, 70);
    }, 280);
  };

  const openEnvelope = () => {
    if (envelopeOpening || transitioning) return;

    setEnvelopeOpening(true);

    window.setTimeout(() => {
      nextScene();
      window.setTimeout(() => {
        setEnvelopeOpening(false);
      }, 380);
    }, 760);
  };

  const nextScene = () => {
    if (isLast) return;

    const next = scenes[sceneIndex + 1];

    if (next === "letter" && token) {
      void momentsService.trackMomentEvent(token, "thank_you_revealed", {
        scene: "tnm_thank_you_click_story",
      });
    }

    goToScene(next);
  };

  const previousScene = () => {
    if (isFirst) return;
    goToScene(scenes[sceneIndex - 1]);
  };

  const showLittleHappiness = () => {
    const messages = experience.happiness.messages.length
      ? experience.happiness.messages
      : DEFAULT_EXPERIENCE.happiness.messages;

    const nextMessage =
      messages[Math.floor(Math.random() * messages.length)];

    setHappinessMessage(nextMessage);
    setShowHappiness(true);
    setBurstKey((value) => value + 1);

    if (token) {
      void momentsService.trackMomentEvent(token, "little_happiness", {
        scene: "tnm_thank_you_click_story",
      });
    }
  };

  const handleExplore = () => {
    window.location.assign(experience.exploreUrl);
  };

  if (loading) {
    return (
      <main className="tnm-click-story loading-state">
        <div className="loading-logo">
          T<span>&</span>M
        </div>
        <p>From T&M, with love…</p>
      </main>
    );
  }

  if (invalid) {
    return (
      <main className="tnm-click-story invalid-state">
        <div className="invalid-brand">
          T<span>&</span>M
          <small>JEWELS</small>
        </div>

        <div className="invalid-card">
          <span>A LITTLE NOTE FROM T&M</span>
          <h1>
            This little thank-you
            <br />
            couldn’t be opened.
          </h1>
          <p>
            The private moment may have expired or the link may be incorrect.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="tnm-click-story">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <div className="floating-decor" aria-hidden="true">
        <span>✦</span>
        <span>♡</span>
        <span>✧</span>
        <span>✦</span>
        <span>♡</span>
      </div>

      <header className="click-story-header">
        <div className="click-brand">
          <img src={MainLogo} alt="T&M Jewels" />
        </div>

        <div className="scene-counter">
          <span>{sceneNumber}</span>
          <i />
          <span>06</span>
        </div>
      </header>

      <div className="story-viewport">
        <div
          className={`scene-transition ${transitioning ? "is-transitioning" : ""}`}
        />

        {/* PAGE 01 */}
        {scene === "intro" && (
          <section className="click-scene intro-scene scene-enter">
            <div className="scene-content intro-content">
              <span className="scene-kicker">{experience.intro.kicker}</span>

              <h1>
                {experience.intro.title}
              </h1>

              <p>
                {experience.intro.subtitle}
              </p>

              <div className="floating-hearts" aria-hidden="true">
                <span className="floating-heart heart-1">♥</span>
                <span className="floating-heart heart-2">♥</span>
                <span className="floating-heart heart-3">♥</span>
                <span className="floating-heart heart-4">♥</span>
                <span className="floating-heart heart-5">♥</span>
                <span className="floating-heart heart-6">♥</span>
                <span className="floating-heart heart-7">♥</span>
              </div>

              <div className="envelope-stage">
                <div
                  className={`envelope ${envelopeOpening ? "is-opening" : ""}`}
                  aria-label="T&M thank you envelope"
                >
                  <span className="envelope-shadow" />

                  <span className="envelope-body">
                    <span className="envelope-pattern" />

                    <span className="envelope-decoration">
                      ✦ &nbsp; ♡ &nbsp; ✦
                    </span>
                  </span>

                  <span className="envelope-flap" />

                  <button
                    type="button"
                    className="envelope-seal"
                    onClick={openEnvelope}
                    aria-label="Open your T&M thank you surprise"
                    disabled={envelopeOpening}
                  >
                    <img src={MainLogo} alt="T&M Jewels" />
                    <span className="seal-glow" />
                  </button>
                </div>
              </div>

              <button type="button" className="primary-next" onClick={openEnvelope}>
                <span>Open your little surprise</span>
                <b>→</b>
              </button>
            </div>
          </section>
        )}

        {/* PAGE 02 */}
        {scene === "letter" && (
          <section className="click-scene letter-scene scene-enter">
            <div className="scene-content letter-layout">
              <div className="letter-card">
                <span className="scene-kicker">{experience.letter.kicker}</span>

                <h2>
                  {experience.letter.titleLine1}
                  <br />
                  <span>{experience.letter.titleLine2}</span>
                  <i>♡</i>
                </h2>

                <div className="letter-divider">
                  <i />
                  <span>✦</span>
                  <i />
                </div>

                {recipientName && (
                  <p className="recipient">
                    Especially for <strong>{recipientName}</strong>
                  </p>
                )}

                <p className="letter-lead">
                  Thank you for choosing <strong>T&M Jewels.</strong>
                </p>

                <p className="letter-copy">{message}</p>

                <p className="letter-copy">
                  Your order may look like a little package, but to us,
                  it carries a little piece of our dream — carefully packed,
                  lovingly sent, and now on its way to you.
                </p>

                <p className="letter-copy letter-highlight">
                  {experience.letter.highlight}
                </p>

                <p className="letter-copy">
                  {experience.letter.closing}
                </p>

                <div className="signature">
                  <span>with lots of love,</span>
                  <strong>T&M Jewels</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="primary-next bottom-next"
              onClick={nextScene}
            >
              <span>See your sparkle</span>
              <b>→</b>
            </button>
          </section>
        )}

        {/* PAGE 03 */}
        {scene === "product" && (
          <section className="click-scene product-scene scene-enter">
            <div className="scene-content product-memory-layout">
              <div className="product-memory-copy">
                <span className="scene-kicker">{experience.product.kicker}</span>

                <h2>
                  {experience.product.titleLine1}
                  <br />
                  <span>{experience.product.titleLine2}</span>
                </h2>

                <p>{experience.product.description}</p>

                <div className="product-memory-count">
                  <span>{productCount || 0}</span>
                  <small>
                    {productCount === 1 ? "PIECE" : "PIECES"} FROM YOUR ORDER
                  </small>
                </div>
              </div>

              <div
                className={`product-collage product-collage-count-${Math.min(
                  productCount || 1,
                  5
                )}`}
                aria-label="Products from your T&M order"
              >
                <div className="product-collage-glow" />

                {products.length ? (
                  products.slice(0, 5).map((product, index) => (
                    <article
                      className={`product-memory-card product-memory-card-${index + 1}`}
                      key={product.id ?? `${product.name}-${index}`}
                    >
                      <div className="product-memory-image-wrap">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-memory-image"
                          />
                        ) : (
                          <div className="product-memory-placeholder">
                            <span>✦</span>
                          </div>
                        )}
                      </div>

                      <div className="product-memory-card-label">
                        <small>T&M JEWELS</small>
                        <strong>{product.name}</strong>
                      </div>
                    </article>
                  ))
                ) : (
                  <article className="product-memory-card product-memory-card-1 product-memory-card-empty">
                    <div className="product-memory-image-wrap">
                      <div className="product-memory-placeholder">
                        <span>✦</span>
                      </div>
                    </div>
                    <div className="product-memory-card-label">
                      <small>YOUR T&M ORDER</small>
                      <strong>A little sparkle, just for you</strong>
                    </div>
                  </article>
                )}
{productCount > 5 && (
                  <div className="product-collage-more">
                    +{productCount - 5} more
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="primary-next bottom-next"
              onClick={nextScene}
            >
              <span>What your order means</span>
              <b>→</b>
            </button>
          </section>
        )}

        {/* PAGE 04 */}
        {scene === "love" && (
          <section className="click-scene love-scene scene-enter">
            <div className="scene-content love-content">
              <span className="scene-kicker">{experience.love.kicker}</span>

              <h2>
                {experience.love.titleLine1}
                <br />
                <span>{experience.love.titleLine2}</span>
              </h2>

              <div className="love-grid">
                {experience.love.cards.slice(0, 3).map((card, index) => (
                  <article key={`${card.title}-${index}`}>
                    <div>{card.icon}</div>
                    <strong>{card.title}</strong>
                    <p>{card.description}</p>
                  </article>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="primary-next bottom-next"
              onClick={nextScene}
            >
              <span>We saved one more thing</span>
              <b>→</b>
            </button>
          </section>
        )}

        {/* PAGE 05 */}
        {scene === "happiness" && (
          <section className="click-scene happiness-scene scene-enter">
            <div className="scene-content happiness-content">
              <div className="happiness-card">
                <span className="big-star">✦</span>
                <span className="scene-kicker">{experience.happiness.kicker}</span>

                <h2>
                  {experience.happiness.titleLine1}
                  <br />
                  <span>{experience.happiness.titleLine2}</span>
                </h2>

                <p>{experience.happiness.description}</p>

                <button
                  type="button"
                  className="happiness-button"
                  onClick={showLittleHappiness}
                >
                  <span>✨</span>
                  Make me smile
                  <span>♡</span>
                </button>

                <div
                  className={`happiness-message ${
                    showHappiness ? "show" : ""
                  }`}
                  aria-live="polite"
                >
                  {happinessMessage}
                </div>

                {showHappiness && (
                  <div className="happiness-burst" key={burstKey}>
                    {["♡", "✦", "♡", "✧", "♡", "✦", "♡"].map(
                      (symbol, index) => (
                        <span
                          key={`${burstKey}-${index}`}
                          style={{
                            left: `${16 + index * 11}%`,
                            animationDelay: `${index * 75}ms`,
                          }}
                        >
                          {symbol}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              className="primary-next bottom-next"
              onClick={nextScene}
            >
              <span>One last little note</span>
              <b>→</b>
            </button>
          </section>
        )}

        {/* PAGE 06 */}
        {scene === "final" && (
          <section className="click-scene final-scene scene-enter">
            <div className="scene-content final-content">
              <span className="final-star">✦</span>
              <span className="scene-kicker">{experience.final.kicker}</span>

              <h2>
                {experience.final.titleLine1}
                <br />
                <span>{experience.final.titleLine2}</span>
              </h2>

              <p>{experience.final.subtitle}</p>

              <button
                type="button"
                className="explore-button"
                onClick={handleExplore}
              >
                EXPLORE T&M
                <span>→</span>
              </button>

              <a
                className="instagram-link"
                href={experience.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span className="instagram-icon">◎</span>
                <span>
                  <small>COME SAY HI</small>
                  Follow us on Instagram
                </span>
                <b>↗</b>
              </a>

              <div className="final-brand">
                <img src={MainLogo} alt="T&M Jewels" />
              </div>

              <div className="final-hearts">
                ♡ &nbsp; ✦ &nbsp; ♡ &nbsp; ✦ &nbsp; ♡
              </div>

              <small>Made with love by T&M Jewels ♡</small>
            </div>
          </section>
        )}
      </div>

      {!isFirst && (
        <button
          type="button"
          className="back-button"
          onClick={previousScene}
          aria-label="Previous page"
        >
          ←
        </button>
      )}

      {!isLast && (
        <button
          type="button"
          className="edge-next"
          onClick={nextScene}
          aria-label="Next page"
        >
          <span />
        </button>
      )}

      <div className="story-footer">
        <span>T&M JEWELS</span>
        <span>{isLast ? "WITH LOVE ♡" : "TAP TO CONTINUE"}</span>
      </div>
    </main>
  );
}
