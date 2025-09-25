"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface UseActivityTrackerProps {
  timeoutMinutes?: number;
  onTimeout?: () => void;
  enabled?: boolean;
}

export const useActivityTracker = ({ 
  timeoutMinutes = 5, 
  onTimeout,
  enabled = true 
}: UseActivityTrackerProps) => {
  const [timeRemaining, setTimeRemaining] = useState(timeoutMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Przechowuj najnowszą referencję callbacku, aby nie restartować efektu na każdy render
  const onTimeoutRef = useRef<(() => void) | undefined>(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(() => {
    if (!enabled) return;
    
    setTimeRemaining(timeoutMinutes * 60);
    
    // Wyczyść poprzedni timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Ustaw nowy timeout na określoną liczbę minut
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current?.();
    }, timeoutMinutes * 60 * 1000);
  }, [timeoutMinutes, enabled]);

  // Uruchom timer przy inicjalizacji
  useEffect(() => {
    if (!enabled) return;

    // Ustaw początkowy czas
    setTimeRemaining(timeoutMinutes * 60);
    
    // Ustaw timeout na określoną liczbę minut
    timeoutRef.current = setTimeout(() => {
      onTimeoutRef.current?.();
    }, timeoutMinutes * 60 * 1000);

    // Timer odliczający co sekundę
    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      // Wyczyść timery
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, timeoutMinutes]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return {
    isActive: timeRemaining > 0,
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    resetTimer
  };
};
