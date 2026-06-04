import { useState, useCallback, useEffect } from "react";

export function useCountdown(initialSeconds: number = 120) {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);

  // Derived state — no setState needed
  const isCompleted = timeLeft <= 0;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const resetCountdown = useCallback(
    (seconds: number = initialSeconds) => {
      setTimeLeft(seconds);
    },
    [initialSeconds],
  );

  const formatTime = useCallback(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  return { timeLeft, isCompleted, formatTime, resetCountdown };
}
