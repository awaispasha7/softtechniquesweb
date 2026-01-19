"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getGeneratedVideos, GeneratedVideo } from "@/lib/videoService";
import { useAuth } from "@/components/AuthProvider";
import { getUserCredits } from "@/lib/creditService";

type Status = "idle" | "starting" | "waiting" | "done" | "error";

export default function GenerateVideoPage() {
  const router = useRouter();
  const { user, userData, loading: authLoading } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState("10");
  const [status, setStatus] = useState<Status>("idle");
  const [jobId, setJobId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [showExamples, setShowExamples] = useState(false);
  const [exampleVideos, setExampleVideos] = useState<GeneratedVideo[]>([]);
  const [loadingExamples, setLoadingExamples] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isUnlimited, setIsUnlimited] = useState(false);

  // Load user credits
  useEffect(() => {
    if (user?.uid) {
      getUserCredits(user.uid).then((userCredits) => {
        setCredits(userCredits.credits);
        setIsUnlimited(userCredits.isUnlimited || false);
      });
    } else {
      setCredits(null);
      setIsUnlimited(false);
    }
  }, [user]);

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
          console.log("[Frontend] Status check found video done, videoUrl:", data.videoUrl, "videoName:", data.videoName);
          setVideoUrl(data.videoUrl || null);
          setVideoName(data.videoName || null);
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
            videoName?: string;
            error?: string;
          };

          console.log("[Frontend] Parsed SSE data:", data);

          if (data.status === "done") {
            console.log("[Frontend] Video generation done, videoUrl:", data.videoUrl, "videoName:", data.videoName);
            setVideoUrl(data.videoUrl || null);
            setVideoName(data.videoName || null);
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

    // Check authentication
    if (!user || !user.uid) {
      router.push('/auth/login');
      return;
    }

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
        body: JSON.stringify({ prompt, duration, userId: user.uid }),
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
        
        // Handle authentication/authorization errors
        if (res.status === 401) {
          router.push('/auth/login');
          return;
        }
        
        if (res.status === 403) {
          // Refresh credits display
          if (user?.uid) {
            getUserCredits(user.uid).then((userCredits) => {
              setCredits(userCredits.credits);
              setIsUnlimited(userCredits.isUnlimited || false);
            });
          }
        }
        
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
      
      // Refresh credits after using one
      if (user?.uid) {
        getUserCredits(user.uid).then((userCredits) => {
          setCredits(userCredits.credits);
          setIsUnlimited(userCredits.isUnlimited || false);
        });
      }
      
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
    setVideoName(null);
    setErrorMessage(null);
    setStatus("idle");
  }

  const isBusy = status === "starting" || status === "waiting";

  return (
    <div className="min-h-screen bg-[#44559e] text-white flex flex-col">
      <Navbar />

      {/* Decorative background similar to HeroSection */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
      </div>

      <main className="relative flex-1 pt-28 pb-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-8 space-y-10">
          <header className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
                  AI Video Generation (Beta)
                </h1>
                <p className="text-white/80 max-w-2xl mt-2">
                  Describe the video you want, choose a duration, and we&apos;ll
                  generate it with our Sora-powered workflow. Your video will appear
                  below as soon as it&apos;s ready.
                </p>
              </div>
              <button
                onClick={async () => {
                  setShowExamples(true);
                  // Always reload videos when opening the modal
                  setLoadingExamples(true);
                  try {
                    console.log('[Frontend] Loading example videos...');
                    const videos = await getGeneratedVideos();
                    console.log('[Frontend] Received videos:', videos.length);
                    const doneVideos = videos.filter(v => v.status === 'done');
                    console.log('[Frontend] Filtered done videos:', doneVideos.length);
                    setExampleVideos(doneVideos);
                  } catch (error) {
                    console.error('[Frontend] Error loading example videos:', error);
                    // Show error to user
                    // setErrorMessage('Failed to load example videos. Please check console for details.');
                  } finally {
                    setLoadingExamples(false);
                  }
                }}
                className="inline-flex items-center justify-center border-2 border-white/40 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/10 hover:border-white/60 transition-all"
              >
                View Examples
              </button>
            </div>
          </header>

          {/* Authentication and Credits Status */}
          {!authLoading && (
            <div className="bg-white/10 border border-white/20 rounded-xl p-4 sm:p-6">
              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <div className="text-sm sm:text-base text-white/80">
                      Signed in as <span className="font-semibold text-white break-words">{userData?.displayName || user.email}</span>
                    </div>
                    {credits !== null && (
                      <div className="flex items-center gap-2">
                        <span className="text-white/60 text-xs sm:text-sm">Credits:</span>
                        {isUnlimited ? (
                          <span className="font-bold text-white text-sm sm:text-base">Unlimited</span>
                        ) : (
                          <span className={`font-bold text-sm sm:text-base ${credits > 0 ? 'text-white' : 'text-red-300'}`}>
                            {credits}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                  <p className="text-sm sm:text-base text-white/80">Sign in to generate videos</p>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2.5 bg-white text-[#44559e] hover:bg-white/90 rounded-lg transition-all text-sm font-semibold text-center"
                  >
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          )}

          <section>
            {user ? (
              <form
                onSubmit={handleSubmit}
                className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 backdrop-blur"
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

                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">
                      Duration (seconds)
                    </label>
                    <select
                      className="w-full sm:w-48 rounded-full bg-white/5 border border-white/20 px-4 py-3 sm:py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/70"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      disabled={isBusy}
                    >
                      <option value="10" className="bg-[#44559e] text-white">10 seconds</option>
                      <option value="15" className="bg-[#44559e] text-white">15 seconds</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isBusy || (credits !== null && credits <= 0 && !isUnlimited)}
                    className="w-full sm:w-auto mt-0 sm:mt-0 inline-flex items-center justify-center bg-white text-[#44559e] px-6 sm:px-8 py-3 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl hover:bg-white/90 hover:scale-105 transition-all disabled:opacity-60 disabled:hover:scale-100 disabled:cursor-not-allowed min-h-[44px]"
                  >
                    {status === "starting"
                      ? "Starting..."
                      : status === "waiting"
                      ? "Generating..."
                      : credits !== null && credits <= 0 && !isUnlimited
                      ? "No Credits"
                      : "Generate Video"}
                  </button>
                </div>

                {credits !== null && credits <= 0 && !isUnlimited && (
                  <div className="rounded-xl bg-yellow-500/20 border border-yellow-400/60 text-sm px-4 py-3">
                    You have no credits remaining. Please contact support to add more credits.
                  </div>
                )}

                {errorMessage && (
                  <div className="rounded-xl bg-red-500/20 border border-red-400/60 text-sm px-4 py-3">
                    {errorMessage}
                  </div>
                )}
              </div>
            </form>
            ) : null}
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
              <div>
                <h2 className="text-2xl font-semibold">Your video</h2>
                {videoName && (
                  <p className="text-lg text-white/80 mt-2">{videoName}</p>
                )}
              </div>
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
                className="inline-flex items-center justify-center border border-white/40 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-white hover:text-[#44559e] transition-all"
              >
                Generate another video
              </button>
            </section>
          )}
        </div>
      </main>

      <Footer />

      {/* Video Examples Modal */}
      {showExamples && (
        <div 
          className="fixed inset-0 bg-[#44559e]/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowExamples(false);
              setSelectedVideo(null);
            }
          }}
        >
          <div className="bg-[#44559e] backdrop-blur-sm rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border border-white/20 relative shadow-2xl shadow-white/20 animate-in zoom-in-95 duration-300">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-white/10 rounded-3xl pointer-events-none"></div>
            
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={() => {
                  setShowExamples(false);
                  setSelectedVideo(null);
                }}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                aria-label="Close modal"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-10 relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Generated Video Examples
              </h2>

              {loadingExamples ? (
                <div className="flex items-center justify-center py-20">
                  <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              ) : exampleVideos.length === 0 ? (
                <div className="text-center py-20 text-white/60">
                  <p className="text-lg">No example videos yet.</p>
                  <p className="text-sm mt-2">Generate your first video to see it here!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exampleVideos.map((video) => (
                    <div
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer group"
                    >
                      <div className="aspect-video bg-black/40 rounded-lg mb-3 overflow-hidden relative">
                        {video.videoUrl ? (
                          <video
                            className="w-full h-full object-cover"
                            src={video.videoUrl}
                            muted
                            playsInline
                            onMouseEnter={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.play().catch(() => {});
                            }}
                            onMouseLeave={(e) => {
                              const target = e.target as HTMLVideoElement;
                              target.pause();
                              target.currentTime = 0;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {video.videoName && (
                        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2 group-hover:text-white transition-colors">
                          {video.videoName}
                        </h3>
                      )}
                      <p className="text-white/60 text-xs line-clamp-2 mb-2">
                        {video.prompt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-white/40">
                        <span>{video.duration}s</span>
                        <span>•</span>
                        <span>{new Date(video.createdAt?.toDate?.() || video.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Video Modal */}
      {selectedVideo && (
        <div 
          className="fixed inset-0 bg-[#44559e]/95 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedVideo(null);
            }
          }}
        >
          <div className="bg-[#44559e] backdrop-blur-sm rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto border border-white/20 relative shadow-2xl shadow-white/20 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <div className="absolute top-6 right-6 z-50">
              <button
                onClick={() => setSelectedVideo(null)}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110 hover:shadow-lg cursor-pointer"
                aria-label="Close modal"
                type="button"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Video Content */}
            <div className="p-10 relative z-10">
              {selectedVideo.videoName && (
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                  {selectedVideo.videoName}
                </h2>
              )}
              {selectedVideo.prompt && (
                <p className="text-white/80 mb-6">
                  <span className="font-semibold">Prompt:</span> {selectedVideo.prompt}
                </p>
              )}
              {selectedVideo.videoUrl && (
                <div className="bg-black/60 border border-white/15 rounded-2xl p-4">
                  <video
                    className="w-full rounded-xl shadow-2xl"
                    src={selectedVideo.videoUrl}
                    controls
                    autoPlay
                  />
                </div>
              )}
              <div className="flex items-center gap-4 mt-6 text-sm text-white/60">
                <span>Duration: {selectedVideo.duration}s</span>
                <span>•</span>
                <span>Created: {new Date(selectedVideo.createdAt?.toDate?.() || selectedVideo.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


