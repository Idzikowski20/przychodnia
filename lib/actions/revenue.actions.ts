"use server";

import { databases, DATABASE_ID } from "@/lib/appwrite.config";
import { ID } from "node-appwrite";

const REVENUE_COLLECTION_ID = "revenue"; // ID kolekcji revenue

export interface RevenueEntry {
  $id?: string;
  amount: number;
  date: string;
  type: string;
  doctorId: string;
  appointmentId?: string;
  $createdAt?: string;
  $updatedAt?: string;
}

// Sprawdź czy kolekcja revenue istnieje i czy ma wszystkie potrzebne kolumny
async function ensureRevenueCollection() {
  try {
    // Spróbuj pobrać kolekcję
    const collection = await databases.getCollection(DATABASE_ID!, REVENUE_COLLECTION_ID);
    console.log("Kolekcja revenue już istnieje");
    
    // Sprawdź czy ma kolumnę appointmentId
    try {
      await databases.getAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "appointmentId");
      console.log("Kolumna appointmentId już istnieje");
    } catch (attrError) {
      // Jeśli kolumna nie istnieje, dodaj ją
      console.log("Dodawanie kolumny appointmentId...");
      try {
        await databases.createStringAttribute(
          DATABASE_ID!, 
          REVENUE_COLLECTION_ID, 
          "appointmentId", 
          100, 
          false // nie wymagane
        );
        console.log("Kolumna appointmentId dodana!");
      } catch (addError) {
        console.error("Błąd dodawania kolumny appointmentId:", addError);
      }
    }
  } catch (error) {
    // Jeśli kolekcja nie istnieje, utwórz ją
    console.log("Tworzenie kolekcji revenue...");
    try {
      await databases.createCollection(DATABASE_ID!, REVENUE_COLLECTION_ID, "Revenue", [
        {
          key: "amount",
          type: "double",
          required: true,
          default: 0
        },
        {
          key: "date",
          type: "string",
          required: true,
          size: 50
        },
        {
          key: "type",
          type: "string",
          required: true,
          size: 100
        },
        {
          key: "doctorId",
          type: "string",
          required: true,
          size: 100
        },
        {
          key: "appointmentId",
          type: "string",
          required: false,
          size: 100
        }
      ]);
      console.log("Kolekcja revenue utworzona!");
    } catch (createError) {
      console.error("Błąd tworzenia kolekcji revenue:", createError);
      // Nie rzucaj błędu, po prostu loguj
    }
  }
}

// Pobierz wpisy dochodów
export async function getRevenueEntries(filters?: {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  type?: string;
}) {
  try {
    // Upewnij się, że kolekcja istnieje
    await ensureRevenueCollection();
    
    let queries: string[] = [];
    
    if (filters?.startDate) {
      queries.push(`date >= "${filters.startDate}"`);
    }
    
    if (filters?.endDate) {
      queries.push(`date <= "${filters.endDate}"`);
    }
    
    if (filters?.doctorId) {
      queries.push(`doctorId = "${filters.doctorId}"`);
    }
    
    if (filters?.type) {
      queries.push(`type = "${filters.type}"`);
    }

    const response = await databases.listDocuments(
      DATABASE_ID!,
      REVENUE_COLLECTION_ID,
      queries.length > 0 ? queries : undefined
    );

    return response.documents as RevenueEntry[];
  } catch (error) {
    console.error("Błąd pobierania wpisów dochodów:", error);
    // Jeśli nie można pobrać z bazy revenue, zwróć pustą tablicę
    return [];
  }
}

// Utwórz wpis dochodów
export async function createRevenueEntry(data: Omit<RevenueEntry, "$id" | "$createdAt" | "$updatedAt">) {
  try {
    // Upewnij się, że kolekcja istnieje
    await ensureRevenueCollection();
    
    const response = await databases.createDocument(
      DATABASE_ID!,
      REVENUE_COLLECTION_ID,
      ID.unique(),
      {
        amount: data.amount,
        date: data.date,
        type: data.type,
        doctorId: data.doctorId,
        appointmentId: data.appointmentId || "",
      }
    );

    return response as RevenueEntry;
  } catch (error) {
    console.error("Błąd tworzenia wpisu dochodów:", error);
    throw error;
  }
}

// Zaktualizuj wpis dochodów
export async function updateRevenueEntry(id: string, data: Partial<RevenueEntry>) {
  try {
    const response = await databases.updateDocument(
      DATABASE_ID!,
      REVENUE_COLLECTION_ID,
      id,
      data
    );

    return response as RevenueEntry;
  } catch (error) {
    console.error("Błąd aktualizacji wpisu dochodów:", error);
    throw error;
  }
}

// Usuń wpis dochodów
export async function deleteRevenueEntry(id: string) {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      REVENUE_COLLECTION_ID,
      id
    );

    return true;
  } catch (error) {
    console.error("Błąd usuwania wpisu dochodów:", error);
    throw error;
  }
}

// Pobierz dochody miesięczne
export async function getMonthlyRevenue(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(year, month, 0).toISOString().split('T')[0];
  
  return getRevenueEntries({
    startDate,
    endDate
  });
}

// Pobierz dochody roczne
export async function getYearlyRevenue(year: number) {
  const startDate = new Date(year, 0, 1).toISOString().split('T')[0];
  const endDate = new Date(year, 11, 31).toISOString().split('T')[0];
  
  return getRevenueEntries({
    startDate,
    endDate
  });
}

// Utwórz wpis dochodów dla wizyty
export async function createRevenueForAppointment(appointment: any, schedules: any[], scheduleSlots: any[]) {
  try {
    // Znajdź cenę z grafiku specjalisty
    const doctorId = appointment.primaryPhysician?.$id || appointment.primaryPhysician;
    const appointmentTime = new Date(appointment.schedule);
    const dayOfWeek = appointmentTime.getDay();
    
    // Znajdź harmonogram specjalisty
    const doctorSchedule = schedules.find(schedule => 
      schedule.doctor?.$id === doctorId || schedule.doctor === doctorId
    );
    
    let amount = 0;
    if (doctorSchedule) {
      // Znajdź slot dla tego dnia tygodnia i godziny
      const slot = scheduleSlots.find(slot => 
        slot.schedule?.$id === doctorSchedule.$id && 
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= appointmentTime.toTimeString().slice(0, 5) &&
        slot.endTime > appointmentTime.toTimeString().slice(0, 5)
      );
      
      if (slot && slot.price) {
        amount = parseFloat(slot.price);
      } else if (doctorSchedule.defaultPrice) {
        amount = parseFloat(doctorSchedule.defaultPrice);
      }
    }
    
    // Fallback na cenę z wizyty jeśli nie ma w grafiku
    if (amount === 0) {
      amount = parseFloat(appointment.amount || appointment.price || 0);
    }
    
    // Utwórz wpis dochodów tylko jeśli kwota > 0
    if (amount > 0) {
      const revenueEntry = await createRevenueEntry({
        amount,
        date: appointmentTime.toISOString().split('T')[0],
        type: "appointment",
        doctorId: doctorId || "",
        appointmentId: appointment.$id
      });
      
      return revenueEntry;
    }
    
    return null;
  } catch (error) {
    console.error("Błąd tworzenia wpisu dochodów dla wizyty:", error);
    return null;
  }
}
