"use client";

import { useState, useEffect } from "react";
import { Patient } from "@/types/appwrite.types";
import { getPatients } from "@/lib/actions/patient.actions";
import { PatientDetailsModal } from "./PatientDetailsModal";
import { PatientHistoryModal } from "./PatientHistoryModal";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";

export const PatientsList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(patientsData || []);
      } catch (error) {
        console.error("Błąd podczas pobierania pacjentów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleDetailsClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const handleHistoryClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsHistoryModalOpen(true);
  };

  const handleAppointmentClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsAppointmentModalOpen(true);
  };

  const handleDetailsModalClose = () => {
    setIsDetailsModalOpen(false);
    setSelectedPatient(null);
  };

  const handleHistoryModalClose = () => {
    setIsHistoryModalOpen(false);
    setSelectedPatient(null);
  };

  const handleAppointmentModalClose = () => {
    setIsAppointmentModalOpen(false);
    setSelectedPatient(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Ładowanie pacjentów...</div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Brak zarejestrowanych pacjentów</div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Lista pacjentów</h2>
          <p className="text-white/70 mt-1">Wszyscy zarejestrowani pacjenci</p>
        </div>
        
        <div className="overflow-x-visible">
          <table className="w-full min-w-[1200px]">
            <thead className="bg-white/5">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Pacjent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Kontakt
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Płeć
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                  Lekarz prowadzący
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider min-w-[200px]">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {patients.map((patient) => (
                <tr key={patient.$id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{patient.name}</div>
                        <div className="text-sm text-white/70">{patient.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{patient.email}</div>
                    <div className="text-sm text-white/70">{patient.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {patient.gender === "male" ? "Mężczyzna" :
                     patient.gender === "female" ? "Kobieta" : "Inna"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                    {patient.primaryPhysician}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap min-w-[200px]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDetailsClick(patient)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        Szczegóły
                      </button>
                      <button
                        onClick={() => handleHistoryClick(patient)}
                        className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        Historia
                      </button>
                      <button
                        onClick={() => handleAppointmentClick(patient)}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                      >
                        Umów
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal szczegółów pacjenta */}
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          isOpen={isDetailsModalOpen}
          onClose={handleDetailsModalClose}
        />
      )}

      {/* Modal historii wizyt */}
      {selectedPatient && (
        <PatientHistoryModal
          patient={selectedPatient}
          isOpen={isHistoryModalOpen}
          onClose={handleHistoryModalClose}
        />
      )}

      {/* Modal umówienia wizyty */}
      {selectedPatient && (
        <ControlledAppointmentModal
          patientId={selectedPatient.$id}
          userId={selectedPatient.userid || selectedPatient.userId}
          type="create"
          title="Umów nową wizytę"
          description="Umów nową wizytę dla tego pacjenta."
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
        />
      )}
    </>
  );
};
