"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { StatCard } from "@/components/StatCard";
import { AppointmentCalendar } from "@/components/AppointmentCalendar";
import { AdminNavigation } from "@/components/AdminNavigation";
import { PatientsList } from "@/components/PatientsList";
import { DoctorsList } from "@/components/DoctorsList";
import { OfficeView } from "@/components/OfficeView";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/DataTable";
import { getRecentAppointmentList } from "@/lib/actions/appointment.actions";
import { useEffect } from "react";

const AdminPage = () => {
  const [activeSection, setActiveSection] = useState<"appointments" | "patients" | "specialists" | "office" | "payments" | "settings">("appointments");
  const [appointments, setAppointments] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointmentsData = await getRecentAppointmentList();
        setAppointments(appointmentsData);
      } catch (error) {
        console.error("Błąd podczas pobierania wizyt:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading || !appointments) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col space-y-14">
        <header className="admin-header">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={162}
              alt="logo"
              className="h-8 w-fit"
            />
          </Link>
          <p className="text-16-semibold">Panel administratora</p>
        </header>
        <div className="flex items-center justify-center py-12">
          <div className="text-white/70">Ładowanie...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col space-y-14">
      <header className="admin-header">
        <div className="flex items-center gap-6">
          <Link href="/" className="cursor-pointer">
            <Image
              src="/assets/icons/logo-full.svg"
              height={32}
              width={162}
              alt="logo"
              className="h-8 w-fit"
            />
          </Link>
          <AdminNavigation 
            activeSection={activeSection} 
            onSectionChange={setActiveSection} 
          />
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => {
              // Tutaj można dodać logikę wylogowania
              window.location.href = '/';
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            Wyloguj
          </button>
        </div>
      </header>

      <main className="admin-main">
        <section className="w-full space-y-4">
          <h1 className="header">Witamy 👋</h1>
          <p className="text-dark-700">
            {activeSection === "appointments" 
              ? "Rozpocznij dzień od zarządzania nowymi wizytami"
              : activeSection === "patients"
              ? "Zarządzaj bazą zarejestrowanych pacjentów"
              : activeSection === "specialists"
              ? "Zarządzaj bazą lekarzy i specjalistów"
              : activeSection === "office"
              ? "Zarządzaj gabinetami i przypisuj specjalistów"
              : activeSection === "payments"
              ? "Monitoruj płatności i rozliczenia"
              : "Konfiguruj ustawienia systemu"
            }
          </p>
        </section>


        {/* Sekcja Wizyty */}
        {activeSection === "appointments" && (
          <>
            <section className="admin-stat">
              <StatCard
                type="appointments"
                count={appointments.scheduledCount}
                label="Przełożone wizyty"
                icon={"/assets/icons/appointments.svg"}
              />
              <StatCard
                type="accepted"
                count={appointments.acceptedCount}
                label="Potwierdzone wizyty"
                icon={"/assets/icons/check.svg"}
              />
              <StatCard
                type="completed"
                count={appointments.completedCount}
                label="Odbyte wizyty"
                icon={"/assets/icons/check-circle.svg"}
              />
              <StatCard
                type="awaiting"
                count={appointments.awaitingCount}
                label="Oczekujące wizyty"
                icon={"/assets/icons/pending.svg"}
              />
              <StatCard
                type="cancelled"
                count={appointments.cancelledCount}
                label="Anulowane wizyty"
                icon={"/assets/icons/cancelled.svg"}
              />
            </section>

            <AppointmentCalendar appointments={appointments.documents} />

            <DataTable columns={columns} data={appointments.documents} />
          </>
        )}

        {/* Sekcja Pacjenci */}
        {activeSection === "patients" && (
          <PatientsList />
        )}

        {/* Sekcja Specjaliści */}
        {activeSection === "specialists" && (
          <DoctorsList />
        )}

        {/* Sekcja Biuro */}
        {activeSection === "office" && (
          <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
            <OfficeView appointments={appointments?.documents || []} />
          </div>
        )}

        {/* Sekcja Płatności */}
        {activeSection === "payments" && (
          <div className="space-y-6">
            {/* Statystyki płatności */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">₽</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Dzisiejsze wpływy</h3>
                    <p className="text-2xl font-bold text-white">1,250 zł</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">₽</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Ten miesiąc</h3>
                    <p className="text-2xl font-bold text-white">15,800 zł</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">⏰</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Oczekujące</h3>
                    <p className="text-2xl font-bold text-white">3</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">❌</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Nieopłacone</h3>
                    <p className="text-2xl font-bold text-white">2</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista płatności */}
            <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">Ostatnie płatności</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Pacjent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Kwota</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">Metoda</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Jan Kowalski</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">9 września 2025</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">150 zł</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Opłacone</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Gotówka</td>
                    </tr>
                    <tr className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Patryk Idzikowski</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">8 września 2025</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">200 zł</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-full">Oczekujące</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">Przelew</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Sekcja Ustawienia */}
        {activeSection === "settings" && (
          <div className="space-y-6">
            {/* Ustawienia systemu */}
            <div className="w-full bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Ustawienia systemu</h2>
              
              <div className="space-y-6">
                {/* Ustawienia powiadomień */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Powiadomienia</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Powiadomienia SMS</label>
                        <p className="text-white/70 text-sm">Wysyłaj SMS-y o wizytach</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-white font-medium">Powiadomienia email</label>
                        <p className="text-white/70 text-sm">Wysyłaj emaile o wizytach</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Ustawienia kalendarza */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Kalendarz</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-white font-medium">Domyślny widok</label>
                      <select className="mt-2 w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                        <option value="week">Tydzień</option>
                        <option value="month">Miesiąc</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-white font-medium">Godziny pracy</label>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/70 text-sm">Od</label>
                          <input type="time" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" defaultValue="08:00" />
                        </div>
                        <div>
                          <label className="text-white/70 text-sm">Do</label>
                          <input type="time" className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white" defaultValue="18:00" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Przyciski akcji */}
                <div className="flex gap-3 pt-4">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
                    Zapisz zmiany
                  </button>
                  <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium">
                    Resetuj
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPage;
