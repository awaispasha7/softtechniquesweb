// API Configuration
// Uses Next.js API routes as proxy to avoid CORS issues
// The API routes proxy requests to the backend Railway URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';

export const API_ENDPOINTS = {
  CHAT: `${API_BASE_URL}/chat`,
  CONSULTATION_AVAILABLE_SLOTS: `${API_BASE_URL}/consultation/available-slots`,
  CONSULTATION_SCHEDULE: `${API_BASE_URL}/consultation/schedule`,
} as const;

export default API_BASE_URL;
