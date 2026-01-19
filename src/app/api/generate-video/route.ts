// softtechniquesweb/src/app/api/generate-video/route.ts
/* eslint-disable react-hooks/rules-of-hooks */
import { NextRequest, NextResponse } from "next/server";
import { getAllJobIds } from "@/lib/videoJobs";
import { hasCredits, useCredit } from "@/lib/creditServiceAdmin";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration, userId } = body ?? {};

    // Check authentication
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Authentication required. Please sign in to generate videos." },
        { status: 401 }
      );
    }

    // Verify user exists in Firestore (using Admin SDK)
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
        { error: "You have no video generation credits remaining. Please contact support to add more credits." },
        { status: 403 }
      );
    }

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 }
      );
    }

    if (!duration) {
      return NextResponse.json(
        { error: "Duration is required." },
        { status: 400 }
      );
    }

    // Use a credit before starting generation
    const creditUsed = await useCredit(userId);
    if (!creditUsed) {
      return NextResponse.json(
        { error: "Failed to use credit. Please try again." },
        { status: 500 }
      );
    }

    const webhookUrl = process.env.N8N_START_WEBHOOK_URL;
    if (!webhookUrl) {
      return NextResponse.json(
        { error: "Server is not configured (missing N8N_START_WEBHOOK_URL)." },
        { status: 500 }
      );
    }

    const site = "softtechniques";

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout

    let n8nRes: Response;
    try {
      n8nRes = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, duration, site }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      if (fetchErr instanceof Error && fetchErr.name === "AbortError") {
        return NextResponse.json(
          {
            error: "n8n webhook request timed out. Please check your n8n workflow configuration.",
            details: "The webhook did not respond within 25 seconds. Make sure it's set to 'Respond: Immediately'.",
          },
          { status: 504 }
        );
      }
      throw fetchErr;
    }

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => "");
      return NextResponse.json(
        {
          error: "Failed to start video generation.",
          details: text || n8nRes.statusText,
        },
        { status: 502 }
      );
    }

    // n8n webhook doesn't return jobId - it will call the callback immediately with { jobId } to register it
    // We'll wait a short time for the callback to register the job, then return the jobId
    console.log("[Start] n8n webhook called successfully. Waiting for callback to register jobId...");
    
    // Get all existing jobIds before the webhook call
    const existingJobIds = new Set(getAllJobIds());
    console.log("[Start] Existing jobIds before webhook:", Array.from(existingJobIds));
    
    // Wait up to 3 seconds for callback to register the job
    const maxWaitTime = 3000; // 3 seconds
    const checkInterval = 100; // Check every 100ms
    const startTime = Date.now();
    
    let registeredJobId: string | null = null;
    
    while (Date.now() - startTime < maxWaitTime) {
      // Check if a new job was registered
      const currentJobIds = getAllJobIds();
      const newJobIds = currentJobIds.filter(id => !existingJobIds.has(id));
      
      if (newJobIds.length > 0) {
        registeredJobId = newJobIds[0]; // Take the first new jobId
        console.log("[Start] Found newly registered jobId from callback:", registeredJobId);
        break;
      }
      
      await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    if (!registeredJobId) {
      console.error("[Start] No jobId was registered by callback within 3 seconds");
      console.error("[Start] Current jobIds:", getAllJobIds());
      return NextResponse.json(
        {
          error: "Job registration timeout.",
          details: "n8n did not call the callback to register the jobId within 3 seconds. Make sure your n8n workflow calls the callback endpoint immediately after the webhook with { jobId }.",
        },
        { status: 504 }
      );
    }
    
    console.log("[Start] Returning registered jobId to frontend:", registeredJobId);
    return NextResponse.json({ jobId: registeredJobId });
  } catch (err) {
    console.error("Error in /api/generate-video:", err);
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    const errorStack = err instanceof Error ? err.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: "Unexpected server error.",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}


