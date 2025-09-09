"use client";

import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useMemo, useState, useEffect } from "react";

import { getPatients } from "@/lib/actions/patient.actions";
import { Patient } from "@/types/appwrite.types";

import { ControlledAppointmentModal } from "./ControlledAppointmentModal";
import { PatientDetailsModal } from "./PatientDetailsModal";
import { PatientHistoryModal } from "./PatientHistoryModal";

export const PatientsList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [showGenderDropdown, setShowGenderDropdown] = useState(false);

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

  // usunięte: nieużywana funkcja handleAppointmentModalClose

  // Filtered patients based on search and filters
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const matchesSearch = 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone.includes(searchTerm) ||
        patient.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.primaryPhysician.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesGender = genderFilter === "all" || patient.gender === genderFilter;
      
      return matchesSearch && matchesGender;
    });
  }, [patients, searchTerm, genderFilter]);

  const clearFilters = () => {
    setSearchTerm("");
    setGenderFilter("all");
  };

  const genderOptions = [
    { value: "all", label: "Wszystkie" },
    { value: "male", label: "Mężczyźni" },
    { value: "female", label: "Kobiety" },
    { value: "other", label: "Inne" }
  ];

  const selectedGenderLabel = genderOptions.find(option => option.value === genderFilter)?.label || "Wszystkie";

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Lista pacjentów</h2>
              <p className="text-white/70 mt-1">
                {filteredPatients.length} z {patients.length} pacjentów
              </p>
            </div>
            
            {/* Search and Filter Controls */}
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search Input */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                <input
                  type="text"
                  placeholder="Szukaj pacjentów..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full md:w-64"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Filter Toggle Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters || genderFilter !== "all"
                    ? "bg-blue-600 text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                <FunnelIcon className="w-4 h-4" />
                <span className="hidden md:inline">Filtry</span>
              </button>
            </div>
          </div>
          
          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Płeć
                  </label>
                  <div className="relative">
                    <button
                      onClick={() => setShowGenderDropdown(!showGenderDropdown)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between"
                    >
                      <span>{selectedGenderLabel}</span>
                      <ChevronDownIcon className={`w-4 h-4 transition-transform ${showGenderDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showGenderDropdown && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-300 border border-gray-400 rounded-lg shadow-lg z-10">
                        {genderOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => {
                              setGenderFilter(option.value);
                              setShowGenderDropdown(false);
                            }}
                            className={`w-full px-3 py-2 text-left text-gray-800 hover:bg-gray-400 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                              genderFilter === option.value ? 'bg-gray-400' : ''
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm border border-white/10"
                  >
                    Wyczyść filtry
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-white/50 text-4xl mb-4">🔍</div>
              <p className="text-white/70 text-lg mb-4">
                {searchTerm || genderFilter !== "all" 
                  ? "Nie znaleziono pacjentów spełniających kryteria" 
                  : "Brak pacjentów do wyświetlenia"}
              </p>
              {(searchTerm || genderFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Wyczyść filtry
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
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
                {filteredPatients.map((patient) => (
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
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-white/50 text-lg mb-2">🔍</div>
              <p className="text-white/70">
                {searchTerm || genderFilter !== "all" 
                  ? "Nie znaleziono pacjentów spełniających kryteria" 
                  : "Brak pacjentów do wyświetlenia"}
              </p>
              {(searchTerm || genderFilter !== "all") && (
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
                >
                  Wyczyść filtry
                </button>
              )}
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div key={patient.$id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                {/* Header with avatar and name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white font-medium text-lg">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{patient.name}</h3>
                    <p className="text-white/70 text-sm">{patient.address}</p>
                  </div>
                </div>

                {/* Patient details */}
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Email:</span>
                    <span className="text-white">{patient.email}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Telefon:</span>
                    <span className="text-white">{patient.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Płeć:</span>
                    <span className="text-white">
                      {patient.gender === "male" ? "Mężczyzna" :
                       patient.gender === "female" ? "Kobieta" : "Inna"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Lekarz:</span>
                    <span className="text-white">{patient.primaryPhysician}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDetailsClick(patient)}
                    className="w-full px-4 py-2 bg-blue-800 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Szczegóły
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleHistoryClick(patient)}
                      className="flex-1 px-3 py-2 bg-yellow-800 hover:bg-yellow-800 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      Historia
                    </button>
                    <button
                      onClick={() => handleAppointmentClick(patient)}
                      className="flex-1 px-3 py-2 bg-green-800 hover:bg-green-800 text-white rounded-lg transition-colors font-medium text-sm"
                    >
                      Umów
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
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
