"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doctor, WorkingHours } from "@/types/appwrite.types";
import { updateDoctorSchedule } from "@/lib/actions/doctor.actions";
import SubmitButton from "./SubmitButton";

type DoctorScheduleModalProps = {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScheduleUpdated?: () => void;
};

const dayNames = {
  monday: "Poniedziałek",
  tuesday: "Wtorek", 
  wednesday: "Środa",
  thursday: "Czwartek",
  friday: "Piątek",
  saturday: "Sobota",
  sunday: "Niedziela"
};

export const DoctorScheduleModal = ({ 
  doctor, 
  open, 
  onOpenChange, 
  onScheduleUpdated 
}: DoctorScheduleModalProps) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (doctor) {
      try {
        const parsedHours = JSON.parse(doctor.workingHours);
        setWorkingHours(parsedHours);
      } catch {
        // Domyślny harmonogram jeśli parsing się nie powiedzie
        setWorkingHours({
          monday: { start: "08:00", end: "16:00", isWorking: true },
          tuesday: { start: "08:00", end: "16:00", isWorking: true },
          wednesday: { start: "08:00", end: "16:00", isWorking: true },
          thursday: { start: "08:00", end: "16:00", isWorking: true },
          friday: { start: "08:00", end: "16:00", isWorking: true },
          saturday: { start: "09:00", end: "13:00", isWorking: false },
          sunday: { start: "09:00", end: "13:00", isWorking: false },
        });
      }
    }
  }, [doctor]);

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'isWorking', value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      await updateDoctorSchedule(doctor.$id, JSON.stringify(workingHours));
      onScheduleUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error("Błąd podczas aktualizacji harmonogramu:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAllDays = (isWorking: boolean, start: string, end: string) => {
    const newHours = { ...workingHours };
    Object.keys(dayNames).forEach(day => {
      newHours[day] = { start, end, isWorking };
    });
    setWorkingHours(newHours);
  };

  const copyToWeekend = () => {
    const newHours = { ...workingHours };
    const weekdayHours = workingHours.monday;
    newHours.saturday = { ...weekdayHours };
    newHours.sunday = { ...weekdayHours };
    setWorkingHours(newHours);
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shad-dialog sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>Harmonogram pracy - {doctor.name}</DialogTitle>
          <DialogDescription>
            Ustaw godziny pracy dla każdego dnia tygodnia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Szybkie ustawienia */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Szybkie ustawienia</h3>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAllDays(true, "08:00", "16:00")}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Wszystkie dni 8:00-16:00
              </button>
              <button
                type="button"
                onClick={() => setAllDays(true, "09:00", "17:00")}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                Wszystkie dni 9:00-17:00
              </button>
              <button
                type="button"
                onClick={() => setAllDays(false, "09:00", "17:00")}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Wszystkie dni nieaktywne
              </button>
              <button
                type="button"
                onClick={copyToWeekend}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Skopiuj do weekendu
              </button>
            </div>
          </div>

          {/* Harmonogram dla każdego dnia */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Harmonogram tygodniowy</h3>
            <div className="space-y-3">
              {Object.entries(dayNames).map(([day, dayName]) => (
                <div key={day} className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3 min-w-[140px]">
                    <input
                      type="checkbox"
                      checked={workingHours[day]?.isWorking || false}
                      onChange={(e) => updateWorkingHours(day, 'isWorking', e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <span className="text-white font-medium">{dayName}</span>
                  </div>
                  
                  {workingHours[day]?.isWorking && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <label className="text-white/70 text-sm">Od:</label>
                        <input
                          type="time"
                          value={workingHours[day]?.start || "08:00"}
                          onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-white/70 text-sm">Do:</label>
                        <input
                          type="time"
                          value={workingHours[day]?.end || "16:00"}
                          onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                          className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  )}
                  
                  {!workingHours[day]?.isWorking && (
                    <span className="text-white/50 text-sm">Nieaktywny</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Podsumowanie */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Podsumowanie</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Dni robocze</h4>
                <div className="space-y-1">
                  {Object.entries(dayNames).map(([day, dayName]) => {
                    const hours = workingHours[day];
                    if (hours?.isWorking) {
                      return (
                        <div key={day} className="text-white/70 text-sm">
                          {dayName}: {hours.start} - {hours.end}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Dni wolne</h4>
                <div className="space-y-1">
                  {Object.entries(dayNames).map(([day, dayName]) => {
                    const hours = workingHours[day];
                    if (!hours?.isWorking) {
                      return (
                        <div key={day} className="text-white/70 text-sm">
                          {dayName}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Przyciski */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg transition-colors font-medium"
            >
              Anuluj
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-800 text-white rounded-lg transition-colors font-medium"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz harmonogram"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
