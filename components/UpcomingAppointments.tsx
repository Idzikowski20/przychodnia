"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Plus, 
  Trash2, 
  User, 
  Edit, 
  Play,
  ChevronUp,
  ChevronDown,
  MapPin,
  Clock
} from "lucide-react";
import { Appointment } from "@/types/appwrite.types";
import { useState } from "react";

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  onCreateAppointment: () => void;
  onStartVisit: (appointmentId: string) => void;
  onEditAppointment: (appointmentId: string) => void;
  onDeleteAppointment: (appointmentId: string) => void;
  onViewPatient: (patientId: string) => void;
}

export const UpcomingAppointments = ({ 
  appointments, 
  onCreateAppointment,
  onStartVisit,
  onEditAppointment,
  onDeleteAppointment,
  onViewPatient
}: UpcomingAppointmentsProps) => {
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pl-PL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getDuration = (dateString: string) => {
    // Zakładamy 30 minut na wizytę
    return "30 min";
  };

  const isNewPatient = (appointment: Appointment) => {
    // Logika do określenia czy to nowy pacjent
    return Math.random() > 0.7; // Przykładowa logika
  };

  const groupedAppointments = appointments.reduce((acc, appointment) => {
    const time = formatTime(appointment.schedule.toString());
    if (!acc[time]) {
      acc[time] = [];
    }
    acc[time].push(appointment);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const sortedTimes = Object.keys(groupedAppointments).sort();

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Nadchodzące wizyty
          </CardTitle>
          <Button 
            onClick={onCreateAppointment}
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Nowa wizyta
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {sortedTimes.map((time) => (
            <div key={time} className="space-y-2">
              {/* Linia czasu */}
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <div className="w-px h-8 bg-gray-300 mt-2"></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">{time}</h4>
                  
                  {groupedAppointments[time].map((appointment) => {
                    const isExpanded = expandedAppointment === appointment.$id;
                    const isNew = isNewPatient(appointment);
                    
                    return (
                      <div key={appointment.$id} className="mb-3">
                        <div 
                          className={`p-3 rounded-lg border cursor-pointer transition-all ${
                            isExpanded 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => setExpandedAppointment(
                            isExpanded ? null : appointment.$id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={appointment.doctorAvatar} />
                                <AvatarFallback>
                                  {appointment.patient?.name?.charAt(0) || 'P'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {appointment.patient?.name || 'Nieznany pacjent'}
                                </p>
                                {isNew && (
                                  <Badge className="text-xs bg-green-100 text-green-800">
                                    Nowy
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                            >
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Rozwinięte szczegóły */}
                        {isExpanded && (
                          <div className="ml-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm text-gray-600">
                                  <strong>Pacjent:</strong> {appointment.patient?.name || 'Nieznany pacjent'}
                                  {isNew && (
                                    <Badge className="ml-2 text-xs bg-green-100 text-green-800">
                                      Nowy
                                    </Badge>
                                  )}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>
                                  <strong>Godzina:</strong> {time} - {formatTime(new Date(new Date(appointment.schedule).getTime() + 30 * 60000).toISOString())} ({getDuration(appointment.schedule.toString())})
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span>
                                  <strong>Adres:</strong> {appointment.patient?.address || 'Brak adresu'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 pt-2">
                                <Button
                                  onClick={() => onDeleteAppointment(appointment.$id)}
                                  size="sm"
                                  variant="outline"
                                  className="p-2 h-8 w-8"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  onClick={() => onViewPatient(appointment.userId)}
                                  size="sm"
                                  variant="outline"
                                  className="p-2 h-8 w-8"
                                >
                                  <User className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  onClick={() => onEditAppointment(appointment.$id)}
                                  size="sm"
                                  variant="outline"
                                  className="p-2 h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                
                                <Button
                                  onClick={() => onStartVisit(appointment.$id)}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                  <Play className="h-4 w-4 mr-1" />
                                  Rozpocznij wizytę
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}

          {/* Jeśli brak wizyt */}
          {appointments.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Brak nadchodzących wizyt</p>
              <Button 
                onClick={onCreateAppointment}
                size="sm" 
                variant="outline"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Zaplanuj pierwszą wizytę
              </Button>
            </div>
          )}

          {/* Przycisk "Pokaż wszystkie" */}
          {appointments.length > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">
                Pokaż wszystkie &gt;
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
