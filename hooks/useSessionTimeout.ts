"use client";

import { useState, useEffect, useCallback } from "react";

interface UseSessionTimeoutProps {
  timeoutMinutes?: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

export function useSessionTimeout({
  timeoutMinutes = 5,
  onTimeout,
  enabled = true
}: UseSessionTimeoutProps) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [lastActivity, setLastActivity] = useState<Date>(new Date());

  // Resetuj timeout przy aktywności użytkownika
  const resetTimeout = useCallback(() => {
    if (enabled && !isTimedOut) {
      setLastActivity(new Date());
    }
  }, [enabled, isTimedOut]);

  // Sprawdź czy sesja wygasła
  useEffect(() => {
    if (!enabled || isTimedOut) return;

    const checkTimeout = () => {
      const now = new Date();
      const timeSinceLastActivity = now.getTime() - lastActivity.getTime();
      const timeoutMs = timeoutMinutes * 60 * 1000;

      if (timeSinceLastActivity >= timeoutMs) {
        setIsTimedOut(true);
        onTimeout?.();
      }
    };

    // Sprawdź co sekundę
    const interval = setInterval(checkTimeout, 1000);

    return () => clearInterval(interval);
  }, [enabled, isTimedOut, lastActivity, timeoutMinutes, onTimeout]);

  // Nasłuchuj aktywności użytkownika
  useEffect(() => {
    if (!enabled || isTimedOut) return;

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleActivity = () => {
      resetTimeout();
    };

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled, isTimedOut, resetTimeout]);

  // Funkcja do ręcznego resetowania sesji
  const resetSession = useCallback(() => {
    setIsTimedOut(false);
    setLastActivity(new Date());
  }, []);

  // Funkcja do wymuszenia timeout
  const forceTimeout = useCallback(() => {
    setIsTimedOut(true);
    onTimeout?.();
  }, [onTimeout]);

  return {
    isTimedOut,
    resetSession,
    forceTimeout,
    lastActivity
  };
}
