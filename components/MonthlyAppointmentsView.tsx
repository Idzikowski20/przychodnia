"use client";

import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, addDays, isSameDay, parseISO, startOfWeek, endOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface MonthlyAppointmentsViewProps {
  appointments: any[];
  doctors: any[];
  onAppointmentClick?: (appointment: any) => void;
}

export function MonthlyAppointmentsView({ 
  appointments, 
  doctors, 
  onAppointmentClick 
}: MonthlyAppointmentsViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(doctors[0] || null);
  const [filteredAppointments, setFilteredAppointments] = useState<any[]>([]);

  // Generuj daty miesiąca
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  
  // Generuj wszystkie dni miesiąca
  const monthDays = [];
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Rozpocznij od poniedziałku
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // Zakończ w niedzielę
  
  for (let i = 0; i < Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1; i++) {
    monthDays.push(addDays(startDate, i));
  }

  // Filtruj wizyty dla aktualnego miesiąca
  useEffect(() => {
    const monthAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.schedule);
      return appointmentDate >= monthStart && appointmentDate <= monthEnd;
    });

    // Filtruj według wybranego specjalisty
    const doctorAppointments = selectedDoctor 
      ? monthAppointments.filter(appointment => appointment.primaryPhysician === selectedDoctor.name)
      : monthAppointments;

    // Filtruj według wyszukiwania
    if (searchTerm) {
      const filtered = doctorAppointments.filter(appointment => {
        const patientName = appointment.patient?.name || appointment.patientName || "";
        const doctorName = appointment.primaryPhysician || "";
        return patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
               doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      });
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(doctorAppointments);
    }
  }, [appointments, currentMonth, searchTerm, selectedDoctor, monthStart, monthEnd]);

  // Grupuj wizyty według dnia
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

  // Nawigacja miesiącami
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  // Generuj tygodnie dla miesiąca
  const getWeeksForMonth = () => {
    const weeks = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      const week = monthDays.slice(i, i + 7);
      // Filtruj tylko dni z aktualnego miesiąca
      const currentMonthWeek = week.filter(day => day && day.getMonth() === currentMonth.getMonth());
      if (currentMonthWeek.length > 0) {
        weeks.push(currentMonthWeek);
      }
    }
    return weeks;
  };

  const weeks = getWeeksForMonth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Widok miesięczny wizyt</h2>
          <p className="text-gray-600">Zarządzaj wizytami w widoku miesięcznym</p>
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

      {/* Nawigacja miesiącami */}
      <div className="flex items-center justify-between bg-white rounded-lg border p-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPreviousMonth}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Poprzedni miesiąc
        </Button>
        
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {format(currentMonth, "MMMM yyyy", { locale: pl })}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goToCurrentMonth}
            className="text-sm"
          >
            Dzisiaj
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={goToNextMonth}
          className="flex items-center gap-2"
        >
          Następny miesiąc
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Przełącznik specjalistów */}
      <div className="bg-white rounded-lg border p-4 mb-4">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Wybierz specjalistę:</h3>
          <div className="flex gap-2">
            {doctors.map((doctor) => (
              <button
                key={doctor.$id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                  selectedDoctor?.$id === doctor.$id
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Image
                  src={doctor.avatar || "/assets/images/dr-cameron.png"}
                  alt={doctor.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
                <div className="text-left">
                  <div className="font-medium text-sm">{doctor.name}</div>
                  <div className="text-xs text-gray-500">{doctor.specialization}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Kalendarz miesięczny */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {/* Informacje o wybranym specjalistcie */}
        {selectedDoctor && (
          <div className="p-4 flex items-center gap-3 bg-gray-50 border-b">
            <Image
              src={selectedDoctor.avatar || "/assets/images/dr-cameron.png"}
              alt={selectedDoctor.name}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border border-gray-200"
            />
            <div>
              <div className="font-medium text-gray-900">{selectedDoctor.name}</div>
              <div className="text-sm text-gray-500">{selectedDoctor.specialization}</div>
            </div>
          </div>
        )}

        {/* Dni tygodnia */}
        <div className="grid grid-cols-7 bg-gray-100 border-b">
          {['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'].map((day, index) => (
            <div
              key={day}
              className="p-2 text-center text-sm font-medium text-gray-600 border-r last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Tygodnie kalendarza */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className={`grid border-b last:border-b-0`} style={{ gridTemplateColumns: `repeat(${week.length}, 1fr)` }}>
            {week.map((day, dayIndex) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isToday = isSameDay(day, new Date());

              return (
                <div
                  key={dayIndex}
                  className={`p-2 min-h-[120px] border-r last:border-r-0 ${
                    isToday
                      ? 'bg-blue-50'
                      : 'bg-white'
                  }`}
                >
                  {/* Numer dnia */}
                  <div className="text-sm font-medium mb-2 text-gray-900">
                    {format(day, 'd')}
                  </div>
                  
                  {/* Wizyty */}
                  <div className="space-y-1">
                    {dayAppointments.length > 0 ? (
                      dayAppointments.slice(0, 3).map((appointment, aptIndex) => {
                        const appointmentStatus = getAppointmentStatus(appointment);
                        const appointmentTime = format(new Date(appointment.schedule), "HH:mm", { locale: pl });
                        const patientName = appointment.patient?.name || appointment.patientName || "Brak danych";
                        const { roomNumber, roomColor } = getRoomInfo(appointment);

                        return (
                          <div
                            key={aptIndex}
                            className="bg-white rounded border p-1 cursor-pointer hover:shadow-sm transition-shadow"
                            onClick={() => onAppointmentClick?.(appointment)}
                          >
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {patientName}
                            </div>
                            <div className="text-xs text-gray-600">
                              {appointmentTime}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {roomNumber && (
                                <div 
                                  className="w-3 h-3 rounded-full flex items-center justify-center text-xs font-bold text-gray-700 bg-gray-100 border border-gray-300"
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
                      })
                    ) : (
                      <div className="text-xs text-gray-400 text-center py-2">
                        Brak wizyt
                      </div>
                    )}
                    
                    {/* Więcej wizyt */}
                    {dayAppointments.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayAppointments.length - 3} więcej
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
