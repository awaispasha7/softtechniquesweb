// softtechniquesweb/src/lib/videoJobs.ts

export type JobStatus = "pending" | "done" | "error";

export interface JobResult {
  status: JobStatus;
  videoUrl?: string;
  videoName?: string;
  error?: string;
}

type Listener = (result: JobResult) => void;

// In-memory stores (reset on server restart / redeploy)
const results = new Map<string, JobResult>();
const listeners = new Map<string, Listener>();

export function registerListener(jobId: string, listener: Listener) {
  // If job already has a final result, emit immediately
  const existing = results.get(jobId);
  if (existing) {
    listener(existing);
    return;
  }

  listeners.set(jobId, listener);
}

export function registerJob(jobId: string) {
  console.log(`[videoJobs] registerJob called for jobId: ${jobId}`);
  // Register job as pending if it doesn't exist
  if (!results.has(jobId)) {
    results.set(jobId, { status: "pending" });
    console.log(`[videoJobs] Registered new job as pending: ${jobId}`);
  } else {
    console.log(`[videoJobs] Job ${jobId} already exists, skipping registration`);
  }
}

export function notifyJobComplete(jobId: string, result: JobResult) {
  console.log(`[videoJobs] notifyJobComplete called for jobId: ${jobId}`, result);
  results.set(jobId, result);

  const listener = listeners.get(jobId);
  if (listener) {
    console.log(`[videoJobs] Found listener for jobId: ${jobId}, calling it`);
    try {
      listener(result);
      listeners.delete(jobId);
      console.log(`[videoJobs] Successfully notified listener for jobId: ${jobId}`);
    } catch (error) {
      console.error(`[videoJobs] Error calling listener for jobId: ${jobId}`, error);
      listeners.delete(jobId);
    }
  } else {
    console.log(`[videoJobs] No listener found for jobId: ${jobId}, result stored for later retrieval`);
  }
}

export function getJobResult(jobId: string): JobResult | undefined {
  const result = results.get(jobId);
  console.log(`[videoJobs] getJobResult called for jobId: ${jobId}, found:`, result ? "yes" : "no");
  if (!result) {
    console.log(`[videoJobs] Current stored jobIds:`, Array.from(results.keys()));
  }
  return result;
}

export function getAllJobIds(): string[] {
  return Array.from(results.keys());
}


