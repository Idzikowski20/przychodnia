"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  ChevronDown,
  Calendar
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  // Przykładowe dane wykresu jeśli nie są przekazane
  const defaultChartData = [
    { date: "09", amount: 1200 },
    { date: "11", amount: 1800 },
    { date: "13", amount: 2200 },
    { date: "15", amount: 1900 },
    { date: "17", amount: 2500 },
    { date: "19", amount: 2800 },
    { date: "21", amount: 3200 },
    { date: "23", amount: 2900 },
    { date: "25", amount: 3500 },
    { date: "27", amount: 3800 },
    { date: "29", amount: 4200 },
    { date: "02", amount: 4500 },
    { date: "04", amount: 4800 },
  ];

  const data = chartData || defaultChartData;

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
          <p className="text-sm text-gray-600 mb-1">Data: {label} Marzec</p>
          <p className="text-sm font-semibold text-gray-900">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

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
              Miesiąc
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {formatCurrency(revenueData.totalRevenue)}
            </h2>
            <div className="flex items-center gap-2 text-green-600 mt-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-medium">
                {revenueData.revenueGrowth}% vs ostatni miesiąc
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 w-full">
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
                tickFormatter={(value) => `${value / 1000}k`}
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
        </div>
        
        {/* Oznaczenie "Dzisiaj" na osi X */}
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-500">Dzisiaj</span>
        </div>
      </CardContent>
    </Card>
  );
};
