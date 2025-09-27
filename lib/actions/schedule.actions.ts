"use server";

import { ID, Query } from "node-appwrite";
import {
  DATABASE_ID,
  SCHEDULE_COLLECTION_ID,
  SCHEDULE_SLOT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// Konfiguracja domyślnej puli urlopów w roku
// Domyślna pula urlopów w roku (używana tylko, gdy nie istnieją żadne zapisy w bazie)
const DEFAULT_VACATION_DAYS = 21;

// CREATE SCHEDULE
export const createSchedule = async (schedule: {
  doctorId: string;
  weekStart: Date;
  weekEnd: Date;
  isActive?: boolean;
}) => {
  try {
    const newSchedule = await databases.createDocument(
      DATABASE_ID!,
      SCHEDULE_COLLECTION_ID!,
      ID.unique(),
      {
        doctorId: schedule.doctorId,
        weekStart: schedule.weekStart,
        weekEnd: schedule.weekEnd,
        isActive: schedule.isActive ?? true,
      }
    );
    return parseStringify(newSchedule);
  } catch (error) {
    console.error("An error occurred while creating schedule:", error);
    throw error;
  }
};

// GET SCHEDULES
export const getSchedules = async (doctorId?: string) => {
  try {
    const queries = [Query.orderDesc("$createdAt")];
    if (doctorId) {
      queries.push(Query.equal("doctorId", [doctorId]));
    }
    
    const schedules = await databases.listDocuments(
      DATABASE_ID!,
      SCHEDULE_COLLECTION_ID!,
      queries
    );
    return parseStringify(schedules.documents);
  } catch (error) {
    console.error("An error occurred while retrieving schedules:", error);
    return [];
  }
};

// CREATE SCHEDULE SLOT
export const createScheduleSlot = async (slot: {
  scheduleId: string;
  doctorId?: string;
  dayOfWeek?: number;
  specificDate?: string; // YYYY-MM-DD (local)
  startTime: string;
  endTime: string;
  type: "commercial" | "nfz";
  status: "working" | "vacation" | "sick_leave";
  roomName?: string;
  roomColor?: string;
  appointmentDuration?: number;
  consultationFee?: number;
}) => {
  try {
    // Normalizuj specificDate do lokalnego YYYY-MM-DD, aby uniknąć przesunięcia o 1 dzień
    const toLocalDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const specificDateNormalized = slot.specificDate
      ? (typeof slot.specificDate === 'string' ? slot.specificDate : toLocalDateKey(slot.specificDate as unknown as Date))
      : null;

    const newSlot = await databases.createDocument(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      ID.unique(),
      {
        scheduleId: slot.scheduleId,
        doctorId: slot.doctorId,
        dayOfWeek: slot.dayOfWeek || null,
        specificDate: specificDateNormalized,
        startTime: slot.startTime,
        endTime: slot.endTime,
        type: slot.type,
        status: slot.status,
        roomName: slot.roomName || null,
        roomColor: slot.roomColor || null,
        isVacationDay: Boolean(slot.status === 'vacation'),
        isSickLeaveDay: Boolean(slot.status === 'sick_leave'),
        isWorkingDay: Boolean(slot.status !== 'vacation' && slot.status !== 'sick_leave' && slot.startTime && slot.endTime),
      }
    );

    // Aktualizuj statystyki po utworzeniu slotu (tylko jeśli doctorId istnieje)
    if (slot.doctorId) {
      try {
        if (slot.specificDate) {
          await calculateAndUpdateStats(slot.doctorId, new Date(slot.specificDate));
        } else {
          // Dla slotów tygodniowych, aktualizuj dla bieżącego tygodnia
          const currentDate = new Date();
          await calculateAndUpdateStats(slot.doctorId, currentDate);
        }
      } catch (statsError) {
        console.error('Error updating stats after creating slot:', statsError);
        // Nie przerywaj procesu tworzenia slotu jeśli aktualizacja statystyk się nie powiedzie
      }
    }

    return parseStringify(newSlot);
  } catch (error) {
    console.error("An error occurred while creating schedule slot:", error);
    throw error;
  }
};

// GET SCHEDULE SLOTS
export const getScheduleSlots = async (scheduleId: string) => {
  try {
    const slots = await databases.listDocuments(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      [
        Query.equal("scheduleId", [scheduleId]),
        Query.orderAsc("dayOfWeek"),
        // Zwiększ limit, bo domyślnie Appwrite zwraca tylko 25 dokumentów
        Query.limit(1000)
      ]
    );
    return parseStringify(slots.documents);
  } catch (error) {
    console.error("An error occurred while retrieving schedule slots:", error);
    return [];
  }
};

// GET SCHEDULE SLOTS FOR SPECIFIC DATE
export const getScheduleSlotsForDate = async (scheduleId: string, date: Date) => {
  try {
    // Użyj lokalnego porównania daty, unikaj przesunięć stref czasowych
    const toLocalDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const dateStr = toLocalDateKey(date);
    const slots = await databases.listDocuments(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      [
        Query.equal("scheduleId", [scheduleId]),
        Query.equal("specificDate", [dateStr])
      ,
      Query.limit(1000)
      ]
    );
    return parseStringify(slots.documents);
  } catch (error) {
    console.error("An error occurred while retrieving schedule slots for date:", error);
    return [];
  }
};

// GET ALL SCHEDULE SLOTS
export const getAllScheduleSlots = async () => {
  try {
    const slots = await databases.listDocuments(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      [
        Query.orderAsc("dayOfWeek"),
        Query.limit(1000)
      ]
    );
    return parseStringify(slots.documents);
  } catch (error) {
    console.error("An error occurred while retrieving all schedule slots:", error);
    return [];
  }
};

// UPDATE SCHEDULE SLOT
export const updateScheduleSlot = async (
  slotId: string,
  data: {
    startTime?: string;
    endTime?: string;
    type?: "commercial" | "nfz";
    status?: "working" | "vacation" | "sick_leave";
    roomName?: string;
    roomColor?: string;
    specificDate?: Date;
  }
) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      slotId,
      data
    );
    return parseStringify(updated);
  } catch (error) {
    console.error("An error occurred while updating schedule slot:", error);
    throw error;
  }
};

