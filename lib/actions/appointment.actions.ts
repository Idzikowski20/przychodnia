"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import { Appointment } from "@/types/appwrite.types";

import {
  APPOINTMENT_COLLECTION_ID,
  DATABASE_ID,
  databases,
  messaging,
} from "../appwrite.config";
import { formatDateTime, parseStringify } from "../utils";
import { getRooms } from "./room.actions";
import { getDoctors } from "./doctor.actions";

//  CREATE APPOINTMENT
export const createAppointment = async (
  appointment: CreateAppointmentParams
) => {
  try {
    // Znajdź gabinet przypisany do specjalisty i avatar lekarza
    const [rooms, doctors] = await Promise.all([
      getRooms(),
      getDoctors()
    ]);
    
    const specialistRoom = rooms.find((room: any) => room.assignedSpecialist === appointment.primaryPhysician);
    const doctor = doctors.find((doctor: any) => doctor.name === appointment.primaryPhysician);
    
    // Przygotuj dane wizyty z informacjami o gabinecie i lekarzu
    const appointmentData = {
      ...appointment,
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
    return parseStringify(newAppointment);
  } catch (error) {
    console.error("An error occurred while creating a new appointment:", error);
  }
};

//  GET RECENT APPOINTMENTS
export const getRecentAppointmentList = async () => {
  try {
    // Pobierz wizyty, gabinety i lekarzy równocześnie
    const [appointments, rooms, doctors] = await Promise.all([
      databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.orderDesc("$createdAt")]
      ),
      getRooms(),
      getDoctors()
    ]);

    // const scheduledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "scheduled");

    // const pendingAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "pending");

    // const cancelledAppointments = (
    //   appointments.documents as Appointment[]
    // ).filter((appointment) => appointment.status === "cancelled");

    // const data = {
    //   totalCount: appointments.total,
    //   scheduledCount: scheduledAppointments.length,
    //   pendingCount: pendingAppointments.length,
    //   cancelledCount: cancelledAppointments.length,
    //   documents: appointments.documents,
    // };

    const initialCounts = {
      scheduledCount: 0,
      acceptedCount: 0,
      awaitingCount: 0,
      cancelledCount: 0,
      completedCount: 0,
    };

    const counts = (appointments.documents as Appointment[]).reduce(
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

    // Zaktualizuj wizyty z aktualnymi informacjami o gabinetach i lekarzach
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
        // Zawsze używaj aktualnych danych z gabinetów i lekarzy
        roomId: specialistRoom?.$id || appointment.roomId,
        roomName: specialistRoom?.name || appointment.roomName,
        roomColor: specialistRoom?.color || appointment.roomColor,
        doctorAvatar: doctor?.avatar || appointment.doctorAvatar,
      };
    });

    const data = {
      totalCount: appointments.total,
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
}: UpdateAppointmentParams) => {
  try {
    // Przygotuj dane do aktualizacji
    let updateData: any = {};
    
    if (appointment) {
      updateData = appointment;
    } else {
      if (note !== undefined) updateData.note = note;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
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
    if (type && userId && timeZone && appointment) {
      const smsMessage = `${type === "schedule" ? `Twoja wizyta została potwierdzona na ${formatDateTime(appointment.schedule!, timeZone).dateTime} z dr. ${appointment.primaryPhysician}` : `Z przykrością informujemy, że Twoja wizyta na ${formatDateTime(appointment.schedule!, timeZone).dateTime} została anulowana. Powód:  ${appointment.cancellationReason}`}.`;
      await sendSMSNotification(userId, smsMessage);
    }

    revalidatePath("/admin");
    return parseStringify(updatedAppointment);
  } catch (error) {
    console.error("An error occurred while scheduling an appointment:", error);
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

    return parseStringify(appointment);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the existing patient:",
      error
    );
  }
};

export const getAppointmentsByPatient = async (userId: string) => {
  try {
    console.log("🔍 Szukam wizyt dla userId:", userId);
    
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

    console.log("📋 Znalezione wizyty dla userId:", appointments.documents.length);

    // Zaktualizuj wizyty z aktualnymi informacjami o gabinetach i lekarzach
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
        // Zawsze używaj aktualnych danych z gabinetów i lekarzy
        roomId: specialistRoom?.$id || appointment.roomId,
        roomName: specialistRoom?.name || appointment.roomName,
        roomColor: specialistRoom?.color || appointment.roomColor,
        doctorAvatar: doctor?.avatar || appointment.doctorAvatar,
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

// MARK APPOINTMENT AS COMPLETED
export const markAppointmentAsCompleted = async (appointmentId: string) => {
  try {
    // Najpierw pobierz aktualną wizytę, żeby dostać obecne statusy
    const currentAppointment = await databases.getDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId
    ) as Appointment;

    // Pobierz obecne statusy
    let currentStatuses: string[];
    if (Array.isArray(currentAppointment.status)) {
      currentStatuses = currentAppointment.status;
    } else {
      currentStatuses = currentAppointment.status.includes(',') 
        ? currentAppointment.status.split(',').map((s: string) => s.trim()) 
        : [currentAppointment.status];
    }

    // Dodaj status "completed" jeśli go jeszcze nie ma
    if (!currentStatuses.includes("completed")) {
      currentStatuses.push("completed");
    }

    const updatedAppointment = await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        isCompleted: true,
        status: currentStatuses
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
    console.log("🔄 Aktualizuję istniejące wizyty z informacjami o gabinecie...");
    
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
          console.log(`✅ Zaktualizowano wizytę ${appointmentData.$id}`, updateData);
        }
      }
    }
    
    console.log(`🎉 Zaktualizowano ${updatedCount} wizyt z informacjami o gabinecie`);
    revalidatePath("/admin");
    
    return { success: true, updatedCount };
  } catch (error) {
    console.error("Błąd podczas aktualizacji wizyt z informacjami o gabinecie:", error);
    return { success: false, error };
  }
};
