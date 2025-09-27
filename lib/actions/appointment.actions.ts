"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";
import { createRevenueForAppointment } from "./revenue.actions";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";

import { getDoctors } from "./doctor.actions";
import { getRooms } from "./room.actions";
import { getPatient } from "./patient.actions";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    // Znajdź gabinet przypisany do specjalisty, avatar lekarza i dane pacjenta
    const [rooms, doctors, patient] = await Promise.all([
      getRooms(),
      getDoctors(),
      getPatient(appointment.userId)
    ]);
    
    const specialistRoom = rooms.find((room: any) => room.assignedSpecialist === appointment.primaryPhysician);
    const doctor = doctors.find((doctor: any) => doctor.name === appointment.primaryPhysician);
    
    // Przygotuj dane wizyty z informacjami o gabinecie, lekarzu i pacjencie
    const appointmentData = {
      ...appointment,
      // Usuń pole patient z appointmentData - będzie dodane automatycznie przez Appwrite
      roomId: specialistRoom?.$id || null,
      roomName: specialistRoom?.name || null,
      roomColor: specialistRoom?.color || null,
      doctorAvatar: doctor?.avatar || null,
    };
    
    const newAppointment = await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointmentData
    );

    // Wysyłanie SMS-a z potwierdzeniem utworzenia wizyty
    const smsMessage = `Twoja prośba o wizytę została pomyślnie złożona na ${formatDateTime(appointment.schedule).dateTime} z dr. ${appointment.primaryPhysician}. Skontaktujemy się z Tobą wkrótce w celu potwierdzenia, Pozdrowienia z CarePulse. `;
    await sendSMSNotification(appointment.userId, smsMessage);

    revalidatePath("/admin");
    revalidatePath("/patients");
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    // Pobierz wizyty, gabinety i lekarzy równocześnie z lepszą obsługą błędów
    const [appointments, rooms, doctors] = await Promise.allSettled([
      databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt"), Query.limit(1000)]
      ),
      getRooms(),
      getDoctors()
    ]);

    // Obsłuż wyniki
    const appointmentsResult = appointments.status === 'fulfilled' ? appointments.value : { documents: [] };
    const roomsResult = rooms.status === 'fulfilled' ? rooms.value : [];
    const doctorsResult = doctors.status === 'fulfilled' ? doctors.value : [];

    // const scheduledAppointments = (
    //   appointmentsResult.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "scheduled");

    // const pendingAppointments = (
    //   appointmentsResult.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "pending");

    // const cancelledAppointments = (
    //   appointmentsResult.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "cancelled");

    // const data = {
    //   totalCount: appointments.total,
    //   scheduledCount: scheduledAppointments.length,
    //   pendingCount: pendingAppointments.length,
    //   cancelledCount: cancelledAppointments.length,
    //   documents: appointmentsResult.documents,
    // };

    const initialCounts = {
      scheduledCount: 0,
      acceptedCount: 0,
      awaitingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
    };

    const counts = (appointmentsResult.documents as Appointment[]).reduce(
      (acc, appointment) => {
        // Backward compatibility: obsługa zarówno array jak i string
        let statuses: string[];
        
        if (Array.isArray(appointment.status)) {
          statuses = appointment.status;
        } else {
          // Jeśli to string, podziel po przecinku lub użyj jako pojedynczy status
          statuses = appointment.status.includes(',') ? appointment.status.split(',').map(s => s.trim()) : [appointment.status];
        }
        
        // Jeśli array jest pusty, traktuj jako "awaiting"
        if (statuses.length === 0) {
          statuses = ["awaiting"];
        }
        
        statuses.forEach(status => {
          switch (status) {
            case "scheduled":
              acc.scheduledCount++;
              break;
            case "accepted":
              acc.acceptedCount++;
              break;
            case "completed":
              acc.completedCount++;
              break;
            case "awaiting":
            case "pending":
              acc.awaitingCount++;
              break;
            case "cancelled":
              acc.cancelledCount++;
              break;
          }
        });
        
        return acc;
      },
      initialCounts
    );

    // Pobierz dane pacjentów dla wszystkich wizyt
    const patientPromises = appointmentsResult.documents.map((appointment: any) => 
      getPatient(appointment.userId)
    );
    const patients = await Promise.all(patientPromises);
    



    // Zaktualizuj wizyty z aktualnymi informacjami o gabinetach, lekarzach i pacjentach
    const updatedAppointments = appointmentsResult.documents.map((appointment: any, index: number) => {
      // Znajdź gabinet przypisany do specjalisty
      const specialistRoom = roomsResult.find((room: any) => 
        room.assignedSpecialist === appointment.primaryPhysician
      );
      
      // Znajdź lekarza
      const doctor = doctorsResult.find((doctor: any) => 
        doctor.name === appointment.primaryPhysician
      );
      
      // Pobierz dane pacjenta
      const patient = patients[index];
      
      return {
        ...appointment,
        // Zawsze używaj aktualnych danych z gabinetów, lekarzy i pacjentów
        roomId: specialistRoom?.$id || appointment.roomId,
        roomName: specialistRoom?.name || appointment.roomName,
        roomColor: specialistRoom?.color || appointment.roomColor,
        doctorAvatar: doctor?.avatar || appointment.doctorAvatar,
        patient: patient || appointment.patient, // Użyj pobranych danych pacjenta lub fallback
      };
    });

    const data = {
      totalCount: (appointmentsResult as any).total || appointmentsResult.documents.length,
      ...counts,
      documents: updatedAppointments,
    };

    return parseStringify(data);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the recent appointments:",
      error
    );
  }
};

