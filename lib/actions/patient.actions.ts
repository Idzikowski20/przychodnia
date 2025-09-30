"use server";

import { ID, Query } from "node-appwrite";

import {
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  databases,
  users,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE APPWRITE USER
export const createUser = async (user: CreateUserParams & { password?: string }) => {
  try {
    console.log("Tworzę użytkownika w Appwrite:", { email: user.email, phone: user.phone, hasPassword: !!user.password });
    
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      user.password, // Hasło jeśli podane
      user.name
    );

    console.log("Użytkownik utworzony w Appwrite:", newuser);
    return parseStringify(newuser);
  } catch (error: any) {
    console.error("Błąd podczas tworzenia użytkownika:", error);
    
    // Check existing user
    if (error && error?.code === 409) {
      console.log("Użytkownik już istnieje, pobieram istniejącego...");
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      if (existingUser.users.length > 0) {
        console.log("Znaleziono istniejącego użytkownika:", existingUser.users[0]);
        return parseStringify(existingUser.users[0]);
      }
    }
    
    console.error("Nie udało się utworzyć ani znaleźć użytkownika");
    return null;
  }
};

// GET USER
export const getUser = async (userId: string) => {
  try {
    const user = await users.get(userId);

    return parseStringify(user);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the user details:",
      error
    );
  }
};

// REGISTER PATIENT
export const registerPatient = async (patient: RegisterUserParams) => {
  try {
    // Create new patient document -> https://appwrite.io/docs/references/cloud/server-nodejs/databases#createDocument
    const newPatient = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        userId: patient.userId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        numberVerified: patient.numberVerified,
        password: patient.password || "",
        birthDate: patient.birthDate,
        gender: patient.gender,
        address: patient.address,
        occupation: patient.occupation,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactNumber: patient.emergencyContactNumber,
        primaryPhysician: patient.primaryPhysician,
        insuranceProvider: patient.insuranceProvider,
        insurancepolicyNumber: patient.insurancePolicyNumber,
        allergies: patient.allergies,
        currentMedication: patient.currentMedication,
        familyMedicalHistory: patient.familyMedicalHistory,
        pastMedicalHistory: patient.pastMedicalHistory,
        privacyConsent: patient.privacyConsent,
        identificationNumber: patient.identificationNumber || "",
        identificationDocumentId: patient.identificationDocumentId || "",
        identificationDocumentUrl: patient.identificationDocumentUrl || "",
      }
    );

    return parseStringify(newPatient);
  } catch (error) {
    console.error("An error occurred while creating a new patient:", error);
  }
};

// GET PATIENT
export const getPatient = async (userId: string) => {
  try {
    if (!userId) {
      console.error("User ID is required");
      return null;
    }

    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    if (patients.documents.length === 0) {
      console.error("Patient not found for userId:", userId);
      return null;
    }

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
    return null;
  }
};

export const getPatients = async () => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    return parseStringify(patients.documents);
  } catch (error) {
    console.error(
      "An error occurred while retrieving patients:",
      error
    );
  }
};

// UPDATE PATIENT (by document id)
export const updatePatient = async (
  patientId: string,
  data: Partial<{
    name: string;
    email: string;
    phone: string;
    numberVerified: boolean;
    password?: string;
    birthDate: Date;
    gender: string;
    address: string;
    occupation: string;
    emergencyContactName: string;
    emergencyContactNumber: string;
    primaryPhysician: string;
    insuranceProvider: string;
    insurancePolicyNumber: string;
    allergies?: string;
    currentMedication?: string;
    familyMedicalHistory?: string;
    pastMedicalHistory?: string;
    privacyConsent?: boolean;
    treatmentConsent?: boolean;
    disclosureConsent?: boolean;
  }>
) => {
  try {
    const updated = await databases.updateDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId,
      data
    );
    return parseStringify(updated);
  } catch (error) {
    console.error("An error occurred while updating patient:", error);
  }
};

// DELETE PATIENT
export const deletePatient = async (patientId: string) => {
  try {
    const deleted = await databases.deleteDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      patientId
    );
    return parseStringify(deleted);
  } catch (error) {
    console.error("An error occurred while deleting patient:", error);
    throw error;
  }
};