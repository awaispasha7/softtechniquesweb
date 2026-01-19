import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from './firebase';

export interface UserCredits {
  credits: number;
  isUnlimited?: boolean; // Admin accounts with unlimited credits
}

const INITIAL_CREDITS = 3;

// Get admin emails from environment (server-side only) or use a default list
// For client-side, we check the isUnlimited flag in Firestore
const getAdminEmails = (): string[] => {
  if (typeof window === 'undefined') {
    // Server-side: use environment variable
    return process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
  }
  // Client-side: return empty array, rely on isUnlimited flag in Firestore
  return [];
};

// Get user credits
export const getUserCredits = async (userId: string): Promise<UserCredits> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { credits: 0 };
    }
    
    const userData = userDoc.data();
    const email = userData.email as string | undefined;
    
    // Check if user is admin (unlimited credits)
    // First check isUnlimited flag, then check admin emails (server-side only)
    const adminEmails = getAdminEmails();
    const isUnlimited = userData.isUnlimited === true || (email && adminEmails.includes(email));
    
    return {
      credits: userData.credits ?? INITIAL_CREDITS,
      isUnlimited: isUnlimited ? true : undefined,
    };
  } catch (error: unknown) {
    console.error('Error getting user credits:', error);
    return { credits: 0 };
  }
};

// Check if user has credits available
export const hasCredits = async (userId: string): Promise<boolean> => {
  const userCredits = await getUserCredits(userId);
  
  if (userCredits.isUnlimited) {
    return true;
  }
  
  return userCredits.credits > 0;
};

// Decrement user credits (only if not unlimited)
export const useCredit = async (userId: string): Promise<boolean> => {
  try {
    const userCredits = await getUserCredits(userId);
    
    // Don't decrement for unlimited accounts
    if (userCredits.isUnlimited) {
      return true;
    }
    
    // Check if user has credits
    if (userCredits.credits <= 0) {
      return false;
    }
    
    // Decrement credits
    await updateDoc(doc(db, 'users', userId), {
      credits: increment(-1),
    });
    
    return true;
  } catch (error: unknown) {
    console.error('Error using credit:', error);
    return false;
  }
};

// Add credits to user (admin function)
export const addCredits = async (userId: string, amount: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      credits: increment(amount),
    });
  } catch (error: unknown) {
    console.error('Error adding credits:', error);
    throw error;
  }
};

// Set credits to a specific amount (admin function)
export const setCredits = async (userId: string, amount: number): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      credits: amount,
    });
  } catch (error: unknown) {
    console.error('Error setting credits:', error);
    throw error;
  }
};

// Set unlimited credits for a user (admin function)
export const setUnlimitedCredits = async (userId: string, unlimited: boolean): Promise<void> => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      isUnlimited: unlimited,
    });
  } catch (error: unknown) {
    console.error('Error setting unlimited credits:', error);
    throw error;
  }
};

