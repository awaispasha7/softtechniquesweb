// softtechniquesweb/src/app/api/generate-video/route.ts
import { NextRequest, NextResponse } from "next/server";

type N8nStartResponse = {
  jobId?: string;
  id?: string;
  workflowId?: string;
  // Allow additional properties from n8n without using `any`
  [key: string]: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, duration } = body ?? {};

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

    const responseText = await n8nRes.text();
    let data: N8nStartResponse;
    
    try {
      data = JSON.parse(responseText) as N8nStartResponse;
    } catch (parseErr) {
      console.error("Failed to parse n8n response:", responseText);
      return NextResponse.json(
        {
          error: "n8n returned invalid JSON response.",
          details: `Response was: ${responseText.substring(0, 200)}`,
        },
        { status: 502 }
      );
    }

    const jobId = data.jobId ?? data.id ?? data.workflowId;

    console.log("[Start] n8n webhook response:", JSON.stringify(data, null, 2));
    console.log("[Start] Extracted jobId:", jobId);

    if (!jobId || typeof jobId !== "string") {
      console.error("[Start] n8n response missing jobId. Full response:", JSON.stringify(data, null, 2));
      return NextResponse.json(
        {
          error: "n8n did not return a valid jobId.",
          details: `Expected jobId, id, or workflowId in the response. Received: ${JSON.stringify(data)}. Make sure your n8n webhook node returns a JSON object with a 'jobId' field containing the same jobId that will be used in the callback.`,
        },
        { status: 500 }
      );
    }

    console.log("[Start] Successfully extracted jobId from n8n:", jobId);
    console.log("[Start] Returning jobId to frontend. IMPORTANT: n8n callback must use this EXACT jobId:", jobId);
    return NextResponse.json({ jobId });
  } catch (err) {
    console.error("Error in /api/generate-video:", err);
    return NextResponse.json(
      { error: "Unexpected server error." },
      { status: 500 }
    );
  }
}


