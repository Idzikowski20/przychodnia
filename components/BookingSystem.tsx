"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getActiveDoctors } from "@/lib/actions/doctor.actions";
import { getSchedules, getScheduleSlots } from "@/lib/actions/schedule.actions";
import { createAppointment, getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { Doctor } from "@/types/appwrite.types";

interface BookingSystemProps {
  userId: string;
  patientId: string;
  patientName?: string;
  onBookingComplete: (appointmentId: string) => void;
  onAppointmentCancelled?: () => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  type: "commercial" | "nfz";
  consultationFee?: number;
}

interface DoctorAvailability {
  doctor: Doctor;
  date: Date;
  availableSlots: TimeSlot[];
  nextAvailableTime?: string;
  isAvailable: boolean;
  slots: any[];
}

import { useToast } from "@/components/ui/toast";

const BookingSystem = ({ userId, patientId, patientName, onBookingComplete, onAppointmentCancelled }: BookingSystemProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<"date" | "doctor" | "time" | "confirm">("date");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorAvailability, setDoctorAvailability] = useState<DoctorAvailability[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<any[]>([]);
  
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [isWeekLoading, setIsWeekLoading] = useState(false);
  const [weekAvailability, setWeekAvailability] = useState<Map<string, { hasAvailability: boolean; availableHours: number }>>(new Map());

  // Load doctors and existing appointments on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [activeDoctors, appointments] = await Promise.all([
          getActiveDoctors(),
          getRecentAppointmentList()
        ]);
        setDoctors(activeDoctors || []);
        setExistingAppointments(appointments?.documents || []);
        
        // Debug: log loaded appointments
        console.log("📋 Loaded existing appointments:", appointments?.documents?.length || 0);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // Load week availability when doctors or currentWeek changes
  useEffect(() => {
    if (doctors.length > 0) {
      // Clear availability when week changes to show loading
      setWeekAvailability(new Map());
      
      // Debounce to avoid too many calls
      const timeoutId = setTimeout(() => {
        loadWeekAvailability();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [doctors, currentWeek]);

  // Doctor availability is now loaded in handleDateSelect

  // Function to refresh availability (can be called from parent)
  const refreshAvailability = async () => {
    if (doctors.length > 0) {
      await loadWeekAvailability();
    }
  };

  // Expose refresh function to parent
  useEffect(() => {
    if (onAppointmentCancelled) {
      // Store the refresh function in a way that parent can call it
      (window as any).refreshBookingAvailability = refreshAvailability;
    }
  }, [onAppointmentCancelled, doctors.length]);

  // Load week availability to check which dates have schedules and count available hours
  const loadWeekAvailability = async () => {
    if (doctors.length === 0) return;
    
    setIsWeekLoading(true);
    try {
      const schedules = await getSchedules();
      const availability = new Map<string, { hasAvailability: boolean; availableHours: number }>();
      
      const weekDates = getWeekDates(currentWeek);
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      
      // Initialize all dates as unavailable with 0 hours
      weekDates.forEach(date => {
        availability.set(date.toDateString(), { hasAvailability: false, availableHours: 0 });
      });
      
      // Check each doctor's schedule once
      for (const doctor of doctors) {
        const doctorSchedule = schedules.find(s => s.doctorId === doctor.$id);
        if (!doctorSchedule) continue;
        
        const slots = await getScheduleSlots(doctorSchedule.$id);
        
        // Check each slot against all week dates
        for (const slot of slots) {
          if (slot.status !== 'working') continue;
          
          // Parse appointment duration from roomName
          let appointmentDuration = 60; // default
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              appointmentDuration = roomData.appointmentDuration || 60;
            } catch (e) {
              appointmentDuration = 60;
            }
          }
          
          // Check weekly slots
          if (!slot.specificDate) {
            const dayOfWeek = slot.dayOfWeek;
            const weekDayIndex = dayOfWeek === 7 ? 0 : dayOfWeek; // Sunday = 0
            const weekDate = weekDates[weekDayIndex];
            
            if (weekDate && !isPastDate(weekDate)) {
              const slotEndTime = new Date(weekDate);
              const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
              slotEndTime.setHours(endHours, endMinutes, 0, 0);
              
              if (slotEndTime > oneHourFromNow) {
                const currentAvailability = availability.get(weekDate.toDateString()) || { hasAvailability: false, availableHours: 0 };
                
                // Calculate available time slots for this slot
                const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
                const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
                
                let availableSlots = 0;
                const slotStartTime = new Date(startTime);
                while (slotStartTime < endTime) {
                  const slotEndTime = new Date(slotStartTime.getTime() + appointmentDuration * 60000);
                  
                  if (slotEndTime <= endTime) {
                    // Check if slot is at least one hour in the future
                    const slotDateTime = new Date(weekDate);
                    const [hours, minutes] = slotStartTime.toTimeString().split(':').map(Number);
                    slotDateTime.setHours(hours, minutes, 0, 0);
                    
                    if (slotDateTime > oneHourFromNow) {
                      // Check if slot is available (not booked)
                      const isAvailable = isSlotAvailable(doctor, slotStartTime.toTimeString().substring(0, 5), slotEndTime.toTimeString().substring(0, 5), weekDate);
                      if (isAvailable) {
                        availableSlots++;
                      }
                    }
                  }
                  
                  slotStartTime.setTime(slotStartTime.getTime() + appointmentDuration * 60000);
                }
                
                availability.set(weekDate.toDateString(), {
                  hasAvailability: true,
                  availableHours: currentAvailability.availableHours + availableSlots
                });
              }
            }
          } else {
            // Check specific date slots
            const specificDate = new Date(slot.specificDate);
            const weekDate = weekDates.find(date => 
              date.toDateString() === specificDate.toDateString()
            );
            
            if (weekDate && !isPastDate(weekDate)) {
              const slotEndTime = new Date(weekDate);
              const [endHours, endMinutes] = slot.endTime.split(':').map(Number);
              slotEndTime.setHours(endHours, endMinutes, 0, 0);
              
              if (slotEndTime > oneHourFromNow) {
                const currentAvailability = availability.get(weekDate.toDateString()) || { hasAvailability: false, availableHours: 0 };
                
                // Calculate available time slots for this slot
                const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
                const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
                
                let availableSlots = 0;
                const slotStartTime = new Date(startTime);
                while (slotStartTime < endTime) {
                  const slotEndTime = new Date(slotStartTime.getTime() + appointmentDuration * 60000);
                  
                  if (slotEndTime <= endTime) {
                    // Check if slot is at least one hour in the future
                    const slotDateTime = new Date(weekDate);
                    const [hours, minutes] = slotStartTime.toTimeString().split(':').map(Number);
                    slotDateTime.setHours(hours, minutes, 0, 0);
                    
                    if (slotDateTime > oneHourFromNow) {
                      // Check if slot is available (not booked)
                      const isAvailable = isSlotAvailable(doctor, slotStartTime.toTimeString().substring(0, 5), slotEndTime.toTimeString().substring(0, 5), weekDate);
                      if (isAvailable) {
                        availableSlots++;
                      }
                    }
                  }
                  
                  slotStartTime.setTime(slotStartTime.getTime() + appointmentDuration * 60000);
                }
                
                availability.set(weekDate.toDateString(), {
                  hasAvailability: true,
                  availableHours: currentAvailability.availableHours + availableSlots
                });
              }
            }
          }
        }
      }
      
      setWeekAvailability(availability);
    } catch (error) {
      console.error("Error loading week availability:", error);
    } finally {
      setIsWeekLoading(false);
    }
  };

  // Check if a time slot is available (not booked)
  const isSlotAvailable = (doctor: Doctor, startTime: string, endTime: string, date?: Date) => {
    const checkDate = date || selectedDate;
    if (!checkDate) {
      console.log("❌ No date provided for slot availability check");
      return false;
    }
    
    const appointmentStartTime = new Date(checkDate);
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    appointmentStartTime.setHours(startHours, startMinutes, 0, 0);

    const appointmentEndTime = new Date(checkDate);
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    appointmentEndTime.setHours(endHours, endMinutes, 0, 0);

    // Check if there's a conflicting appointment
    const conflictingAppointment = existingAppointments.find(apt => {
      const aptDate = new Date(apt.schedule);
      
      // Check if it's the same doctor and same date
      if (apt.primaryPhysician !== doctor.name || 
          aptDate.toDateString() !== appointmentStartTime.toDateString()) {
        return false;
      }

      // Check if appointment is not cancelled or completed
      const status = apt.status;
      if (Array.isArray(status)) {
        if (status.includes('cancelled') || status.includes('completed')) {
          return false;
        }
      } else {
        if (status === 'cancelled' || status === 'completed') {
          return false;
        }
      }

      // Check if there's a time overlap
      const aptStartTime = new Date(aptDate);
      const aptEndTime = new Date(aptDate);
      
      // Assuming appointment duration is 60 minutes (we could get this from the appointment data)
      aptEndTime.setMinutes(aptEndTime.getMinutes() + 60);
      
      // Check for time overlap
      const hasOverlap = (appointmentStartTime < aptEndTime && appointmentEndTime > aptStartTime);
      
      return hasOverlap;
    });

    return !conflictingAppointment;
  };


  const getWeekDates = (date: Date) => {
    const week = [];
    const monday = new Date(date);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // Monday = 1
    monday.setDate(date.getDate() + diff);

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('pl-PL', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Check if date is within one hour from now
  const isWithinOneHour = (date: Date) => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    return date < oneHourFromNow;
  };

  const handleDateSelect = async (date: Date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
    setCurrentStep("doctor");
    
    // Load doctor availability to check if there are any available slots
    setIsLoading(true);
    try {
      const schedules = await getSchedules();
      const availability: DoctorAvailability[] = [];
      
      for (const doctor of doctors) {
        const doctorSchedule = schedules.find(s => s.doctorId === doctor.$id);
        if (!doctorSchedule) continue;

        const slots = await getScheduleSlots(doctorSchedule.$id);
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        
        // Find slots for this day
        const daySlots = slots.filter(slot => {
          const isWeeklySlot = slot.dayOfWeek === dayOfWeek && !slot.specificDate;
          const isSpecificDateSlot = slot.specificDate && new Date(slot.specificDate).toDateString() === date.toDateString();
          
          return isWeeklySlot || isSpecificDateSlot;
        });

        if (daySlots.length === 0) {
          availability.push({
            doctor,
            date,
            availableSlots: [],
            nextAvailableTime: null,
            isAvailable: false,
            slots: []
          });
          continue;
        }

        // Generate available time slots
        const availableSlots: TimeSlot[] = [];
        
        for (const slot of daySlots) {
          if (slot.status !== 'working') continue;
          
          // Parse appointment duration and consultation fee from roomName
          let appointmentDuration = 60; // default
          let consultationFee = 150; // default
          
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              appointmentDuration = roomData.appointmentDuration || 60;
              consultationFee = roomData.consultationFee || 150;
            } catch (e) {
              // Keep defaults if parsing fails
            }
          }
          
          const startTime = new Date(`2000-01-01T${slot.startTime}:00`);
          const endTime = new Date(`2000-01-01T${slot.endTime}:00`);
          
          // Generate time slots based on appointment duration
          const slotStartTime = new Date(startTime);
          while (slotStartTime < endTime) {
            const slotEndTime = new Date(slotStartTime.getTime() + appointmentDuration * 60000);
            
            // Check if this slot fits within the working period
            if (slotEndTime <= endTime) {
              // Check if slot is at least one hour in the future
              const slotDateTime = new Date(date);
              const [hours, minutes] = slotStartTime.toTimeString().split(':').map(Number);
              slotDateTime.setHours(hours, minutes, 0, 0);
              
              const slotWithinOneHour = isWithinOneHour(slotDateTime);
              const isAvailable = !slotWithinOneHour && isSlotAvailable(doctor, slotStartTime.toTimeString().substring(0, 5), slotEndTime.toTimeString().substring(0, 5), date);
              
              availableSlots.push({
                startTime: slotStartTime.toTimeString().substring(0, 5),
                endTime: slotEndTime.toTimeString().substring(0, 5),
                isAvailable,
                consultationFee: slot.type === 'nfz' ? 0 : consultationFee
              });
            }
            
            slotStartTime.setTime(slotStartTime.getTime() + appointmentDuration * 60000);
          }
        }

        // Check if there are any available slots
        const hasAvailableSlots = availableSlots.some(slot => slot.isAvailable);
        
        if (!hasAvailableSlots && availableSlots.length > 0) {
          // Look for next available day
          for (let i = 1; i <= 7; i++) {
            const futureDate = new Date(date);
            futureDate.setDate(date.getDate() + i);
            const futureDayOfWeek = futureDate.getDay() === 0 ? 7 : futureDate.getDay();
            
            const futureSlots = slots.filter(slot => 
              slot.dayOfWeek === futureDayOfWeek && slot.status === 'working'
            );
            
            if (futureSlots.length > 0) {
              const nextSlot = futureSlots[0];
              availability.push({
                doctor,
                date,
                availableSlots: [],
                nextAvailableTime: `${futureDate.toLocaleDateString('pl-PL')} ${nextSlot.startTime}`,
                isAvailable: false,
                slots: daySlots
              });
              break;
            }
          }
        } else {
          availability.push({
            doctor,
            date,
            availableSlots,
            nextAvailableTime: null,
            isAvailable: hasAvailableSlots,
            slots: daySlots
          });
        }
      }
      
      setDoctorAvailability(availability);
      
      // Check if any doctor has available slots
      const hasAnyAvailableSlots = availability.some(a => a.isAvailable);
      if (!hasAnyAvailableSlots) {
        // No available slots, show message and stay on date selection
        toast({ variant: 'destructive', title: 'Brak terminów', description: 'Wybierz inny dzień' });
        setCurrentStep("date");
        setSelectedDate(null);
      }
      
    } catch (error) {
      console.error("Error loading doctor availability:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorSelect = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    const availability = doctorAvailability.find(a => a.doctor.$id === doctor.$id);
    if (availability && availability.availableSlots.length > 0) {
      setAvailableTimeSlots(availability.availableSlots);
      setCurrentStep("time");
    } else {
      // Show next available time
      setCurrentStep("confirm");
    }
  };

  const handleTimeSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setCurrentStep("confirm");
  };

  const handleBookingConfirm = async () => {
    if (!selectedDate || !selectedDoctor || !selectedTimeSlot) return;

    setIsLoading(true);
    try {
      // Create appointment
      const appointmentDateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTimeSlot.startTime.split(':').map(Number);
      appointmentDateTime.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        userId,
        patient: patientName || "Pacjent", // Use actual patient name
        primaryPhysician: selectedDoctor.name,
        reason: "Wizyta",
        schedule: appointmentDateTime,
        status: ["pending"], // Set as pending for confirmation
        note: "",
        isCompleted: false
      };

      const newAppointment = await createAppointment(appointmentData);
      
      if (newAppointment) {
        // Refresh existing appointments to include the new one
        const updatedAppointments = await getRecentAppointmentList();
        setExistingAppointments(updatedAppointments?.documents || []);
        
        onBookingComplete(newAppointment.$id);
      } else {
        throw new Error("Failed to create appointment");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({ variant: 'destructive', title: 'Błąd', description: 'Nie udało się utworzyć wizyty' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderDateSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wybierz dzień</h2>
        <p className="text-gray-600">Wybierz datę wizyty</p>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(new Date(currentWeek.getTime() - 7 * 24 * 60 * 60 * 1000))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-lg font-semibold text-gray-900">
          {currentWeek.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentWeek(new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {isWeekLoading || weekAvailability.size === 0 ? (
          // Show loading spinner for all days
          Array.from({ length: 7 }, (_, index) => (
            <div key={index} className="p-3 rounded-lg text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-xs text-gray-500">Ładowanie...</div>
            </div>
          ))
        ) : (
          getWeekDates(currentWeek).map((date, index) => {
          const isSelected = selectedDate?.toDateString() === date.toDateString();
          const isPast = isPastDate(date);
          const isTodayDate = isToday(date);
          const dayAvailability = weekAvailability.get(date.toDateString()) || { hasAvailability: false, availableHours: 0 };
          const hasAvailability = dayAvailability.hasAvailability;
          const totalAvailableHours = dayAvailability.availableHours;
          

          return (
            <button
              key={index}
              onClick={() => handleDateSelect(date)}
              disabled={isPast || !hasAvailability}
              className={`
                p-3 rounded-lg text-center transition-all
                ${isSelected 
                  ? 'bg-blue-500 text-white' 
                  : isPast || !hasAvailability
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-900 border border-gray-200 hover:bg-gray-50'
                }
              `}
            >
              <div className="text-xs text-gray-500 mb-1">
                {formatDayName(date)}
              </div>
              <div className="font-semibold">
                {date.getDate()}
              </div>
              {isTodayDate && (
                <div className="text-xs text-gray-600 mt-1">Dziś</div>
              )}
              {!isPast && hasAvailability && totalAvailableHours > 0 && (
                <div className="text-xs font-medium mt-1 text-green-600">
                  {totalAvailableHours} dostępnych
                </div>
              )}
            </button>
          );
        })
        )}
      </div>
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wybierz lekarza</h2>
        <p className="text-gray-600">Dostępni specjaliści na {selectedDate?.toLocaleDateString('pl-PL')}</p>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-2">Ładowanie dostępności...</p>
        </div>
      ) : (
        <div className="space-y-3">
          {(() => {
            // Calculate minimum fee across all available doctors
            const allFees = doctorAvailability
              .filter(availability => availability.isAvailable && availability.slots)
              .map(availability => {
                const daySlots = availability.slots.filter(slot => slot.status === 'working');
                const fees = daySlots.map(slot => {
                  if (slot.type === 'nfz') return 0;
                  let consultationFee = 150;
                  if (slot.roomName) {
                    try {
                      const roomData = JSON.parse(slot.roomName);
                      consultationFee = roomData.consultationFee || 150;
                    } catch (e) {
                      consultationFee = 150;
                    }
                  }
                  return consultationFee;
                });
                return fees.length > 0 ? Math.min(...fees) : Infinity;
              });
            
            const globalMinFee = allFees.length > 0 ? Math.min(...allFees) : Infinity;
            
            return doctorAvailability.map((availability) => (
            <Card 
              key={availability.doctor.$id}
              className={`transition-shadow ${
                availability.isAvailable 
                  ? "cursor-pointer hover:shadow-md" 
                  : "cursor-not-allowed opacity-60"
              }`}
              onClick={() => availability.isAvailable && handleDoctorSelect(availability.doctor)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {availability.doctor.avatar ? (
                      <img
                        src={availability.doctor.avatar}
                        alt={availability.doctor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {availability.doctor.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{availability.doctor.name}</h3>
                    <p className="text-sm text-gray-500">{availability.doctor.specialization}</p>
                    
                    {/* Show fees for this doctor on this day */}
                    {availability.isAvailable && availability.slots && availability.slots.length > 0 && (
                      <div className="mt-2">
                        {(() => {
                          const daySlots = availability.slots.filter(slot => slot.status === 'working');
                          const fees = daySlots.map(slot => {
                            if (slot.type === 'nfz') return { type: 'nfz', fee: 0 };
                            let consultationFee = 150;
                            if (slot.roomName) {
                              try {
                                const roomData = JSON.parse(slot.roomName);
                                consultationFee = roomData.consultationFee || 150;
                              } catch (e) {
                                consultationFee = 150;
                              }
                            }
                            return { type: slot.type, fee: consultationFee };
                          });
                          
                          const uniqueFees = fees.filter((fee, index, self) => 
                            index === self.findIndex(f => f.type === fee.type && f.fee === fee.fee)
                          );
                          
                          return (
                            <div className="flex gap-2">
                              {uniqueFees.map((feeInfo, index) => {
                                const isCheapest = feeInfo.fee === globalMinFee && globalMinFee !== Infinity;
                                const isNFZCheapest = feeInfo.type === 'nfz' && globalMinFee === 0;
                                
                                return (
                                  <span 
                                    key={index}
                                    className={`text-xs px-2 py-1 rounded font-medium ${
                                      feeInfo.type === 'nfz' 
                                        ? isNFZCheapest 
                                          ? 'bg-green-100 text-green-700 border border-green-300' 
                                          : 'bg-blue-100 text-blue-700'
                                        : isCheapest
                                          ? 'bg-green-100 text-green-700 border border-green-300'
                                          : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {feeInfo.type === 'nfz' ? 'NFZ' : `${feeInfo.fee} zł`}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    {availability.isAvailable ? (
                      <Badge variant="default" className="bg-green-100 text-green-700">
                        {availability.availableSlots.filter(slot => slot.isAvailable).length} dostępnych
                      </Badge>
                    ) : availability.nextAvailableTime ? (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                        Dostępny o {availability.nextAvailableTime}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-700">
                        Niedostępny
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ));
          })()}
        </div>
      )}

      <Button 
        variant="outline" 
        onClick={() => {
          setSelectedDate(null);
          setCurrentStep("date");
        }}
        className="w-full"
      >
        Wróć do wyboru dnia
      </Button>
    </div>
  );

  const renderTimeSelection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Wybierz godzinę</h2>
        <p className="text-gray-600">
          {selectedDoctor?.name} • {selectedDate?.toLocaleDateString('pl-PL')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {availableTimeSlots.filter(slot => slot.isAvailable).map((slot, index) => (
          <button
            key={index}
            onClick={() => handleTimeSelect(slot)}
            className="p-3 rounded-lg text-center transition-all border bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200"
          >
            <div className="font-semibold">{slot.startTime}</div>
            <div className="text-xs text-gray-500">{slot.type === 'nfz' ? 'NFZ' : 'Komercyjne'}</div>
          </button>
        ))}
        
        {availableTimeSlots.filter(slot => slot.isAvailable).length === 0 && (
          <div className="col-span-3 text-center py-8">
            <p className="text-gray-500">Brak dostępnych terminów na ten dzień</p>
          </div>
        )}
      </div>

      <Button 
        variant="outline" 
        onClick={() => setCurrentStep("doctor")}
        className="w-full"
      >
        Wróć do wyboru lekarza
      </Button>
    </div>
  );

  const renderConfirmation = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Potwierdź wizytę</h2>
        <p className="text-gray-600">Sprawdź szczegóły przed potwierdzeniem</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedDate?.toLocaleDateString('pl-PL', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{selectedDoctor?.name}</p>
                <p className="text-sm text-gray-500">{selectedDoctor?.specialization}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">
                  {selectedTimeSlot?.type === 'nfz' ? 'NFZ' : 'Komercyjne'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedTimeSlot?.type === 'nfz' ? 'Za darmo' : `${selectedTimeSlot?.consultationFee || 150} PLN`}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep("time")}
          className="flex-1"
        >
          Wróć do godziny
        </Button>
        <Button 
          onClick={handleBookingConfirm}
          disabled={isLoading}
          className="flex-1 bg-blue-500 hover:bg-blue-600"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Tworzenie wizyty...
            </>
          ) : (
            "Potwierdź wizytę"
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardContent className="p-6">
          {currentStep === "date" && renderDateSelection()}
          {currentStep === "doctor" && renderDoctorSelection()}
          {currentStep === "time" && renderTimeSelection()}
          {currentStep === "confirm" && renderConfirmation()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSystem;
