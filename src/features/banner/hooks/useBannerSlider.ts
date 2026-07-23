import { useEffect, useState } from "react";

export function useBannerSlider(total: number) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!total) return;

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 5000);

    return () => clearInterval(interval);
  }, [total]);

  const next = () =>
    setCurrent((prev) => (prev + 1) % total);

  const previous = () =>
    setCurrent((prev) => (prev - 1 + total) % total);

  return {
    current,
    next,
    previous,
    setCurrent,
  };
}