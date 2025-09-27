"use client";

import React, { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, addDays, isSameDay, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface WeeklyAppointmentsViewProps {
  appointments: any[];
  doctors: any[];
  onAppointmentClick?: (appointment: any) => void;
}

export function WeeklyAppointmentsView({ 
  appointments, 
  doctors, 
  onAppointmentClick 
}: WeeklyAppointmentsViewProps) {
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);

  // Generuj daty tygodnia
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Poniedziałek
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Niedziela
  const weekDays = [];
  
  for (let i = 0; i < 7; i++) {
    weekDays.push(addDays(weekStart, i));
  }

  // Filtruj wizyty dla aktualnego tygodnia
  useEffect(() => {
    const weekAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.schedule);
      return appointmentDate >= weekStart && appointmentDate <= weekEnd;
    });

    // Filtruj według wyszukiwania
    if (searchTerm) {
      const filtered = weekAppointments.filter(appointment => {
        const patientName = appointment.patient?.name || appointment.patientName || "";
        const doctorName = appointment.primaryPhysician || "";
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(weekAppointments);
    }
  }, [appointments, currentWeek, searchTerm, weekStart, weekEnd]);

  // Grupuj wizyty według dnia i lekarza
  const getAppointmentsForDay = (day: Date) => {
    return filteredAppointments.filter(appointment => 
      isSameDay(new Date(appointment.schedule), day)
    );
  };

  // Określ status wizyty
  const getAppointmentStatus = (appointment: any) => {
    const statuses = Array.isArray(appointment.status) 
      ? appointment.status 
      : (appointment.status || '').split(',').map((s: string) => s.trim());
    
    if (statuses.includes('cancelled')) return 'Anulowane';
    if (statuses.includes('scheduled')) return 'Przełożone';
    if (statuses.includes('accepted')) return 'Potwierdzone';
    if (statuses.includes('completed')) return 'Odbyte';
    if (statuses.includes('awaiting') || statuses.includes('pending')) return 'Oczekujące';
    
    return 'Oczekujące';
  };

  // Określ kolor dla statusu wizyty
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Anulowane': return 'bg-red-100 text-red-800';
      case 'Przełożone': return 'bg-orange-100 text-orange-800';
      case 'Potwierdzone': return 'bg-green-100 text-green-800';
      case 'Odbyte': return 'bg-blue-100 text-blue-800';
      case 'Oczekujące': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Określ numer gabinetu i kolor
  const getRoomInfo = (appointment: any) => {
    let roomNumber = null;
    let roomColor = '#3B82F6'; // Domyślny kolor
    
    if (appointment.roomName) {
      try {
        const roomData = JSON.parse(appointment.roomName);
        const name = roomData?.name || String(appointment.roomName);
        roomNumber = String(name).replace(/^Gabinet\s*/i, '');
      } catch {
        roomNumber = String(appointment.roomName).replace(/^Gabinet\s*/i, '');
      }
    } else if (appointment.roomColor) {
      roomColor = appointment.roomColor;
      // Spróbuj wyciągnąć numer z koloru (jeśli jest w PREDEFINED_ROOMS)
      const predefinedRooms = [
        { id: 1, name: "Gabinet 1", color: "#3B82F6" },
        { id: 2, name: "Gabinet 2", color: "#10B981" },
        { id: 3, name: "Gabinet 3", color: "#F59E0B" },
        { id: 4, name: "Gabinet 4", color: "#EF4444" }
      ];
      const match = predefinedRooms.find(r => r.color.toLowerCase() === String(appointment.roomColor).toLowerCase());
      if (match) {
        roomNumber = match.id.toString();
      }
    }
    
    return { roomNumber, roomColor };
  };

  // Nawigacja tygodniami
  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widok tygodniowy wizyt</h2>
          <p className="text-gray-600">Zarządzaj wizytami w widoku tygodniowym</p>
        </div>
        
        {/* Wyszukiwanie */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Szukaj wizyt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full sm:w-64"
          />
        </div>
      </div>

      {/* Nawigacja tygodniami */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousWeek}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Poprzedni tydzień
        </Button>
        
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(weekStart, "dd MMM", { locale: pl })} - {format(weekEnd, "dd MMM yyyy", { locale: pl })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentWeek}
            className="text-sm"
          >
            Dzisiaj
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextWeek}
          className="flex items-center gap-2"
        >
          Następny tydzień
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Kalendarz tygodniowy */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Nagłówki dni */}
        <div className="grid grid-cols-8 bg-gray-50 border-b">
          <div className="p-4 font-medium text-gray-600">Pracownik</div>
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`p-4 text-center font-medium ${
                isSameDay(day, new Date())
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600'
              }`}
            >
              <div className="text-sm">
                {format(day, "EEE", { locale: pl })}
              </div>
              <div className="text-lg font-semibold">
                {format(day, "dd", { locale: pl })}
              </div>
            </div>
          ))}
        </div>

        {/* Lista lekarzy i ich wizyty */}
        <div className="divide-y">
          {doctors.map((doctor) => (
            <div key={doctor.$id} className="grid grid-cols-8">
              {/* Informacje o lekarzu */}
              <div className="p-4 flex items-center gap-3 border-r">
                <Image
                  src={doctor.avatar || "/assets/images/dr-cameron.png"}
                  alt={doctor.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-gray-200"
                />
                <div>
                  <div className="font-medium text-gray-900">{doctor.name}</div>
                  <div className="text-sm text-gray-500">{doctor.specialization}</div>
                </div>
              </div>

              {/* Wizyty dla każdego dnia */}
              {weekDays.map((day, dayIndex) => {
                const dayAppointments = getAppointmentsForDay(day).filter(
                  appointment => appointment.primaryPhysician === doctor.name
                );

                return (
                  <div
                    key={dayIndex}
                    className={`p-2 min-h-[80px] border-r ${
                      isSameDay(day, new Date())
                        ? 'bg-blue-50'
                        : 'bg-white'
                    }`}
                  >
                    {dayAppointments.length > 0 ? (
                      <div className="space-y-1">
                        {dayAppointments.map((appointment, aptIndex) => {
                          const appointmentStatus = getAppointmentStatus(appointment);
                          const appointmentTime = format(new Date(appointment.schedule), "HH:mm", { locale: pl });
                          const patientName = appointment.patient?.name || appointment.patientName || "Brak danych";
                          const { roomNumber, roomColor } = getRoomInfo(appointment);

                          return (
                            <div
                              key={aptIndex}
                              className="bg-white rounded-lg border p-2 cursor-pointer hover:shadow-md transition-shadow"
                              onClick={() => onAppointmentClick?.(appointment)}
                            >
                              <div className="text-xs font-medium text-gray-900 truncate">
                                {patientName}
                              </div>
                              <div className="text-xs text-gray-600">
                                {appointmentTime}
                              </div>
                              <div className="flex items-center gap-1 mt-1 px-1">
                                {roomNumber && (
                                  <div 
                                    className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300"
                                  >
                                    {roomNumber}
                                  </div>
                                )}
                                <Badge
                                  className={`text-xs ${getStatusColor(appointmentStatus)} hover:${getStatusColor(appointmentStatus)}`}
                                >
                                  {appointmentStatus}
                                </Badge>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-4">
                        Brak wizyt
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
