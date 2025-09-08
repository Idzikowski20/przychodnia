"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils";
import { Patient, Appointment } from "@/types/appwrite.types";
import { getAppointmentsByPatient } from "@/lib/actions/appointment.actions";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";

type PatientHistoryModalProps = {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
};

export const PatientHistoryModal = ({ 
  patient, 
  isOpen, 
  onClose 
}: PatientHistoryModalProps) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchAppointments = async () => {
        try {
          console.log("🔍 PatientHistoryModal - patient.userId:", patient.userId);
          console.log("🔍 PatientHistoryModal - patient.$id:", patient.$id);
          console.log("🔍 PatientHistoryModal - patient.userid:", patient.userid);
          
          // Próbujemy najpierw po userid (ID użytkownika z Appwrite), a potem po userId jeśli nie ma wyników
          let appointmentsData = await getAppointmentsByPatient(patient.userid);
          console.log("📋 Wyniki po userid:", appointmentsData);
          
          // Jeśli nie ma wyników po userid, spróbuj po userId
          if (!appointmentsData || appointmentsData.length === 0) {
            console.log("🔄 Próbuję po userId...");
            appointmentsData = await getAppointmentsByPatient(patient.userId);
            console.log("📋 Wyniki po userId:", appointmentsData);
          }
          
          setAppointments(appointmentsData || []);
        } catch (error) {
          console.error("Błąd podczas pobierania wizyt:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchAppointments();
    }
  }, [isOpen, patient.userId, patient.$id, patient.userid]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-dark-300 backdrop-blur-md border border-white/20 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-semibold text-white">Historia wizyt</h2>
              <p className="text-white/70 mt-1">{patient.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAppointmentModal(true)}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
              >
                Umów
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/70">Ładowanie historii wizyt...</div>
              </div>
            ) : appointments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white/70">Brak wizyt w historii</div>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((appointment) => {
                  // Parsowanie statusu dla lepszego wyświetlania
                  let statuses: string[];
                  if (Array.isArray(appointment.status)) {
                    statuses = appointment.status;
                  } else {
                    statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
                  }
                  if (statuses.length === 0) {
                    statuses = ["awaiting"];
                  }

                  const hasAccepted = statuses.includes("accepted");
                  const hasCancelled = statuses.includes("cancelled");
                  const hasScheduled = statuses.includes("scheduled");
                  const hasAwaiting = statuses.includes("awaiting") || statuses.includes("pending");
                  const hasCompleted = statuses.includes("completed");

                  // Określenie czy wizyta się odbyła
                  const isCompleted = appointment.isCompleted || hasCompleted;
                  const isCancelled = hasCancelled;
                  const isUpcoming = hasAccepted && !isCompleted && !isCancelled;
                  const isPending = hasAwaiting && !hasAccepted && !isCompleted && !isCancelled;

                  return (
                    <div
                      key={appointment.$id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold text-white">
                              {formatDateTime(appointment.schedule).dateTime}
                            </h3>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isCompleted ? 'bg-green-500/20 text-green-400' :
                              isCancelled ? 'bg-red-500/20 text-red-400' :
                              isUpcoming ? 'bg-blue-500/20 text-blue-400' :
                              isPending ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {isCompleted ? 'Odbyta' :
                               isCancelled ? 'Anulowana' :
                               isUpcoming ? 'Potwierdzona' :
                               isPending ? 'Oczekująca' : 'Nieznany'}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-white/70">Lekarz:</span>
                                <p className="text-white">{appointment.primaryPhysician}</p>
                              </div>
                              
                              <div>
                                <span className="text-sm font-medium text-white/70">Powód wizyty:</span>
                                <p className="text-white">{appointment.reason || "Nie podano"}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div>
                                <span className="text-sm font-medium text-white/70">Notatki:</span>
                                <p className="text-white">{appointment.note || "Brak notatek"}</p>
                              </div>
                              
                              {appointment.cancellationReason && (
                                <div>
                                  <span className="text-sm font-medium text-white/70">Powód anulowania:</span>
                                  <p className="text-red-400">{appointment.cancellationReason}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal do umówienia nowej wizyty */}
      <ControlledAppointmentModal
        patientId={patient.$id}
        userId={patient.userid || patient.userId}
        type="create"
        title="Umów nową wizytę"
        description="Umów nową wizytę dla tego pacjenta."
        open={showAppointmentModal}
        onOpenChange={setShowAppointmentModal}
      />
    </>
  );
};
