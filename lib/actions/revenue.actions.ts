"use server";

import { databases, DATABASE_ID } from "@/lib/appwrite.config";
import { ID, Query } from "node-appwrite";

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
    
    // Sprawdź uprawnienia kolekcji
    try {
      await databases.updateCollection(
        DATABASE_ID!,
        REVENUE_COLLECTION_ID,
        "Revenue",
        ["read(\"any\")", "create(\"any\")", "update(\"any\")", "delete(\"any\")"]
      );
      console.log("Uprawnienia kolekcji revenue zaktualizowane");
    } catch (permError) {
      console.log("Nie można zaktualizować uprawnień kolekcji revenue:", permError instanceof Error ? permError.message : permError);
    }
  } catch (error) {
    // Jeśli kolekcja nie istnieje, utwórz ją
    console.log("Tworzenie kolekcji revenue...");
    try {
      await databases.createCollection(
        DATABASE_ID!, 
        REVENUE_COLLECTION_ID, 
        "Revenue", 
        ["read(\"any\")", "create(\"any\")", "update(\"any\")", "delete(\"any\")"]
      );
      console.log("Kolekcja revenue utworzona!");
      
      // Dodaj atrybuty do kolekcji
      await databases.createFloatAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "amount", true, 0, 999999, 0);
      await databases.createStringAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "date", 50, true);
      await databases.createStringAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "type", 100, true);
      await databases.createStringAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "doctorId", 100, true);
      await databases.createStringAttribute(DATABASE_ID!, REVENUE_COLLECTION_ID, "appointmentId", 100, false);
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
    console.log("Pobieranie wpisów dochodów z filtrami:", filters);
    
    // Upewnij się, że kolekcja revenue istnieje
    await ensureRevenueCollection();
    
    let queries: any[] = [];
    
    // Jeśli nie ma filtrów dat, pobierz wszystkie wpisy
    if (!filters?.startDate && !filters?.endDate) {
      console.log("Brak filtrów dat - pobieranie wszystkich wpisów dochodów");
    } else {
      if (filters?.startDate) {
        queries.push(Query.greaterThanEqual("date", filters.startDate));
      }
      
      if (filters?.endDate) {
        queries.push(Query.lessThanEqual("date", filters.endDate));
      }
    }
    
    if (filters?.doctorId) {
      queries.push(Query.equal("doctorId", [filters.doctorId]));
    }
    
    if (filters?.type) {
      queries.push(Query.equal("type", [filters.type]));
    }

    console.log("Wykonywanie zapytania do kolekcji Revenue z queries:", queries);

    const response = await databases.listDocuments(
      DATABASE_ID!,
      REVENUE_COLLECTION_ID,
      queries.length > 0 ? queries : undefined
    );

    console.log("Odpowiedź z kolekcji Revenue:", response.documents);
    console.log("Liczba dokumentów:", response.documents.length);

    return response.documents as unknown as RevenueEntry[];
  } catch (error) {
    console.error("Błąd pobierania wpisów dochodów:", error);
    // Jeśli nie można pobrać z bazy revenue, zwróć pustą tablicę
    return [];
  }
}

// Utwórz wpis dochodów
export async function createRevenueEntry(data: Omit<RevenueEntry, "$id" | "$createdAt" | "$updatedAt">) {
  try {
    console.log("Tworzenie wpisu dochodów:", data);
    
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

    console.log("Wpis dochodów utworzony:", response);
    return response as unknown as RevenueEntry;
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

    return response as unknown as RevenueEntry;
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

// Pobierz sumę dochodów dla określonego okresu
export async function getTotalRevenue(filters?: {
  startDate?: string;
  endDate?: string;
  doctorId?: string;
  type?: string;
}) {
  try {
    const entries = await getRevenueEntries(filters);
    const total = entries.reduce((sum, entry) => sum + (entry.amount || 0), 0);
    console.log(`Suma dochodów: ${total} zł z ${entries.length} wpisów`);
    return total;
  } catch (error) {
    console.error("Błąd obliczania sumy dochodów:", error);
    return 0;
  }
}

// Pobierz dochody z ostatnich 30 dni
export async function getLast30DaysRevenue() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);
  
  return getRevenueEntries({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });
}

// Pobierz dochody z ostatnich 7 dni
export async function getLast7DaysRevenue() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  return getRevenueEntries({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  });
}

// Utwórz wpis dochodów dla wizyty
export async function createRevenueForAppointment(appointment: any, schedules: any[], scheduleSlots: any[]) {
  try {
    // Znajdź cenę z grafiku specjalisty
    const doctorName = appointment.primaryPhysician;
    const appointmentTime = new Date(appointment.schedule);
    const dayOfWeek = appointmentTime.getDay() === 0 ? 7 : appointmentTime.getDay(); // Sunday = 7
    
    // Znajdź harmonogram specjalisty po nazwie lekarza
    const doctorSchedule = schedules.find(schedule => 
      schedule.doctorName === doctorName || schedule.doctor?.name === doctorName
    );
    
    let amount = 0;
    let doctorId = "";
    
    if (doctorSchedule) {
      doctorId = doctorSchedule.doctorId || doctorSchedule.doctor?.$id || "";
      
      // Znajdź slot dla tego dnia tygodnia i godziny
      const slot = scheduleSlots.find(slot => 
        slot.scheduleId === doctorSchedule.$id && 
        slot.dayOfWeek === dayOfWeek &&
        slot.startTime <= appointmentTime.toTimeString().slice(0, 5) &&
        slot.endTime > appointmentTime.toTimeString().slice(0, 5)
      );
      
      if (slot) {
        // Sprawdź czy slot ma consultationFee w roomName (JSON)
        if (slot.roomName) {
          try {
            const roomData = JSON.parse(slot.roomName);
            if (roomData.consultationFee !== undefined) {
              amount = parseFloat(roomData.consultationFee);
            }
          } catch (e) {
            // Jeśli nie można sparsować JSON, użyj domyślnej ceny
            amount = slot.type === 'nfz' ? 0 : 150;
          }
        } else if (slot.type === 'nfz') {
          amount = 0;
        } else {
          amount = 150; // Domyślna cena dla wizyt komercyjnych
        }
      } else if (doctorSchedule.defaultPrice) {
        amount = parseFloat(doctorSchedule.defaultPrice);
      }
    }
    
    // Fallback na cenę z wizyty jeśli nie ma w grafiku
    if (amount === 0 && appointment.amount) {
      amount = parseFloat(appointment.amount);
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
