"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createDoctor } from "@/lib/actions/doctor.actions";
import { uploadFileToStorage } from "@/lib/upload";
import { WorkingHours } from "@/types/appwrite.types";

import { FileUploader } from "../FileUploader";
import SubmitButton from "../SubmitButton";

const doctorSchema = z.object({
  name: z.string().min(2, "Imię i nazwisko musi mieć co najmniej 2 znaki"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z.string().min(9, "Numer telefonu musi mieć co najmniej 9 znaków"),
  specialization: z.string().min(2, "Specjalizacja jest wymagana"),
  licenseNumber: z.string().min(5, "Numer licencji musi mieć co najmniej 5 znaków"),
  bio: z.string().optional(),
  appointmentDuration: z.string().min(1, "Długość wizyty jest wymagana"),
  breakDuration: z.string().min(1, "Długość przerwy jest wymagana"),
  maxAppointmentsPerDay: z.string().min(1, "Maksymalna liczba wizyt jest wymagana"),
  consultationFee: z.string().min(1, "Opłata jest wymagana"),
  currency: z.string().min(3, "Waluta jest wymagana"),
  notes: z.string().optional(),
  avatar: z.string().optional(),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

const defaultWorkingHours: WorkingHours = {
  monday: { start: "08:00", end: "16:00", isWorking: true },
  tuesday: { start: "08:00", end: "16:00", isWorking: true },
  wednesday: { start: "08:00", end: "16:00", isWorking: true },
  thursday: { start: "08:00", end: "16:00", isWorking: true },
  friday: { start: "08:00", end: "16:00", isWorking: true },
  saturday: { start: "09:00", end: "13:00", isWorking: false },
  sunday: { start: "09:00", end: "13:00", isWorking: false },
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

type DoctorFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
  isAdminModal?: boolean;
};

export const DoctorForm = ({ onSuccess, onCancel, isAdminModal = false }: DoctorFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workingHours, setWorkingHours] = useState<WorkingHours>(defaultWorkingHours);
  const [files, setFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      appointmentDuration: "30",
      breakDuration: "15",
      maxAppointmentsPerDay: "10",
      consultationFee: "150",
      currency: "PLN",
    },
  });

  const onSubmit = async (data: DoctorFormData) => {
    setIsSubmitting(true);
    try {
      let avatarUrl = "";
      
      // Wgraj plik do Appwrite Storage jeśli został wybrany
      if (files.length > 0) {
        avatarUrl = await uploadFileToStorage(files[0]);
      }

      const doctorData = {
        ...data,
        isActive: true,
        workingHours: JSON.stringify(workingHours),
        avatar: avatarUrl,
      };

      await createDoctor(doctorData);
      reset();
      setWorkingHours(defaultWorkingHours);
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error("Błąd podczas dodawania doktora:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateWorkingHours = (day: string, field: 'start' | 'end' | 'isWorking', value: string | boolean) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Podstawowe informacje */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Podstawowe informacje</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Imię i nazwisko</label>
            <input
              {...register("name")}
              placeholder="Dr. Jan Kowalski"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="jan.kowalski@example.com"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Telefon</label>
            <input
              {...register("phone")}
              placeholder="+48 123 456 789"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.phone && <p className="text-red-400 text-sm">{errors.phone.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Specjalizacja</label>
            <input
              {...register("specialization")}
              placeholder="Medycyna rodzinna"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.specialization && <p className="text-red-400 text-sm">{errors.specialization.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Numer licencji</label>
            <input
              {...register("licenseNumber")}
              placeholder="1234567"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.licenseNumber && <p className="text-red-400 text-sm">{errors.licenseNumber.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-white font-medium">Biografia</label>
          <textarea
            {...register("bio")}
            placeholder="Krótki opis doświadczenia i specjalizacji..."
            rows={3}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {errors.bio && <p className="text-red-400 text-sm">{errors.bio.message}</p>}
        </div>

        {/* Wgrywanie zdjęcia */}
        <div className="space-y-2">
          <label className="text-white font-medium">Zdjęcie specjalisty</label>
          <div className="w-full">
            <FileUploader files={files} onChange={setFiles} />
          </div>
          {errors.avatar && <p className="text-red-400 text-sm">{errors.avatar.message}</p>}
        </div>
      </div>

      {/* Ustawienia wizyt */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Ustawienia wizyt</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Długość wizyty (min)</label>
            <input
              {...register("appointmentDuration")}
              placeholder="30"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.appointmentDuration && <p className="text-red-400 text-sm">{errors.appointmentDuration.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Przerwa między wizytami (min)</label>
            <input
              {...register("breakDuration")}
              placeholder="15"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.breakDuration && <p className="text-red-400 text-sm">{errors.breakDuration.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Maks. wizyt dziennie</label>
            <input
              {...register("maxAppointmentsPerDay")}
              placeholder="10"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.maxAppointmentsPerDay && <p className="text-red-400 text-sm">{errors.maxAppointmentsPerDay.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-white font-medium">Opłata za konsultację</label>
            <input
              {...register("consultationFee")}
              placeholder="150"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.consultationFee && <p className="text-red-400 text-sm">{errors.consultationFee.message}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-white font-medium">Waluta</label>
            <input
              {...register("currency")}
              placeholder="PLN"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.currency && <p className="text-red-400 text-sm">{errors.currency.message}</p>}
          </div>
        </div>
      </div>


      {/* Harmonogram pracy */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Harmonogram pracy</h3>
        
        <div className="space-y-3">
          {Object.entries(dayNames).map(([day, dayName]) => (
            <div key={day} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-2 min-w-[120px]">
                <input
                  type="checkbox"
                  checked={workingHours[day].isWorking}
                  onChange={(e) => updateWorkingHours(day, 'isWorking', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                />
                <span className="text-white font-medium">{dayName}</span>
              </div>
              
              {workingHours[day].isWorking && (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={workingHours[day].start}
                    onChange={(e) => updateWorkingHours(day, 'start', e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                  <span className="text-white/70">-</span>
                  <input
                    type="time"
                    value={workingHours[day].end}
                    onChange={(e) => updateWorkingHours(day, 'end', e.target.value)}
                    className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Notatki */}
      <div className="space-y-2">
        <label className="text-white font-medium">Notatki administracyjne</label>
        <textarea
          {...register("notes")}
          placeholder="Dodatkowe informacje o doktorze..."
          rows={3}
          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {errors.notes && <p className="text-red-400 text-sm">{errors.notes.message}</p>}
      </div>

      {/* Przyciski */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
          >
            Anuluj
          </button>
        )}
        <SubmitButton isLoading={isSubmitting}>
          Dodaj doktora
        </SubmitButton>
      </div>
    </form>
  );
};