// DELETE SCHEDULE SLOT
export const deleteScheduleSlot = async (slotId: string) => {
  try {
    const deleted = await databases.deleteDocument(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      slotId
    );
    return parseStringify(deleted);
  } catch (error) {
    console.error("An error occurred while deleting schedule slot:", error);
    throw error;
  }
};

// DELETE SCHEDULE
export const deleteSchedule = async (scheduleId: string) => {
  try {
    // First delete all slots
    const slots = await getScheduleSlots(scheduleId);
    for (const slot of slots) {
      await deleteScheduleSlot(slot.$id);
    }
    
    // Then delete the schedule
    const deleted = await databases.deleteDocument(
      DATABASE_ID!,
      SCHEDULE_COLLECTION_ID!,
      scheduleId
    );
    return parseStringify(deleted);
  } catch (error) {
    console.error("An error occurred while deleting schedule:", error);
    throw error;
  }
};

// STATISTICS MANAGEMENT
export const updateMonthlyStats = async (doctorId: string, year: number, month: number, stats: {
  totalHours: number;
  workingDays: number;
  vacationDaysUsed: number;
  sickLeaveDaysUsed: number;
  remainingVacationDays: number;
}) => {
  try {
    const existingStats = await databases.listDocuments(
      DATABASE_ID!,
      'monthly_stats',
      [
        Query.equal('doctorId', doctorId),
        Query.equal('year', year),
        Query.equal('month', month)
      ]
    );

    if (existingStats.documents.length > 0) {
      // Aktualizuj istniejące
      const updated = await databases.updateDocument(
        DATABASE_ID!,
        'monthly_stats',
        existingStats.documents[0].$id,
        stats
      );
      return parseStringify(updated);
    } else {
      // Stwórz nowe
      const created = await databases.createDocument(
        DATABASE_ID!,
        'monthly_stats',
        ID.unique(),
        {
          doctorId,
          year,
          month,
          ...stats
        }
      );
      return parseStringify(created);
    }
  } catch (error) {
    console.error('Error updating monthly stats:', error);
    throw error;
  }
};

