// softtechniquesweb/src/app/api/generate-video/stream/route.ts
import { NextRequest, NextResponse } from "next/server";
import {
  getJobResult,
  registerListener,
  JobResult,
} from "@/lib/videoJobs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json(
      { error: "jobId is required." },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(result: JobResult) {
        const data = `data: ${JSON.stringify(result)}\n\n`;
        controller.enqueue(encoder.encode(data));
        controller.close();
      }

      // If job already has a result, send immediately
      const existing = getJobResult(jobId);
      if (existing) {
        send(existing);
        return;
      }

      // Otherwise, register listener
      registerListener(jobId, send);

      // Handle client disconnect
      const abort = req.signal;
      abort.addEventListener("abort", () => {
        try {
          controller.close();
        } catch {
          // ignore
        }
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}


