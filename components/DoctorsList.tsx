"use client";

import { useState, useEffect } from "react";
import { Doctor, WorkingHours } from "@/types/appwrite.types";
import { getDoctors } from "@/lib/actions/doctor.actions";
import { getRooms } from "@/lib/actions/room.actions";
import { AddDoctorModal } from "./AddDoctorModal";
import { DoctorScheduleModal } from "./DoctorScheduleModal";
import { EditDoctorModal } from "./EditDoctorModal";

export const DoctorsList = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorsData, roomsData] = await Promise.all([
          getDoctors(),
          getRooms()
        ]);
        setDoctors(doctorsData || []);
        setRooms(roomsData || []);
      } catch (error) {
        console.error("Błąd podczas pobierania danych:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDoctorAdded = () => {
    // Odśwież listę po dodaniu nowego doktora
    const fetchDoctors = async () => {
      try {
        const doctorsData = await getDoctors();
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error("Błąd podczas pobierania doktorów:", error);
      }
    };
    fetchDoctors();
  };

  const handleScheduleClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsScheduleModalOpen(true);
  };

  const handleEditClick = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsEditModalOpen(true);
  };

  const handleScheduleModalClose = () => {
    setIsScheduleModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedDoctor(null);
  };

  const handleScheduleUpdated = () => {
    // Odśwież listę po aktualizacji harmonogramu
    const fetchDoctors = async () => {
      try {
        const doctorsData = await getDoctors();
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error("Błąd podczas pobierania doktorów:", error);
      }
    };
    fetchDoctors();
  };

  const handleDoctorUpdated = () => {
    // Odśwież listę po aktualizacji doktora
    const fetchDoctors = async () => {
      try {
        const doctorsData = await getDoctors();
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error("Błąd podczas pobierania doktorów:", error);
      }
    };
    fetchDoctors();
  };

  const parseWorkingHours = (workingHoursString: string): WorkingHours => {
    try {
      return JSON.parse(workingHoursString);
    } catch {
      return {
        monday: { start: "08:00", end: "16:00", isWorking: true },
        tuesday: { start: "08:00", end: "16:00", isWorking: true },
        wednesday: { start: "08:00", end: "16:00", isWorking: true },
        thursday: { start: "08:00", end: "16:00", isWorking: true },
        friday: { start: "08:00", end: "16:00", isWorking: true },
        saturday: { start: "09:00", end: "13:00", isWorking: false },
        sunday: { start: "09:00", end: "13:00", isWorking: false },
      };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvailabilityStatus = (workingHours: WorkingHours) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = workingHours[today];
    
    if (!todayHours?.isWorking) {
      return { status: "Niedostępny", color: "text-red-400" };
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const startTime = todayHours.start;
    const endTime = todayHours.end;

    if (currentTime >= startTime && currentTime <= endTime) {
      return { status: "Dostępny", color: "text-green-400" };
    } else {
      return { status: "Poza godzinami", color: "text-yellow-400" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Ładowanie specjalistów...</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
      <h2 className="text-xl font-semibold text-white mb-4">Lista specjalistów</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => {
          const workingHours = parseWorkingHours(doctor.workingHours);
          const availability = getAvailabilityStatus(workingHours);
          const assignedRoom = rooms.find(room => room.assignedSpecialist === doctor.name);
          
          return (
            <div key={doctor.$id} className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                {doctor.avatar ? (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={doctor.avatar}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {getInitials(doctor.name)}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-white font-semibold">{doctor.name}</h3>
                  <p className="text-white/70 text-sm">{doctor.specialization}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                {/* Gabinet */}
                {assignedRoom && (
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Gabinet:</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full bg-${assignedRoom.color || 'green'}-500`}></div>
                      <span className="text-white text-sm">{assignedRoom.name}</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-white/70">Email:</span>
                  <span className="text-white text-sm">{doctor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Telefon:</span>
                  <span className="text-white text-sm">{doctor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Dostępność:</span>
                  <span className={`text-sm ${availability.color}`}>
                    {availability.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Opłata:</span>
                  <span className="text-white text-sm">{doctor.consultationFee} {doctor.currency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Wizyta:</span>
                  <span className="text-white text-sm">{doctor.appointmentDuration} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Status:</span>
                  <span className={`text-sm ${doctor.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {doctor.isActive ? 'Aktywny' : 'Nieaktywny'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleEditClick(doctor)}
                  className="flex-1 px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Edytuj
                </button>
                <button 
                  onClick={() => handleScheduleClick(doctor)}
                  className="flex-1 px-3 py-2 bg-green-700 hover:bg-green-800 text-white rounded-lg transition-colors font-medium text-sm"
                >
                  Harmonogram
                </button>
              </div>
            </div>
          );
        })}

        {/* Karta dodawania nowego doktora */}
        <AddDoctorModal onDoctorAdded={handleDoctorAdded} />
      </div>

      {/* Modal harmonogramu */}
      <DoctorScheduleModal
        doctor={selectedDoctor}
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        onScheduleUpdated={handleScheduleUpdated}
      />

      {/* Modal edycji doktora */}
      <EditDoctorModal
        doctor={selectedDoctor}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onDoctorUpdated={handleDoctorUpdated}
      />
    </div>
  );
};