export const updateYearlyVacationTracking = async (doctorId: string, year: number, stats: {
  usedVacationDays: number;
  usedSickLeaveDays: number;
  remainingVacationDays: number;
}) => {
  try {
    const existingTracking = await databases.listDocuments(
      DATABASE_ID!,
      'yearly_vacation_tracking',
      [
        Query.equal('doctorId', doctorId),
        Query.equal('year', year)
      ]
    );

    if (existingTracking.documents.length > 0) {
      // Aktualizuj istniejące
      const updated = await databases.updateDocument(
        DATABASE_ID!,
        'yearly_vacation_tracking',
        existingTracking.documents[0].$id,
        stats
      );
      return parseStringify(updated);
    } else {
      // Stwórz nowe
      const created = await databases.createDocument(
        DATABASE_ID!,
        'yearly_vacation_tracking',
        ID.unique(),
        {
          doctorId,
          year,
          totalVacationDays: DEFAULT_VACATION_DAYS,
          ...stats
        }
      );
      return parseStringify(created);
    }
  } catch (error) {
    console.error('Error updating yearly vacation tracking:', error);
    throw error;
  }
};

export const getMonthlyStats = async (doctorId: string, year: number, month: number) => {
  try {
    // Pobierz tylko statystyki miesięczne z cache DB (bez przeliczania tutaj)
    const monthlyStats = await databases.listDocuments(
      DATABASE_ID!,
      'monthly_stats',
      [
        Query.equal('doctorId', doctorId),
        Query.equal('year', year),
        Query.equal('month', month)
      ]
    );

    const monthly = monthlyStats.documents[0];

    // Urlopy i zwolnienia trzymajmy w rocznym dokumencie – dzięki temu nie przeliczamy ich przy zmianie miesiąca
    const yearlyStats = await databases.listDocuments(
      DATABASE_ID!,
      'yearly_vacation_tracking',
      [
        Query.equal('doctorId', doctorId),
        Query.equal('year', year)
      ]
    );

    let yearly = yearlyStats.documents[0];

    // Fallback – jeśli brak rocznych statystyk w DB, policz z slotów dla całego roku
    if (!yearly) {
      try {
        const yearStartISO = new Date(year, 0, 1).toISOString();
        const yearEndISO = new Date(year, 11, 31).toISOString();
        const yearSlots = await databases.listDocuments(
          DATABASE_ID!,
          SCHEDULE_SLOT_COLLECTION_ID!,
          [
            Query.equal('doctorId', doctorId),
            Query.greaterThanEqual('specificDate', yearStartISO),
            Query.lessThanEqual('specificDate', yearEndISO),
          ]
        );
        let v = 0; let s = 0;
        (yearSlots.documents as any[]).forEach((slot) => {
          if (slot.status === 'vacation') v++;
          else if (slot.status === 'sick_leave') s++;
        });
        yearly = {
          usedVacationDays: v,
          usedSickLeaveDays: s,
          remainingVacationDays: Math.max(0, DEFAULT_VACATION_DAYS - v),
        } as any;
      } catch (e) {
        console.error('Fallback yearly compute failed:', e);
      }
    }

    return {
      totalHours: monthly?.totalHours ?? 0,
      workingDays: monthly?.workingDays ?? 0,
      vacationDays: yearly?.usedVacationDays ?? 0,
      sickLeaveDays: yearly?.usedSickLeaveDays ?? 0,
      remainingVacationDays: yearly?.remainingVacationDays ?? DEFAULT_VACATION_DAYS,
      totalVacationDays: yearly?.totalVacationDays ?? DEFAULT_VACATION_DAYS,
    };
  } catch (error) {
    console.error('Error fetching monthly stats:', error);
    return {
      totalHours: 0,
      workingDays: 0,
      vacationDays: 0,
      sickLeaveDays: 0,
      remainingVacationDays: DEFAULT_VACATION_DAYS,
      totalVacationDays: DEFAULT_VACATION_DAYS
    };
  }
};

