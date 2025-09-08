import { NextRequest, NextResponse } from "next/server";
import { storage, BUCKET_ID } from "@/lib/appwrite.config";

export async function GET(
  request: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;
    
    if (!fileId) {
      return NextResponse.json({ error: "File ID is required" }, { status: 400 });
    }

    // Pobierz plik z Appwrite Storage
    const file = await storage.getFileView(BUCKET_ID!, fileId);
    
    // Pobierz metadane pliku żeby określić typ MIME
    const fileInfo = await storage.getFile(BUCKET_ID!, fileId);
    const mimeType = fileInfo.mimeType || 'image/jpeg';
    
    // Zwróć plik jako response
    return new NextResponse(file, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000', // Cache na rok
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
