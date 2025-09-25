import { Models } from "node-appwrite";

export interface Patient extends Models.Document {
  userId: string;
  userid: string; // ID użytkownika z Appwrite (users table)
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancepolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  privacyConsent: boolean;
  identificationNumber: string | undefined;
  identificationDocumentId: string | undefined;
  identificationDocumentUrl: string | undefined;
}

export interface Appointment extends Models.Document {
  patient: Patient;
  schedule: Date;
  status: Status | string; // Backward compatibility: obsługa zarówno array jak i string
  primaryPhysician: string;
  reason: string;
  note: string; // Notatka od pacjenta (powód wizyty)
  adminNotes: string | null; // Notatka od admina (po wizycie)
  userId: string;
  cancellationReason: string | null;
  isCompleted: boolean; // Czy wizyta faktycznie się odbyła
  roomId?: string; // ID gabinetu
  roomName?: string; // Nazwa gabinetu dla łatwiejszego wyświetlania
  roomColor?: string; // Kolor gabinetu dla kalendarza
  doctorAvatar?: string; // Avatar lekarza dla wyświetlania w tabeli
}

export interface WorkingHours {
  [key: string]: {
    start: string;
    end: string;
    isWorking: boolean;
  };
}

export interface Doctor extends Models.Document {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  avatar?: string;
  bio?: string;
  workingHours: string; // JSON string z WorkingHours
  appointmentDuration: string; // Długość wizyty w minutach (String w Appwrite)
  breakDuration: string; // Długość przerwy w minutach (String w Appwrite)
  maxAppointmentsPerDay: string;
  consultationFee: string;
  currency: string;
  notes?: string;
}

export interface Room extends Models.Document {
  name: string;
  color: string;
  assignedSpecialist?: string;
}

export interface Task extends Models.Document {
  title: string;
  description?: string;
  completed: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

export interface Revenue extends Models.Document {
  amount: number;
  date: string;
  type: string;
  doctorId: string;
}

