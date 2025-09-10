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
import { getAppointmentSchema } from "@/lib/validation";
import { Appointment, Doctor, WorkingHours } from "@/types/appwrite.types";

import "react-datepicker/dist/react-datepicker.css";

import CustomFormField, { FormFieldType } from "../CustomFormField";
import SubmitButton from "../SubmitButton";
import { Form } from "../ui/form";

export const AppointmentForm = ({
  userId,
  patientId,
  type = "create",
  appointment,
  setOpen,
  isAdminModal = false,
}: {
  userId: string;
  patientId: string;
  type: "create" | "schedule" | "cancel" | "plan";
  appointment?: Appointment;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  isAdminModal?: boolean;
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<string[]>([]);

  // Load doctors on component mount
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const activeDoctors = await getActiveDoctors();
        setDoctors(activeDoctors || []);
      } catch (error) {
        console.error("Error loading doctors:", error);
      }
    };
    loadDoctors();
  }, []);


  // Generate available times based on doctor's working hours and existing appointments
  const generateAvailableTimes = async (doctor: Doctor, selectedDate: Date) => {
    if (!doctor.workingHours) return [];

    try {
      const workingHours: WorkingHours = JSON.parse(doctor.workingHours);
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      const daySchedule = workingHours[dayOfWeek];

      if (!daySchedule || !daySchedule.isWorking) return [];

      // Pobierz istniejące wizyty dla tego lekarza w tym dniu
      const existingAppointments = await getAppointmentsByDoctorAndDate(doctor.name, selectedDate);
      console.log("📅 Istniejące wizyty dla", doctor.name, "w dniu", selectedDate.toDateString(), ":", existingAppointments.length);

      // Wyciągnij zajęte minuty od północy (porównanie niezależne od locale)
      const bookedMinutes = existingAppointments.map((appointment: any) => {
        const appointmentDate = new Date(appointment.schedule);
        return appointmentDate.getHours() * 60 + appointmentDate.getMinutes();
      });

      console.log("⏰ Zarezerwowane sloty (minuty od północy):", bookedMinutes);

      const times: string[] = [];
      const startTime = new Date(`2000-01-01T${daySchedule.start}`);
      const endTime = new Date(`2000-01-01T${daySchedule.end}`);
      const appointmentDuration = Number(doctor.appointmentDuration);
      const breakDuration = Number(doctor.breakDuration);
      const safeAppointmentDuration = Number.isFinite(appointmentDuration) && appointmentDuration > 0 ? appointmentDuration : 30;
      const safeBreakDuration = Number.isFinite(breakDuration) && breakDuration >= 0 ? breakDuration : 0;

      console.log("⏰ Harmonogram lekarza:", {
        start: daySchedule.start,
        end: daySchedule.end,
        appointmentDuration,
        breakDuration,
        totalInterval: appointmentDuration + breakDuration,
        doctorName: doctor.name,
        rawAppointmentDuration: doctor.appointmentDuration,
        rawBreakDuration: doctor.breakDuration
      });

      // Licz w minutach dla pełnej kontroli
      const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
      const endMinutes = endTime.getHours() * 60 + endTime.getMinutes();
      const step = safeAppointmentDuration + safeBreakDuration; // np. 30 + 15 = 45

      const formatTime = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      let currentMinutes = startMinutes;
      while (currentMinutes < endMinutes) {
        const timeString = formatTime(currentMinutes);
        const isBooked = bookedMinutes.includes(currentMinutes);
        console.log("🕐 Sprawdzam slot:", timeString, `(min ${currentMinutes})`, "zajęty:", isBooked);

        if (!isBooked) {
          times.push(timeString);
          console.log("✅ Dodaję godzinę:", timeString);
        } else {
          console.log("❌ Pomijam zarezerwowaną godzinę:", timeString);
        }

        currentMinutes += step;
      }

      console.log("✅ Dostępne godziny:", times);
      return times;
    } catch (error) {
      console.error("Error parsing working hours:", error);
      return [];
    }
  };

  // Get working days from doctor's schedule
  const getWorkingDays = (doctor: Doctor) => {
    if (!doctor.workingHours) return [];

    try {
      const workingHours: WorkingHours = JSON.parse(doctor.workingHours);
      const workingDaysList: string[] = [];

      Object.keys(workingHours).forEach(day => {
        if (workingHours[day].isWorking) {
          workingDaysList.push(day);
        }
      });

      return workingDaysList;
    } catch (error) {
      console.error("Error parsing working hours:", error);
      return [];
    }
  };

  // Update available times when doctor or date changes
  const handleDoctorChange = async (doctorName: string) => {
    const doctor = doctors.find(d => d.name === doctorName);
    setSelectedDoctor(doctor || null);
    
    if (doctor) {
      const workingDaysList = getWorkingDays(doctor);
      setWorkingDays(workingDaysList);
      
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
    setIsLoading(true);

    let status;
    switch (type) {
      case "schedule": {
        status = ["accepted"];
        break;
      }
      case "plan": {
        // Dla przełożenia, dodaj "scheduled" do istniejących statusów
        const currentStatuses = Array.isArray(appointment?.status) 
          ? [...appointment.status] 
          : appointment?.status 
            ? [appointment.status] 
            : ["awaiting"];
        
        // Jeśli nie ma "accepted", dodaj go (wizyta musi być potwierdzona żeby być przełożona)
        if (!currentStatuses.includes("accepted")) {
          currentStatuses.push("accepted");
        }
        // Dodaj "scheduled" (przełożona)
        currentStatuses.push("scheduled");
        status = currentStatuses;
        break;
      }
      case "cancel": {
        status = ["cancelled"];
        break;
      }
      default: {
        status = ["awaiting"];
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
          status: status as Status,
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
            status: status as Status,
            cancellationReason: values.cancellationReason,
          },
          type,
          timeZone,
        };

        const updatedAppointment = await updateAppointment(appointmentToUpdate);

        if (updatedAppointment) {
          setOpen && setOpen(false);
          form.reset();
        }
      }
    } catch (error) {
      console.error("An error occurred while scheduling an appointment:", error);
      // Możesz dodać toast notification tutaj
    }
    setIsLoading(false);
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
              {doctors.map((doctor, i) => (
                <SelectItem key={doctor.$id + i} value={doctor.name}>
                  <div className="flex cursor-pointer items-center gap-2">
                <Image
                  src={doctor.avatar || "/assets/images/dr-cameron.png"}
                  width={32}
                  height={32}
                  alt="doctor"
                  className="doctor-avatar border border-gray-200"
                />
                    <div>
                      <p className="font-medium">{doctor.name}</p>
                      <p className="text-sm text-gray-500">{doctor.specialization}</p>
                    </div>
                  </div>
                </SelectItem>
              ))}
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
    </Form>
  );
};
