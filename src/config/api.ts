// API Configuration
// Uses Next.js API routes as proxy to avoid CORS issues
// The API routes proxy requests to the backend Railway URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

// Football Analysis API URL - use Railway backend in production, localhost in development
// Only affects football analysis endpoints, other API routes remain unchanged
export const FOOTBALL_API_URL = (() => {
    // Check if we're in production environment
    const isProduction = typeof window !== 'undefined' 
        ? (window.location.hostname !== 'localhost' && 
           window.location.hostname !== '127.0.0.1' &&
           !window.location.hostname.startsWith('192.168.') &&
           !window.location.hostname.startsWith('10.'))
        : process.env.NODE_ENV === 'production';
    
    if (isProduction) {
        // Production - always use Railway backend
        return 'https://web-production-608ab4.up.railway.app';
    } else {
        // Local development - use localhost:8000
        return 'http://localhost:8000';
    }
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
