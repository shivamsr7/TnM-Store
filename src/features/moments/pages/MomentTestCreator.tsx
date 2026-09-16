import { useState } from "react";
import { momentsService } from "@/features/moments/services/moments.service";

export default function MomentTestCreator() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function createTestMoment() {
    setLoading(true);
    setError("");
    setUrl("");

    try {
      const result = await momentsService.createMoment({
        occasion: "anniversary",
        templateKey: "anniversary_love_letter",
        recipientName: "My Love",
        senderName: "With Love ❤️",
        personalMessage:
          "Another year, another beautiful chapter together. Every moment with you is something worth remembering. ❤️",
        metadata: {
          test: true,
        },
      });

      setUrl(result.url);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to create Moment."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0d080b] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-xl">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-white/35">
            T&M Jewels
          </p>

          <h1 className="mt-4 font-serif text-3xl">
            Moment Test Creator
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/45">
            Create a temporary Anniversary Moment to test
            the complete private experience.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void createTestMoment()}
          disabled={loading}
          className="
            mt-8
            w-full
            rounded-full
            bg-white
            px-6
            py-4
            text-sm
            font-medium
            text-black
            transition
            hover:bg-white/90
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading
            ? "Creating Moment..."
            : "Create Test Moment ✨"}
        </button>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {url && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.25em] text-white/35">
              Your private Moment URL
            </p>

            <p className="mt-3 break-all text-sm leading-6 text-white/70">
              {url}
            </p>

            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="
                mt-5
                block
                rounded-full
                border
                border-white/15
                bg-white/[0.06]
                px-5
                py-3
                text-center
                text-sm
                text-white
                transition
                hover:bg-white/[0.1]
              "
            >
              Open Moment →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}