//  SEND SMS NOTIFICATION
export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    // https://appwrite.io/docs/references/1.5.x/server-nodejs/messaging#createSms
    const message = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    );
    return parseStringify(message);
  } catch (error) {
    console.error("An error occurred while sending sms:", error);
  }
};

//  UPDATE APPOINTMENT
export const updateAppointment = async ({
  appointmentId,
  userId,
  timeZone,
  appointment,
  type,
  note,
  adminNotes,
  skipSMS = false,
}: UpdateAppointmentParams) => {
  try {
    // Walidacja wymaganych parametrów
    if (!appointmentId) {
      throw new Error("Appointment ID is required");
    }
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Przygotuj dane do aktualizacji
    let updateData: any = {};

    // Dla operacji statusu trzymajmy minimalny payload (tylko status)
    if (type === "cancel" || type === "schedule" || type === "complete") {
      updateData = {
        status:
          type === "cancel"
            ? ["cancelled"]
            : type === "schedule"
            ? ["accepted"]
            : ["completed"],
      };
      console.log("🔍 Update (status-only) payload:", updateData);
    } else if (appointment) {
      // Kopiuj tylko bezpieczne pola (bez relacji)
      if (appointment.primaryPhysician !== undefined) updateData.primaryPhysician = appointment.primaryPhysician;
      if (appointment.schedule !== undefined) updateData.schedule = appointment.schedule;
      if (appointment.reason !== undefined) updateData.reason = appointment.reason;
      if (appointment.note !== undefined) updateData.note = appointment.note;
      if (appointment.cancellationReason !== undefined) updateData.cancellationReason = appointment.cancellationReason;
      if (appointment.isCompleted !== undefined) updateData.isCompleted = appointment.isCompleted;
      if (appointment.rescheduleNote !== undefined) updateData.rescheduleNote = appointment.rescheduleNote;

      if (appointment.status !== undefined) {
        updateData.status = Array.isArray(appointment.status)
          ? appointment.status
          : [appointment.status];
      }
      console.log("🔍 Update (details) payload:", updateData);
    } else {
      // Notatki bez zmiany statusu
      if (note !== undefined) updateData.note = note;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      console.log("🔍 Update (notes) payload:", updateData);
    }

    // Upewnij się, że relacje w istniejącym dokumencie są zgodne ze schematem (np. 'patient' nie jest tablicą)
    try {
      const existing: any = await databases.getDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        appointmentId
      );
      // Normalizacja relacji 'patient' (jeżeli w dokumencie jest tablica, wybierz pierwszy element / $id)
      if (existing && (Array.isArray(existing.patient) || typeof existing.patient !== 'string')) {
        let normalizedPatient: string | undefined;
        if (Array.isArray(existing.patient)) {
          const first = existing.patient[0];
          if (typeof first === 'string') normalizedPatient = first;
          else if (first && typeof first === 'object' && first.$id) normalizedPatient = first.$id;
        } else if (existing.patient && typeof existing.patient === 'object' && existing.patient.$id) {
          normalizedPatient = existing.patient.$id;
        }
        // Fallback do userId, jeżeli wygląda jak ID pacjenta
        if (!normalizedPatient && typeof existing.userId === 'string') {
          normalizedPatient = existing.userId;
        }
        if (normalizedPatient) {
          (updateData as any).patient = normalizedPatient;
        }
      }

    } catch (e) {
      console.warn('⚠️ Could not load existing appointment for normalization');
    }

    // Update appointment -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#updateDocument
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      updateData
    );

    if (!updatedAppointment) throw Error;

    // Wyślij SMS tylko gdy aktualizujemy status wizyty, nie gdy dodajemy notatki
    if (type && userId && timeZone && appointment && !skipSMS) {
      let smsMessage = "";
      
      if (type === "schedule") {
        smsMessage = `Twoja wizyta została potwierdzona na ${formatDateTime(appointment.schedule!, timeZone).dateTime} z dr. ${appointment.primaryPhysician}.`;
      } else if (type === "plan") {
        // SMS dla przełożenia wizyty
        const newDate = formatDateTime(appointment.schedule!, timeZone);
        const doctorChange = appointment.primaryPhysician !== appointment.originalPhysician ? 
          ` i została przeniesiona do dr. ${appointment.primaryPhysician}` : "";
        smsMessage = `Twoja wizyta została przełożona na ${newDate.dateTime}${doctorChange}.`;
      } else if (type === "cancel") {
        smsMessage = `Z przykrością informujemy, że Twoja wizyta na ${formatDateTime(appointment.schedule!, timeZone).dateTime} została anulowana. Powód: ${appointment.cancellationReason}.`;
      }
      
      if (smsMessage) {
        await sendSMSNotification(userId, smsMessage);
      }
    }

    // Utwórz wpis dochodów dla potwierdzonych/odbytych wizyt
    if ((type === "schedule" || type === "complete") && appointment) {
      try {
        // Pobierz harmonogramy i sloty (można to zoptymalizować)
        const schedulesResponse = await databases.listDocuments(DATABASE_ID!, "schedules");
        const scheduleSlotsResponse = await databases.listDocuments(DATABASE_ID!, "scheduleSlots");
        
        await createRevenueForAppointment(
          updatedAppointment, 
          schedulesResponse.documents, 
          scheduleSlotsResponse.documents
        );
      } catch (error) {
        console.error("Błąd tworzenia wpisu dochodów:", error);
        // Nie przerywamy procesu jeśli nie uda się utworzyć wpisu dochodów
      }
    }

    revalidatePath("/admin");
    revalidatePath("/patients");
    
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
    throw error; // Re-throw the error so the caller can handle it
  }
};

