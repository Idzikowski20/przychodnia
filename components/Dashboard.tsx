"use client";

import { useEffect, useState } from "react";
import { DashboardStats } from "./DashboardStats";
import { RevenueChart } from "./RevenueChart";
import { TaskList } from "./TaskList";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { 
  getDashboardStats, 
  getRevenueData, 
  getUpcomingAppointments 
} from "@/lib/actions/appointment.actions";
import { getLast30DaysRevenue, getTotalRevenue, getRevenueEntries } from "@/lib/actions/revenue.actions";
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTaskCompletion 
} from "@/lib/actions/task.actions";
import { Task } from "@/types/appwrite.types";
import { Appointment } from "@/types/appwrite.types";

interface DashboardProps {
  onCreateAppointment?: () => void;
  onEditAppointment?: (appointmentId: string) => void;
  onDeleteAppointment?: (appointmentId: string) => void;
  onViewPatient?: (patientId: string) => void;
  onStartVisit?: (appointmentId: string) => void;
}

export const Dashboard = ({
  onCreateAppointment,
  onEditAppointment,
  onDeleteAppointment,
  onViewPatient,
  onStartVisit
}: DashboardProps) => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    todayScheduled: 0,
    totalAppointments30Days: 0,
    cancelledAppointments30Days: 0,
    completedAppointments30Days: 0,
    newPatients30Days: 18,
    unapprovedCards: 4,
    totalRevenue30Days: 0,
    revenueGrowth: 0
  });
  
  const [revenueData, setRevenueData] = useState({
    totalRevenue: 20560,
    previousRevenue: 17000,
    revenueGrowth: 21,
    appointmentsCount: 0
  });
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Ładowanie danych równolegle
        console.log("Dashboard: Rozpoczynanie ładowania danych...");
        const [statsData, revenueDataResult, tasksData, appointmentsData, revenueEntries] = await Promise.all([
          getDashboardStats(),
          getRevenueData(),
          getTasks(),
          getUpcomingAppointments(5),
          getRevenueEntries({})
        ]);
        console.log("Dashboard: Dane załadowane:", { statsData, revenueDataResult, tasksData, appointmentsData, revenueEntries });

        // Oblicz rzeczywiste dane dochodów - użyj wszystkich danych
        const totalRevenue30Days = revenueEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Oblicz wzrost w porównaniu do poprzedniego miesiąca
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        // Dochody z bieżącego miesiąca
        const currentMonthEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
        });
        const currentMonthRevenue = currentMonthEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        // Dochody z poprzedniego miesiąca
        const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const previousMonthEntries = revenueEntries.filter(entry => {
          const entryDate = new Date(entry.date);
          return entryDate.getMonth() === previousMonth && entryDate.getFullYear() === previousYear;
        });
        const previousMonthRevenue = previousMonthEntries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        
        const revenueGrowth = previousMonthRevenue === 0 ? (currentMonthRevenue > 0 ? 100 : 0) : 
          ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;

        if (statsData) {
          setStats({
            ...statsData,
            newPatients30Days: 18,
            unapprovedCards: 4,
            totalRevenue30Days,
            revenueGrowth
          });
        }

        if (revenueDataResult) {
          console.log("Dashboard: Otrzymane dane przychodów:", revenueDataResult);
          setRevenueData(revenueDataResult);
        } else {
          console.log("Dashboard: Brak danych przychodów");
        }

        if (tasksData) {
          setTasks(tasksData);
        }

        if (appointmentsData) {
          setUpcomingAppointments(appointmentsData);
        }

        console.log(`Dashboard: Przychód z ostatnich 30 dni: ${totalRevenue30Days} zł, wzrost: ${revenueGrowth.toFixed(1)}%`);
        console.log(`Dashboard: Wszystkie wpisy dochodów:`, revenueEntries);
        console.log(`Dashboard: Suma wszystkich dochodów: ${totalRevenue30Days} zł`);
      } catch (error) {
        console.error("Błąd podczas ładowania danych dashboard:", error);
        console.error("Szczegóły błędu:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleCreateTask = async () => {
    try {
      const newTask = await createTask({
        title: "Nowe zadanie",
        description: "Opis nowego zadania",
        priority: "medium"
      });
      
      if (newTask) {
        setTasks(prev => [newTask, ...prev]);
      }
    } catch (error) {
      console.error("Błąd podczas tworzenia zadania:", error);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const updatedTask = await toggleTaskCompletion(taskId);
      if (updatedTask) {
        setTasks(prev => prev.map(task => 
          task.$id === taskId ? updatedTask : task
        ));
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji zadania:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.$id !== taskId));
    } catch (error) {
      console.error("Błąd podczas usuwania zadania:", error);
    }
  };

  const handleStartVisit = (appointmentId: string) => {
    if (onStartVisit) {
      onStartVisit(appointmentId);
    }
  };

  const handleEditAppointment = (appointmentId: string) => {
    if (onEditAppointment) {
      onEditAppointment(appointmentId);
    }
  };

  const handleDeleteAppointment = (appointmentId: string) => {
    if (onDeleteAppointment) {
      onDeleteAppointment(appointmentId);
    }
  };

  const handleViewPatient = (patientId: string) => {
    if (onViewPatient) {
      onViewPatient(patientId);
    }
  };

  const handleCreateAppointment = () => {
    if (onCreateAppointment) {
      onCreateAppointment();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Nagłówek z powitaniem */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Miłego dnia, Joanna</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Dzisiaj, 29 marca</p>
          <p className="text-sm text-gray-600">8:00 - 16:00</p>
        </div>
      </div>

      {/* Statystyki */}
      <DashboardStats stats={stats} />

      {/* Główna zawartość - grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lewa kolumna - Wykres przychodów i Lista zadań */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wykres przychodów */}
          <RevenueChart revenueData={revenueData} />
          
          {/* Lista zadań */}
          <TaskList 
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
            onCreateTask={handleCreateTask}
          />
        </div>

        {/* Prawa kolumna - Nadchodzące wizyty */}
        <div className="lg:col-span-1">
          <UpcomingAppointments 
            appointments={upcomingAppointments}
            onCreateAppointment={handleCreateAppointment}
            onStartVisit={handleStartVisit}
            onEditAppointment={handleEditAppointment}
            onDeleteAppointment={handleDeleteAppointment}
            onViewPatient={handleViewPatient}
          />
        </div>
      </div>
    </div>
  );
};