export const getYearlyVacationStats = async (doctorId: string, year: number) => {
  try {
    const yearlyStats = await databases.listDocuments(
      DATABASE_ID!,
      'yearly_vacation_tracking',
      [
        Query.equal('doctorId', doctorId),
        Query.equal('year', year)
      ]
    );

    if (yearlyStats.documents.length > 0) {
      return parseStringify(yearlyStats.documents[0]);
    } else {
      // Zwróć domyślne wartości
      return {
        totalVacationDays: DEFAULT_VACATION_DAYS,
        usedVacationDays: 0,
        usedSickLeaveDays: 0,
        remainingVacationDays: DEFAULT_VACATION_DAYS
      };
    }
  } catch (error) {
    console.error('Error fetching yearly vacation stats:', error);
    return {
      totalVacationDays: DEFAULT_VACATION_DAYS,
      usedVacationDays: 0,
      usedSickLeaveDays: 0,
      remainingVacationDays: DEFAULT_VACATION_DAYS
    };
  }
};

export const calculateAndUpdateStats = async (doctorId: string, date: Date) => {
  try {
    // Walidacja parametrów
    if (!doctorId || !date) {
      console.error('Invalid parameters: doctorId or date is missing');
      return null;
    }

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    // Zakresy w czasie lokalnym (żeby uniknąć przesunięć do poprzedniego dnia)
    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const yearStart = new Date(year, 0, 1, 0, 0, 0, 0);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    // Szybsza ścieżka: jeśli w slotach istnieje atrybut doctorId – pobierz wszystko tego lekarza
    // i odfiltruj w pamięci (najmniej wrażliwe na różnice schematu)
    const allDoctorSlots = await databases.listDocuments(
      DATABASE_ID!,
      SCHEDULE_SLOT_COLLECTION_ID!,
      [Query.equal('doctorId', doctorId), Query.limit(1000)]
    );

    // Dla bezpieczeństwa: jeżeli kolekcja nie ma pola doctorId lub zwróci 0, fallback do scheduleId
    let fallbackUsed = false;
    let allSlots = allDoctorSlots.documents as any[];
    if (!allSlots || allSlots.length === 0) {
      fallbackUsed = true;
      const doctorSchedules = await databases.listDocuments(
        DATABASE_ID!,
        SCHEDULE_COLLECTION_ID!,
        [Query.equal('doctorId', doctorId), Query.limit(1000)]
      );
      const scheduleIds = doctorSchedules.documents.map((s: any) => s.$id);
      if (scheduleIds.length > 0) {
        const bySchedule = await databases.listDocuments(
          DATABASE_ID!,
          SCHEDULE_SLOT_COLLECTION_ID!,
          [Query.equal('scheduleId', scheduleIds), Query.limit(1000)]
        );
        allSlots = bySchedule.documents as any[];
      } else {
        allSlots = [];
      }
    }

    // Podziel sloty na:
    // - z datą (specificDate) -> używane do liczenia godzin (jeśli working), urlopów i zwolnień
    // - tygodniowe (dayOfWeek), bez specificDate -> używane do liczenia godzin (working) przez rozwinięcie w miesiącu
    const slotsWithDate = allSlots.filter((s: any) => !!s.specificDate);

    const toDate = (value: any): Date | null => {
      if (!value) return null;
      if (typeof value === 'string') {
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          // format YYYY-MM-DD
          return new Date(`${value}T00:00:00`);
        }
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
      }
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : d;
    };

    const monthlyDated = slotsWithDate.filter((s: any) => {
      const d = toDate(s.specificDate);
      return !!d && d >= monthStart && d <= monthEnd;
    });
    const yearlyDated = slotsWithDate.filter((s: any) => {
      const d = toDate(s.specificDate);
      return !!d && d >= yearStart && d <= yearEnd;
    });
    const weeklySlots = allSlots.filter((s: any) => !s.specificDate && s.dayOfWeek != null);

    // Oblicz statystyki miesięczne
    let totalHours = 0;
    let workingDays = 0;

    // Godziny pracy w miesiącu:
    const monthlySlotsArray: any[] = [];
    // 1) sloty dzienne w miesiącu
    monthlySlotsArray.push(...monthlyDated);
    // 2) sloty tygodniowe – rozwiń na konkretne dni miesiąca
    weeklySlots.forEach((slot: any) => {
      if (!(slot.startTime && slot.endTime) || slot.status === 'vacation' || slot.status === 'sick_leave') return;
      // dayOfWeek: 0..6, Monday=1 w naszej logice tygodnia; Appwrite brak gwarancji – przyjmij 0..6 (0=Sunday)
      const dow = Number(slot.dayOfWeek);
      // iteruj po wszystkich dniach miesiąca i dodaj, jeśli dzień tygodnia pasuje
      const d = new Date(monthStart);
      while (d <= monthEnd) {
        if (d.getDay() === (dow === 7 ? 0 : dow)) {
          monthlySlotsArray.push({ ...slot, specificDate: d.toISOString() });
        }
        d.setDate(d.getDate() + 1);
      }
    });

    monthlySlotsArray.forEach((slot: any) => {
      if (slot.startTime && slot.endTime && slot.status !== 'vacation' && slot.status !== 'sick_leave') {
        const start = slot.startTime.split(':');
        const end = slot.endTime.split(':');
        const startMinutes = parseInt(start[0]) * 60 + parseInt(start[1]);
        const endMinutes = parseInt(end[0]) * 60 + parseInt(end[1]);
        const hours = (endMinutes - startMinutes) / 60;
        totalHours += hours;
        workingDays++;
      }
    });

    // Oblicz urlopy i zwolnienia z całego roku
    let vacationDays = 0;
    let sickLeaveDays = 0;

    yearlyDated.forEach((slot: any) => {
      if (slot.status === 'vacation') {
        vacationDays++;
      } else if (slot.status === 'sick_leave') {
        sickLeaveDays++;
      }
    });

    const remainingVacationDays = Math.max(0, DEFAULT_VACATION_DAYS - vacationDays);

    // Aktualizuj statystyki miesięczne
    await updateMonthlyStats(doctorId, year, month, {
      totalHours: Math.round(totalHours * 10) / 10,
      workingDays,
      vacationDaysUsed: vacationDays,
      sickLeaveDaysUsed: sickLeaveDays,
      remainingVacationDays: Math.max(0, remainingVacationDays)
    });

    // Aktualizuj śledzenie urlopów rocznych
    const yearlyUpdated = await updateYearlyVacationTracking(doctorId, year, {
      usedVacationDays: vacationDays,
      usedSickLeaveDays: sickLeaveDays,
      remainingVacationDays: Math.max(0, remainingVacationDays)
    });

    return {
      monthly: {
        totalHours: Math.round(totalHours * 10) / 10,
        workingDays,
        vacationDaysUsed: vacationDays,
        sickLeaveDaysUsed: sickLeaveDays,
        remainingVacationDays: Math.max(0, remainingVacationDays)
      },
      yearly: {
        usedVacationDays: vacationDays,
        usedSickLeaveDays: sickLeaveDays,
        remainingVacationDays: Math.max(0, remainingVacationDays)
      }
    };
  } catch (error) {
    console.error('Error calculating and updating stats:', error);
    throw error;
  }
};

// Funkcja do inicjalizacji statystyk dla wszystkich lekarzy
export const initializeAllStats = async () => {
  try {
    // Pobierz wszystkich lekarzy
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!
    );

    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    for (const doctor of doctors.documents) {
      try {
        await calculateAndUpdateStats(doctor.$id, currentDate);
        console.log(`Stats initialized for doctor: ${doctor.name}`);
      } catch (error) {
        console.error(`Error initializing stats for doctor ${doctor.name}:`, error);
      }
    }

    return { success: true, doctorsProcessed: doctors.documents.length };
  } catch (error) {
    console.error('Error initializing all stats:', error);
    throw error;
  }
};