// GET APPOINTMENT
export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    );

    // Pobierz dane pacjenta dla tej wizyty
    const patient = await getPatient((appointment as any).userId);

    // Zwróć wizytę z danymi pacjenta
    const appointmentWithPatient = {
      ...appointment,
      patient: patient || (appointment as any).patient, // Użyj pobranych danych pacjenta lub fallback
    };

    return parseStringify(appointmentWithPatient);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the appointment:",
      error
    );
  }
};

export const getAppointmentsByPatient = async (userId: string) => {
  try {

    
    // Pobierz wizyty, gabinety i lekarzy równocześnie
    const [appointments, rooms, doctors] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.equal("userId", [userId]), Query.orderDesc("schedule")]
      ),
      getRooms(),
      getDoctors()
    ]);



    // Pobierz dane pacjenta dla tego użytkownika
    const patient = await getPatient(userId);

    // Zaktualizuj wizyty z aktualnymi informacjami o gabinetach, lekarzach i pacjencie
    const updatedAppointments = appointments.documents.map((appointment: any) => {
      // Znajdź gabinet przypisany do specjalisty
      const specialistRoom = rooms.find((room: any) => 
        room.assignedSpecialist === appointment.primaryPhysician
      );
      
      // Znajdź lekarza
      const doctor = doctors.find((doctor: any) => 
        doctor.name === appointment.primaryPhysician
      );
      
      return {
        ...appointment,
        // Zawsze używaj aktualnych danych z gabinetów, lekarzy i pacjenta
        roomId: specialistRoom?.$id || appointment.roomId,
        roomName: specialistRoom?.name || appointment.roomName,
        roomColor: specialistRoom?.color || appointment.roomColor,
        doctorAvatar: doctor?.avatar || appointment.doctorAvatar,
        patient: patient || appointment.patient, // Użyj pobranych danych pacjenta lub fallback
      };
    });

    return parseStringify(updatedAppointments);
  } catch (error) {
    console.error(
      "An error occurred while retrieving patient appointments:",
      error
    );
  }
};

