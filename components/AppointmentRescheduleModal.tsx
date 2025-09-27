"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Calendar, Clock, User, MessageSquare, RotateCcw } from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
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

interface AppointmentRescheduleModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  appointment?: Appointment;
  doctors?: Doctor[];
  doctorWorkingHours?: {[key: string]: string};
  schedules?: any[];
  scheduleSlots?: any[];
  onReschedule?: (data: { doctorId: string; newDate: string; reason: string }) => void;
}

export function AppointmentRescheduleModal({
  open = false,
  onOpenChange,
  appointment,
  doctors = [],
  doctorWorkingHours = {},
  schedules = [],
  scheduleSlots = [],
  onReschedule
}: AppointmentRescheduleModalProps) {
  const [selectedDoctor, setSelectedDoctor] = React.useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<Date | null>(null);
  const [rescheduleReason, setRescheduleReason] = React.useState<string>("");
  const [weeklySchedule, setWeeklySchedule] = React.useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = React.useState<Date[]>([]);
  const [availableDates, setAvailableDates] = React.useState<Date[]>([]);
  const [availableTimes, setAvailableTimes] = React.useState<Date[]>([]);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  React.useEffect(() => {
    if (appointment && doctors.length > 0) {
      const doctor = doctors.find(d => d.name === appointment.primaryPhysician);
      setSelectedDoctor(doctor || null);
      // Set initial selectedDate and selectedTime to current appointment schedule
      const appointmentDate = new Date(appointment.schedule);
      setSelectedDate(appointmentDate);
      setSelectedTime(appointmentDate);
    }
  }, [appointment, doctors]);

  // Pobierz harmonogram tygodniowy dla wybranego lekarza
  React.useEffect(() => {
    if (selectedDoctor && schedules.length > 0 && scheduleSlots.length > 0) {
      const doctorSchedule = schedules.find(schedule => schedule.doctorId === selectedDoctor.$id);
      
      if (doctorSchedule) {
        const weeklySlots = scheduleSlots.filter(slot => {
          const matchesSchedule = slot.scheduleId === doctorSchedule.$id;
          const hasSpecificDate = slot.specificDate !== null;
          const isWorking = slot.status === 'working';
          
          return matchesSchedule && hasSpecificDate && isWorking;
        });
        setWeeklySchedule(weeklySlots);
        generateAvailableSlots(weeklySlots);
      }
    }
  }, [selectedDoctor, schedules, scheduleSlots]);

  // Generuj dostępne terminy na podstawie harmonogramu
  const generateAvailableSlots = (slots: any[]) => {
    const allSlots: Date[] = [];
    const uniqueDates = new Set<string>();
    const today = new Date();
    
    // Przetwarzaj sloty z konkretnymi datami
    slots.forEach(slot => {
      if (slot.specificDate) {
        const slotDate = new Date(slot.specificDate);
        
        // Sprawdź czy data nie jest w przeszłości
        if (slotDate >= today) {
          const startTime = slot.startTime;
          const endTime = slot.endTime;
          
          // Parsuj godziny (format HH:MM)
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          
          // Generuj sloty co 30 minut
          let currentHour = startHour;
          let currentMinute = startMinute;
          
          while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const timeSlot = new Date(slotDate);
            timeSlot.setHours(currentHour, currentMinute, 0, 0);
            
            // Sprawdź czy termin nie jest w przeszłości
            if (timeSlot > today) {
              allSlots.push(timeSlot);
              uniqueDates.add(slotDate.toDateString());
            }
            
            // Dodaj 30 minut
            currentMinute += 30;
            if (currentMinute >= 60) {
              currentMinute = 0;
              currentHour++;
            }
          }
        }
      }
    });
    
    // Konwertuj unikalne daty na tablicę i posortuj
    const sortedDates = Array.from(uniqueDates)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());
    
    setAvailableSlots(allSlots.sort((a, b) => a.getTime() - b.getTime()));
    setAvailableDates(sortedDates);
  };

  const handleDoctorChange = (doctorName: string) => {
    const doctor = doctors.find(d => d.name === doctorName);
    if (doctor) {
      setSelectedDoctor(doctor);
      // Resetuj wybrane daty/godziny przy zmianie lekarza
      setSelectedDate(null);
      setSelectedTime(null);
      setAvailableTimes([]);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setShowDatePicker(false);
    
    // Filtruj godziny dla wybranej daty
    const timesForDate = availableSlots.filter(slot => 
      isSameDay(slot, date)
    );
    setAvailableTimes(timesForDate);
    setShowTimePicker(true);
  };

  const handleTimeSelect = (time: Date) => {
    setSelectedTime(time);
    setShowTimePicker(false);
  };

  const handleReschedule = () => {
    if (selectedDoctor && selectedTime && rescheduleReason) {
      onReschedule?.({
        doctorId: selectedDoctor.$id,
        newDate: selectedTime.toISOString(),
        reason: rescheduleReason
      });
      onOpenChange?.(false);
    }
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
        <div className="mb-4 flex flex-col lg:flex-row max-h-[80vh] overflow-y-auto">
          {/* Left Side - Reschedule Form */}
          <div className="flex-1 p-6 space-y-4">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <RotateCcw className="w-5 h-5" />
                <h2 className="text-2xl font-bold text-foreground">Przełóż Wizytę</h2>
              </div>
              <p className="text-muted-foreground">
                Proszę ustawić konkretną datę i godzinę wizyty oraz podać powód przełożenia.
              </p>
            </div>

            {/* Doctor Selection */}
            <div className="space-y-2">
              <Label htmlFor="doctor" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Lekarz
              </Label>
              <Select 
                value={selectedDoctor?.name || ""} 
                onValueChange={handleDoctorChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wybierz lekarza" />
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

            {/* Date Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Wybierz datę
              </Label>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd.MM.yyyy", { locale: pl })
                ) : (
                  "Kliknij aby wybrać datę"
                )}
              </Button>
              
              {showDatePicker && (
                <div className="border rounded-lg p-4 bg-background max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-1 gap-2">
                    {availableDates.length > 0 ? (
                      availableDates.map((date, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant={selectedDate && isSameDay(selectedDate, date) ? "default" : "outline"}
                          className="justify-start text-left"
                          onClick={() => handleDateSelect(date)}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {format(date, "dd.MM.yyyy (EEEE)", { locale: pl })}
                        </Button>
                      ))
                    ) : (
                      <div className="text-center text-muted-foreground py-4">
                        Brak dostępnych dat dla wybranego lekarza
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Wybierz godzinę
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  onClick={() => setShowTimePicker(!showTimePicker)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {selectedTime ? (
                    format(selectedTime, "HH:mm", { locale: pl })
                  ) : (
                    "Kliknij aby wybrać godzinę"
                  )}
                </Button>
                
                {showTimePicker && (
                  <div className="border rounded-lg p-4 bg-background max-h-60 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-2">
                      {availableTimes.length > 0 ? (
                        availableTimes.map((time, index) => (
                          <Button
                            key={index}
                            type="button"
                            variant={selectedTime && isSameDay(selectedTime, time) && 
                                     selectedTime.getHours() === time.getHours() && 
                                     selectedTime.getMinutes() === time.getMinutes() 
                                     ? "default" : "outline"}
                            className="justify-center"
                            onClick={() => handleTimeSelect(time)}
                          >
                            {format(time, "HH:mm", { locale: pl })}
                          </Button>
                        ))
                      ) : (
                        <div className="col-span-2 text-center text-muted-foreground py-4">
                          Brak dostępnych godzin dla wybranej daty
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Current Appointment Info */}
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium text-sm text-muted-foreground">Obecna wizyta</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Data:</span>
                  <span className="text-sm">{formatDate(appointment.schedule)} - {formatTime(appointment.schedule)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Lekarz:</span>
                  <span className="text-sm">{appointment.primaryPhysician}</span>
                </div>
              </div>
            </div>

            {/* Reason for Rescheduling */}
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Powód przełożenia
              </Label>
              <Textarea
                id="reason"
                value={rescheduleReason}
                onChange={(e) => setRescheduleReason(e.target.value)}
                placeholder="Proszę podać powód przełożenia wizyty..."
                className="min-h-[80px] resize-none"
              />
            </div>

            {/* Original Reason (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="originalReason" className="text-sm font-medium">
                Powód wizyty (nie można zmienić)
              </Label>
              <Input
                id="originalReason"
                value={appointment.reason || ""}
                readOnly
                className="bg-muted/50"
              />
            </div>

            {/* Original Comments (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="originalComments" className="text-sm font-medium">
                Komentarze/uwagi (nie można zmienić)
              </Label>
              <Textarea
                id="originalComments"
                value={appointment.note || ""}
                readOnly
                className="bg-muted/50 min-h-[100px] resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 mb-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange?.(false)}
              >
                Anuluj
              </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={handleReschedule}
                    disabled={!selectedDoctor || !selectedTime || !rescheduleReason}
                  >
                    Przełóż wizytę
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
                <div className="space-y-3">
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
