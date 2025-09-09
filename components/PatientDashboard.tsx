"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { 
  CalendarDaysIcon, 
  DocumentTextIcon, 
  ClockIcon,
  CreditCardIcon, 
  CogIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { getAppointmentsByPatient } from "@/lib/actions/appointment.actions";
import { formatDateTime } from "@/lib/utils";

interface PatientDashboardProps {
  patient: any;
  userId: string;
}

export const PatientDashboard = ({ patient, userId }: PatientDashboardProps) => {
  const router = useRouter();
  const patientName = patient?.name || "Pacjencie";
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load patient appointments
  useEffect(() => {
    const loadAppointments = async () => {
      if (userId) {
        try {
          console.log("🔍 Ładuję wizyty dla userId:", userId);
          const patientAppointments = await getAppointmentsByPatient(userId);
          console.log("📅 Pobrane wizyty:", patientAppointments);
          setAppointments(patientAppointments || []);
        } catch (error) {
          console.error("Error loading appointments:", error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log("❌ Brak userId:", userId);
        setLoading(false);
      }
    };

    loadAppointments();
  }, [userId]);

  // Filter upcoming appointments only
  const now = new Date();
  
  // Debug: log all appointments
  console.log("🔍 Wszystkie wizyty:", appointments);
  console.log("⏰ Aktualna data:", now);
  
  // Najbliższe wizyty: tylko awaiting i confirmed, które są w przyszłości
  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.schedule);
    const isFuture = appointmentDate > now;
    
    // Obsługa statusu jako tablicy lub stringa
    let isActive = false;
    if (Array.isArray(apt.status)) {
      isActive = apt.status.includes('awaiting') || apt.status.includes('confirmed');
    } else {
      isActive = apt.status === 'awaiting' || apt.status === 'confirmed';
    }
    
    console.log(`📅 Wizyta ${apt.primaryPhysician}:`, {
      date: apt.schedule,
      parsedDate: appointmentDate,
      status: apt.status,
      statusType: Array.isArray(apt.status) ? 'array' : 'string',
      isFuture,
      isActive,
      willShow: isFuture && isActive
    });
    
    return isFuture && isActive;
  });
  
  console.log("✅ Najbliższe wizyty po filtrowaniu:", upcomingAppointments);

  const menuOptions = [
    {
      id: "book-appointment",
      title: "Umów wizytę",
      description: "Zarezerwuj termin wizyty",
      icon: CalendarDaysIcon,
      href: `/patients/${patient?.userId || patient?.userid}/new-appointment`
    },
    {
      id: "files",
      title: "Twoje pliki",
      description: "Dokumenty i wyniki badań",
      icon: DocumentTextIcon,
      href: `/patients/${patient?.userId || patient?.userid}/files`
    },
    {
      id: "history",
      title: "Historia wizyt",
      description: "Przeglądaj poprzednie wizyty",
      icon: ClockIcon,
      href: `/patients/${patient?.userId || patient?.userid}/history`
    },
    {
      id: "payments",
      title: "Płatności",
      description: "Historia i faktury",
      icon: CreditCardIcon,
      href: `/patients/${patient?.userId || patient?.userid}/payments`
    },
    {
      id: "specialists",
      title: "Specjaliści",
      description: "Lista lekarzy i specjalizacji",
      icon: UserGroupIcon,
      href: `/patients/${patient?.userId || patient?.userid}/specialists`
    },
    {
      id: "chat",
      title: "Wiadomości",
      description: "Kontakt z personelem medycznym",
      icon: ChatBubbleLeftRightIcon,
      href: `/patients/${patient?.userId || patient?.userid}/messages`
    },
    {
      id: "settings",
      title: "Ustawienia",
      description: "Profil i preferencje",
      icon: CogIcon,
      href: `/patients/${patient?.userId || patient?.userid}/settings`
    }
  ];

  const handleMenuClick = (href: string) => {
    router.push(href);
  };

  // Format status for display
  const getStatusDisplay = (status: string | string[]) => {
    // Obsługa statusu jako tablicy lub stringa
    let statusValue = status;
    if (Array.isArray(status)) {
      // Jeśli to tablica, weź pierwszy element lub najważniejszy
      if (status.includes('awaiting')) {
        statusValue = 'awaiting';
      } else if (status.includes('confirmed')) {
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
        return { text: 'Oczekuje na potwierdzenie', className: 'bg-yellow-100 text-yellow-800' };
      case 'confirmed':
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
              {upcomingAppointments.slice(0, 3).map((appointment) => (
                <div key={appointment.$id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="font-medium text-gray-900">{appointment.primaryPhysician}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(appointment.schedule).dateTime}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusDisplay(appointment.status).className}`}>
                    {getStatusDisplay(appointment.status).text}
                  </span>
                </div>
              ))}
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
                onClick={() => handleMenuClick(option.href)}
                className="group p-6 rounded-xl border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg transition-all duration-200 text-left bg-white hover:bg-gray-50"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gray-100 text-gray-700 group-hover:scale-110 transition-transform duration-200">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default PatientDashboard;
