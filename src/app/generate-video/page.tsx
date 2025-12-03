"use client";

import { FormEvent, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Status = "idle" | "starting" | "waiting" | "done" | "error";

export default function GenerateVideoPage() {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("10");
  const [status, setStatus] = useState<Status>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Rotating loading messages
  useEffect(() => {
    if (status !== "waiting") {
      setLoadingMessage("");
      return;
    }

    const messages = [
      "Building your video...",
      "Applying AI magic...",
      "Crafting your vision...",
      "Rendering frames...",
      "Adding finishing touches...",
      "Polishing details...",
      "Almost there...",
      "Creating something amazing...",
      "Working on it...",
      "This might take a moment...",
    ];

    let messageIndex = 0;
    setLoadingMessage(messages[0]);

    const interval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setLoadingMessage(messages[messageIndex]);
    }, 8000); // Change message every 8 seconds

    return () => clearInterval(interval);
  }, [status]);

  useEffect(() => {
    if (status !== "waiting" || !jobId) {
      console.log("[Frontend] useEffect skipped - status:", status, "jobId:", jobId);
      return;
    }
    
    console.log("[Frontend] Starting SSE and status checks for jobId:", jobId);

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let statusCheckInterval: NodeJS.Timeout | null = null;

    // Fallback: Check status via API every 5 seconds as backup
    const checkStatus = async () => {
      try {
        console.log("[Frontend] Checking status for jobId:", jobId);
        const res = await fetch(`/api/generate-video/status?jobId=${jobId}`);
        if (!res.ok) {
          console.error("[Frontend] Status check failed with status:", res.status);
          return;
        }
        
        const data = await res.json();
        console.log("[Frontend] Status check result for jobId", jobId, ":", data);
        
        if (data.status === "done") {
          console.log("[Frontend] Status check found video done, videoUrl:", data.videoUrl);
          setVideoUrl(data.videoUrl || null);
          setStatus("done");
          if (es) es.close();
          if (statusCheckInterval) clearInterval(statusCheckInterval);
        } else if (data.status === "error") {
          console.log("[Frontend] Status check found error:", data.error);
          setErrorMessage(data.error || "Video generation failed.");
          setStatus("error");
          if (es) es.close();
          if (statusCheckInterval) clearInterval(statusCheckInterval);
        }
      } catch (err) {
        console.error("[Frontend] Status check failed:", err);
      }
    };

    // Start periodic status checks
    statusCheckInterval = setInterval(checkStatus, 5000);

    const connect = () => {
      if (es) {
        es.close();
      }

      es = new EventSource(`/api/generate-video/stream?jobId=${jobId}`);

      es.onmessage = (event) => {
        try {
          // Reset reconnect attempts on successful message
          reconnectAttempts = 0;

          console.log("[Frontend] SSE message received:", event.data);
          
          // Skip keepalive comments
          if (event.data.trim().startsWith(":")) {
            console.log("[Frontend] SSE keepalive received, ignoring");
            return;
          }

          const data = JSON.parse(event.data) as {
            status: "done" | "error";
            videoUrl?: string;
            error?: string;
          };

          console.log("[Frontend] Parsed SSE data:", data);

          if (data.status === "done") {
            console.log("[Frontend] Video generation done, videoUrl:", data.videoUrl);
            setVideoUrl(data.videoUrl || null);
            setStatus("done");
            if (es) es.close();
            if (statusCheckInterval) clearInterval(statusCheckInterval);
          } else if (data.status === "error") {
            // Only show error when n8n explicitly sends status: "error"
            console.log("[Frontend] Video generation error:", data.error);
            setErrorMessage(data.error || "Video generation failed.");
            setStatus("error");
            if (es) es.close();
            if (statusCheckInterval) clearInterval(statusCheckInterval);
          }
        } catch (e) {
          console.error("[Frontend] Failed to parse SSE message", e, "Raw data:", event.data);
          // Don't error on parse failures, just log
        }
      };

      es.onerror = () => {
        console.log("SSE connection issue, will retry...");
        
        if (es) {
          es.close();
          es = null;
        }

        // Only show error if we've exhausted reconnection attempts
        if (reconnectAttempts >= maxReconnectAttempts) {
          console.log("[Frontend] Max reconnect attempts reached, relying on status checks");
          // Don't set error status - let status checks handle it
          return;
        }

        // Exponential backoff for reconnection
        reconnectAttempts++;
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000); // Max 30 seconds
        
        reconnectTimeout = setTimeout(() => {
          if (status === "waiting") {
            connect();
          }
        }, delay);
      };

      es.onopen = () => {
        // Reset reconnect attempts on successful connection
        reconnectAttempts = 0;
      };
    };

    connect();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (statusCheckInterval) clearInterval(statusCheckInterval);
      if (es) es.close();
    };
  }, [status, jobId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMessage(null);
    setVideoUrl(null);

    if (!prompt.trim()) {
      setErrorMessage("Please enter a prompt.");
      return;
    }

    setStatus("starting");

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, duration }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      type ApiErrorResponse = { error?: string; details?: string };
      if (!res.ok) {
        const data: ApiErrorResponse = await res
          .json()
          .catch(() => ({} as ApiErrorResponse));
        const errorMsg = data.error || "Failed to start video generation.";
        const details = data.details ? ` ${data.details}` : "";
        throw new Error(errorMsg + details);
      }

      const responseData = await res.json();
      console.log("[Frontend] Full response from /api/generate-video:", responseData);
      
      const data: { jobId?: string } = responseData;
      
      if (!data.jobId) {
        console.error("[Frontend] Server response missing jobId. Full response:", responseData);
        throw new Error("Server did not return a job ID. Please check server logs.");
      }

      console.log("[Frontend] Received jobId from server:", data.jobId);
      console.log("[Frontend] Setting jobId state to:", data.jobId);
      setJobId(data.jobId);
      setStatus("waiting");
      
      // Immediately check status in case job already completed
      setTimeout(() => {
        console.log("[Frontend] Performing immediate status check for jobId:", data.jobId);
        fetch(`/api/generate-video/status?jobId=${data.jobId}`)
          .then(res => res.json())
          .then(statusData => {
            console.log("[Frontend] Immediate status check response:", statusData);
            if (statusData.status === "done" && statusData.videoUrl) {
              console.log("[Frontend] Immediate status check found completed job");
              setVideoUrl(statusData.videoUrl);
              setStatus("done");
            } else if (statusData.status === "error") {
              setErrorMessage(statusData.error || "Video generation failed.");
              setStatus("error");
            }
          })
          .catch(err => console.error("[Frontend] Immediate status check failed:", err));
      }, 1000);
    } catch (err: unknown) {
      console.error("Error starting video generation:", err);
      let message = "Something went wrong.";
      
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          message = "Request timed out. Please check your n8n webhook configuration.";
        } else {
          message = err.message;
        }
      }
      
      setErrorMessage(message);
      setStatus("error");
    }
  }

  function reset() {
    setPrompt("");
    setDuration("10");
    setJobId(null);
    setVideoUrl(null);
    setErrorMessage(null);
    setStatus("idle");
  }

  const isBusy = status === "starting" || status === "waiting";

  return (
    <div className="min-h-screen bg-[#29473d] text-white flex flex-col">
      <Navbar />

      {/* Decorative background similar to HeroSection */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <main className="relative flex-1 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          <header className="space-y-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              AI Video Generation (Beta)
            </h1>
            <p className="text-white/80 max-w-2xl">
              Describe the video you want, choose a duration, and we&apos;ll
              generate it with our Sora-powered workflow. Your video will appear
              below as soon as it&apos;s ready.
            </p>
          </header>

          <section>
            <form
              onSubmit={handleSubmit}
              className="bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 backdrop-blur"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Prompt
                  </label>
                  <textarea
                    className="w-full min-h-[140px] rounded-xl bg-white/5 border border-white/20 px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white/70"
                    placeholder="e.g. A cinematic, slow-motion shot of waves crashing on a rocky coastline at sunset..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={isBusy}
                  />
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">
                      Duration (seconds)
                    </label>
                    <select
                      className="w-full md:w-48 rounded-full bg-white/5 border border-white/20 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={isBusy}
                    >
                      <option value="10" className="bg-[#29473d] text-white">10 seconds</option>
                      <option value="15" className="bg-[#29473d] text-white">15 seconds</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy}
                    className="mt-2 md:mt-7 inline-flex items-center justify-center bg-white text-[#29473d] px-8 py-3 rounded-full font-bold text-base shadow-xl hover:shadow-2xl hover:bg-white/90 hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {status === "starting"
                      ? "Starting..."
                      : status === "waiting"
                      ? "Generating..."
                      : "Generate Video"}
                  </button>
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-red-500/20 border border-red-400/60 text-sm px-4 py-3">
                    {errorMessage}
                  </div>
                )}
              </div>
            </form>
          </section>

          {status === "waiting" && (
            <section>
              <div className="bg-black/20 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold">
                    {loadingMessage || "Generating your video..."}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    This may take 2-12 minutes. Keep this tab open and
                    we&apos;ll display the video as soon as it&apos;s ready.
                  </p>
                </div>
              </div>
            </section>
          )}

          {status === "done" && videoUrl && (
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold">Your video</h2>
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                <video
                  className="w-full max-w-3xl mx-auto rounded-xl shadow-2xl"
                  src={videoUrl}
                  controls
                />
              </div>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center border border-white/40 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-[#29473d] transition-all"
              >
                Generate another video
              </button>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}


