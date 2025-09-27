"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentNotesModal } from "./AppointmentNotesModal";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";
import { StatusBadge } from "./StatusBadge";

export const AppointmentDetailsContent = ({
  appointment,
  userId,
  patientId,
}: {
  appointment: Appointment;
  userId: string;
  patientId: string;
}) => {
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<"schedule" | "plan" | "cancel" | "create">("schedule");

  const doctor = Doctors.find((doctor) => doctor.name === appointment.primaryPhysician);

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
  const isCompleted = appointment.isCompleted || false;

  const handleAction = (type: "schedule" | "plan" | "cancel" | "create") => {
    setActionType(type);
    setShowActionModal(true);
  };

  return (
    <>
      <div className="space-y-8">
        {/* Informacje o wizycie */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Informacje o wizycie
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Status</label>
              <StatusBadge status={appointment.status} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Data i godzina</label>
              <p className="text-gray-900">{formatDateTime(appointment.schedule).dateTime}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Lekarz</label>
              <div className="flex items-center gap-3">
                <Image
                  src={appointment.doctorAvatar || doctor?.image || "/assets/images/dr-green.png"}
                  alt={appointment.primaryPhysician}
                  width={32}
                  height={32}
                  className="rounded-full border border-gray-300 object-cover"
                />
                <span className="text-gray-900">Dr. {appointment.primaryPhysician}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Powód wizyty</label>
              <p className="text-gray-900 bg-gray-100 p-3 rounded-md">{appointment.reason}</p>
            </div>

            {appointment.note && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notatki</label>
                <p className="text-gray-900 bg-gray-100 p-3 rounded-md">{appointment.note}</p>
              </div>
            )}

            {appointment.cancellationReason && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Powód anulowania</label>
                <p className="text-red-600 bg-red-50 p-3 rounded-md">{appointment.cancellationReason}</p>
              </div>
            )}

            {appointment.rescheduleNote && (
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Notatka przełożenia</label>
                <p className="text-blue-600 bg-blue-50 p-3 rounded-md">{appointment.rescheduleNote}</p>
              </div>
            )}
          </div>
        </section>

        {/* Informacje o pacjencie */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Dane osobowe pacjenta
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Imię i nazwisko</label>
              <p className="text-gray-900">{appointment.patient?.name || "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Email</label>
              <p className="text-gray-900">{appointment.patient?.email || "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Numer telefonu</label>
              <p className="text-gray-900">{appointment.patient?.phone || "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Data urodzenia</label>
              <p className="text-gray-900">{appointment.patient?.birthDate ? formatDateTime(appointment.patient.birthDate).dateOnly : "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Płeć</label>
              <p className="text-gray-900">
                {appointment.patient?.gender === "male" ? "Mężczyzna" :
                 appointment.patient?.gender === "female" ? "Kobieta" :
                 appointment.patient?.gender === "others" ? "Inna" : appointment.patient?.gender}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Adres</label>
              <p className="text-gray-900">{appointment.patient?.address || "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Zawód</label>
              <p className="text-gray-900">{appointment.patient?.occupation || "Nie podano"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Lekarz prowadzący</label>
              <p className="text-gray-900">{appointment.patient?.primaryPhysician || "Brak danych"}</p>
            </div>
          </div>
        </section>

        {/* Kontakt awaryjny */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Kontakt awaryjny
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Imię i nazwisko</label>
              <p className="text-gray-900">{appointment.patient?.emergencyContactName || "Brak danych"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Numer telefonu</label>
              <p className="text-gray-900">{appointment.patient?.emergencyContactNumber || "Brak danych"}</p>
            </div>
          </div>
        </section>

        {/* Informacje medyczne */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Informacje medyczne
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Ubezpieczyciel</label>
              <p className="text-gray-900">{appointment.patient?.insuranceProvider || "Nie podano"}</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Numer polisy</label>
              <p className="text-gray-900">{appointment.patient?.insurancePolicyNumber || "Brak danych"}</p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Alergie</label>
              <p className="text-gray-900 bg-gray-100 p-3 rounded-md">
                {appointment.patient?.allergies || "Brak alergii"}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Aktualnie przyjmowane leki</label>
              <p className="text-gray-900 bg-gray-100 p-3 rounded-md">
                {appointment.patient?.currentMedication || "Brak leków"}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Historia medyczna rodziny</label>
              <p className="text-gray-900 bg-gray-100 p-3 rounded-md">
                {appointment.patient?.familyMedicalHistory || "Brak informacji"}
              </p>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-600">Przebyte choroby</label>
              <p className="text-gray-900 bg-gray-100 p-3 rounded-md">
                {appointment.patient?.pastMedicalHistory || "Brak informacji"}
              </p>
            </div>
          </div>
        </section>

        {/* Zgody i prywatność */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
            Zgody i prywatność
          </h3>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${appointment.patient?.privacyConsent ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-gray-900">Zgoda na politykę prywatności</span>
            </div>
          </div>
        </section>

        {/* Akcje */}
        <section className="space-y-4 pt-6 border-t border-gray-300">
          <h3 className="text-lg font-semibold text-gray-900">Akcje</h3>
          
          <div className="flex gap-3 flex-wrap">
            {isCompleted ? (
              // Akcje dla odbytych wizyt
              <>
                <AppointmentNotesModal appointment={appointment} />
                <button
                  onClick={() => handleAction("create")}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-gray-900 rounded-lg transition-colors font-medium"
                >
                  Umów ponownie
                </button>
                <ControlledAppointmentModal
                  userId={userId}
                  patientId={patientId || appointment.userId}
                  type="create"
                  appointment={appointment}
                  title="Umów ponownie"
                  description="Umów nową wizytę dla tego pacjenta."
                  open={showActionModal}
                  onOpenChange={setShowActionModal}
                />
              </>
            ) : (
              // Akcje dla nieodbytych wizyt
              <>
                {hasAwaiting && (
                  <button
                    onClick={() => handleAction("schedule")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-gray-900 rounded-lg transition-colors font-medium"
                  >
                    Potwierdź wizytę
                  </button>
                )}
                
                {hasAccepted && (
                  <button
                    onClick={() => handleAction("plan")}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-gray-900 rounded-lg transition-colors font-medium"
                  >
                    Przełóż wizytę
                  </button>
                )}
                
                {!hasCancelled && (
                  <button
                    onClick={() => handleAction("cancel")}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-gray-900 rounded-lg transition-colors font-medium"
                  >
                    Anuluj wizytę
                  </button>
                )}
              </>
            )}
          </div>
        </section>
      </div>

      {/* Modal akcji */}
      <ControlledAppointmentModal
        userId={userId}
        patientId={patientId || appointment.userId}
        type={actionType}
        appointment={appointment}
        title={
          actionType === "schedule" ? "Potwierdź wizytę" :
          actionType === "plan" ? "Przełóż wizytę" : "Anuluj wizytę"
        }
        description={
          actionType === "schedule" ? "Proszę potwierdzić następujące szczegóły, aby potwierdzić wizytę" :
          actionType === "plan" ? "Proszę ustawić konkretną datę i godzinę wizyty" :
          "Proszę wypełnić następujące szczegóły, aby anulować wizytę"
        }
        open={showActionModal}
        onOpenChange={setShowActionModal}
      />
    </>
  );
};
