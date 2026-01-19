// API Configuration
// Uses Next.js API routes as proxy to avoid CORS issues
// The API routes proxy requests to the backend Railway URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Football Analysis API URL - use Railway backend in production, localhost in development
// Only affects football analysis endpoints, other API routes remain unchanged
export const FOOTBALL_API_URL = (() => {
    // In browser/client-side: check the current hostname
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        // Local development - use localhost:8000
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:8000';
        }
        // Production deployment on softtechniques.com - use Railway backend
        if (hostname === 'softtechniques.com' || hostname.includes('softtechniques')) {
            return 'https://web-production-608ab4.up.railway.app';
        }
    }
    // Server-side or fallback: use env var, Railway URL, or default to localhost
    return process.env.NEXT_PUBLIC_FOOTBALL_API_URL || 'https://web-production-608ab4.up.railway.app';
})();

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  CONSULTATION_AVAILABLE_SLOTS: `${API_BASE_URL}/consultation/available-slots`,
  CONSULTATION_SCHEDULE: `${API_BASE_URL}/consultation/schedule`,
  // Football Analysis endpoints
  FOOTBALL_UPLOAD: `${FOOTBALL_API_URL}/api/videos/upload`,
  FOOTBALL_JOB_STATUS: (jobId: string) => `${FOOTBALL_API_URL}/api/jobs/${jobId}`,
  FOOTBALL_RESULT: (jobId: string) => `${FOOTBALL_API_URL}/api/results/${jobId}.mp4`,
} as const;

export default API_BASE_URL;
