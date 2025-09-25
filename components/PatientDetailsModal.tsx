"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useState } from "react";

import { Doctors } from "@/constants";
import { formatDateTime } from "@/lib/utils";
import BookingModal from "./BookingModal";
import { Patient } from "@/types/appwrite.types";

type PatientDetailsModalProps = {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
};

export const PatientDetailsModal = ({ 
  patient, 
  isOpen, 
  onClose 
}: PatientDetailsModalProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  if (!isOpen) return null;

  // Znajdź lekarza po nazwisku
  const doctor = Doctors.find(d => d.name === patient.primaryPhysician);

  const handleBookingClick = () => {
    setIsBookingModalOpen(true);
  };

  const handleBookingModalClose = () => {
    setIsBookingModalOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Modal */}
        <div 
          className="bg-dark-300 backdrop-blur-md border border-white/20 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Szczegóły pacjenta</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Dane osobowe */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Dane osobowe
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Imię i nazwisko</label>
                  <p className="text-white font-medium">{patient.name}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Email</label>
                  <p className="text-white">{patient.email}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Numer telefonu</label>
                  <p className="text-white">{patient.phone}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Data urodzenia</label>
                  <p className="text-white">{formatDateTime(patient.birthDate).dateOnly}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Płeć</label>
                  <p className="text-white">
                    {patient.gender === "male" ? "Mężczyzna" :
                     patient.gender === "female" ? "Kobieta" : "Inna"}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Adres</label>
                  <p className="text-white">{patient.address}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Zawód</label>
                  <p className="text-white">{patient.occupation}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Lekarz prowadzący</label>
                  <div className="flex items-center gap-3">
                    {doctor?.image && (
                      <Image
                        src={doctor.image}
                        alt={patient.primaryPhysician}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    )}
                    <p className="text-white">{patient.primaryPhysician}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Kontakt awaryjny */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Kontakt awaryjny
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Imię i nazwisko</label>
                  <p className="text-white">{patient.emergencyContactName}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Numer telefonu</label>
                  <p className="text-white">{patient.emergencyContactNumber}</p>
                </div>
              </div>
            </section>

            {/* Ubezpieczenie */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Ubezpieczenie
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Dostawca ubezpieczenia</label>
                  <p className="text-white">{patient.insuranceProvider}</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Numer polisy</label>
                  <p className="text-white">{patient.insurancePolicyNumber}</p>
                </div>
              </div>
            </section>

            {/* Historia medyczna */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Historia medyczna
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Alergie</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white">{patient.allergies || "Brak alergii"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Aktualne leki</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white">{patient.currentMedication || "Brak leków"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Historia rodzinna</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white">{patient.familyMedicalHistory || "Brak informacji"}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Przeszła historia medyczna</label>
                  <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                    <p className="text-white">{patient.pastMedicalHistory || "Brak informacji"}</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Zgody */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Zgody
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${patient.privacyConsent ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-white">
                    Zgoda na politykę prywatności: {patient.privacyConsent ? 'Tak' : 'Nie'}
                  </span>
                </div>
              </div>
            </section>

            {/* Akcje */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">
                Akcje
              </h3>
              
              <div className="flex gap-3">
                <button
                  onClick={handleBookingClick}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Umów ponownie
                </button>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modal nowego systemu rezerwacji */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={handleBookingModalClose}
        userId={patient.userid || patient.userId}
        patientId={patient.$id}
        patientName={patient.name}
        onBookingComplete={(appointmentId) => {
          console.log("Wizyta umówiona:", appointmentId);
          handleBookingModalClose();
        }}
      />
    </>
  );
};
