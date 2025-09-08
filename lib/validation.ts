import { z } from "zod";

export const UserFormValidation = z.object({
  name: z
    .string()
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(50, "Imię może mieć maksymalnie 50 znaków"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Nieprawidłowy numer telefonu"),
});

export const PatientFormValidation = z.object({
  name: z
    .string()
    .min(2, "Imię musi mieć co najmniej 2 znaki")
    .max(50, "Imię może mieć maksymalnie 50 znaków"),
  email: z.string().email("Nieprawidłowy adres email"),
  phone: z
    .string()
    .refine((phone) => /^\+\d{10,15}$/.test(phone), "Nieprawidłowy numer telefonu"),
  birthDate: z.coerce.date(),
  gender: z.enum(["Mężczyzna", "Kobieta", "Inny"]),
  address: z
    .string()
    .min(5, "Adres musi mieć co najmniej 5 znaków")
    .max(500, "Adres może mieć maksymalnie 500 znaków"),
  occupation: z
    .string()
    .min(2, "Zawód musi mieć co najmniej 2 znaki")
    .max(500, "Zawód może mieć maksymalnie 500 znaków"),
  emergencyContactName: z
    .string()
    .min(2, "Imię kontaktu musi mieć co najmniej 2 znaki")
    .max(50, "Imię kontaktu może mieć maksymalnie 50 znaków"),
  emergencyContactNumber: z
    .string()
    .refine(
      (emergencyContactNumber) => /^\+\d{10,15}$/.test(emergencyContactNumber),
      "Nieprawidłowy numer telefonu"
    ),
  primaryPhysician: z.string().min(2, "Wybierz co najmniej jednego lekarza"),
  insuranceProvider: z
    .string()
    .min(2, "Nazwa ubezpieczyciela musi mieć co najmniej 2 znaki")
    .max(50, "Nazwa ubezpieczyciela może mieć maksymalnie 50 znaków"),
  insurancePolicyNumber: z
    .string()
    .min(2, "Numer polisy musi mieć co najmniej 2 znaki")
    .max(50, "Numer polisy może mieć maksymalnie 50 znaków"),
  allergies: z.string().optional(),
  currentMedication: z.string().optional(),
  familyMedicalHistory: z.string().optional(),
  pastMedicalHistory: z.string().optional(),
  treatmentConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Musisz wyrazić zgodę na leczenie, aby kontynuować",
    }),
  disclosureConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Musisz wyrazić zgodę na ujawnienie informacji, aby kontynuować",
    }),
  privacyConsent: z
    .boolean()
    .default(false)
    .refine((value) => value === true, {
      message: "Musisz wyrazić zgodę na politykę prywatności, aby kontynuować",
    }),
});

export const CreateAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Wybierz co najmniej jednego lekarza"),
  schedule: z.coerce.date(),
  reason: z
    .string()
    .min(2, "Powód musi mieć co najmniej 2 znaki")
    .max(500, "Powód może mieć maksymalnie 500 znaków"),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const ScheduleAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Wybierz co najmniej jednego lekarza"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z.string().optional(),
});

export const CancelAppointmentSchema = z.object({
  primaryPhysician: z.string().min(2, "Wybierz co najmniej jednego lekarza"),
  schedule: z.coerce.date(),
  reason: z.string().optional(),
  note: z.string().optional(),
  cancellationReason: z
    .string()
    .min(2, "Powód musi mieć co najmniej 2 znaki")
    .max(500, "Powód może mieć maksymalnie 500 znaków"),
});

export function getAppointmentSchema(type: string) {
  switch (type) {
    case "create":
      return CreateAppointmentSchema;
    case "cancel":
      return CancelAppointmentSchema;
    default:
      return ScheduleAppointmentSchema;
  }
}
