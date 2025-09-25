"use client";

import { ColumnDef } from "@tanstack/react-table";

import { markAppointmentAsCompleted } from "@/lib/actions/appointment.actions";
import { Appointment } from "@/types/appwrite.types";

import { AppointmentDetails } from "../AppointmentDetails";
import { AppointmentModal } from "../AppointmentModal";
import { AppointmentNotesModal } from "../AppointmentNotesModal";
import { StatusBadge } from "../StatusBadge";

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

export const columns: ColumnDef<Appointment>[] = [
  {
    header: "#",
    cell: ({ row }) => {
      return <p className="text-14-medium ">{row.index + 1}</p>;
    },
  },
  {
    accessorKey: "patient",
    header: "Pacjent",
    cell: ({ row }) => {
      const appointment = row.original;
      return <p className="text-14-medium ">{appointment.patient?.name || 'Brak danych'}</p>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const appointment = row.original;
      return (
        <div className="min-w-[115px]">
          <StatusBadge status={appointment.status} />
        </div>
      );
    },
  },
  {
    accessorKey: "roomName",
    header: "Gabinet",
    cell: ({ row }) => {
      const appointment = row.original;
      
      // Sprawdź czy wizyta ma przypisany gabinet
      if (appointment.roomName) {
        // Usuń "Gabinet " z nazwy, zostaw tylko numer/identyfikator
        const roomDisplayName = appointment.roomName.replace(/^Gabinet\s*/i, '');
        
        return (
          <div className="flex items-center gap-2 min-w-[100px]">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: appointment.roomColor ? getColorValue(appointment.roomColor) : '#3B82F6' }}
            />
            <p className="text-14-regular">{roomDisplayName}</p>
          </div>
        );
      }
      
      // Jeśli nie ma gabinetu, pokaż "Brak"
      return (
        <p className="text-14-regular text-white/50 min-w-[100px]">Brak</p>
      );
    },
  },
  {
    accessorKey: "schedule",
    header: "Wizyta",
    cell: ({ row }) => {
      const appointment = row.original;
      const date = new Date(appointment.schedule);
      
      // Format: 8/09/2025 12:27
      const formattedDate = `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      
      return (
        <p className="text-14-regular min-w-[100px]">
          {formattedDate}
        </p>
      );
    },
  },
  {
    accessorKey: "primaryPhysician",
    header: "Lekarz",
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex items-center gap-3">
          {/* Avatar lekarza - sprawdź czy ma avatar w danych */}
          {appointment.doctorAvatar ? (
            <div className="size-8 rounded-full overflow-hidden">
              <img
                src={appointment.doctorAvatar}
                alt={appointment.primaryPhysician}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="size-8 bg-white/10 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {appointment.primaryPhysician.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          )}
          <p className="whitespace-nowrap">Dr. {appointment.primaryPhysician}</p>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="pl-4">Akcje</div>,
    cell: ({ row }) => {
      const appointment = row.original;

      return (
        <div className="flex gap-1">
          <AppointmentDetails
            appointment={appointment}
            userId={appointment.userId}
            patientId={appointment.patient?.$id || appointment.userId}
          />
          
          {(() => {
            // Backward compatibility: obsługa zarówno array jak i string
            let statuses: string[];
            
            if (Array.isArray(appointment.status)) {
              statuses = appointment.status;
            } else {
              statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
            }
            
            // Jeśli array jest pusty, traktuj jako "awaiting"
            if (statuses.length === 0) {
              statuses = ["awaiting"];
            }
            
            const hasAwaiting = statuses.includes("awaiting") || statuses.includes("pending");
            const hasAccepted = statuses.includes("accepted");
            const hasCancelled = statuses.includes("cancelled");
            const isCompleted = appointment.isCompleted || false;
            
            // Sprawdź czy wizyta może być oznaczona jako odbyta
            const canMarkAsCompleted = hasAccepted && !hasCancelled && !isCompleted;
            
            const handleMarkAsCompleted = async () => {
              try {
                await markAppointmentAsCompleted(appointment.$id);
              } catch (error) {
                console.error("Błąd podczas oznaczania wizyty jako odbytej:", error);
              }
            };
            
            // Jeśli wizyta się odbyła, pokaż tylko akcje dla odbytych wizyt
            if (isCompleted) {
              return (
                <>
                  <AppointmentNotesModal appointment={appointment} />
                  <AppointmentModal
                    patientId={appointment.patient?.$id || appointment.userId}
                    userId={appointment.userId}
                    appointment={appointment}
                    type="create"
                    title="Umów ponownie"
                    description="Umów nową wizytę dla tego pacjenta."
                    isAdminModal={true}
                  />
                </>
              );
            }

            // Dla nieodbytych wizyt - standardowe akcje
            return (
              <>
                {hasAwaiting && (
                  <AppointmentModal
                    patientId={appointment.patient?.$id || appointment.userId}
                    userId={appointment.userId}
                    appointment={appointment}
                    type="schedule"
                    title="Potwierdź wizytę"
                    description="Proszę potwierdzić następujące szczegóły, aby potwierdzić wizytę."
                    isAdminModal={true}
                  />
                )}
                {hasAccepted && (
                  <AppointmentModal
                    patientId={appointment.patient?.$id || appointment.userId}
                    userId={appointment.userId}
                    appointment={appointment}
                    type="plan"
                    title="Przełóż wizytę"
                    description="Proszę ustawić konkretną datę i godzinę wizyty."
                    isAdminModal={true}
                  />
                )}
                {canMarkAsCompleted && (
                  <button
                    onClick={handleMarkAsCompleted}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm"
                  >
                    Odbyta
                  </button>
                )}
                {!hasCancelled && (
                  <AppointmentModal
                    patientId={appointment.patient?.$id || appointment.userId}
                    userId={appointment.userId}
                    appointment={appointment}
                    type="cancel"
                    title="Anuluj wizytę"
                    description="Czy na pewno chcesz anulować swoją wizytę?"
                    isAdminModal={true}
                  />
                )}
              </>
            );
          })()}
        </div>
      );
    },
  },
];
