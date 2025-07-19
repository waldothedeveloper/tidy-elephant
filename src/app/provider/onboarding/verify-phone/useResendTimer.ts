import { useCallback, useEffect, useRef, useState } from "react";

interface UseResendTimerOptions {
  initialDelay?: number; // Initial delay in seconds
  maxDelay?: number; // Maximum delay in seconds
  maxAttempts?: number; // Maximum number of resend attempts
}

interface UseResendTimerReturn {
  timeLeft: number;
  canResend: boolean;
  resendCount?: number;
  maxAttemptsReached: boolean; // Add this to know when max attempts reached
  startTimer: () => void;
  resetTimer: () => void;
  formatTime: (seconds: number) => string;
}

export function useResendTimer({
  initialDelay = 60, // Start with 60 seconds (1 minute)
  maxDelay = 300,
  maxAttempts = 4,
}: UseResendTimerOptions = {}): UseResendTimerReturn {
  const [timeLeft, setTimeLeft] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [canResend, setCanResend] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const resendCountRef = useRef(0);

  // Check if max attempts reached
  const maxAttemptsReached = resendCount >= maxAttempts;

  // Consolidate canResend logic to account for both timer and max attempts
  const isResendAllowed = canResend && !maxAttemptsReached;

  // Calculate delay based on attempt count with linear increment
  const calculateDelay = useCallback(
    (attempt: number): number => {
      const delay = initialDelay + attempt * 30;
      return Math.min(delay, maxDelay);
    },
    [initialDelay, maxDelay]
  );

  // Format time as MM:SS
  const formatTime = useCallback((seconds: number): string => {
    // Round to ensure we get whole seconds
    const wholeSeconds = Math.floor(seconds);
    const mins = Math.floor(wholeSeconds / 60);
    const secs = wholeSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // Start the countdown timer
  const startTimer = useCallback(() => {
    if (resendCount >= maxAttempts) {
      setCanResend(false);
      return;
    }

    const delay = calculateDelay(resendCount);
    setTimeLeft(delay);
    setCanResend(false);
    setResendCount((prev) => {
      const newCount = prev + 1;
      resendCountRef.current = newCount; // Keep ref in sync
      return newCount;
    });

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Start new interval
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Use ref to get current resendCount instead of stale closure
          const currentResendCount = resendCountRef.current;
          if (currentResendCount < maxAttempts) {
            setCanResend(true);
          }
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [resendCount, maxAttempts, calculateDelay]);

  // Reset timer and attempt count
  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeLeft(0);
    setResendCount(0);
    resendCountRef.current = 0; // Keep ref in sync
    setCanResend(true);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    timeLeft,
    canResend: isResendAllowed,
    maxAttemptsReached,
    startTimer,
    resetTimer,
    formatTime,
  };
}
