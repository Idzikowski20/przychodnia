"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign, ChevronDown, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, addMonths, subMonths, addYears, subYears } from "date-fns";
import { pl } from "date-fns/locale";
import { getMonthlyRevenue, getYearlyRevenue, RevenueEntry } from "@/lib/actions/revenue.actions";

interface RevenueAnalysisProps {
  appointments: any[];
  schedules?: any[];
  scheduleSlots?: any[];
}

interface RevenueData {
  date: string;
  value: number;
  displayDate: string;
}

export function RevenueAnalysis({ appointments, schedules = [], scheduleSlots = [] }: RevenueAnalysisProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"monthly" | "yearly">("monthly");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataType, setDataType] = useState<"revenue" | "allVisits" | "newPatients" | "cancelledVisits">("revenue");
  const [timePeriod, setTimePeriod] = useState<"year" | "last30days" | "last7days">("last30days");


  // Pobierz dane dochodów z bazy (tymczasowo wyłączone z powodu błędów)
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        // Tymczasowo wyłączone - używamy fallback z wizyt
        // if (viewType === "monthly") {
        //   const data = await getMonthlyRevenue(currentDate.getFullYear(), currentDate.getMonth() + 1);
        //   setRevenueEntries(data);
        // } else {
        //   const data = await getYearlyRevenue(selectedYear);
        //   setRevenueEntries(data);
        // }
        setRevenueEntries([]); // Używamy fallback
      } catch (error) {
        console.error("Błąd pobierania danych dochodów:", error);
        setRevenueEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [currentDate, selectedYear, viewType]);

  // Funkcja do obliczania przychodów dla dowolnego okresu
  const calculateRevenueData = (appointments: any[], schedules: any[], scheduleSlots: any[], startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.schedule);
        const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");
        return appointmentDateStr === dayStr;
      });
      
      let total = 0;
      dayAppointments.forEach((appointment) => {
        
        const doctorId = appointment.primaryPhysician?.$id || appointment.primaryPhysician;
        const appointmentTime = new Date(appointment.schedule);
        const dayOfWeek = appointmentTime.getDay();
        const appointmentHour = format(appointmentTime, "HH:mm");
        
        // Znajdź slot po dacie i godzinie (ignorujemy doctorId bo jest null)
        const slot = scheduleSlots.find(slot => {
          const slotDate = slot.specificDate ? new Date(slot.specificDate).toISOString().split('T')[0] : null;
          const slotDayOfWeek = slot.dayOfWeek;
          
          // Sprawdź czy slot pasuje do daty wizyty
          const dateMatches = slotDate === dayStr || 
            (slotDayOfWeek === dayOfWeek && !slotDate);
          
          // Sprawdź czy slot pasuje do godziny wizyty
          const timeMatches = slot.startTime <= appointmentHour && slot.endTime > appointmentHour;
          
          return dateMatches && timeMatches;
        });
        
        let price = 0;
        if (slot) {
          // Spróbuj wyciągnąć cenę z roomName (JSON)
          if (slot.roomName) {
            try {
              const roomData = JSON.parse(slot.roomName);
              if (roomData.consultationFee) {
                price = parseFloat(roomData.consultationFee);
              }
            } catch (e) {
              // Ignoruj błąd parsowania
            }
          }
          
          // Fallback na inne pola z ceną
          if (price === 0 && slot.price) {
            price = parseFloat(slot.price);
          }
        }
        
        // Sprawdź cenę w wizycie (priorytet)
        if (appointment.amount && parseFloat(appointment.amount) > 0) {
          price = parseFloat(appointment.amount);
        } else if (appointment.price && parseFloat(appointment.price) > 0) {
          price = parseFloat(appointment.price);
        } else if (appointment.revenue && parseFloat(appointment.revenue) > 0) {
          price = parseFloat(appointment.revenue);
        } else if (price === 0) {
          // Fallback na domyślną cenę dla slotów bez ceny
          if (slot && slot.type === 'commercial') {
            price = 150; // Domyślna cena dla wizyt komercyjnych
          } else if (slot && slot.type === 'nfz') {
            price = 0; // NFZ jest darmowe
          }
        }
        
        total += price;
      });

      return {
        date: dayStr,
        value: total,
        displayDate: format(day, "dd"),
      };
    });
  };

  // Funkcje do obliczania różnych typów danych
  const calculateAllVisitsData = (appointments: any[], startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.schedule);
        const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");
        return appointmentDateStr === dayStr;
      });
      
      return {
        date: dayStr,
        value: dayAppointments.length,
        displayDate: format(day, "dd"),
      };
    });
  };

  const calculateCancelledVisitsData = (appointments: any[], startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.schedule);
        const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");
        const status = appointment.status?.[0] || appointment.status;
        return appointmentDateStr === dayStr && status === "cancelled";
      });
      
      return {
        date: dayStr,
        value: dayAppointments.length,
        displayDate: format(day, "dd"),
      };
    });
  };

  const calculateNewPatientsData = (appointments: any[], startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const processedPatients = new Set<string>();
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayAppointments = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.schedule);
        const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");
        return appointmentDateStr === dayStr;
      });
      
      let newPatientsCount = 0;
      dayAppointments.forEach(appointment => {
        const patientId = appointment.patient?.userId || appointment.userId;
        if (patientId && !processedPatients.has(patientId)) {
          processedPatients.add(patientId);
          newPatientsCount++;
        }
      });
      
      return {
        date: dayStr,
        value: newPatientsCount,
        displayDate: format(day, "dd"),
      };
    });
  };

  // Oblicz dane na podstawie wybranego typu
  const chartData = useMemo(() => {
    if (!Array.isArray(appointments)) {
      return [];
    }

    let startDate: Date;
    let endDate: Date;

    if (timePeriod === "year") {
      startDate = startOfYear(new Date(selectedYear, 0, 1));
      endDate = endOfYear(new Date(selectedYear, 11, 31));
    } else if (timePeriod === "last30days") {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
    } else { // last7days
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
    }


    switch (dataType) {
      case "revenue":
        const filteredAppointments = appointments.filter(appointment => {
          const status = appointment.status?.[0] || appointment.status;
          return status === "accepted" || status === "scheduled" || status === "completed";
        });
        return calculateRevenueData(filteredAppointments, schedules, scheduleSlots, startDate, endDate);
      case "allVisits":
        return calculateAllVisitsData(appointments, startDate, endDate);
      case "cancelledVisits":
        return calculateCancelledVisitsData(appointments, startDate, endDate);
      case "newPatients":
        return calculateNewPatientsData(appointments, startDate, endDate);
      default:
        return [];
    }
  }, [appointments, schedules, scheduleSlots, dataType, timePeriod, selectedYear]);

  // Oblicz statystyki
  const stats = useMemo(() => {
    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    
    // Oblicz poprzedni okres dla porównania
    let previousPeriodValue = 0;
    if (timePeriod === "last30days") {
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - 60);
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - 30);
      
      switch (dataType) {
        case "revenue":
          const prevFilteredAppointments = appointments.filter(appointment => {
            const status = appointment.status?.[0] || appointment.status;
            return status === "accepted" || status === "scheduled" || status === "completed";
          });
          previousPeriodValue = calculateRevenueData(prevFilteredAppointments, schedules, scheduleSlots, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "allVisits":
          previousPeriodValue = calculateAllVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "cancelledVisits":
          previousPeriodValue = calculateCancelledVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "newPatients":
          previousPeriodValue = calculateNewPatientsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
      }
    } else if (timePeriod === "last7days") {
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - 14);
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - 7);
      
      switch (dataType) {
        case "revenue":
          const prevFilteredAppointments = appointments.filter(appointment => {
            const status = appointment.status?.[0] || appointment.status;
            return status === "accepted" || status === "scheduled" || status === "completed";
          });
          previousPeriodValue = calculateRevenueData(prevFilteredAppointments, schedules, scheduleSlots, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "allVisits":
          previousPeriodValue = calculateAllVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "cancelledVisits":
          previousPeriodValue = calculateCancelledVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "newPatients":
          previousPeriodValue = calculateNewPatientsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
      }
    } else { // year
      const prevYear = selectedYear - 1;
      const prevStartDate = startOfYear(new Date(prevYear, 0, 1));
      const prevEndDate = endOfYear(new Date(prevYear, 11, 31));
      
      switch (dataType) {
        case "revenue":
          const prevFilteredAppointments = appointments.filter(appointment => {
            const status = appointment.status?.[0] || appointment.status;
            return status === "accepted" || status === "scheduled" || status === "completed";
          });
          previousPeriodValue = calculateRevenueData(prevFilteredAppointments, schedules, scheduleSlots, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "allVisits":
          previousPeriodValue = calculateAllVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "cancelledVisits":
          previousPeriodValue = calculateCancelledVisitsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
        case "newPatients":
          previousPeriodValue = calculateNewPatientsData(appointments, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
          break;
      }
    }

    const growthPercentage = previousPeriodValue === 0 ? (totalValue > 0 ? 100 : 0) : ((totalValue - previousPeriodValue) / previousPeriodValue) * 100;
    
    return { totalValue, previousPeriodValue, growthPercentage };
  }, [chartData, dataType, timePeriod, selectedYear, appointments, schedules, scheduleSlots]);

  // Funkcje nawigacji
  const goToPrevious = () => {
    if (viewType === "monthly") {
      setCurrentDate(prev => subMonths(prev, 1));
    } else {
      setSelectedYear(prev => prev - 1);
    }
  };

  const goToNext = () => {
    if (viewType === "monthly") {
      setCurrentDate(prev => addMonths(prev, 1));
    } else {
      setSelectedYear(prev => prev + 1);
    }
  };

  const goToToday = () => {
    if (viewType === "monthly") {
      setCurrentDate(new Date());
    } else {
      setSelectedYear(new Date().getFullYear());
    }
  };

  // Generuj dostępne lata
  const availableYears = useMemo(() => {
    if (!Array.isArray(appointments)) {
      return [new Date().getFullYear()];
    }
    
    const years = new Set<number>();
    appointments.forEach(appointment => {
      if (appointment.schedule) {
        const date = new Date(appointment.schedule);
        years.add(date.getFullYear());
      }
    });
    
    // Jeśli nie ma żadnych lat, dodaj aktualny rok
    if (years.size === 0) {
      years.add(new Date().getFullYear());
    }
    
    return Array.from(years).sort((a, b) => b - a);
  }, [appointments]);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Select value={dataType} onValueChange={(value: "revenue" | "allVisits" | "newPatients" | "cancelledVisits") => setDataType(value)}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Przychód</SelectItem>
                  <SelectItem value="allVisits">Wszystkie wizyty</SelectItem>
                  <SelectItem value="newPatients">Nowi pacjenci</SelectItem>
                  <SelectItem value="cancelledVisits">Odwołane wizyty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timePeriod} onValueChange={(value: "year" | "last30days" | "last7days") => setTimePeriod(value)}>
              <SelectTrigger className="w-[150px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Rok</SelectItem>
                <SelectItem value="last30days">Ostatnie 30 dni</SelectItem>
                <SelectItem value="last7days">Ostatnie 7 dni</SelectItem>
              </SelectContent>
            </Select>

            {timePeriod === "year" && (
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Główna statystyka */}
        <div className="text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {dataType === "revenue" ? `${stats.totalValue.toLocaleString()} zł` : stats.totalValue}
          </div>
          <div className="flex items-center justify-center gap-1 text-sm mb-2">
            <TrendingUp className={`h-4 w-4 ${stats.growthPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`} />
            <span className={`${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
              {stats.growthPercentage > 0 ? '+' : ''}{stats.growthPercentage.toFixed(1)}%
            </span>
            <span className="text-gray-500">
              vs {timePeriod === "year" ? "ostatni rok" : timePeriod === "last30days" ? "ostatnie 30 dni" : "ostatnie 7 dni"}
            </span>
          </div>
        </div>

        {/* Wykres */}
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8">
              <div className="text-gray-400 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium mb-2">Ładowanie danych...</p>
                <p className="text-sm">Pobieranie dochodów z bazy</p>
              </div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="displayDate" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => {
                    if (dataType === "revenue") {
                      return `${(value / 1000).toFixed(0)} tys`;
                    }
                    return value.toString();
                  }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const value = payload[0].value;
                      const displayValue = dataType === "revenue" ? `${value?.toLocaleString()} zł` : value?.toString();
                      return (
                        <div className="bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg">
                          <p className="font-medium">{displayValue}</p>
                          <p className="text-xs text-gray-300">{label}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={
                    dataType === "revenue" ? "#8B5CF6" :
                    dataType === "allVisits" ? "#3B82F6" :
                    dataType === "cancelledVisits" ? "#EF4444" :
                    "#10B981"
                  }
                  strokeWidth={2}
                  dot={false}
                  activeDot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8">
              <div className="text-gray-400 text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Brak danych</p>
                <p className="text-sm">Nie ma wizyt w wybranym okresie</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Funkcja obliczająca dochody miesięczne z bazy revenue
function calculateMonthlyRevenueFromEntries(revenueEntries: RevenueEntry[], currentDate: Date): RevenueData[] {
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayEntries = revenueEntries.filter(entry => entry.date === dayStr);
    
    const total = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      date: dayStr,
      value: total,
      displayDate: format(day, "dd"),
    };
  });
}

// Funkcja obliczająca dochody roczne z bazy revenue
function calculateYearlyRevenueFromEntries(revenueEntries: RevenueEntry[], year: number): RevenueData[] {
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 11, 31));
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    const monthEntries = revenueEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return format(entryDate, "yyyy-MM") === monthStr;
    });
    
    const total = monthEntries.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      date: monthStr,
      value: total,
      displayDate: format(month, "MMM", { locale: pl }),
    };
  });
}

// Fallback - funkcje obliczające dochody z wizyt
function calculateMonthlyRevenueFromAppointments(appointments: any[], schedules: any[], scheduleSlots: any[], currentDate: Date): RevenueData[] {
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Debug: pokaż dostępne harmonogramy i sloty
  console.log("Available schedules (full objects):", schedules);
  console.log("Available schedule slots (first 3):", scheduleSlots.slice(0, 3));
  
  // Sprawdź jakie pola mają harmonogramy
  if (schedules.length > 0) {
    console.log("Schedule fields:", Object.keys(schedules[0]));
    console.log("First schedule:", schedules[0]);
  }

  return days.map(day => {
    const dayStr = format(day, "yyyy-MM-dd");
    const dayAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.schedule);
      const appointmentDateStr = format(appointmentDate, "yyyy-MM-dd");
      return appointmentDateStr === dayStr;
    });
    
    let total = 0;
    dayAppointments.forEach(appointment => {
      console.log("Processing appointment:", appointment);
      const doctorId = appointment.primaryPhysician?.$id || appointment.primaryPhysician;
      const appointmentTime = new Date(appointment.schedule);
      const dayOfWeek = appointmentTime.getDay();
      const appointmentHour = format(appointmentTime, "HH:mm");
      
      // Znajdź slot bezpośrednio po dacie i godzinie (bez harmonogramu)
      const slot = scheduleSlots.find(slot => {
        const slotDate = slot.specificDate ? new Date(slot.specificDate).toISOString().split('T')[0] : null;
        const slotDayOfWeek = slot.dayOfWeek;
        
        // Sprawdź czy slot pasuje do daty wizyty
        const dateMatches = slotDate === dayStr || 
          (slotDayOfWeek === dayOfWeek && !slotDate);
        
        // Sprawdź czy slot pasuje do godziny wizyty
        const timeMatches = slot.startTime <= appointmentHour && slot.endTime > appointmentHour;
        
        return dateMatches && timeMatches;
      });
      
      let price = 0;
      if (slot) {
        console.log(`✅ Found slot for appointment:`, slot);
        
        // Spróbuj wyciągnąć cenę z roomName (JSON)
        if (slot.roomName) {
          try {
            const roomData = JSON.parse(slot.roomName);
            if (roomData.consultationFee) {
              price = parseFloat(roomData.consultationFee);
              console.log(`✅ Price from roomName: ${price}`);
            }
          } catch (e) {
            console.log("Could not parse roomName JSON:", slot.roomName);
          }
        }
        
        // Fallback na inne pola z ceną
        if (price === 0 && slot.price) {
          price = parseFloat(slot.price);
          console.log(`✅ Price from slot.price: ${price}`);
        }
      } else {
        console.log(`❌ No slot found for appointment at ${dayStr} ${appointmentHour}`);
      }
      
      if (price === 0) {
        price = parseFloat(appointment.amount || appointment.price || 0);
      }
      
      total += price;
    });

    return {
      date: dayStr,
      value: total,
      displayDate: format(day, "dd"),
    };
  });
}

function calculateYearlyRevenueFromAppointments(appointments: any[], schedules: any[], scheduleSlots: any[], year: number): RevenueData[] {
  const startDate = startOfYear(new Date(year, 0, 1));
  const endDate = endOfYear(new Date(year, 11, 31));
  const months = eachMonthOfInterval({ start: startDate, end: endDate });

  return months.map(month => {
    const monthStr = format(month, "yyyy-MM");
    const monthAppointments = appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.schedule);
      return format(appointmentDate, "yyyy-MM") === monthStr;
    });
    
    let total = 0;
    monthAppointments.forEach(appointment => {
      const doctorId = appointment.primaryPhysician?.$id || appointment.primaryPhysician;
      const appointmentTime = new Date(appointment.schedule);
      const dayOfWeek = appointmentTime.getDay();
      
      const doctorSchedule = schedules.find(schedule => {
        // Sprawdź czy doctorId to ID czy nazwa
        const scheduleDoctorId = schedule.doctor?.$id || schedule.doctor;
        const scheduleDoctorName = schedule.doctor?.name || schedule.doctorName;
        
        console.log(`  Looking for doctor: ${doctorId}, Schedule doctor ID: ${scheduleDoctorId}, Schedule doctor name: ${scheduleDoctorName}`);
        
        return scheduleDoctorId === doctorId || scheduleDoctorName === doctorId;
      });
      
      let price = 0;
      if (doctorSchedule) {
        const slot = scheduleSlots.find(slot => 
          slot.schedule?.$id === doctorSchedule.$id && 
          slot.dayOfWeek === dayOfWeek &&
          slot.startTime <= format(appointmentTime, "HH:mm") &&
          slot.endTime > format(appointmentTime, "HH:mm")
        );
        
        if (slot && slot.price) {
          price = parseFloat(slot.price);
        } else if (doctorSchedule.defaultPrice) {
          price = parseFloat(doctorSchedule.defaultPrice);
        }
      }
      
      if (price === 0) {
        price = parseFloat(appointment.amount || appointment.price || 0);
      }
      
      total += price;
    });

    return {
      date: monthStr,
      value: total,
      displayDate: format(month, "MMM", { locale: pl }),
    };
  });
}
