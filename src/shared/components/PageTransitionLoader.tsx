import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo/mainLogo.png";

const MAX_LOADING_TIME = 10_000;

export default function PageTransitionLoader() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);

  const previousPathRef = useRef(location.pathname);
  const navigationStartedRef = useRef(false);
  const recoveryTimerRef = useRef<number | null>(null);

  const clearRecoveryTimer = () => {
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  };

  const finishNavigation = () => {
    clearRecoveryTimer();
    navigationStartedRef.current = false;
    setShowRecovery(false);
    setIsLoading(false);
  };

  // Route completion: once the pathname changes, the destination route has
  // completed its React Router transition and the global loader can close.
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      finishNavigation();
    }
  }, [location.pathname]);

  // Global navigation intent. This avoids adding transition logic to every page.
  useEffect(() => {
    const startNavigation = () => {
      if (navigationStartedRef.current) return;

      navigationStartedRef.current = true;
      setShowRecovery(false);
      setIsLoading(true);
      clearRecoveryTimer();

      recoveryTimerRef.current = window.setTimeout(() => {
        if (navigationStartedRef.current) {
          setShowRecovery(true);
        }
      }, MAX_LOADING_TIME);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      try {
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) return;
        startNavigation();
      } catch {
        // Ignore non-standard URLs.
      }
    };

    const handlePopState = () => {
      if (window.location.pathname !== previousPathRef.current) {
        startNavigation();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
      window.removeEventListener("popstate", handlePopState);
      clearRecoveryTimer();
    };
  }, []);

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="page-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black"
          aria-live="polite"
          aria-busy="true"
        >
          <AnimatePresence mode="wait">
            {!showRecovery ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="flex flex-col items-center"
              >
                <div className="relative flex h-28 w-28 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border border-[#D4AF37]/20" />
                  <motion.div
                    className="absolute inset-0 rounded-full border border-transparent border-t-[#D4AF37] border-r-[#F7E3A3]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.div
                    className="absolute inset-3 rounded-full border border-[#D4AF37]/10"
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <img src={logo} alt="T&M Jewels" className="relative z-10 w-16 object-contain" />
                </div>

                <p className="mt-6 text-xs font-medium tracking-[0.32em] text-[#D4AF37]">T&M JEWELS</p>
                <motion.p
                  className="mt-2 text-sm text-neutral-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                >
                  Curating your sparkle...
                </motion.p>
                <div className="mt-5 h-px w-28 overflow-hidden bg-white/10">
                  <motion.div
                    className="h-full w-1/2 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
                    animate={{ x: ["-100%", "300%"] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="recovery"
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="mx-5 w-full max-w-md rounded-2xl border border-[#D4AF37]/30 bg-[#111111] p-7 text-center shadow-2xl"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#D4AF37]/40 text-[#D4AF37]">
                  <span className="text-xl">✦</span>
                </div>
                <p className="mt-5 text-xs font-medium tracking-[0.28em] text-[#D4AF37]">T&M JEWELS</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Taking a little longer than expected</h2>
                <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-neutral-400">
                  Something may have slowed down while loading this page. You can refresh and try again.
                </p>
                <button
                  type="button"
                  onClick={refreshPage}
                  className="mt-6 rounded-full bg-[#D4AF37] px-6 py-2.5 text-sm font-medium text-black transition hover:bg-[#E4C35A]"
                >
                  Refresh Page
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
