"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";


import {
  DATABASE_ID,
  DOCTOR_COLLECTION_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// DOCTOR_COLLECTION_ID jest już zaimportowany z appwrite.config.ts

// CREATE DOCTOR
export const createDoctor = async (doctor: CreateDoctorParams) => {
  try {
    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      ID.unique(),
      doctor
    );

    revalidatePath("/admin");
    return parseStringify(newDoctor);
  } catch (error) {
    console.error("An error occurred while creating a new doctor:", error);
  }
};

// GET DOCTORS
export const getDoctors = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    return parseStringify(doctors.documents);
  } catch (error) {
    console.error("An error occurred while retrieving doctors:", error);
  }
};

// GET DOCTOR
export const getDoctor = async (doctorId: string) => {
  try {
    const doctor = await databases.getDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    return parseStringify(doctor);
  } catch (error) {
    console.error("An error occurred while retrieving the doctor:", error);
  }
};

// UPDATE DOCTOR
export const updateDoctor = async ({
  doctorId,
  doctor,
}: UpdateDoctorParams) => {
  try {
    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      doctor
    );

    if (!updatedDoctor) throw Error;

    revalidatePath("/admin");
    return parseStringify(updatedDoctor);
  } catch (error) {
    console.error("An error occurred while updating the doctor:", error);
  }
};

// DELETE DOCTOR
export const deleteDoctor = async (doctorId: string) => {
  try {
    const deletedDoctor = await databases.deleteDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    if (!deletedDoctor) throw Error;

    revalidatePath("/admin");
    return parseStringify(deletedDoctor);
  } catch (error) {
    console.error("An error occurred while deleting the doctor:", error);
  }
};

// GET ACTIVE DOCTORS
export const getActiveDoctors = async () => {
  try {
    const doctors = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [
        Query.equal("isActive", true),
        Query.orderAsc("name")
      ]
    );

    return parseStringify(doctors.documents);
  } catch (error) {
    console.error("An error occurred while retrieving active doctors:", error);
  }
};

// UPDATE DOCTOR SCHEDULE
export const updateDoctorSchedule = async (doctorId: string, workingHours: string) => {
  try {
    const updatedDoctor = await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      { workingHours }
    );

    if (!updatedDoctor) throw Error;

    revalidatePath("/admin");
    return parseStringify(updatedDoctor);
  } catch (error) {
    console.error("An error occurred while updating doctor schedule:", error);
  }
};
