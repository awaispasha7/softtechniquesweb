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

  useEffect(() => {
    if (status !== "waiting" || !jobId) return;

    const es = new EventSource(`/api/generate-video/stream?jobId=${jobId}`);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as {
          status: "done" | "error";
          videoUrl?: string;
          error?: string;
        };

        if (data.status === "done") {
          setVideoUrl(data.videoUrl || null);
          setStatus("done");
        } else if (data.status === "error") {
          setErrorMessage(data.error || "Something went wrong.");
          setStatus("error");
        }
      } catch (e) {
        console.error("Failed to parse SSE message", e);
        setErrorMessage("Failed to read server update.");
        setStatus("error");
      } finally {
        es.close();
      }
    };

    es.onerror = () => {
      console.error("SSE connection error");
      setErrorMessage("Connection lost while waiting for the video.");
      setStatus("error");
      es.close();
    };

    return () => {
      es.close();
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
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, duration }),
      });

      type ApiErrorResponse = { error?: string };
      if (!res.ok) {
        const data: ApiErrorResponse = await res
          .json()
          .catch(() => ({} as ApiErrorResponse));
        throw new Error(data.error || "Failed to start video generation.");
      }

      const data: { jobId?: string } = await res.json();
      setJobId(data.jobId ?? null);
      setStatus("waiting");
    } catch (err: unknown) {
      console.error(err);
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
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
                      className="w-full md:w-48 rounded-full bg-white/5 border border-white/20 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/70"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={isBusy}
                    >
                      <option value="5">5 seconds</option>
                      <option value="10">10 seconds</option>
                      <option value="15">15 seconds</option>
                      <option value="20">20 seconds</option>
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
                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <div>
                  <p className="font-semibold">Generating your video...</p>
                  <p className="text-sm text-white/70">
                    This usually takes a short while. Keep this tab open and
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


