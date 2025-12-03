// softtechniquesweb/src/app/api/generate-video/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { notifyJobComplete, registerJob, JobResult } from "@/lib/videoJobs";

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get("x-n8n-secret");
  const expectedSecret = process.env.N8N_CALLBACK_SECRET;

  if (!expectedSecret || secretHeader !== expectedSecret) {
    console.error("Callback unauthorized - secret mismatch or missing");
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    console.log("[Callback] Received body:", JSON.stringify(body, null, 2));
    
    const { jobId, status, videoUrl, error } = body ?? {};

    if (!jobId || typeof jobId !== "string") {
      console.error("[Callback] Missing or invalid jobId:", jobId);
      return NextResponse.json(
        { error: "jobId is required." },
        { status: 400 }
      );
    }

    // Case 1: Initial registration - just jobId (no status)
    if (!status) {
      console.log(`[Callback] Initial registration for jobId: ${jobId}`);
      registerJob(jobId);
      return NextResponse.json({ ok: true, message: "Job registered" });
    }

    // Case 2: Completion notification - jobId + status + (videoUrl or error)
    if (status !== "done" && status !== "error") {
      console.error("[Callback] Invalid status:", status);
      return NextResponse.json(
        { error: "Invalid status. Must be 'done' or 'error'." },
        { status: 400 }
      );
    }

    // Ensure videoUrl is a valid string if status is done
    let finalVideoUrl: string | undefined;
    if (status === "done") {
      const urlStr = String(videoUrl || "").trim();
      if (urlStr && urlStr.length > 0) {
        finalVideoUrl = urlStr;
      } else {
        console.warn(`[Callback] Job ${jobId} marked as done but videoUrl is empty`);
      }
    }

    const result: JobResult = {
      status,
      videoUrl: finalVideoUrl,
      error: status === "error" ? String(error || "Unknown error") : undefined,
    };

    console.log(`[Callback] Notifying job complete for jobId: ${jobId}`, result);
    notifyJobComplete(jobId, result);
    console.log(`[Callback] Successfully notified job complete for jobId: ${jobId}`);

    return NextResponse.json({ ok: true, message: "Job completed" });
  } catch (err) {
    console.error("[Callback] Error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}


