// softtechniquesweb/src/app/api/generate-video/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getJobResult } from "@/lib/videoJobs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "jobId is required." },
      { status: 400 }
    );
  }

  console.log(`[Status] Checking status for jobId: ${jobId}`);
  const result = getJobResult(jobId);

  if (!result) {
    console.log(`[Status] No result found for jobId: ${jobId}, returning pending`);
    return NextResponse.json({
      status: "pending",
    });
  }

  console.log(`[Status] Found result for jobId: ${jobId}`, result);
  return NextResponse.json(result);
}

