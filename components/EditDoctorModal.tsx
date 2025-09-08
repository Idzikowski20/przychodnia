"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Doctor } from "@/types/appwrite.types";
import { updateDoctor } from "@/lib/actions/doctor.actions";
import { uploadFileToStorage } from "@/lib/upload";
import { FileUploader } from "./FileUploader";

type EditDoctorModalProps = {
  doctor: Doctor | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDoctorUpdated?: () => void;
};

export const EditDoctorModal = ({ 
  doctor, 
  open, 
  onOpenChange, 
  onDoctorUpdated 
}: EditDoctorModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    specialization: "",
    licenseNumber: "",
    bio: "",
    appointmentDuration: "",
    breakDuration: "",
    maxAppointmentsPerDay: "",
    consultationFee: "",
    currency: "",
    notes: "",
    isActive: true,
    avatar: "",
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        name: doctor.name || "",
        email: doctor.email || "",
        phone: doctor.phone || "",
        specialization: doctor.specialization || "",
        licenseNumber: doctor.licenseNumber || "",
        bio: doctor.bio || "",
        appointmentDuration: doctor.appointmentDuration || "",
        breakDuration: doctor.breakDuration || "",
        maxAppointmentsPerDay: doctor.maxAppointmentsPerDay || "",
        consultationFee: doctor.consultationFee || "",
        currency: doctor.currency || "",
        notes: doctor.notes || "",
        isActive: doctor.isActive || true,
        avatar: doctor.avatar || "",
      });
    }
  }, [doctor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      let avatarUrl = formData.avatar;
      
      // Wgraj nowy plik do Appwrite Storage jeśli został wybrany
      if (files.length > 0) {
        avatarUrl = await uploadFileToStorage(files[0]);
      }

      const updatedData = {
        ...formData,
        avatar: avatarUrl,
      };
      
      await updateDoctor({
        doctorId: doctor.$id,
        doctor: updatedData,
      });
      onDoctorUpdated?.();
      onOpenChange(false);
      setFiles([]);
    } catch (error) {
      console.error("Błąd podczas aktualizacji doktora:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!doctor) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="shad-dialog sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="mb-4 space-y-3">
          <DialogTitle>Edytuj specjalistę - {doctor.name}</DialogTitle>
          <DialogDescription>
            Zaktualizuj informacje o specjalistę.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Podstawowe informacje */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Podstawowe informacje</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
              <div className="space-y-2">
                <label className="text-white font-medium">Imię i nazwisko</label>
                <input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Telefon</label>
                <input
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Specjalizacja</label>
                <input
                  value={formData.specialization}
                  onChange={(e) => handleInputChange("specialization", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Numer licencji</label>
                <input
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Waluta</label>
                <input
                  value={formData.currency}
                  onChange={(e) => handleInputChange("currency", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Biografia</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                rows={5}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Wgrywanie zdjęcia */}
            <div className="space-y-2">
              <label className="text-white font-medium">Zdjęcie specjalisty</label>
              <div className="w-full">
                <FileUploader files={files} onChange={setFiles} />
              </div>
              {formData.avatar && !files.length && (
                <div className="mt-2">
                  <p className="text-white/70 text-sm mb-2">Aktualne zdjęcie:</p>
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img
                      src={formData.avatar}
                      alt="Aktualne zdjęcie"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Ustawienia wizyt */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Ustawienia wizyt</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-white font-medium">Długość wizyty</label>
                <input
                  value={formData.appointmentDuration}
                  onChange={(e) => handleInputChange("appointmentDuration", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Przerwa między wizytami</label>
                <input
                  value={formData.breakDuration}
                  onChange={(e) => handleInputChange("breakDuration", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-white font-medium">Maks. wizyt dziennie</label>
                <input
                  value={formData.maxAppointmentsPerDay}
                  onChange={(e) => handleInputChange("maxAppointmentsPerDay", e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Opłata za konsultację</label>
              <input
                value={formData.consultationFee}
                onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>


          {/* Status i notatki */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => handleInputChange("isActive", e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-white font-medium">
                Aktywny specjalista
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-white font-medium">Notatki administracyjne</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-green-700 hover:bg-green-800 disabled:bg-green-800 text-white rounded-lg transition-colors font-medium"
            >
              {isSubmitting ? "Zapisywanie..." : "Zapisz zmiany"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
