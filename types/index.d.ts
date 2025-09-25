/* eslint-disable no-unused-vars */

declare type SearchParamProps = {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

declare type Gender = "male" | "female" | "others";
declare type Status = string[]; // Array of strings: ["accepted", "scheduled"]

declare interface CreateUserParams {
  name: string;
  email: string;
  phone: string;
}
declare interface User extends CreateUserParams {
  $id: string;
}

declare interface RegisterUserParams extends CreateUserParams {
  userId: string;
  birthDate: Date;
  gender: Gender;
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  primaryPhysician: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string | undefined;
  currentMedication: string | undefined;
  familyMedicalHistory: string | undefined;
  pastMedicalHistory: string | undefined;
  privacyConsent: boolean;
  identificationNumber: string | undefined;
  identificationDocumentId: string | undefined;
  identificationDocumentUrl: string | undefined;
}

declare type CreateAppointmentParams = {
  userId: string;
  patient: string;
  primaryPhysician: string;
  reason: string;
  schedule: Date;
  status: Status;
  note: string | undefined;
  isCompleted: boolean;
  roomName?: string;
  roomColor?: string;
};

declare type UpdateAppointmentParams = {
  appointmentId: string;
  userId?: string;
  timeZone?: string;
  appointment?: Appointment;
  type?: string;
  note?: string;
  adminNotes?: string;
  skipSMS?: boolean;
};

declare type CreateDoctorParams = {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  licenseNumber: string;
  isActive: boolean;
  avatar?: string;
  bio?: string;
  workingHours: string; // JSON string
  appointmentDuration: string;
  breakDuration: string;
  maxAppointmentsPerDay: string;
  consultationFee: string;
  currency: string;
  notes?: string;
  roomName?: string;
  roomColor?: string;
};

declare type UpdateDoctorParams = {
  doctorId: string;
  doctor: Partial<CreateDoctorParams>;
};

