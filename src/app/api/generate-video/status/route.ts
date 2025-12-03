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

  const result = getJobResult(jobId);

  if (!result) {
    return NextResponse.json({
      status: "pending",
    });
  }

  return NextResponse.json(result);
}

