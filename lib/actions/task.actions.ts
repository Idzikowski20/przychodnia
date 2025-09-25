"use server";

import { revalidatePath } from "next/cache";
import { ID, Query } from "node-appwrite";

import {
  DATABASE_ID,
  databases,
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE TASK
export const createTask = async (task: {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}) => {
  try {
    const newTask = await databases.createDocument(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID - będziesz musiał dodać to do .env.local
      ID.unique(),
      {
        ...task,
        completed: false,
        createdAt: new Date().toISOString(),
      }
    );

    revalidatePath("/admin");
    return parseStringify(newTask);
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

// GET TASKS
export const getTasks = async () => {
  try {
    const tasks = await databases.listDocuments(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID
      [Query.orderDesc("$createdAt")]
    );

    return parseStringify(tasks.documents);
  } catch (error) {
    console.error("Error getting tasks:", error);
    return [];
  }
};

// UPDATE TASK
export const updateTask = async (taskId: string, updates: {
  title?: string;
  description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}) => {
  try {
    const updatedTask = await databases.updateDocument(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID
      taskId,
      updates
    );

    revalidatePath("/admin");
    return parseStringify(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

// DELETE TASK
export const deleteTask = async (taskId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID
      taskId
    );

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

// TOGGLE TASK COMPLETION
export const toggleTaskCompletion = async (taskId: string) => {
  try {
    // Najpierw pobierz aktualny task
    const currentTask = await databases.getDocument(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID
      taskId
    );

    const updatedTask = await databases.updateDocument(
      DATABASE_ID!,
      "tasks", // TASK_COLLECTION_ID
      taskId,
      {
        completed: !(currentTask as any).completed
      }
    );

    revalidatePath("/admin");
    return parseStringify(updatedTask);
  } catch (error) {
    console.error("Error toggling task completion:", error);
    throw error;
  }
};

