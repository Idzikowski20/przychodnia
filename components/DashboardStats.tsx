"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  FileText, 
  PhoneOff, 
  Users, 
  TrendingUp,
  ArrowUpRight,
  BarChart3
} from "lucide-react";

interface DashboardStatsProps {
  stats: {
    todayAppointments: number;
    todayScheduled: number;
    totalAppointments30Days: number;
    cancelledAppointments30Days: number;
    completedAppointments30Days: number;
    newPatients30Days?: number;
  };
}

export const DashboardStats = ({ stats }: DashboardStatsProps) => {
  const todayProgress = stats.todayScheduled > 0 ? (stats.todayAppointments / stats.todayScheduled) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {/* Wizyty dzisiaj */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:bg-gradient-to-b from-blue-500/10 to-transparent transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6 h-48">
          <div className="flex flex-col h-full">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                  {stats.todayAppointments} / {stats.todayScheduled}
                </h3>
                <p className="text-gray-600 text-sm font-medium group-hover:text-white/90 transition-colors duration-300 mb-3">
                  Wizyty dzisiaj
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3 group-hover:bg-white/30 transition-colors duration-300">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300 group-hover:bg-white" 
                      style={{ width: `${Math.min(todayProgress, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-white transition-colors duration-300">
                    {Math.round(todayProgress)}%
                  </span>
                </div>
                <p className="text-gray-600 text-sm group-hover:text-white/90 transition-colors duration-300">
                  {todayProgress >= 50 ? "Połowa już za Tobą!" : "Dobra robota!"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wszystkie wizyty (30 dni) */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:bg-gradient-to-b from-purple-500/10 to-transparent transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6 h-48">
          <div className="flex flex-col h-full">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                  {stats.totalAppointments30Days}
                </h3>
                <p className="text-gray-600 text-sm font-medium group-hover:text-white/90 transition-colors duration-300 mb-3">
                  Wszystkie wizyty (30 dni)
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">21% vs ostatni miesiąc</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Odwołane wizyty (30 dni) */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:bg-gradient-to-b from-red-500/10 to-transparent transition-all duration-300 cursor-pointer group relative">
        <CardContent className="p-6 h-48">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                <PhoneOff className="h-6 w-6 text-white" />
              </div>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-gray-400 hover:text-gray-600 p-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                  {stats.cancelledAppointments30Days}
                </h3>
                <p className="text-gray-600 text-sm font-medium group-hover:text-white/90 transition-colors duration-300 mb-3">
                  Odwołane wizyty (30 dni)
                </p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-blue-600 text-sm cursor-pointer group-hover:text-white transition-colors duration-300">
                  Zobacz odwołane
                </span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="text-gray-400 border-gray-300 hover:bg-gray-100 text-xs px-3 py-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nowi pacjenci (30 dni) */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:bg-gradient-to-b from-green-500/10 to-transparent transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6 h-48">
          <div className="flex flex-col h-full">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                  {stats.newPatients30Days || 18}
                </h3>
                <p className="text-gray-600 text-sm font-medium group-hover:text-white/90 transition-colors duration-300 mb-3">
                  Nowi pacjenci (30 dni)
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">14% vs ostatni miesiąc</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zakończone wizyty */}
      <Card className="bg-white border border-gray-200 shadow-lg hover:bg-gradient-to-b from-gray-500/10 to-transparent transition-all duration-300 cursor-pointer group">
        <CardContent className="p-6 h-48">
          <div className="flex flex-col h-full">
            <div className="w-12 h-12 bg-gray-500 rounded-xl flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold text-gray-900 group-hover:text-white transition-colors duration-300 mb-2">
                  {stats.completedAppointments30Days}
                </h3>
                <p className="text-gray-600 text-sm font-medium group-hover:text-white/90 transition-colors duration-300 mb-3">
                  Zakończone wizyty
                </p>
              </div>
              <div className="flex items-center gap-2 text-green-600 group-hover:text-white transition-colors duration-300">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">Dobra wydajność</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
