"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentNotesModal } from "./AppointmentNotesModal";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";
import { StatusBadge } from "./StatusBadge";

type CalendarAppointmentModalProps = {
  appointment: Appointment;
  isOpen: boolean;
  onClose: () => void;
};

export const CalendarAppointmentModal = ({ 
  appointment, 
  isOpen, 
  onClose 
}: CalendarAppointmentModalProps) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"schedule" | "plan" | "cancel" | "create">("schedule");

  if (!isOpen) return null;

  // Parsowanie statusu dla przycisków akcji
  let statuses: string[];
  if (Array.isArray(appointment.status)) {
    statuses = appointment.status;
  } else {
    statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
  }
  if (statuses.length === 0) {
    statuses = ["awaiting"];
  }

  const hasAwaiting = statuses.includes("awaiting") || statuses.includes("pending");
  const hasAccepted = statuses.includes("accepted");
  const hasCancelled = statuses.includes("cancelled");
  const hasCompleted = statuses.includes("completed");
  
  // Określenie czy wizyta się odbyła
  const isCompleted = appointment.isCompleted || hasCompleted;

  const handleAction = (type: "schedule" | "plan" | "cancel" | "create") => {
    setActionType(type);
    setShowActionModal(true);
  };



  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-dark-300 backdrop-blur-md border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Szczegóły wizyty</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white/70">Status:</span>
              <StatusBadge status={appointment.status} />
            </div>

            {/* Informacje o wizycie */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Data i godzina</label>
                <p className="text-white font-medium">{formatDateTime(appointment.schedule).dateTime}</p>
              </div>
              
               <div className="space-y-2">
                 <label className="text-sm font-medium text-white/70">Lekarz</label>
                 <div className="flex items-center gap-3">
                   {appointment.doctorAvatar ? (
                     <img src={appointment.doctorAvatar} alt={appointment.primaryPhysician} className="w-10 h-10 rounded-full object-cover border border-white/20" />
                   ) : (
                     <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                       <span className="text-white text-sm font-medium">
                         {appointment.primaryPhysician.split(' ').map(n => n[0]).join('')}
                       </span>
                     </div>
                   )}
                   <p className="text-white font-medium">{appointment.primaryPhysician}</p>
                 </div>
               </div>
            </div>

            {/* Gabinet */}
            {appointment.roomName && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Gabinet</label>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: appointment.roomColor || '#3B82F6' }}
                  />
                  <p className="text-white font-medium">
                    {appointment.roomName.replace(/^Gabinet\s*/i, '')}
                  </p>
                </div>
              </div>
            )}

            {/* Powód wizyty */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Powód wizyty</label>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-white">{appointment.reason || "Nie podano"}</p>
              </div>
            </div>

            {/* Notatki */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Notatki</label>
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <p className="text-white">{appointment.note || "Brak notatek"}</p>
              </div>
            </div>

            {/* Dane pacjenta */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Dane pacjenta
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Imię i nazwisko</label>
                  <p className="text-white">{appointment.patient?.name || 'Brak danych'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Email</label>
                  <p className="text-white">{appointment.patient?.email || 'Brak danych'}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Telefon</label>
                  <p className="text-white">{appointment.patient?.phone || 'Brak danych'}</p>
                </div>
                
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-white/70">Data urodzenia</label>
                   <p className="text-white">{appointment.patient?.birthDate ? formatDateTime(appointment.patient.birthDate).dateOnly : 'Brak danych'}</p>
                 </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Płeć</label>
                  <p className="text-white">
                    {appointment.patient?.gender === "male" ? "Mężczyzna" :
                     appointment.patient?.gender === "female" ? "Kobieta" : "Inna"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Adres</label>
                  <p className="text-white">{appointment.patient?.address || 'Brak danych'}</p>
                </div>
              </div>
            </div>

            {/* Przyciski akcji */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
              {isCompleted ? (
                // Akcje dla odbytych wizyt
                <>
                  <AppointmentNotesModal appointment={appointment} />
                  <button
                    onClick={() => handleAction("create")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Umów ponownie
                  </button>
                </>
              ) : (
                // Akcje dla nieodbytych wizyt
                <>
                  {hasAwaiting && (
                    <button
                      onClick={() => handleAction("schedule")}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Potwierdź wizytę
                    </button>
                  )}
                  
                  {hasAccepted && (
                    <button
                      onClick={() => handleAction("plan")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Przełóż wizytę
                    </button>
                  )}
                  
                  {!hasCancelled && (
                    <button
                      onClick={() => handleAction("cancel")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                    >
                      Anuluj wizytę
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal akcji - wyższy z-index */}
      <ControlledAppointmentModal
        userId={appointment.userId}
        patientId={appointment.patient?.$id || appointment.userId}
        type={actionType}
        appointment={appointment}
        title={
          actionType === "schedule" ? "Potwierdź wizytę" :
          actionType === "plan" ? "Przełóż wizytę" :
          actionType === "create" ? "Umów ponownie" : "Anuluj wizytę"
        }
        description={
          actionType === "schedule" ? "Proszę potwierdzić następujące szczegóły, aby potwierdzić wizytę" :
          actionType === "plan" ? "Proszę ustawić konkretną datę i godzinę wizyty" :
          actionType === "create" ? "Umów nową wizytę dla tego pacjenta." :
          "Proszę wypełnić następujące szczegóły, aby anulować wizytę"
        }
        open={showActionModal}
        onOpenChange={setShowActionModal}
      />
    </>
  );
};
