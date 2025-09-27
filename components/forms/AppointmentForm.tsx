"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { SelectItem } from "@/components/ui/select";
import {
  createAppointment,
  updateAppointment,
  getAppointmentsByDoctorAndDate,
} from "@/lib/actions/appointment.actions";
import { getActiveDoctors } from "@/lib/actions/doctor.actions";
import { getSchedules, getScheduleSlots, getScheduleSlotsForDate } from "@/lib/actions/schedule.actions";
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment, Doctor, WorkingHours } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";
import { AppointmentConfirmationModal } from "../AppointmentConfirmationModal";
import { useToast } from "@/components/ui/toast";

// Funkcja do odtwarzania dźwięku przycisku
const playButtonSound = () => {
  const audio = new Audio("/assets/sounds/button.mp3");
  audio.play().catch((error) => {
    console.error("Błąd odtwarzania dźwięku przycisku:", error);
  });
};

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
  isAdminModal = false,
  onUpdated,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel" | "plan";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isAdminModal?: boolean;
  onUpdated?: (payload: { id: string; status?: string[]; isCompleted?: boolean }) => void;
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleSlots, setScheduleSlots] = useState<any[]>([]);
  const [doctorWorkingHours, setDoctorWorkingHours] = useState<{[key: string]: string}>({});
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Load doctors and schedules on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [activeDoctors, schedulesData] = await Promise.all([
          getActiveDoctors(),
          getSchedules()
        ]);
        setDoctors(activeDoctors || []);
        setSchedules(schedulesData || []);
        


        
        // Load all schedule slots
        if (schedulesData && schedulesData.length > 0) {
          const allSlots = [];
          for (const schedule of schedulesData) {
            const slots = await getScheduleSlots(schedule.$id);
            allSlots.push(...slots);

          }
          setScheduleSlots(allSlots);

        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
  }, []);

  // Update working days when schedules or selected doctor changes
  useEffect(() => {
    if (selectedDoctor && schedules.length > 0 && scheduleSlots.length > 0) {

      const workingDaysList = getWorkingDays(selectedDoctor);

      setWorkingDays(workingDaysList);
    } else {
      console.log("❌ Nie mogę zaktualizować workingDays:", {
        selectedDoctor: selectedDoctor?.name,
        schedulesLength: schedules.length,
        scheduleSlotsLength: scheduleSlots.length
      });
    }
  }, [selectedDoctor, schedules, scheduleSlots]);

  // Update working hours for all doctors when date changes
  useEffect(() => {
    const updateAllDoctorHours = async () => {
      if (doctors.length > 0 && schedules.length > 0 && scheduleSlots.length > 0) {
        const selectedDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // Default to tomorrow
        const hoursMap: {[key: string]: string} = {};
        
        for (const doctor of doctors) {
          const hours = await getDoctorWorkingHours(doctor, selectedDate);
          hoursMap[doctor.$id] = hours;
        }
        
        setDoctorWorkingHours(hoursMap);
      }
    };
    
    updateAllDoctorHours();
  }, [doctors, schedules, scheduleSlots]);


  // Generate available times based on doctor's schedule and existing appointments
  const generateAvailableTimes = async (doctor: Doctor, selectedDate: Date) => {
    try {
      // Znajdź harmonogram dla tego lekarza
      const doctorSchedule = schedules.find(schedule => schedule.doctorId === doctor.$id);
      if (!doctorSchedule) {

        return [];
      }

      // Pobierz sloty dla konkretnej daty
      const specificDateSlots = await getScheduleSlotsForDate(doctorSchedule.$id, selectedDate);
      
      // Jeśli nie ma slotów dla konkretnej daty, sprawdź sloty tygodniowe
      let workingSlots = specificDateSlots;
      if (workingSlots.length === 0) {
        const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay(); // Sunday = 7, Monday = 1
        workingSlots = scheduleSlots.filter(slot => 
          slot.scheduleId === doctorSchedule.$id && 
          slot.dayOfWeek === dayOfWeek &&
          slot.status === 'working'
        );
      }

      if (workingSlots.length === 0) {
        console.log("❌ Brak slotów pracy dla lekarza:", doctor.name, "w dniu:", selectedDate.toDateString());
        return [];
      }

      // Pobierz istniejące wizyty dla tego lekarza w tym dniu
      const existingAppointments = await getAppointmentsByDoctorAndDate(doctor.name, selectedDate);
      console.log("📅 Istniejące wizyty dla", doctor.name, "w dniu", selectedDate.toDateString(), ":", existingAppointments.length);

      // Wyciągnij zajęte minuty od północy
      const bookedMinutes = existingAppointments.map((appointment: any) => {
        const appointmentDate = new Date(appointment.schedule);
        return appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
      });

      console.log("⏰ Zarezerwowane sloty (minuty od północy):", bookedMinutes);

      const times: string[] = [];
      const appointmentDuration = Number(doctor.appointmentDuration);
      const breakDuration = Number(doctor.breakDuration);
      const safeAppointmentDuration = Number.isFinite(appointmentDuration) && appointmentDuration > 0 ? appointmentDuration : 30;
      const safeBreakDuration = Number.isFinite(breakDuration) && breakDuration >= 0 ? breakDuration : 0;

      // Dla każdego slotu pracy wygeneruj dostępne godziny
      for (const slot of workingSlots) {
        const startTime = new Date(`2000-01-01T${slot.startTime}`);
        const endTime = new Date(`2000-01-01T${slot.endTime}`);
        
        const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
        const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
        const step = safeAppointmentDuration + safeBreakDuration;

        const formatTime = (totalMinutes: number) => {
          const h = Math.floor(totalMinutes / 60);
          const m = totalMinutes % 60;
          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        };

        let currentMinutes = startMinutes;
        while (currentMinutes < endMinutes) {
          const timeString = formatTime(currentMinutes);
          const isBooked = bookedMinutes.includes(currentMinutes);
          
          if (!isBooked) {
            times.push(timeString);

          } else {

          }

          currentMinutes += step;
        }
      }

      // Sortuj godziny
      times.sort();

      return times;
    } catch (error) {
      console.error("Error generating available times:", error);
      return [];
    }
  };

  // Get working hours for a specific doctor on a specific date
  const getDoctorWorkingHours = async (doctor: Doctor, date: Date) => {
    try {
      const doctorSchedule = schedules.find(schedule => schedule.doctorId === doctor.$id);
      if (!doctorSchedule) {
        return "Brak harmonogramu";
      }

      // Pobierz sloty dla konkretnej daty
      const specificDateSlots = await getScheduleSlotsForDate(doctorSchedule.$id, date);
      
      // Jeśli nie ma slotów dla konkretnej daty, sprawdź sloty tygodniowe
      let workingSlots = specificDateSlots;
      if (workingSlots.length === 0) {
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay(); // Sunday = 7, Monday = 1
        workingSlots = scheduleSlots.filter(slot => 
          slot.scheduleId === doctorSchedule.$id && 
          slot.dayOfWeek === dayOfWeek &&
          slot.status === 'working'
        );
      }

      if (workingSlots.length === 0) {
        return "Niedostępny";
      }

      // Znajdź najwcześniejszą i najpóźniejszą godzinę
      const startTimes = workingSlots.map((slot: any) => slot.startTime).sort();
      const endTimes = workingSlots.map((slot: any) => slot.endTime).sort();
      
      const earliestStart = startTimes[0];
      const latestEnd = endTimes[endTimes.length - 1];
      
      return `${earliestStart} - ${latestEnd}`;
    } catch (error) {
      console.error("Error getting doctor working hours:", error);
      return "Błąd";
    }
  };

  // Get working days from doctor's schedule
  const getWorkingDays = (doctor: Doctor) => {
    try {
      // Znajdź harmonogram dla tego lekarza

      console.log("📋 Dostępne harmonogramy:", schedules.map(s => ({ id: s.$id, doctorId: s.doctorId })));
      
      // Sprawdź czy doctorId pasuje do doctor.$id
      const matchingSchedules = schedules.filter(schedule => schedule.doctorId === doctor.$id);

      
      const doctorSchedule = schedules.find(schedule => schedule.doctorId === doctor.$id);
      if (!doctorSchedule) {


        schedules.forEach(schedule => {
          console.log(`Harmonogram ${schedule.$id}: doctorId = "${schedule.doctorId}" (typ: ${typeof schedule.doctorId})`);
        });
        return [];
      }



      // Pobierz sloty tygodniowe dla tego harmonogramu

      console.log("📋 Wszystkie sloty:", scheduleSlots.map(slot => ({ 
        scheduleId: slot.scheduleId, 
        dayOfWeek: slot.dayOfWeek, 
        status: slot.status 
      })));
      
      // Sprawdź sloty dla konkretnego harmonogramu Sylwii
      const sylwiaSlots = scheduleSlots.filter(slot => slot.scheduleId === doctorSchedule.$id);

      console.log("🔍 Szczegóły slotów Sylwii:", sylwiaSlots.map(slot => ({ 
        scheduleId: slot.scheduleId, 
        dayOfWeek: slot.dayOfWeek, 
        status: slot.status,
        startTime: slot.startTime,
        endTime: slot.endTime
      })));
      
      // Pobierz sloty tygodniowe dla tego harmonogramu
      const weeklySlots = scheduleSlots.filter(slot => 
        slot.scheduleId === doctorSchedule.$id && 
        slot.dayOfWeek !== null &&
        slot.status === 'working'
      );


      console.log("📅 Szczegóły slotów tygodniowych:", weeklySlots.map(slot => ({ 
        dayOfWeek: slot.dayOfWeek, 
        startTime: slot.startTime, 
        endTime: slot.endTime,
        status: slot.status 
      })));

      // Jeśli nie ma slotów tygodniowych, sprawdź sloty dla konkretnych dat
      let workingDaysList: string[] = [];
      
      if (weeklySlots.length > 0) {
        // Mapuj numery dni na nazwy dni dla slotów tygodniowych
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        weeklySlots.forEach((slot: any) => {
          // Mapuj nasz system (1=poniedziałek, 7=niedziela) na JavaScript (0=niedziela, 1=poniedziałek)
          const jsDayIndex = slot.dayOfWeek === 7 ? 0 : slot.dayOfWeek;
          const dayName = dayNames[jsDayIndex];
          if (!workingDaysList.includes(dayName)) {
            workingDaysList.push(dayName);
          }
        });
      } else {
        // Jeśli nie ma slotów tygodniowych, sprawdź sloty dla konkretnych dat
        const specificDateSlots = scheduleSlots.filter(slot => 
          slot.scheduleId === doctorSchedule.$id && 
          slot.specificDate !== null &&
          slot.status === 'working'
        );
        

        console.log("📅 Szczegóły slotów dla konkretnych dat:", specificDateSlots.map(slot => ({ 
          specificDate: slot.specificDate, 
          startTime: slot.startTime, 
          endTime: slot.endTime,
          status: slot.status 
        })));
        
        // Dla slotów konkretnych dat, określ dni tygodnia na podstawie dat
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        
        specificDateSlots.forEach((slot: any) => {
          if (slot.specificDate) {
            const date = new Date(slot.specificDate);
            const dayName = dayNames[date.getDay()];
            if (!workingDaysList.includes(dayName)) {
              workingDaysList.push(dayName);
            }
          }
        });
      }


      return workingDaysList;
    } catch (error) {
      console.error("Error getting working days:", error);
      return [];
    }
  };

  // Update available times when doctor or date changes
  const handleDoctorChange = async (doctorName: string) => {

    const doctor = doctors.find(d => d.name === doctorName);

    setSelectedDoctor(doctor || null);
    
    if (doctor) {

      
      // Generate times for selected date or tomorrow if no date is selected
      const selectedDate = form.getValues('schedule') || new Date(Date.now() + 24 * 60 * 60 * 1000);
      const times = await generateAvailableTimes(doctor, selectedDate);
      setAvailableTimes(times);
    }
  };

  const handleDateChange = async (date: Date) => {
    if (selectedDoctor) {
      const times = await generateAvailableTimes(selectedDoctor, date);
      setAvailableTimes(times);
    }
    
    // Update working hours for all doctors when date changes
    if (doctors.length > 0 && schedules.length > 0 && scheduleSlots.length > 0) {
      const hoursMap: {[key: string]: string} = {};
      
      for (const doctor of doctors) {
        const hours = await getDoctorWorkingHours(doctor, date);
        hoursMap[doctor.$id] = hours;
      }
      
      setDoctorWorkingHours(hoursMap);
    }
  };

  const AppointmentFormValidation = getAppointmentSchema(type);

  const form = useForm<z.infer<typeof AppointmentFormValidation>>({
    resolver: zodResolver(AppointmentFormValidation),
    defaultValues: {
      primaryPhysician: appointment ? appointment?.primaryPhysician : "",
      schedule: appointment
        ? new Date(appointment?.schedule!)
        : undefined, // No default date
      reason: appointment ? appointment.reason : "",
      note: appointment?.note || "",
      cancellationReason: appointment?.cancellationReason || "",
    },
  });

  const onSubmit = async (
    values: z.infer<typeof AppointmentFormValidation>
  ) => {
    // Dla typu schedule, pokaż modal potwierdzenia zamiast bezpośredniego submit
    if (type === "schedule") {
      setShowConfirmationModal(true);
      return;
    }

    playButtonSound();
    setIsLoading(true);

    let status;
    switch (type) {
      case "plan": {
        // Dla przełożenia, ustaw status na "scheduled"
        status = "scheduled";
        break;
      }
      case "cancel": {
        status = "cancelled";
        break;
      }
      default: {
        status = "awaiting";
      }
    }

    try {
      if (type === "create" && patientId) {
        const appointment = {
          userId,
          patient: patientId,
          primaryPhysician: values.primaryPhysician,
          schedule: new Date(values.schedule),
          reason: values.reason!,
          status: status as any,
          note: values.note,
          isCompleted: false,
        };

        const newAppointment = await createAppointment(appointment);

        if (newAppointment) {
          form.reset();
          router.push(
            `/patients/${userId}/new-appointment/success?appointmentId=${newAppointment.$id}`
          );
        }
      } else {
        if (!appointment?.$id) {
          throw new Error("Appointment ID is required for update");
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
        const appointmentToUpdate = {
          userId,
          appointmentId: appointment.$id,
          appointment: {
            primaryPhysician: values.primaryPhysician,
            schedule: new Date(values.schedule),
            status: status as any,
            cancellationReason: values.cancellationReason,
          },
          type,
          timeZone,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          // Toast dla różnych typów operacji
          if (type === "cancel") {
            onUpdated?.({ id: appointment.$id, status: ["cancelled"] });
            toast({
              variant: "default",
              title: "❌ Wizyta anulowana",
              description: "Wizyta została pomyślnie anulowana."
            });
          } else if (type === "plan") {
            onUpdated?.({ id: appointment.$id, status: ["scheduled"] });
            toast({
              variant: "default",
              title: "📅 Wizyta przełożona",
              description: "Wizyta została pomyślnie przełożona."
            });
          }
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.error("An error occurred while scheduling an appointment:", error);
      toast({
        variant: "destructive",
        title: "Błąd operacji",
        description: type === "cancel" ? "Nie udało się anulować wizyty." : 
                    type === "plan" ? "Nie udało się przełożyć wizyty." : 
                    "Wystąpił błąd podczas operacji na wizycie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    playButtonSound();
    setIsLoading(true);

    try {
      if (!appointment?.$id) {
        throw new Error("Appointment ID is required for update");
      }

      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
      const updatedAppointment = await updateAppointment({
        userId,
        appointmentId: appointment.$id,
        type: "schedule",
        timeZone,
      });

      if (updatedAppointment) {
        onUpdated?.({ id: appointment.$id, status: ["accepted"] });
        toast({
          variant: "default",
          title: "✅ Wizyta potwierdzona",
          description: "Wizyta została pomyślnie potwierdzona."
        });
        setOpen && setOpen(false);
        form.reset();
      }
    } catch (error) {
      console.error("An error occurred while confirming appointment:", error);
      toast({
        variant: "destructive",
        title: "Błąd potwierdzania",
        description: "Nie udało się potwierdzić wizyty. Spróbuj ponownie."
      });
    } finally {
      setIsLoading(false);
    }
  };

  let buttonLabel;
  switch (type) {
    case "cancel":
      buttonLabel = "Anuluj wizytę";
      break;
    case "schedule":
      buttonLabel = "Potwierdź wizytę";
      break;
    case "plan":
      buttonLabel = "Przełóż wizytę";
      break;
    default:
      buttonLabel = "Wyślij wizytę";
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 space-y-6">
        {type === "create" && (
          <section className="mb-12 space-y-4">
            <h1 className={`text-4xl font-bold ${isAdminModal ? 'text-gray-900' : 'text-gray-900'}`}>Nowa wizyta</h1>
            <p className={isAdminModal ? 'text-gray-900' : 'text-gray-600'}>
              Umów nową wizytę w 10 sekund.
            </p>
          </section>
        )}

        {type !== "cancel" && (
          <>
            <CustomFormField
              fieldType={FormFieldType.SELECT}
              control={form.control}
              name="primaryPhysician"
              label="Lekarz"
              placeholder="Wybierz lekarza"
              onValueChange={handleDoctorChange}
              isAdminModal={isAdminModal}
            >
              {doctors.map((doctor, i) => {
                const workingHours = doctorWorkingHours[doctor.$id] || "Sprawdzam...";
                const isAvailable = workingHours !== "Niedostępny" && workingHours !== "Brak harmonogramu" && workingHours !== "Błąd";
                
                return (
                  <SelectItem key={doctor.$id + i} value={doctor.name}>
                    <div className="flex cursor-pointer items-center gap-2">
                      <Image
                        src={doctor.avatar || "/assets/images/dr-cameron.png"}
                        width={32}
                        height={32}
                        alt="doctor"
                        className="doctor-avatar border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{doctor.name}</p>
                            <p className="text-sm text-gray-500">{doctor.specialization}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                              {workingHours}
                            </p>
                            <p className={`text-xs ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                              {isAvailable ? 'Dostępny' : 'Niedostępny'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </CustomFormField>

            <CustomFormField
              fieldType={FormFieldType.DATE_PICKER}
              control={form.control}
              name="schedule"
              label="Oczekiwana data wizyty"
              showTimeSelect
              dateFormat="dd/MM/yyyy  -  HH:mm"
              minDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // Tomorrow
              onValueChange={handleDateChange}
              availableTimes={availableTimes}
              workingDays={workingDays}
              isAdminModal={isAdminModal}
            />

            <div
              className={`flex flex-col gap-6  ${type === "create" && "xl:flex-row"}`}
            >
              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="reason"
                label="Powód wizyty"
                placeholder="Roczna kontrola lekarska"
                disabled={type === "schedule"}
                isAdminModal={isAdminModal}
              />

              <CustomFormField
                fieldType={FormFieldType.TEXTAREA}
                control={form.control}
                name="note"
                label="Komentarze/uwagi"
                placeholder="Preferuję popołudniowe wizyty, jeśli to możliwe"
                disabled={type === "schedule"}
                isAdminModal={isAdminModal}
              />
            </div>
          </>
        )}

        {type === "cancel" && (
          <CustomFormField
            fieldType={FormFieldType.TEXTAREA}
            control={form.control}
            name="cancellationReason"
            label="Powód anulowania"
            placeholder="Pilne spotkanie"
            isAdminModal={isAdminModal}
          />
        )}

        <SubmitButton
          isLoading={isLoading}
          className={`${type === "cancel" ? "shad-danger-btn" : "shad-primary-btn"} w-full`}
        >
          {buttonLabel}
        </SubmitButton>
      </form>

      {/* Modal potwierdzenia wizyty */}
      {type === "schedule" && appointment && (
        <AppointmentConfirmationModal
          open={showConfirmationModal}
          onOpenChange={setShowConfirmationModal}
          appointment={appointment}
          doctors={doctors}
          doctorWorkingHours={doctorWorkingHours}
          schedules={schedules}
          scheduleSlots={scheduleSlots}
          onConfirm={handleConfirmAppointment}
        />
      )}
    </Form>
  );
};
