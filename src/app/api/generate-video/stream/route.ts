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
      let isClosed = false;
      let keepaliveInterval: NodeJS.Timeout | null = null;

      function send(result: JobResult) {
        if (isClosed) {
          console.log(`[SSE] Stream already closed for jobId: ${jobId}, cannot send result`);
          return;
        }

        try {
          const data = `data: ${JSON.stringify(result)}\n\n`;
          console.log(`[SSE] Sending result for jobId: ${jobId}`, result);
          controller.enqueue(encoder.encode(data));
          isClosed = true;
          
          if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
          }
          
          controller.close();
          console.log(`[SSE] Stream closed for jobId: ${jobId}`);
        } catch (error) {
          console.error(`[SSE] Error sending result for jobId: ${jobId}`, error);
          isClosed = true;
          try {
            controller.close();
          } catch {
            // ignore
          }
        }
      }

      // If job already has a result, send immediately
      const existing = getJobResult(jobId);
      if (existing) {
        console.log(`[SSE] Job ${jobId} already has result, sending immediately`);
        send(existing);
        return;
      }

      // Otherwise, register listener
      console.log(`[SSE] Registering listener for jobId: ${jobId}`);
      registerListener(jobId, send);

      // Send keepalive pings every 30 seconds to keep connection alive
      keepaliveInterval = setInterval(() => {
        if (isClosed) {
          if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
          }
          return;
        }
        try {
          // Send a comment line (SSE keepalive)
          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          // Connection closed, stop keepalive
          isClosed = true;
          if (keepaliveInterval) {
            clearInterval(keepaliveInterval);
            keepaliveInterval = null;
          }
        }
      }, 30000);

      // Handle client disconnect
      const abort = req.signal;
      abort.addEventListener("abort", () => {
        console.log(`[SSE] Client disconnected for jobId: ${jobId}`);
        isClosed = true;
        if (keepaliveInterval) {
          clearInterval(keepaliveInterval);
          keepaliveInterval = null;
        }
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


