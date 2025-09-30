"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, DollarSign, ChevronDown, BarChart3 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, eachMonthOfInterval, addMonths, subMonths, addYears, subYears, subDays } from "date-fns";
import { pl } from "date-fns/locale";
import { getMonthlyRevenue, getYearlyRevenue, getRevenueEntries, getTotalRevenue, getLast30DaysRevenue, getLast7DaysRevenue, RevenueEntry } from "@/lib/actions/revenue.actions";

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


  // Pobierz dane dochodów z bazy revenue
  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      try {
        let data: RevenueEntry[] = [];
        
        if (timePeriod === "last30days") {
          data = await getRevenueEntries({});
        } else if (timePeriod === "last7days") {
          data = await getRevenueEntries({});
        } else if (timePeriod === "year") {
          data = await getRevenueEntries({});
        }
        
        console.log(`Pobrano ${data.length} wpisów dochodów dla okresu ${timePeriod}`);
        console.log("RevenueAnalysis: Pobrane dane:", data);
        const totalAmount = data.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        console.log(`RevenueAnalysis: Suma dochodów: ${totalAmount} zł`);
        setRevenueEntries(data);
      } catch (error) {
        console.error("Błąd pobierania danych dochodów:", error);
        setRevenueEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [timePeriod, selectedYear]);

  // Funkcja do obliczania przychodów z tabeli revenue
  const calculateRevenueDataFromEntries = (revenueEntries: RevenueEntry[], startDate: Date, endDate: Date) => {
    console.log("calculateRevenueDataFromEntries: startDate:", startDate, "endDate:", endDate);
    console.log("calculateRevenueDataFromEntries: revenueEntries:", revenueEntries);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    console.log("calculateRevenueDataFromEntries: days:", days.length);
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayEntries = revenueEntries.filter(entry => {
        const entryDateStr = entry.date.split('T')[0]; // Wyciągnij tylko datę z ISO string
        return entryDateStr === dayStr;
      });
      
      const total = dayEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      if (total > 0) {
        console.log(`calculateRevenueDataFromEntries: ${dayStr} - ${dayEntries.length} wpisów, suma: ${total}`);
      }

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
        // Użyj wszystkich danych z tabeli revenue bez filtrowania dat
        if (revenueEntries.length === 0) return [];
        
        // Znajdź zakres dat z danych
        const allDates = revenueEntries.map(entry => new Date(entry.date));
        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        // Użyj zakresu dat z danych - obejmij wszystkie dane
        const actualStartDate = minDate;
        const actualEndDate = maxDate;
        
        return calculateRevenueDataFromEntries(revenueEntries, actualStartDate, actualEndDate);
      case "allVisits":
        if (!Array.isArray(appointments)) return [];
        return calculateAllVisitsData(appointments, startDate, endDate);
      case "cancelledVisits":
        if (!Array.isArray(appointments)) return [];
        return calculateCancelledVisitsData(appointments, startDate, endDate);
      case "newPatients":
        if (!Array.isArray(appointments)) return [];
        return calculateNewPatientsData(appointments, startDate, endDate);
      default:
        return [];
    }
  }, [appointments, schedules, scheduleSlots, dataType, timePeriod, selectedYear, revenueEntries]);

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
      
      if (dataType === "revenue") {
        const prevRevenueEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= prevStartDate && entryDate <= prevEndDate;
        });
        previousPeriodValue = calculateRevenueDataFromEntries(prevRevenueEntries, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
      } else if (Array.isArray(appointments)) {
        switch (dataType) {
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
    } else if (timePeriod === "last7days") {
      const prevStartDate = new Date();
      prevStartDate.setDate(prevStartDate.getDate() - 14);
      const prevEndDate = new Date();
      prevEndDate.setDate(prevEndDate.getDate() - 7);
      
      if (dataType === "revenue") {
        const prevRevenueEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= prevStartDate && entryDate <= prevEndDate;
        });
        previousPeriodValue = calculateRevenueDataFromEntries(prevRevenueEntries, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
      } else if (Array.isArray(appointments)) {
        switch (dataType) {
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
    } else { // year
      const prevYear = selectedYear - 1;
      const prevStartDate = startOfYear(new Date(prevYear, 0, 1));
      const prevEndDate = endOfYear(new Date(prevYear, 11, 31));
      
      if (dataType === "revenue") {
        const prevRevenueEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate >= prevStartDate && entryDate <= prevEndDate;
        });
        previousPeriodValue = calculateRevenueDataFromEntries(prevRevenueEntries, prevStartDate, prevEndDate).reduce((sum, data) => sum + data.value, 0);
      } else if (Array.isArray(appointments)) {
        switch (dataType) {
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
    }

    const growthPercentage = previousPeriodValue === 0 ? (totalValue > 0 ? 100 : 0) : ((totalValue - previousPeriodValue) / previousPeriodValue) * 100;
    
    return { totalValue, previousPeriodValue, growthPercentage };
  }, [chartData, dataType, timePeriod, selectedYear, appointments, schedules, scheduleSlots, revenueEntries]);

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

