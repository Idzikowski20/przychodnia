"use client";

import { useState, useEffect } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ShieldCheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface SecurityPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SECURITY_CODE = "123456"; // Kod bezpieczeństwa - można zmienić

export const SecurityPopup = ({ isOpen, onClose, onSuccess }: SecurityPopupProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Resetuj stan przy otwieraniu popup
  useEffect(() => {
    if (isOpen) {
      setCode("");
      setError("");
      setAttempts(0);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Symulacja opóźnienia dla lepszego UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (code === SECURITY_CODE) {
      setError("");
      onSuccess();
      setCode("");
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setError("Zbyt wiele nieprawidłowych prób. Panel zostanie zablokowany na 5 minut.");
        // Tutaj można dodać logikę blokady
        setTimeout(() => {
          setError("");
          setAttempts(0);
        }, 300000); // 5 minut
      } else {
        setError(`Nieprawidłowy kod. Pozostało prób: ${3 - newAttempts}`);
      }
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      // Nie pozwalaj na zamknięcie ESC - wymagany kod bezpieczeństwa
      e.preventDefault();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={() => {}}>
      <AlertDialogContent 
        className="max-w-md"
        onKeyDown={handleKeyDown}
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
              <ShieldCheckIcon className="w-6 h-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-semibold text-gray-900">
              Wymagany kod bezpieczeństwa
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-gray-600">
            Zostałeś nieaktywny przez 5 minut. Wprowadź kod bezpieczeństwa, aby kontynuować pracę w panelu administracyjnym.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="security-code" className="text-sm font-medium text-gray-700">
              Kod bezpieczeństwa
            </Label>
            <Input
              id="security-code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Wprowadź kod bezpieczeństwa"
              className="w-full"
              autoFocus
              disabled={isLoading}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={!code.trim() || isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sprawdzanie...
                </div>
              ) : (
                "Potwierdź"
              )}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 <strong>Wskazówka:</strong> Kod bezpieczeństwa to 6-cyfrowy numer. 
            Skontaktuj się z administratorem systemu, jeśli nie znasz kodu.
          </p>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
