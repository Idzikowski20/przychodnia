"use client";

import { ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

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

  // Generowanie tygodnia (niedziela-sobota)
  const generateWeek = () => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = niedziela, 1 = poniedziałek, ..., 6 = sobota
    
    // Znajdź niedzielę tego tygodnia
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - currentDay);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + i);
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

  generateCalendar();
  const currentMonth = monthNames[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();
  
  // Aktualna data
  const today = new Date();
  const todayString = today.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

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

  // Mapowanie nazw kolorów na wartości hex
  const getColorValue = (colorName: string) => {
    const colorMap: { [key: string]: string } = {
      green: '#10b981',
      blue: '#3b82f6',
      purple: '#8b5cf6',
      red: '#ef4444',
      yellow: '#f59e0b',
      pink: '#ec4899',
      indigo: '#6366f1',
      teal: '#14b8a6'
    };
    return colorMap[colorName] || '#10b981';
  };

  // Kolory gabinetów dla wizyt
  const getAppointmentColor = (appointment: Appointment) => {
    // Jeśli wizyta ma przypisany kolor gabinetu, użyj go
    if (appointment.roomColor) {
      return getColorValue(appointment.roomColor);
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
    if (statuses.includes("cancelled")) return "#ef4444";
    if (appointment.isCompleted || statuses.includes("completed")) return "#059669";
    if (statuses.includes("scheduled")) return "#10b981";
    if (statuses.includes("accepted")) return "#3b82f6";
    return "#f59e0b";
  };

  // Kolory dla poszczególnych statusów
  const getStatusColor = (status: string) => {
    switch (status) {
      case "cancelled": return "#ef4444";
      case "completed": return "#059669";
      case "scheduled": return "#10b981";
      case "accepted": return "#3b82f6";
      case "awaiting":
      case "pending": return "#f59e0b";
      default: return "#6b7280";
    }
  };

  // Sprawdź czy wizyta jest anulowana
  const isAppointmentCancelled = (appointment: Appointment) => {
    let statuses: string[];
    if (Array.isArray(appointment.status)) {
      statuses = appointment.status;
    } else {
      statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
    }
    return statuses.includes("cancelled");
  };

  // Sprawdź czy wizyta się odbyła
  const isAppointmentCompleted = (appointment: Appointment) => {
    return appointment.isCompleted || (Array.isArray(appointment.status) ? appointment.status.includes("completed") : appointment.status.includes("completed"));
  };

  // Generuj kropki statusów dla wizyty
  const getStatusDots = (appointment: Appointment) => {
    let statuses: string[];
    if (Array.isArray(appointment.status)) {
      statuses = appointment.status;
    } else {
      statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
    }
    if (statuses.length === 0) {
      statuses = ["awaiting"];
    }

    // Dodaj status "completed" jeśli wizyta jest oznaczona jako odbyta
    if (appointment.isCompleted && !statuses.includes("completed")) {
      statuses.push("completed");
    }

    return statuses.map((status, index) => (
      <div
        key={index}
        className="size-1.5 rounded-full border border-black/30 shadow-sm"
        style={{ backgroundColor: getStatusColor(status) }}
        title={status}
      />
    ));
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
            <ChevronUpIcon className="size-4 text-white" />
          ) : (
            <ChevronDownIcon className="size-4 text-white" />
          )}
        </button>
      </div>

      {/* Kontener kalendarza */}
      <div className="relative">
        <div 
          className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-none' : 'max-h-80 overflow-hidden'
          }`}
        >
          {/* Nawigacja miesiąca - tylko w widoku miesiąca */}
          {!isWeekView && (
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronLeftIcon className="size-5 text-white" />
                </button>
                <h3 className="text-lg font-semibold text-white">
                  {currentMonth} {currentYear}
                </h3>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <ChevronRightIcon className="size-5 text-white" />
                </button>
              </div>
              {/* Aktualny dzień */}
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg border border-white/20">
                  <div className="size-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-white/90 font-medium capitalize">
                    {todayString}
                  </span>
                </div>
              </div>
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
                    className={`min-h-20 p-2 border transition-all duration-200 ${
                      isToday 
                        ? 'bg-blue-500/30 border-blue-400 ring-2 ring-blue-400/50 shadow-lg shadow-blue-500/20' 
                        : isCurrentMonth 
                          ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                          : 'bg-white/2 border-white/5 hover:bg-white/5'
                    }`}
                  >
                    {/* Numer dnia */}
                    <div className={`text-sm mb-2 ${
                      isToday 
                        ? 'font-bold text-blue-100 bg-blue-600/50 rounded-full size-6 flex items-center justify-center mx-auto' 
                        : isCurrentMonth 
                          ? 'text-white' 
                          : 'text-white/40'
                    }`}>
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
                            className={`text-xs p-2 rounded text-white cursor-pointer hover:opacity-80 transition-opacity ${
                              (isAppointmentCancelled(appointment) || isAppointmentCompleted(appointment)) ? 'line-through opacity-75 brightness-75' : ''
                            }`}
                            style={{ backgroundColor: getAppointmentColor(appointment) }}
                            title={`${appointment.patient.name} - ${formatDateTime(appointment.schedule).timeOnly}${roomDisplayName ? ` - ${roomDisplayName}` : ''}`}
                            onClick={() => handleAppointmentClick(appointment)}
                          >
                            <div className="font-medium flex items-center gap-1">
                              {formatDateTime(appointment.schedule).timeOnly}
                              <div className="flex gap-0.5">
                                {getStatusDots(appointment)}
                              </div>
                            </div>
                            <div className="opacity-90 flex items-center gap-1">
                              <span className="truncate flex-1">{appointment.patient.name}</span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {appointment.doctorAvatar && (
                                  <div className="size-4 rounded-full overflow-hidden border border-white/30">
                                    <img
                                      src={appointment.doctorAvatar}
                                      alt={appointment.primaryPhysician}
                                      className="size-full object-cover"
                                    />
                                  </div>
                                )}
                                {isAppointmentCompleted(appointment) && (
                                  <div className="size-4 rounded-full bg-green-600 flex items-center justify-center border border-white/30">
                                    <svg className="size-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                                {isAppointmentCancelled(appointment) && (
                                  <div className="size-4 rounded-full bg-red-600 flex items-center justify-center border border-white/30">
                                    <svg className="size-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M18.3 5.71a1 1 0 00-1.41 0L12 10.59 7.11 5.7a1 1 0 00-1.41 1.41L10.59 12l-4.9 4.89a1 1 0 101.41 1.41L12 13.41l4.89 4.9a1 1 0 001.41-1.41L13.41 12l4.9-4.89a1 1 0 000-1.4z"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
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
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-dark-900 via-dark-900/90 to-transparent pointer-events-none rounded-b-xl" />
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