// GET APPOINTMENTS BY DOCTOR AND DATE
export const getAppointmentsByDoctorAndDate = async (doctorName: string, date: Date) => {
  try {
    console.log("🔍 Szukam wizyt dla lekarza:", doctorName, "w dniu (LOCAL):", date);

    // Pomocniczo: lokalny klucz daty YYYY-MM-DD, aby uniknąć przesunięć stref czasowych
    const toLocalDateKey = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Lokalny klucz dnia dla wybranej daty
    const dateString = toLocalDateKey(date);
    
    // Pobierz wszystkie wizyty dla danego lekarza
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal("primaryPhysician", [doctorName])]
    );



    // Filtruj wizyty dla konkretnego dnia (LOKALNIE) i wyklucz anulowane/zakończone
    const dayAppointments = appointments.documents.filter((appointment: any) => {
      const appointmentDate = new Date(appointment.schedule);
      const appointmentDateString = toLocalDateKey(appointmentDate);
      
      // Sprawdź czy wizyta jest w tym dniu
      if (appointmentDateString !== dateString) return false;
      
      // Sprawdź status wizyty - wyklucz anulowane i zakończone
      const status = appointment.status;
      if (Array.isArray(status)) {
        // Jeśli status to tablica, sprawdź czy zawiera "cancelled" lub "completed"
        if (status.includes("cancelled") || status.includes("completed")) {
          return false;
        }
      } else if (typeof status === "string") {
        // Jeśli status to string, sprawdź czy to "cancelled" lub "completed"
        if (status === "cancelled" || status === "completed") {
          return false;
        }
      }
      
      return true;
    });



    // Pobierz dane pacjentów dla wszystkich wizyt w tym dniu
    const patientPromises = dayAppointments.map((appointment: any) => 
      getPatient(appointment.userId)
    );
    const patients = await Promise.all(patientPromises);

    // Zaktualizuj wizyty z danymi pacjentów
    const appointmentsWithPatients = dayAppointments.map((appointment: any, index: number) => {
      const patient = patients[index];
      return {
        ...appointment,
        patient: patient || appointment.patient, // Użyj pobranych danych pacjenta lub fallback
      };
    });

    return parseStringify(appointmentsWithPatients);
  } catch (error) {
    console.error("An error occurred while retrieving doctor appointments for date:", error);
    return [];
  }
};

// MARK APPOINTMENT AS COMPLETED
export const markAppointmentAsCompleted = async (appointmentId: string) => {
  try {
    // Najpierw pobierz aktualną wizytę, żeby dostać obecne statusy
    const currentAppointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    ) as Appointment;

    // Pobierz obecny status
    let currentStatus: string;
    if (Array.isArray(currentAppointment.status)) {
      currentStatus = currentAppointment.status[0] || "awaiting";
    } else {
      currentStatus = currentAppointment.status || "awaiting";
    }

    // Ustaw status na "completed"
    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        isCompleted: true,
        status: ["completed"]
      }
    );

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while marking appointment as completed:", error);
  }
};

// UPDATE EXISTING APPOINTMENTS WITH ROOM INFO
export const updateAppointmentsWithRoomInfo = async () => {
  try {

    
    // Pobierz wszystkie wizyty
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    // Pobierz wszystkie gabinety i lekarzy
    const [rooms, doctors] = await Promise.all([
      getRooms(),
      getDoctors()
    ]);
    
    let updatedCount = 0;
    
    // Dla każdej wizyty sprawdź czy ma przypisany gabinet i avatar lekarza
    for (const appointment of appointments.documents) {
      const appointmentData = appointment as any;
      
      // Sprawdź czy wizyta potrzebuje aktualizacji
      const needsRoomUpdate = !appointmentData.roomName && appointmentData.primaryPhysician;
      const needsAvatarUpdate = !appointmentData.doctorAvatar && appointmentData.primaryPhysician;
      
      if (needsRoomUpdate || needsAvatarUpdate) {
        // Znajdź gabinet przypisany do specjalisty
        const specialistRoom = rooms.find((room: any) => 
          room.assignedSpecialist === appointmentData.primaryPhysician
        );
        
        // Znajdź lekarza
        const doctor = doctors.find((doctor: any) => 
          doctor.name === appointmentData.primaryPhysician
        );
        
        // Przygotuj dane do aktualizacji
        const updateData: any = {};
        
        if (needsRoomUpdate && specialistRoom) {
          updateData.roomId = specialistRoom.$id;
          updateData.roomName = specialistRoom.name;
          updateData.roomColor = specialistRoom.color;
        }
        
        if (needsAvatarUpdate && doctor) {
          updateData.doctorAvatar = doctor.avatar;
        }
        
        // Zaktualizuj wizytę jeśli są jakieś dane do aktualizacji
        if (Object.keys(updateData).length > 0) {
          await databases.updateDocument(
            DATABASE_ID!,
            APPOINTMENT_COLLECTION_ID!,
            appointmentData.$id,
            updateData
          );
          
          updatedCount++;

        }
      }
    }
    

    revalidatePath("/admin");
    
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Błąd podczas aktualizacji wizyt z informacjami o gabinecie:", error);
    return { success: false, error };
  }
};

