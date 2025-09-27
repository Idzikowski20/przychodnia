"use client";

import React, { useState, useEffect } from "react";
import { Shield, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface SecurityLoginModalProps {
  open: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  timeoutMinutes?: number;
}

export function SecurityLoginModal({
  open,
  onSuccess,
  onClose,
  timeoutMinutes = 5
}: SecurityLoginModalProps) {
  const [securityCode, setSecurityCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<Date | null>(null);

  // Kod bezpieczeństwa (w prawdziwej aplikacji powinien być w zmiennych środowiskowych)
  const VALID_SECURITY_CODE = "123456";
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_MINUTES = 15;

  // Resetuj stan przy otwarciu modala
  useEffect(() => {
    if (open) {
      setSecurityCode("");
      setError("");
      setAttempts(0);
      setIsLocked(false);
      setLockoutTime(null);
    }
  }, [open]);

  // Sprawdź czy użytkownik jest zablokowany
  useEffect(() => {
    if (lockoutTime) {
      const now = new Date();
      const lockoutEnd = new Date(lockoutTime.getTime() + LOCKOUT_MINUTES * 60 * 1000);
      
      if (now < lockoutEnd) {
        setIsLocked(true);
        const remainingTime = Math.ceil((lockoutEnd.getTime() - now.getTime()) / 1000);
        
        const timer = setTimeout(() => {
          setIsLocked(false);
          setLockoutTime(null);
        }, remainingTime * 1000);

        return () => clearTimeout(timer);
      } else {
        setIsLocked(false);
        setLockoutTime(null);
      }
    }
  }, [lockoutTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError("Konto jest tymczasowo zablokowane. Spróbuj ponownie później.");
      return;
    }

    if (securityCode.length !== 6) {
      setError("Kod bezpieczeństwa musi mieć 6 cyfr.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Symulacja sprawdzania kodu (w prawdziwej aplikacji byłoby to API call)
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (securityCode === VALID_SECURITY_CODE) {
      // Sukces - resetuj licznik prób
      setAttempts(0);
      setIsLoading(false);
      onSuccess();
    } else {
      // Błąd - zwiększ licznik prób
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setIsLoading(false);

      if (newAttempts >= MAX_ATTEMPTS) {
        setLockoutTime(new Date());
        setError(`Zbyt wiele nieudanych prób. Konto zostało zablokowane na ${LOCKOUT_MINUTES} minut.`);
      } else {
        setError(`Nieprawidłowy kod bezpieczeństwa. Pozostało prób: ${MAX_ATTEMPTS - newAttempts}`);
      }
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Tylko cyfry
    if (value.length <= 6) {
      setSecurityCode(value);
      setError("");
    }
  };

  const getRemainingLockoutTime = () => {
    if (!lockoutTime) return 0;
    
    const now = new Date();
    const lockoutEnd = new Date(lockoutTime.getTime() + LOCKOUT_MINUTES * 60 * 1000);
    const remaining = Math.ceil((lockoutEnd.getTime() - now.getTime()) / 1000);
    
    return Math.max(0, remaining);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const remainingTime = getRemainingLockoutTime();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Shield className="w-6 h-6 text-blue-600" />
            Wymagany kod bezpieczeństwa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Opis */}
          <div className="text-center space-y-2">
            <p className="text-gray-600">
              Zostałeś nieaktywny przez {timeoutMinutes} minut. Wprowadź kod bezpieczeństwa, aby kontynuować pracę w panelu administracyjnym.
            </p>
          </div>

          {/* Formularz */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="securityCode" className="text-sm font-medium">
                Kod bezpieczeństwa
              </Label>
              <div className="relative">
                <Input
                  id="securityCode"
                  type={showCode ? "text" : "password"}
                  value={securityCode}
                  onChange={handleCodeChange}
                  placeholder="Wprowadź 6-cyfrowy kod"
                  className={cn(
                    "pr-10 text-center text-lg tracking-widest",
                    error && "border-red-500 focus:border-red-500 focus:ring-red-500"
                  )}
                  maxLength={6}
                  disabled={isLoading || isLocked}
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  disabled={isLoading || isLocked}
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Błąd */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Blokada */}
            {isLocked && remainingTime > 0 && (
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-medium">
                  Konto zablokowane na {formatTime(remainingTime)}
                </p>
              </div>
            )}

            {/* Przycisk */}
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading || isLocked || securityCode.length !== 6}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sprawdzanie...
                </div>
              ) : (
                "Potwierdź"
              )}
            </Button>
          </form>

          {/* Wskazówka */}
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-600 text-xs">💡</span>
            </div>
            <div className="text-sm text-blue-800">
              <p className="font-medium">Wskazówka:</p>
              <p>Kod bezpieczeństwa to 6-cyfrowy numer. Skontaktuj się z administratorem systemu, jeśli nie znasz kodu.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
