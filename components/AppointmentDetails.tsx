"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentNotesModal } from "./AppointmentNotesModal";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";
import { StatusBadge } from "./StatusBadge";

export const AppointmentDetails = ({
  appointment,
  userId,
  patientId,
}: {
  appointment: Appointment;
  userId: string;
  patientId: string;
}) => {
  const [open, setOpen] = useState(false);
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
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="px-3 py-1.5 bg-transparent hover:bg-gray-100 text-black border border-gray-300 rounded-[0.25rem] text-sm">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2.45448 13.8008C1.84656 12.6796 1.84656 11.3204 2.45447 10.1992C4.29523 6.80404 7.87965 4.5 11.9999 4.5C16.1202 4.5 19.7046 6.80404 21.5454 10.1992C22.1533 11.3204 22.1533 12.6796 21.5454 13.8008C19.7046 17.196 16.1202 19.5 11.9999 19.5C7.87965 19.5 4.29523 17.196 2.45448 13.8008Z" stroke="black" strokeWidth="1"/>
                <path d="M15.0126 11.9551C15.0126 13.6119 13.6695 14.9551 12.0126 14.9551C10.3558 14.9551 9.01263 13.6119 9.01263 11.9551C9.01263 10.2982 10.3558 8.95508 12.0126 8.95508C13.6695 8.95508 15.0126 10.2982 15.0126 11.9551Z" stroke="black" strokeWidth="1"/>
              </svg>
              Szczegóły
            </div>
          </button>
        </DialogTrigger>
        <DialogContent className="shad-dialog max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-6 space-y-3">
            <DialogTitle className="text-2xl">Szczegóły wizyty</DialogTitle>
            <DialogDescription>
              Pełne informacje o wizycie i pacjencie
            </DialogDescription>
          </DialogHeader>

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
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
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
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
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
            </section>
          </div>
        </DialogContent>
      </Dialog>

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
