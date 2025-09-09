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
export const createUser = async (user: CreateUserParams) => {
  try {
    // Create new user -> https://appwrite.io/docs/references/1.5.x/server-nodejs/users#create
    const newuser = await users.create(
      ID.unique(),
      user.email,
      user.phone,
      undefined,
      user.name
    );

    return parseStringify(newuser);
  } catch (error: any) {
    // Check existing user
    if (error && error?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);

      return existingUser.users[0];
    }
    console.error("An error occurred while creating a new user:", error);
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
        birthDate: patient.birthDate,
        gender: patient.gender,
        address: patient.address,
        occupation: patient.occupation,
        emergencyContactName: patient.emergencyContactName,
        emergencyContactNumber: patient.emergencyContactNumber,
        primaryPhysician: patient.primaryPhysician,
        insuranceProvider: patient.insuranceProvider,
        insurancePolicyNumber: patient.insurancePolicyNumber,
        allergies: patient.allergies,
        currentMedication: patient.currentMedication,
        familyMedicalHistory: patient.familyMedicalHistory,
        pastMedicalHistory: patient.pastMedicalHistory,
        privacyConsent: patient.privacyConsent,
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
