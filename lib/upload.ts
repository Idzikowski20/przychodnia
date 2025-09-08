"use client";

export const uploadFileToStorage = async (file: File): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    
    const result = await response.json();
    // Zwróć URL do naszego API endpoint zamiast bezpośredniego URL Appwrite
    return `/api/file/${result.fileId}`;
  } catch (error) {
    console.error("Error uploading file to storage:", error);
    throw error;
  }
};