// DASHBOARD STATISTICS
export const getDashboardStats = async () => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Pobierz wszystkie wizyty z ostatnich 30 dni
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThan("schedule", thirtyDaysAgo.toISOString()),
        Query.orderDesc("schedule")
      ]
    );

    // Pobierz wizyty na dzisiaj
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(today);
    todayEnd.setHours(23, 59, 59, 999);

    const todayAppointments = appointments.documents.filter((appointment: any) => {
      const appointmentDate = new Date(appointment.schedule);
      return appointmentDate >= todayStart && appointmentDate <= todayEnd;
    });

    // Policz statystyki
    const stats = {
      todayAppointments: todayAppointments.length,
      todayScheduled: todayAppointments.filter((apt: any) => 
        Array.isArray(apt.status) ? apt.status.includes('scheduled') : apt.status === 'scheduled'
      ).length,
      totalAppointments30Days: appointments.documents.length,
      cancelledAppointments30Days: appointments.documents.filter((apt: any) => 
        Array.isArray(apt.status) ? apt.status.includes('cancelled') : apt.status === 'cancelled'
      ).length,
      completedAppointments30Days: appointments.documents.filter((apt: any) => 
        Array.isArray(apt.status) ? apt.status.includes('completed') : apt.status === 'completed'
      ).length,
    };

    return parseStringify(stats);
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    return {
      todayAppointments: 0,
      todayScheduled: 0,
      totalAppointments30Days: 0,
      cancelledAppointments30Days: 0,
      completedAppointments30Days: 0,
    };
  }
};

// UPCOMING APPOINTMENTS
export const getUpcomingAppointments = async (limit: number = 5) => {
  try {
    const now = new Date();
    
    // Pobierz nadchodzące wizyty (zaplanowane i zaakceptowane)
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThan("schedule", now.toISOString()),
        Query.orderAsc("schedule"),
        Query.limit(limit)
      ]
    );

    // Filtruj tylko wizyty ze statusem accepted lub pending (nie scheduled - przełożone)
    const upcomingAppointments = appointments.documents.filter((appointment: any) => {
      const status = appointment.status;
      if (Array.isArray(status)) {
        return status.includes('accepted') || status.includes('pending') || status.includes('awaiting');
      }
      return status === 'accepted' || status === 'pending' || status === 'awaiting';
    });

    return parseStringify(upcomingAppointments);
  } catch (error) {
    console.error("Error getting upcoming appointments:", error);
    return [];
  }
};

// REVENUE DATA
export const getRevenueData = async (days: number = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Pobierz wizyty z ostatnich X dni
    const appointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThan("schedule", startDate.toISOString()),
        Query.lessThan("schedule", endDate.toISOString()),
        Query.orderDesc("schedule")
      ]
    );

    // Oblicz przychód (zakładając że każda wizyta to 200 zł)
    const totalRevenue = appointments.documents.length * 200;
    
    // Oblicz przychód z poprzedniego okresu dla porównania
    const previousStartDate = new Date();
    previousStartDate.setDate(startDate.getDate() - days);
    
    const previousAppointments = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.greaterThan("schedule", previousStartDate.toISOString()),
        Query.lessThan("schedule", startDate.toISOString()),
        Query.orderDesc("schedule")
      ]
    );

    const previousRevenue = previousAppointments.documents.length * 200;
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

    return parseStringify({
      totalRevenue,
      previousRevenue,
      revenueGrowth: Math.round(revenueGrowth),
      appointmentsCount: appointments.documents.length
    });
  } catch (error) {
    console.error("Error getting revenue data:", error);
    return {
      totalRevenue: 0,
      previousRevenue: 0,
      revenueGrowth: 0,
      appointmentsCount: 0
    };
  }
};
