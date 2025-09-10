"use server";

import { ID, Query } from "node-appwrite";

import { 
  DATABASE_ID, 
  ROOM_COLLECTION_ID,
  databases 
} from "../appwrite.config";
import { parseStringify } from "../utils";

// CREATE ROOM
export const createRoom = async (room: {
  name: string;
  color: string;
  assignedSpecialist?: string;
}) => {
  try {
    const newRoom = await databases.createDocument(
      DATABASE_ID!,
      ROOM_COLLECTION_ID!,
      ID.unique(),
      room
    );

    return parseStringify(newRoom);
  } catch (error) {
    console.error("An error occurred while creating a new room:", error);
  }
};

// GET ROOMS
export const getRooms = async () => {
  try {
    const rooms = await databases.listDocuments(
      DATABASE_ID!,
      ROOM_COLLECTION_ID!,
      [Query.orderDesc("$createdAt")]
    );

    return parseStringify(rooms.documents);
  } catch (error) {
    console.error("An error occurred while fetching rooms:", error);
    return [];
  }
};

// UPDATE ROOM
export const updateRoom = async ({
  roomId,
  room,
}: {
  roomId: string;
  room: {
    name?: string;
    color?: string;
    assignedSpecialist?: string;
  };
}) => {
  try {
    // Jeśli przypisujemy specjalistę, usuń go z innych gabinetów
    if (room.assignedSpecialist) {
      const allRooms = await databases.listDocuments(
        DATABASE_ID!,
        ROOM_COLLECTION_ID!,
        [Query.orderDesc("$createdAt")]
      );

      // Usuń specjalistę z innych gabinetów
      for (const existingRoom of allRooms.documents) {
        if (existingRoom.$id !== roomId && existingRoom.assignedSpecialist === room.assignedSpecialist) {
          await databases.updateDocument(
            DATABASE_ID!,
            ROOM_COLLECTION_ID!,
            existingRoom.$id,
            { assignedSpecialist: null }
          );
        }
      }
    }

    const updatedRoom = await databases.updateDocument(
      DATABASE_ID!,
      ROOM_COLLECTION_ID!,
      roomId,
      room
    );

    return parseStringify(updatedRoom);
  } catch (error) {
    console.error("An error occurred while updating room:", error);
  }
};

// DELETE ROOM
export const deleteRoom = async (roomId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      ROOM_COLLECTION_ID!,
      roomId
    );

    return { success: true };
  } catch (error) {
    console.error("An error occurred while deleting room:", error);
  }
};

// REMOVE DUPLICATE ROOMS
export const removeDuplicateRooms = async () => {
  try {
    const allRooms = await databases.listDocuments(
      DATABASE_ID!,
      ROOM_COLLECTION_ID!,
      [Query.orderAsc("name")]
    );

    const roomMap = new Map();
    const duplicatesToDelete: string[] = [];

    // Znajdź duplikaty
    allRooms.documents.forEach((room: any) => {
      const name = room.name;
      if (roomMap.has(name)) {
        // To jest duplikat - dodaj do listy do usunięcia
        duplicatesToDelete.push(room.$id);
      } else {
        // Pierwszy gabinet o tej nazwie - zachowaj
        roomMap.set(name, room.$id);
      }
    });

    // Usuń duplikaty
    for (const roomId of duplicatesToDelete) {
      await databases.deleteDocument(
        DATABASE_ID!,
        ROOM_COLLECTION_ID!,
        roomId
      );
    }

    console.log(`Usunięto ${duplicatesToDelete.length} duplikatów gabinetów`);
    return { 
      success: true, 
      removedCount: duplicatesToDelete.length,
      keptRooms: Array.from(roomMap.values())
    };
  } catch (error) {
    console.error("Błąd podczas usuwania duplikatów gabinetów:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
};
