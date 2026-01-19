import { NextRequest, NextResponse } from "next/server";
import { hasCredits, useCredit } from "@/lib/creditServiceAdmin";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Configure route for large file uploads
export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('[Football Upload] Received request');
    
    // Parse form data - this might load large files into memory
    // but it's necessary to extract userId for auth checks
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    console.log('[Football Upload] File received:', file ? { name: file.name, size: file.size, type: file.type } : 'null');
    console.log('[Football Upload] UserId:', userId);
    
    // Early validation before processing file

    // Check authentication
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to analyze videos." },
        { status: 401 }
      );
    }

    // Verify user exists in Firestore
    const userDoc = await getAdminDb().collection('users').doc(userId).get();
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: "User not found. Please sign in again." },
        { status: 401 }
      );
    }

    // Check if user has credits
    const hasCredit = await hasCredits(userId);
    if (!hasCredit) {
      return NextResponse.json(
        { error: "You have no credits remaining. Please contact support to add more credits." },
        { status: 403 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    // Use a credit before processing
    const creditUsed = await useCredit(userId);
    if (!creditUsed) {
      return NextResponse.json(
        { error: "Failed to use credit. Please try again." },
        { status: 500 }
      );
    }

    // Forward to Python backend
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const uploadEndpoint = `${backendUrl}/api/videos/upload`;
    
    console.log(`[Football Upload] Backend URL: ${backendUrl}`);
    console.log(`[Football Upload] Upload endpoint: ${uploadEndpoint}`);
    console.log(`[Football Upload] Forwarding file to backend: ${file.name}, size: ${file.size} bytes`);

    // Check if backend URL is accessible
    if (!backendUrl || backendUrl === 'http://localhost:8000') {
      console.warn('[Football Upload] WARNING: Backend URL not configured, using default localhost');
    }

    const backendFormData = new FormData();
    
    // Use file directly - File objects from Next.js FormData should work with fetch
    // Avoid arrayBuffer() as it loads entire file into memory, causing HTTP/2 protocol errors
    backendFormData.append('file', file, file.name);

    // Create AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for upload

    try {
      const backendRes = await fetch(uploadEndpoint, {
        method: 'POST',
        body: backendFormData,
        signal: controller.signal,
        // Force HTTP/1.1 to avoid HTTP/2 protocol errors with large files
        // HTTP/2 can have issues with large request bodies
        headers: {
          'Accept': 'application/json',
          'Connection': 'keep-alive',
        },
        // @ts-ignore - Node.js fetch supports this
        keepalive: true,
      });

      clearTimeout(timeoutId);

      console.log(`[Football Upload] Backend response status: ${backendRes.status}`);

      if (!backendRes.ok) {
        let errorDetail = 'Backend error';
        try {
          const errorData = await backendRes.json();
          errorDetail = errorData.detail || errorData.error || errorDetail;
          console.error(`[Football Upload] Backend error:`, errorData);
        } catch (parseError) {
          const errorText = await backendRes.text().catch(() => 'Unknown error');
          console.error(`[Football Upload] Backend error (non-JSON):`, errorText);
          errorDetail = errorText || errorDetail;
        }
        
        return NextResponse.json(
          { error: errorDetail || 'Upload failed' },
          { status: backendRes.status }
        );
      }

      const result = await backendRes.json();
      console.log(`[Football Upload] Upload successful, job_id: ${result.job_id}`);
      return NextResponse.json(result);
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      console.error(`[Football Upload] Fetch error:`, fetchError);
      
      if (fetchError.name === 'AbortError') {
        return NextResponse.json(
          { error: "Upload timeout. The file may be too large or the server is taking too long to respond." },
          { status: 504 }
        );
      }
      
      // Re-throw to be caught by outer catch block
      throw fetchError;
    }
  } catch (err) {
    console.error("Error in /api/football/upload:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    
    // Check for specific error types
    if (err instanceof Error) {
      if (err.name === 'AbortError' || errorMessage.includes('timeout')) {
        return NextResponse.json(
          { error: "Upload timeout. The file may be too large or the server is taking too long to respond." },
          { status: 504 }
        );
      }
      if (errorMessage.includes('ECONNRESET') || errorMessage.includes('connection reset') || 
          errorMessage.includes('ECONNREFUSED') || errorMessage.includes('fetch failed')) {
        return NextResponse.json(
          { 
            error: "Cannot connect to backend server. Please check if the backend is running and accessible.",
            details: process.env.NODE_ENV === 'development' ? `Backend URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'not set'}` : undefined
          },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Unexpected server error.",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
