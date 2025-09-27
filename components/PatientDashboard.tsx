"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { 
  CalendarDaysIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CreditCardIcon, 
  CogIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { getAppointmentsByPatient, updateAppointment } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog";
import { Textarea } from "./ui/textarea";
import BookingModal from "./BookingModal";

interface PatientDashboardProps {
  patient: any;
  userId: string;
}

export const PatientDashboard = ({ patient, userId }: PatientDashboardProps) => {
  const router = useRouter();
  const { toast } = useToast();
  const patientName = patient?.name || "Pacjencie";
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelReasons, setCancelReasons] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const pageSize = 3;

  // Load patient appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (userId) {
        try {

          const patientAppointments = await getAppointmentsByPatient(userId);

          setAppointments(patientAppointments || []);
        } catch (error) {
          console.error("Error loading appointments:", error);
        } finally {
          setLoading(false);
        }
      } else {

        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId]);

  // Filter upcoming appointments only
  const now = new Date();
  
  // Najbliższe wizyty: tylko awaiting i confirmed/accepted, które są w przyszłości
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.schedule);
    const isFuture = appointmentDate > now;
    
    // Obsługa statusu jako tablicy lub stringa
    let isActive = false;
    let isCancelled = false;
    
    if (Array.isArray(apt.status)) {
      isActive = apt.status.includes('awaiting') || apt.status.includes('confirmed') || apt.status.includes('accepted') || apt.status.includes('pending');
      isCancelled = apt.status.includes('cancelled');
    } else {
      isActive = apt.status === 'awaiting' || apt.status === 'confirmed' || apt.status === 'accepted' || apt.status === 'pending';
      isCancelled = apt.status === 'cancelled';
    }
    
    return isFuture && isActive && !isCancelled;
  });

  // Oblicz widoczne elementy wg paginacji (po 3)
  const totalPages = Math.ceil(upcomingAppointments.length / pageSize) || 1;
  const visibleAppointments = upcomingAppointments.slice(0, page * pageSize);

  const handleCancelAppointment = async (apt: any) => {
    try {
      const reason = cancelReasons[apt.$id] || "";
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Warsaw";
      
      await updateAppointment({
        appointmentId: apt.$id,
        userId,
        timeZone,
        type: "cancel",
        skipSMS: true, // Pacjent anuluje sam, nie wysyłaj SMS
      });

      // Optimistyczna aktualizacja listy
      setAppointments(prev => prev.map(p => p.$id === apt.$id ? { ...p, status: ["cancelled"], cancellationReason: reason } : p));
      
      // Odśwież dostępność w systemie rezerwacji
      if ((window as any).refreshBookingAvailability) {
        (window as any).refreshBookingAvailability();
      }
    } catch (error) {
      console.error("Błąd podczas anulowania wizyty:", error);
      toast({ variant: "destructive", title: "Błąd", description: "Nie udało się anulować wizyty" });
    }
  };

  const menuOptions = [
    {
      id: "book-appointment",
      title: "Umów wizytę",
      description: "Zarezerwuj termin wizyty",
      icon: CalendarDaysIcon,
      href: `/patients/${userId}/new-appointment`
    },
    {
      id: "book-appointment-new",
      title: "Umów ponownie",
      description: "Nowy system rezerwacji",
      icon: CalendarDaysIcon,
      action: () => setIsBookingModalOpen(true)
    },
    // Działające
    {
      id: "settings",
      title: "Profil",
      description: "Dane i preferencje",
      icon: CogIcon,
      href: `/patients/${userId}/profile`
    },
    {
      id: "history",
      title: "Historia wizyt",
      description: "Przeglądaj poprzednie wizyty",
      icon: ClockIcon,
      href: `/patients/${userId}/history`
    },
    // Wyszarzone (jeszcze nieaktywne)
    {
      id: "payments",
      title: "Płatności",
      description: "Historia i faktury",
      icon: CreditCardIcon,
      href: `#disabled`
    },
    {
      id: "files",
      title: "Twoje pliki",
      description: "Dokumenty i wyniki badań",
      icon: DocumentTextIcon,
      href: `#disabled`
    },
    {
      id: "specialists",
      title: "Specjaliści",
      description: "Lista lekarzy i specjalizacji",
      icon: UserGroupIcon,
      href: `#disabled`
    },
    {
      id: "chat",
      title: "Wiadomości",
      description: "Kontakt z personelem medycznym",
      icon: ChatBubbleLeftRightIcon,
      href: `#disabled`
    }
  ];

  const handleMenuClick = async (href: string) => {
    setIsNavigating(true);
    try {
      await router.push(href);
    } catch (error) {
      console.error("Navigation error:", error);
    } finally {
      // Reset loading state after a short delay to show the loader
      setTimeout(() => setIsNavigating(false), 1000);
    }
  };

  const handleMenuAction = (option: any) => {
    if (option.action) {
      option.action();
    } else if (option.href && option.href !== '#disabled') {
      handleMenuClick(option.href);
    }
  };

  // Format status for display
  const getStatusDisplay = (status: string | string[]) => {
    // Obsługa statusu jako tablicy lub stringa
    let statusValue = status;
    if (Array.isArray(status)) {
      // Jeśli to tablica, weź pierwszy element lub najważniejszy
      if (status.includes('awaiting') || status.includes('pending')) {
        statusValue = 'awaiting';
      } else if (status.includes('confirmed') || status.includes('accepted')) {
        statusValue = 'confirmed';
      } else if (status.includes('completed')) {
        statusValue = 'completed';
      } else if (status.includes('cancelled')) {
        statusValue = 'cancelled';
      } else {
        statusValue = status[0] || 'unknown';
      }
    }
    
    switch (statusValue) {
      case 'awaiting':
      case 'pending':
        return { text: 'Oczekuje na potwierdzenie', className: 'bg-yellow-100 text-yellow-800' };
      case 'confirmed':
        return { text: 'Wizyta potwierdzona', className: 'bg-green-100 text-green-800' };
      case 'accepted':
        return { text: 'Wizyta potwierdzona', className: 'bg-green-100 text-green-800' };
      case 'completed':
        return { text: 'Zakończona', className: 'bg-gray-100 text-gray-800' };
      case 'cancelled':
        return { text: 'Anulowana', className: 'bg-red-100 text-red-800' };
      default:
        return { text: String(statusValue), className: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="flex-1 space-y-8">
      {/* Welcome Section */}
      <section className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">
          Dzień dobry, {patientName}! 👋
        </h1>
        <p className="text-gray-600">
          Wybierz co chciałbyś dzisiaj wykonać
        </p>
      </section>

      {/* Appointments Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Twoje wizyty</h2>
        
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarDaysIcon className="h-5 w-5 text-green-500" />
            Najbliższe wizyty
          </h3>
          {loading ? (
            <p className="text-gray-500">Ładowanie...</p>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {visibleAppointments.map((appointment) => (
                <div key={appointment.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.primaryPhysician}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(appointment.schedule).dateTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusDisplay(appointment.status).className}`}>
                      {getStatusDisplay(appointment.status).text}
                    </span>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="px-3 py-1 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100">
                          Odwołaj
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Odwołać wizytę?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">Podaj powód odwołania (opcjonalnie):</p>
                          <Textarea
                            value={cancelReasons[appointment.$id] || ""}
                            onChange={(e) => setCancelReasons(prev => ({ ...prev, [appointment.$id]: e.target.value }))}
                            placeholder="Powód odwołania"
                          />
                        </div>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleCancelAppointment(appointment)} className="bg-red-600 hover:bg-red-700">
                            Odwołaj wizytę
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
              {visibleAppointments.length < upcomingAppointments.length && (
                <div className="pt-2">
                  <button
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 w-full"
                  >
                    Załaduj więcej
                  </button>
                </div>
              )}
              {page > 1 && (
                <div className="pt-2">
                  <button
                    onClick={() => setPage(1)}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 w-full"
                  >
                    Pokaż mniej
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Brak zaplanowanych wizyt</p>
          )}
        </div>
      </section>

      {/* Menu Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                onClick={() => handleMenuAction(option)}
                disabled={option.href === '#disabled' || isNavigating}
                className={`group p-6 rounded-xl border shadow-md transition-all duration-200 text-left ${option.href === '#disabled' ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' : isNavigating ? 'bg-gray-50 border-gray-200 opacity-60 cursor-wait' : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-lg'}`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`p-3 rounded-lg ${option.href === '#disabled' ? 'bg-gray-100 text-gray-400' : isNavigating ? 'bg-gray-100 text-gray-400' : 'bg-gray-100 text-gray-700 group-hover:scale-110 transition-transform duration-200'}`}>
                    {isNavigating ? (
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    ) : (
                      <Icon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-lg font-semibold ${option.href === '#disabled' ? 'text-gray-500' : isNavigating ? 'text-gray-500' : 'text-gray-900 group-hover:text-gray-700'}`}>
                      {isNavigating ? 'Ładowanie...' : option.title}
                    </h3>
                    <p className={`text-sm mt-1 ${option.href === '#disabled' ? 'text-gray-400' : isNavigating ? 'text-gray-400' : 'text-gray-600'}`}>
                      {isNavigating ? 'Przekierowywanie...' : option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Modal nowego systemu rezerwacji */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        userId={userId}
        patientId={patient.$id}
        patientName={patient.name}
        onBookingComplete={(appointmentId) => {

          setIsBookingModalOpen(false);
          // Odśwież listę wizyt
          window.location.reload();
        }}
        onAppointmentCancelled={() => {
          // Odśwież dostępność w systemie rezerwacji
          if ((window as any).refreshBookingAvailability) {
            (window as any).refreshBookingAvailability();
          }
        }}
      />
    </div>
  );
};

export default PatientDashboard;
