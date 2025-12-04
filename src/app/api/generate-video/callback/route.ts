// softtechniquesweb/src/app/api/generate-video/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { notifyJobComplete, registerJob, JobResult } from "@/lib/videoJobs";
import { saveGeneratedVideo } from "@/lib/videoService";
import { uploadVideoToCloudinary } from "@/lib/cloudinary";

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
    
    const { jobId, status, videoUrl, videoName, error, prompt, duration } = body ?? {};

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
        // Optionally compress video using Cloudinary
        // Note: For best performance, compress videos in n8n workflow before sending URL
        // This is a fallback compression option
        const shouldCompress = process.env.ENABLE_VIDEO_COMPRESSION === 'true';
        
        if (shouldCompress && !urlStr.includes('cloudinary.com')) {
          try {
            console.log(`[Callback] Compressing video via Cloudinary for jobId: ${jobId}`);
            finalVideoUrl = await uploadVideoToCloudinary(urlStr, 'generated-videos', {
              quality: 'auto', // Best compression
              bitRate: 1000, // 1 Mbps for good compression
              maxWidth: 1920, // Max 1080p width
              format: 'auto', // Auto format (usually webm for better compression)
            });
            console.log(`[Callback] Video compressed successfully. New URL: ${finalVideoUrl}`);
          } catch (compressError) {
            console.error(`[Callback] Video compression failed for jobId: ${jobId}, using original URL`, compressError);
            finalVideoUrl = urlStr; // Fallback to original URL
          }
        } else {
          finalVideoUrl = urlStr;
        }
      } else {
        console.warn(`[Callback] Job ${jobId} marked as done but videoUrl is empty`);
      }
    }

    const result: JobResult = {
      status,
      videoUrl: finalVideoUrl,
      videoName: status === "done" && videoName ? String(videoName).trim() : undefined,
      error: status === "error" ? String(error || "Unknown error") : undefined,
    };

    console.log(`[Callback] Notifying job complete for jobId: ${jobId}`, result);
    notifyJobComplete(jobId, result);
    console.log(`[Callback] Successfully notified job complete for jobId: ${jobId}`);

    // Save to Firestore if video was successfully generated
    if (status === "done" && finalVideoUrl) {
      // Check if prompt and duration are provided
      if (!prompt || !duration) {
        console.warn(`[Callback] Missing prompt or duration for jobId: ${jobId}. Prompt: ${prompt}, Duration: ${duration}. Video will not be saved to Firestore.`);
      } else {
        try {
          await saveGeneratedVideo({
            jobId,
            videoUrl: finalVideoUrl,
            videoName: videoName ? String(videoName).trim() : undefined,
            prompt: String(prompt),
            duration: Number(duration),
            status: "done",
          });
          console.log(`[Callback] ✅ Saved video to Firestore for jobId: ${jobId}`);
        } catch (firestoreError) {
          console.error(`[Callback] ❌ Error saving to Firestore for jobId: ${jobId}`, firestoreError);
          // Don't fail the callback if Firestore save fails
        }
      }
    } else if (status === "done") {
      console.warn(`[Callback] Video marked as done but no videoUrl provided for jobId: ${jobId}`);
    }

    return NextResponse.json({ ok: true, message: "Job completed" });
  } catch (err) {
    console.error("[Callback] Error:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}


