import { NextRequest, NextResponse } from "next/server";
import { ID, InputFile } from "node-appwrite";

import { storage, BUCKET_ID } from "@/lib/appwrite.config";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileId = ID.unique();
    await storage.createFile(
      BUCKET_ID!,
      fileId,
      InputFile.fromBlob(file, file.name)
    );
    
    // Zwróć tylko fileId - URL będzie generowany przez nasz API endpoint
    return NextResponse.json({ 
      success: true, 
      fileId
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
