"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Calendar, Clock, User, MessageSquare, CheckCircle } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Appointment, Doctor } from "@/types/appwrite.types";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-xl",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
        <X className="h-4 w-4" />
        <span className="sr-only">Zamknij</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

interface AppointmentConfirmationModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appointment?: Appointment;
  doctors?: Doctor[];
  doctorWorkingHours?: {[key: string]: string};
  schedules?: any[];
  scheduleSlots?: any[];
  onConfirm?: () => void;
}

export function AppointmentConfirmationModal({
  open = false,
  onOpenChange,
  appointment,
  doctors = [],
  doctorWorkingHours = {},
  schedules = [],
  scheduleSlots = [],
  onConfirm
}: AppointmentConfirmationModalProps) {
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);
  const [weeklySchedule, setWeeklySchedule] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (appointment && doctors.length > 0) {
      const doctor = doctors.find(d => d.name === appointment.primaryPhysician);
      setSelectedDoctor(doctor || null);
    }
  }, [appointment, doctors]);

  // Pobierz harmonogram tygodniowy dla wybranego lekarza
  React.useEffect(() => {
    if (selectedDoctor && schedules.length > 0 && scheduleSlots.length > 0) {
      const doctorSchedule = schedules.find(schedule => schedule.doctorId === selectedDoctor.$id);
      if (doctorSchedule) {
        const weeklySlots = scheduleSlots.filter(slot => 
          slot.scheduleId === doctorSchedule.$id && 
          slot.dayOfWeek !== null &&
          slot.status === 'working'
        );
        setWeeklySchedule(weeklySlots);
      }
    }
  }, [selectedDoctor, schedules, scheduleSlots]);

  const handleDoctorChange = (doctorName: string) => {
    const doctor = doctors.find(d => d.name === doctorName);
    if (doctor) {
      setSelectedDoctor(doctor);
    }
  };

  const handleConfirm = () => {
    onConfirm?.();
    onOpenChange?.(false);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDoctorHours = (doctor: Doctor) => {
    return doctorWorkingHours[doctor.$id] || "Sprawdzam...";
  };

  const isDoctorAvailable = (doctor: Doctor) => {
    const hours = getDoctorHours(doctor);
    return hours !== "Niedostępny" && hours !== "Brak harmonogramu" && hours !== "Błąd";
  };

  // Formatuj harmonogram tygodniowy
  const getWeeklyScheduleFormatted = () => {
    const dayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
    const scheduleByDay: {[key: number]: any[]} = {};
    
    // Grupuj sloty według dni tygodnia
    weeklySchedule.forEach(slot => {
      if (!scheduleByDay[slot.dayOfWeek]) {
        scheduleByDay[slot.dayOfWeek] = [];
      }
      scheduleByDay[slot.dayOfWeek].push(slot);
    });
    
    // Formatuj dla każdego dnia
    return dayNames.map((dayName, index) => {
      const daySlots = scheduleByDay[index + 1] || []; // Nasz system: 1=poniedziałek, 7=niedziela
      const jsDayIndex = index; // JavaScript: 0=niedziela, 1=poniedziałek
      
      if (daySlots.length === 0) {
        return { day: dayName, time: "Zamknięte", isWorking: false };
      }
      
      // Znajdź najwcześniejszą i najpóźniejszą godzinę
      const startTimes = daySlots.map(slot => slot.startTime).sort();
      const endTimes = daySlots.map(slot => slot.endTime).sort();
      
      const earliestStart = startTimes[0];
      const latestEnd = endTimes[endTimes.length - 1];
      
      return {
        day: dayName,
        time: `${earliestStart} - ${latestEnd}`,
        isWorking: true
      };
    });
  };

  if (!appointment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Side - Appointment Details */}
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="w-5 h-5" />
                <h2 className="text-2xl font-bold text-foreground">Potwierdź Wizytę</h2>
              </div>
              <p className="text-muted-foreground">
                Proszę potwierdzić następujące szczegóły, aby potwierdzić wizytę.
              </p>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-3">
              <Label htmlFor="doctor" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Lekarz
              </Label>
              <Select 
                value={selectedDoctor?.name || ""} 
                onValueChange={handleDoctorChange} 
                disabled
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.$id} value={doctor.name}>
                      <div className="flex items-center gap-3 w-full">
                        <Image
                          src={doctor.avatar || "/assets/images/dr-cameron.png"}
                          width={32}
                          height={32}
                          alt={doctor.name}
                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                        />
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground">{doctor.specialization}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date and Time */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Oczekiwana data wizyty
              </Label>
              <Input
                id="date"
                value={`${formatDate(appointment.schedule)} - ${formatTime(appointment.schedule)}`}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Reason */}
            <div className="space-y-3">
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Powód wizyty
              </Label>
              <Input
                id="reason"
                value={appointment.reason || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Comments */}
            <div className="space-y-3">
              <Label htmlFor="comments" className="text-sm font-medium">
                Komentarze/uwagi
              </Label>
              <Textarea
                id="comments"
                value={appointment.note || ""}
                readOnly
                className="bg-muted/50 min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange?.(false)}
              >
                Anuluj
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleConfirm}
              >
                Potwierdź wizytę
              </Button>
            </div>
          </div>

          {/* Right Side - Doctor Hours */}
          {selectedDoctor && (
            <div className="lg:w-80 bg-muted/30 border-l border-border p-6">
              <div className="space-y-6">
                {/* Doctor Info */}
                <div className="text-center space-y-4">
                  <Image
                    src={selectedDoctor.avatar || "/assets/images/dr-cameron.png"}
                    alt={selectedDoctor.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-background shadow-lg"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {selectedDoctor.name}
                    </h3>
                    <p className="text-muted-foreground">{selectedDoctor.specialization}</p>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Godziny pracy
                  </h4>
                  <div className="space-y-2">
                    {getWeeklyScheduleFormatted().map((schedule, index) => (
                      <div 
                        key={index}
                        className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/50"
                      >
                        <span className="text-sm font-medium text-foreground">
                          {schedule.day}
                        </span>
                        <span className={cn(
                          "text-sm",
                          schedule.isWorking 
                            ? "text-foreground" 
                            : "text-muted-foreground"
                        )}>
                          {schedule.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <h4 className="font-semibold text-foreground">Informacje kontaktowe</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>📞 (555) 123-4567</p>
                    <p>📧 wizyty@klinika.pl</p>
                    <p>📍 ul. Medyczna 123, Warszawa</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
