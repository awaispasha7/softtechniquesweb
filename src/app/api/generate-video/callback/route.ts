// softtechniquesweb/src/app/api/generate-video/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { notifyJobComplete, JobResult } from "@/lib/videoJobs";

export async function POST(req: NextRequest) {
  const secretHeader = req.headers.get("x-n8n-secret");
  const expectedSecret = process.env.N8N_CALLBACK_SECRET;

  if (!expectedSecret || secretHeader !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { jobId, status, videoUrl, error } = body ?? {};

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json(
        { error: "jobId is required." },
        { status: 400 }
      );
    }

    if (status !== "done" && status !== "error") {
      return NextResponse.json(
        { error: "Invalid status." },
        { status: 400 }
      );
    }

    const result: JobResult = {
      status,
      videoUrl: status === "done" ? String(videoUrl || "") : undefined,
      error: status === "error" ? String(error || "Unknown error") : undefined,
    };

    notifyJobComplete(jobId, result);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error in /api/generate-video/callback:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}


