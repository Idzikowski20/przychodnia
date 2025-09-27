"use client";

import { useState, useEffect } from "react";

interface UseLoginSecurityProps {
  onSecurityRequired: () => void;
  enabled?: boolean;
}

export function useLoginSecurity({
  onSecurityRequired,
  enabled = true
}: UseLoginSecurityProps) {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setIsChecking(false);
      return;
    }

    const checkLastActivity = () => {
      try {
        // Sprawdź ostatnią aktywność z localStorage
        const lastActivity = localStorage.getItem('admin_last_activity');
        const securityRequired = localStorage.getItem('admin_security_required');
        
        if (lastActivity) {
          const lastActivityTime = new Date(lastActivity);
          const now = new Date();
          const timeDiff = now.getTime() - lastActivityTime.getTime();
          
          // Jeśli minęło więcej niż 30 minut od ostatniej aktywności
          const thirtyMinutes = 30 * 60 * 1000;
          
          if (timeDiff > thirtyMinutes || securityRequired === 'true') {
            onSecurityRequired();
          }
        } else {
          // Pierwsze wejście - wymagaj kodu bezpieczeństwa
          onSecurityRequired();
        }
      } catch (error) {
        console.error('Błąd sprawdzania ostatniej aktywności:', error);
        // W przypadku błędu, wymagaj kodu bezpieczeństwa
        onSecurityRequired();
      } finally {
        setIsChecking(false);
      }
    };

    // Sprawdź po krótkim opóźnieniu, żeby UI się załadował
    const timeout = setTimeout(checkLastActivity, 500);
    
    return () => clearTimeout(timeout);
  }, [enabled, onSecurityRequired]);

  const updateLastActivity = () => {
    try {
      localStorage.setItem('admin_last_activity', new Date().toISOString());
      localStorage.setItem('admin_security_required', 'false');
    } catch (error) {
      console.error('Błąd zapisywania ostatniej aktywności:', error);
    }
  };

  const requireSecurity = () => {
    try {
      localStorage.setItem('admin_security_required', 'true');
    } catch (error) {
      console.error('Błąd ustawiania wymagania bezpieczeństwa:', error);
    }
  };

  return {
    isChecking,
    updateLastActivity,
    requireSecurity
  };
}
