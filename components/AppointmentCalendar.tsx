"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { formatDateTime } from "@/lib/utils";
import { Appointment } from "@/types/appwrite.types";
import { CalendarAppointmentModal } from "./CalendarAppointmentModal";

type AppointmentCalendarProps = {
  appointments: Appointment[];
};

export const AppointmentCalendar = ({ appointments }: AppointmentCalendarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Generowanie kalendarza dla aktualnego miesiąca
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendar = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      calendar.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return calendar;
  };

  // Generowanie tygodnia (poniedziałek-niedziela)
  const generateWeek = () => {
    const today = new Date();
    const currentDay = today.getDay();
    
    // Znajdź poniedziałek tego tygodnia
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      week.push(day);
    }
    
    return week;
  };

  // Pobieranie wizyt dla konkretnego dnia
  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.schedule);
      return appointmentDate.toDateString() === date.toDateString();
    });
  };

  // Nazwy miesięcy po polsku
  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień"
  ];

  // Nazwy dni tygodnia po polsku
  const dayNames = ["Nd", "Pn", "Wt", "Śr", "Cz", "Pt", "Sb"];

  const calendar = generateCalendar();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Kolory gabinetów dla wizyt
  const getAppointmentColor = (appointment: Appointment) => {
    // Jeśli wizyta ma przypisany kolor gabinetu, użyj go
    if (appointment.roomColor) {
      return `bg-${appointment.roomColor}-500`;
    }
    
    // Fallback na kolory statusów (dla wizyt bez przypisanego gabinetu)
    let statuses: string[];
    if (Array.isArray(appointment.status)) {
      statuses = appointment.status;
    } else {
      statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
    }
    if (statuses.length === 0) {
      statuses = ["awaiting"];
    }

    // Sprawdź statusy w odpowiedniej kolejności (kolory zgodne z StatusBadge)
    if (statuses.includes("cancelled")) return "bg-red-600";
    if (appointment.isCompleted || statuses.includes("completed")) return "bg-green-900";
    if (statuses.includes("scheduled")) return "bg-green-600";
    if (statuses.includes("accepted")) return "bg-blue-600";
    return "bg-yellow-700";
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  const toggleDayExpansion = (dateString: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateString)) {
        newSet.delete(dateString);
      } else {
        newSet.add(dateString);
      }
      return newSet;
    });
  };

  const isDayExpanded = (dateString: string) => {
    return expandedDays.has(dateString);
  };

  // Wybierz dane do wyświetlenia
  const displayData = isExpanded ? generateCalendar() : generateWeek();
  const isWeekView = !isExpanded;

  return (
    <div className="w-full">
      {/* Nagłówek kalendarza */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">
          {isWeekView ? "Ten tydzień" : "Kalendarz wizyt"}
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20"
        >
          <span className="text-sm text-white">
            {isExpanded ? "Zwiń" : "Rozwiń"}
          </span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4 text-white" />
          ) : (
            <ChevronDownIcon className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* Kontener kalendarza */}
      <div className="relative">
        <div 
          className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-none' : 'max-h-60 overflow-hidden'
          }`}
        >
          {/* Nawigacja miesiąca - tylko w widoku miesiąca */}
          {!isWeekView && (
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-lg font-semibold text-white">
                {currentMonth} {currentYear}
              </h3>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <ChevronRightIcon className="w-5 h-5 text-white" />
              </button>
            </div>
          )}

          {/* Siatka kalendarza */}
          <div className="p-4">
            {/* Nagłówki dni */}
            <div className="grid grid-cols-7 gap-px mb-2">
              {dayNames.map(day => (
                <div key={day} className="p-3 text-center text-sm font-medium text-white/70">
                  {day}
                </div>
              ))}
            </div>

            {/* Dni kalendarza */}
            <div className="grid grid-cols-7 gap-px">
              {displayData.map((date, index) => {
                const isCurrentMonth = isWeekView ? true : date.getMonth() === currentDate.getMonth();
                const isToday = date.toDateString() === new Date().toDateString();
                const dayAppointments = getAppointmentsForDate(date);
                const dateString = date.toDateString();
                const dayIsExpanded = isDayExpanded(dateString);
                const maxVisible = dayIsExpanded ? dayAppointments.length : (isWeekView ? 3 : (isExpanded ? 2 : 1));
                
                return (
                  <div
                    key={index}
                    className={`min-h-20 p-2 border border-white/10 ${
                      isCurrentMonth ? 'bg-white/5' : 'bg-white/2'
                    } ${isToday ? 'bg-blue-500/20 border-blue-400/50' : ''} hover:bg-white/10 transition-colors`}
                  >
                    {/* Numer dnia */}
                    <div className={`text-sm mb-2 ${
                      isCurrentMonth ? 'text-white' : 'text-white/40'
                    } ${isToday ? 'font-bold text-blue-300' : ''}`}>
                      {date.getDate()}
                    </div>
                    
                    {/* Wizyty w dniu */}
                    <div className="space-y-1">
                      {dayAppointments.slice(0, maxVisible).map((appointment, idx) => {
                        // Sprawdź czy wizyta ma przypisany gabinet
                        const roomDisplayName = appointment.roomName ? 
                          appointment.roomName.replace(/^Gabinet\s*/i, '') : '';
                        
                        return (
                          <div
                            key={idx}
                            className={`text-xs p-1.5 rounded text-white truncate cursor-pointer hover:opacity-80 transition-opacity ${getAppointmentColor(appointment)}`}
                            title={`${appointment.patient.name} - ${formatDateTime(appointment.schedule).time}${roomDisplayName ? ` - ${roomDisplayName}` : ''}`}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium">{formatDateTime(appointment.schedule).time}</div>
                            <div className="opacity-90 truncate flex items-center gap-1">
                              <span>{appointment.patient.name}</span>
                              {roomDisplayName && (
                                <span 
                                  className="px-1.5 py-0.5 rounded text-xs font-medium opacity-90"
                                  style={{ 
                                    backgroundColor: appointment.roomColor || '#3B82F6',
                                    color: 'white'
                                  }}
                                >
                                  {roomDisplayName}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {dayAppointments.length > maxVisible && (
                        <button
                          onClick={() => toggleDayExpansion(dateString)}
                          className="text-xs text-blue-400 hover:text-blue-300 p-1 transition-colors"
                        >
                          +{dayAppointments.length - maxVisible} więcej
                        </button>
                      )}
                      {dayIsExpanded && dayAppointments.length > 1 && (
                        <button
                          onClick={() => toggleDayExpansion(dateString)}
                          className="text-xs text-gray-400 hover:text-gray-300 p-1 transition-colors"
                        >
                          Zwiń
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Gradient overlay gdy zwinięty */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-dark-900 via-dark-900/90 to-transparent pointer-events-none rounded-b-xl" />
        )}
      </div>

      {/* Modal z szczegółami wizyty */}
      {selectedAppointment && (
        <CalendarAppointmentModal
          appointment={selectedAppointment}
          isOpen={isModalOpen}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};
