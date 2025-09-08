"use client";

import { useState, useEffect } from "react";
import { Patient } from "@/types/appwrite.types";
import { getPatients } from "@/lib/actions/patient.actions";
import { PatientForm } from "./forms/PatientForm";
import { ControlledAppointmentModal } from "./ControlledAppointmentModal";
import RegisterForm from "./forms/RegisterForm";
import { XMarkIcon, UserIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { AppointmentForm } from "./forms/AppointmentForm";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

type PatientAppointmentModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
};

type Step = "select" | "existing" | "new" | "register" | "appointment";

export const PatientAppointmentModal = ({ open, onOpenChange, onSuccess }: PatientAppointmentModalProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("select");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [basicPatientData, setBasicPatientData] = useState({
    name: "",
    email: "",
    phone: ""
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (open) {
      fetchPatients();
      setCurrentStep("select");
      setSelectedPatient(null);
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const patientsData = await getPatients();
      setPatients(patientsData || []);
    } catch (error) {
      console.error("Błąd podczas pobierania pacjentów:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentStep("select");
    setSelectedPatient(null);
    setBasicPatientData({ name: "", email: "", phone: "" });
    setUser(null);
    onOpenChange(false);
  };

  const handleBasicDataSubmit = () => {
    // Tworzymy mock user z podstawowymi danymi
    const mockUser = {
      $id: "mock-user-id",
      name: basicPatientData.name,
      email: basicPatientData.email,
      phone: basicPatientData.phone
    };
    setUser(mockUser);
    setCurrentStep("register");
  };

  const handleExistingPatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep("appointment");
  };

  const handleNewPatientSuccess = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep("appointment");
  };

  const handleRegisterSuccess = (patient: Patient) => {
    setSelectedPatient(patient);
    setCurrentStep("appointment");
  };

  const handleAppointmentSuccess = () => {
    handleClose();
    onSuccess?.();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case "select":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-2xl font-bold text-white mb-2">Umów wizytę</h2>
                <p className="text-white/70">Wybierz jak chcesz umówić wizytę</p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wybór istniejącego pacjenta */}
              <button
                onClick={() => setCurrentStep("existing")}
                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center group-hover:bg-gray-400 transition-colors">
                    <UserIcon className="w-8 h-8 text-gray-800" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Istniejący pacjent</h3>
                    <p className="text-white/70 text-sm">Wybierz z listy zarejestrowanych pacjentów</p>
                  </div>
                </div>
              </button>

              {/* Rejestracja nowego pacjenta */}
              <button
                onClick={() => setCurrentStep("new")}
                className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center group-hover:bg-green-700 transition-colors">
                    <UserPlusIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Nowy pacjent</h3>
                    <p className="text-white/70 text-sm">Zarejestruj nowego pacjenta i umów wizytę</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case "existing":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Wybierz pacjenta</h2>
                <p className="text-white/70">Wybierz pacjenta z listy</p>
              </div>
              <button
                onClick={() => setCurrentStep("select")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-white/70">Ładowanie pacjentów...</div>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto space-y-3">
                {patients.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-white/70">Brak zarejestrowanych pacjentów</div>
                  </div>
                ) : (
                  patients.map((patient) => (
                    <button
                      key={patient.$id}
                      onClick={() => handleExistingPatientSelect(patient)}
                      className="w-full p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-800 font-medium">
                            {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">{patient.name}</h3>
                          <p className="text-white/70 text-sm">{patient.email}</p>
                          <p className="text-white/70 text-sm">{patient.phone}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        );

      case "new":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Rejestracja pacjenta</h2>
                <p className="text-white/70">Wypełnij dane nowego pacjenta</p>
              </div>
              <button
                onClick={() => setCurrentStep("select")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-3xl font-bold text-white mb-2">Cześć 👋</h3>
                <p className="text-white/70 text-lg">Rozpocznij umawianie wizyt.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Imię i nazwisko
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="text"
                      value={basicPatientData.name}
                      onChange={(e) => setBasicPatientData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Błażej Nowak"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      value={basicPatientData.email}
                      onChange={(e) => setBasicPatientData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="blazej.nowak@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Numer telefonu
                  </label>
                  <div className="relative">
                    <PhoneInput
                      defaultCountry="PL"
                      placeholder="+48 123 456 789"
                      international
                      withCountryCallingCode
                      value={basicPatientData.phone as any}
                      onChange={(value) => setBasicPatientData(prev => ({ ...prev, phone: value as string || "" }))}
                      className="input-phone"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleBasicDataSubmit}
                disabled={!basicPatientData.name || !basicPatientData.email || !basicPatientData.phone}
                className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-lg"
              >
                Rozpocznij
              </button>
            </div>
          </div>
        );

      case "register":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Witamy</h2>
                <p className="text-white/70">Pozwól nam poznać Cię lepiej.</p>
              </div>
              <button
                onClick={() => setCurrentStep("new")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {user && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <RegisterForm user={user} />
              </div>
            )}
          </div>
        );

      case "appointment":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Umów wizytę</h2>
                <p className="text-white/70">
                  Pacjent: <span className="text-white font-semibold">{selectedPatient?.name}</span>
                </p>
              </div>
              <button
                onClick={() => setCurrentStep("select")}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-white" />
              </button>
            </div>

            {selectedPatient && (
              <ControlledAppointmentModal
                patientId={selectedPatient.$id}
                userId={selectedPatient.userid || selectedPatient.userId}
                type="create"
                title="Umów wizytę"
                description={`Umów wizytę dla pacjenta: ${selectedPatient.name}`}
                open={true}
                onOpenChange={() => {}}
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!open) return null;

    return (
      <div className="fixed top-[-60px] left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-black rounded-xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
          <div className="p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>
    );
};
