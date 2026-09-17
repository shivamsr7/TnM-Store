import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

export type TinyDoorAnimationHandle = {
  play: () => void;
};

type Props = {
  className?: string;
  onOpen?: () => void;
};

const TinyDoorAnimation = forwardRef<TinyDoorAnimationHandle, Props>(
  ({ className = "", onOpen }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationRef = useRef<any>(null);
    const onOpenRef = useRef(onOpen);

    useEffect(() => {
      onOpenRef.current = onOpen;
    }, [onOpen]);

    useEffect(() => {
      let cancelled = false;

      const mount = async () => {
        try {
          const lottie = await import("lottie-web");

          if (cancelled || !containerRef.current) return;

          const animation = lottie.default.loadAnimation({
            container: containerRef.current,
            renderer: "svg",
            loop: false,
            autoplay: false,
            path: "/moments/lottie/tiny-door-interactive.json",
            rendererSettings: {
              progressiveLoad: true,
              preserveAspectRatio: "xMidYMid meet",
            },
          });

          animationRef.current = animation;

          animation.addEventListener("complete", () => {
            onOpenRef.current?.();
          });
        } catch (error) {
          console.error("TinyDoorAnimation failed to load:", error);
        }
      };

      void mount();

      return () => {
        cancelled = true;
        animationRef.current?.destroy?.();
        animationRef.current = null;
      };
    }, []);

    useImperativeHandle(ref, () => ({
      play() {
        const animation = animationRef.current;
        if (!animation) return;

        animation.stop();
        animation.goToAndPlay(0, true);
      },
    }));

    return (
      <div
        ref={containerRef}
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 ${className}`}
      />
    );
  }
);

TinyDoorAnimation.displayName = "TinyDoorAnimation";

export default TinyDoorAnimation;
