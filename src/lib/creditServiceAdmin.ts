/**
 * Server-side credit service using Firebase Admin SDK
 * This bypasses Firestore security rules and works in API routes
 * 
 * DO NOT use this in client-side code - use creditService.ts instead
 */

import { getAdminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

export interface UserCredits {
  credits: number;
  isUnlimited?: boolean;
}

const INITIAL_CREDITS = 3;

// Get admin emails from environment
const getAdminEmails = (): string[] => {
  return process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
};

// Get user credits (using Admin SDK - bypasses security rules)
export const getUserCredits = async (userId: string): Promise<UserCredits> => {
  try {
    const userDoc = await getAdminDb().collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return { credits: 0 };
    }
    
    const userData = userDoc.data();
    if (!userData) {
      return { credits: 0 };
    }
    
    const email = userData.email as string | undefined;
    const adminEmails = getAdminEmails();
    const isUnlimited = userData.isUnlimited === true || (email && adminEmails.includes(email));
    
    return {
      credits: userData.credits ?? INITIAL_CREDITS,
      isUnlimited: isUnlimited ? true : undefined,
    };
  } catch (error: unknown) {
    console.error('Error getting user credits (Admin SDK):', error);
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
    
    // Decrement credits using Admin SDK
    await getAdminDb().collection('users').doc(userId).update({
      credits: FieldValue.increment(-1),
    });
    
    return true;
  } catch (error: unknown) {
    console.error('Error using credit (Admin SDK):', error);
    return false;
  }
};

