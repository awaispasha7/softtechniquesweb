// softtechniquesweb/src/lib/videoJobs.ts

export type JobStatus = "pending" | "done" | "error";

export interface JobResult {
  status: JobStatus;
  videoUrl?: string;
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

export function notifyJobComplete(jobId: string, result: JobResult) {
  results.set(jobId, result);

  const listener = listeners.get(jobId);
  if (listener) {
    listener(result);
    listeners.delete(jobId);
  }
}

export function getJobResult(jobId: string): JobResult | undefined {
  return results.get(jobId);
}


