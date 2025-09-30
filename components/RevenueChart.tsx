"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ChevronDown,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getLast30DaysRevenue, getTotalRevenue, getRevenueEntries, RevenueEntry } from "@/lib/actions/revenue.actions";
import { format, eachDayOfInterval, subDays } from "date-fns";

interface RevenueChartProps {
  revenueData: {
    totalRevenue: number;
    previousRevenue: number;
    revenueGrowth: number;
    appointmentsCount: number;
  };
  chartData?: Array<{
    date: string;
    amount: number;
  }>;
}

export const RevenueChart = ({ revenueData, chartData }: RevenueChartProps) => {
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualRevenueData, setActualRevenueData] = useState({
    totalRevenue: 0,
    previousRevenue: 0,
    revenueGrowth: 0
  });

  // Pobierz dane dochodów z ostatnich 30 dni
  useEffect(() => {
    const fetchRevenueData = async () => {
      try {
        setLoading(true);
        const entries = await getRevenueEntries({});
        setRevenueEntries(entries);
        
        // Oblicz rzeczywiste dane dochodów - użyj wszystkich danych
        const totalRevenue = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Oblicz wzrost w porównaniu do poprzedniego miesiąca
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Dochody z bieżącego miesiąca
        const currentMonthEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
        const currentMonthRevenue = currentMonthEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Dochody z poprzedniego miesiąca
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const previousMonthEntries = entries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === previousMonth && entryDate.getFullYear() === previousYear;
        });
        const previousMonthRevenue = previousMonthEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        const revenueGrowth = previousMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : 
          ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
        
        setActualRevenueData({
          totalRevenue,
          previousRevenue: previousMonthRevenue,
          revenueGrowth
        });
        
        console.log(`Pobrano ${entries.length} wpisów dochodów, suma: ${totalRevenue} zł`);
      } catch (error) {
        console.error("Błąd pobierania danych dochodów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  // Przygotuj dane wykresu z rzeczywistych danych
  const prepareChartData = () => {
    if (revenueEntries.length === 0) {
      return chartData || [];
    }

    // Użyj wszystkich danych zamiast tylko ostatnich 30 dni
    const allDates = revenueEntries.map(entry => new Date(entry.date));
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Jeśli wszystkie daty są w przyszłości, użyj ostatnich 30 dni
    const now = new Date();
    const endDate = maxDate > now ? now : maxDate;
    const startDate = subDays(endDate, 30);
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayEntries = revenueEntries.filter(entry => entry.date === dayStr);
      const total = dayEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
      
      return {
        date: format(day, "dd"),
        amount: total
      };
    });
  };

  const data = prepareChartData();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 mb-1">Data: {label} {format(new Date(), 'MMMM', { locale: { code: 'pl' } })}</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Użyj rzeczywistych danych jeśli są dostępne, w przeciwnym razie fallback na przekazane dane
  const displayData = actualRevenueData.totalRevenue > 0 ? actualRevenueData : revenueData;

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-semibold">Przychód</CardTitle>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="text-sm">
              Ostatnie 30 dni
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {loading ? (
                <div className="w-32 h-8 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                formatCurrency(displayData.totalRevenue)
              )}
            </h2>
            <div className={`flex items-center gap-2 mt-1 ${
              displayData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${displayData.revenueGrowth < 0 ? 'rotate-180' : ''}`} />
              <span className="text-sm font-medium">
                {loading ? (
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                ) : (
                  `${displayData.revenueGrowth > 0 ? '+' : ''}${displayData.revenueGrowth.toFixed(1)}% vs ostatnie 30 dni`
                )}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 w-full">
          {loading ? (
            <div className="h-full w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8">
              <div className="text-gray-400 text-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-medium mb-2">Ładowanie danych...</p>
                <p className="text-sm">Pobieranie dochodów z bazy</p>
              </div>
            </div>
          ) : data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickMargin={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  domain={[0, 'dataMax + 500']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-gray-50 rounded-xl flex flex-col items-center justify-center p-8">
              <div className="text-gray-400 text-center">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Brak danych</p>
                <p className="text-sm">Nie ma wpisów dochodów w ostatnich 30 dniach</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Oznaczenie "Dzisiaj" na osi X */}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-500">Dzisiaj</span>
        </div>
      </CardContent>
    </Card>
  );
};
