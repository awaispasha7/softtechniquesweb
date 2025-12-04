import { UserData } from './authService';

/**
 * Check if a user is an admin
 * @param userData - User data from Firestore (includes isUnlimited flag)
 * @param userEmail - User's email address (optional, for client-side checks)
 * @returns true if user is admin, false otherwise
 */
export const isAdmin = (userData: UserData | null | undefined, userEmail?: string | null): boolean => {
  if (!userData && !userEmail) return false;
  
  // Check isUnlimited flag (works on both client and server)
  if (userData?.isUnlimited === true) {
    return true;
  }
  
  // Check admin emails (works on both client and server using NEXT_PUBLIC_ADMIN_EMAILS)
  if (userEmail) {
    // Client-side: use NEXT_PUBLIC_ADMIN_EMAILS
    // Server-side: use ADMIN_EMAILS or NEXT_PUBLIC_ADMIN_EMAILS
    const adminEmailsEnv = typeof window !== 'undefined' 
      ? process.env.NEXT_PUBLIC_ADMIN_EMAILS 
      : (process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS);
    
    const adminEmails = adminEmailsEnv?.split(',').map(e => e.trim()) || [];
    if (adminEmails.includes(userEmail)) {
      return true;
    }
  }
  
  return false;
};

