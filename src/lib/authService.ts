import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  createdAt: Timestamp | ReturnType<typeof serverTimestamp>;
  updatedAt: Timestamp | ReturnType<typeof serverTimestamp>;
  credits?: number; // Video generation credits
  isUnlimited?: boolean; // Admin accounts with unlimited credits
}

// Sign up a new user
export const signUp = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update display name
    if (userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Create user document in Firestore
    // Use NEXT_PUBLIC_ADMIN_EMAILS for client-side access
    const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isUnlimited = ADMIN_EMAILS.includes(email);
    
    const userData: Omit<UserData, 'uid'> = {
      email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      credits: 3, // Initial credits for new users
      isUnlimited: isUnlimited, // Set unlimited for admin emails
    };
    
    await setDoc(doc(db, 'users', userCredential.user.uid), userData);
    
    console.log('✅ User created successfully:', userCredential.user.uid);
    return userCredential;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Error signing up:', firebaseError);
    throw error;
  }
};

// Sign in an existing user
export const signIn = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Update last login time in Firestore
    await setDoc(
      doc(db, 'users', userCredential.user.uid),
      { updatedAt: serverTimestamp() },
      { merge: true }
    );
    
    return userCredential;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Error signing in:', firebaseError);
    throw error;
  }
};

// Sign out current user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: unknown) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Send password reset email
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Error sending password reset email:', firebaseError);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    
    // Check if user document exists in Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    const email = userCredential.user.email || '';
    const displayName = userCredential.user.displayName || userCredential.user.email?.split('@')[0] || 'User';
    
    // Check admin emails (use NEXT_PUBLIC_ADMIN_EMAILS for client-side access)
    const ADMIN_EMAILS = process.env.NEXT_PUBLIC_ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
    const isUnlimited = ADMIN_EMAILS.includes(email);
    
    if (!userDoc.exists()) {
      // First time Google sign-in - create user document
      const userData: Omit<UserData, 'uid'> = {
        email,
        displayName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        credits: 3, // Initial credits for new users
        isUnlimited: isUnlimited, // Set unlimited for admin emails
      };
      
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      console.log('✅ New Google user created in Firestore:', userCredential.user.uid, isUnlimited ? '(Admin)' : '');
    } else {
      // Update last login time and admin status
      const existingData = userDoc.data();
      
      // Always update admin status based on current admin emails list
      await setDoc(
        doc(db, 'users', userCredential.user.uid),
        { 
          updatedAt: serverTimestamp(),
          isUnlimited: isUnlimited, // Always set based on current admin list
          // Update email and displayName if they changed
          email: email || existingData.email,
          displayName: displayName || existingData.displayName || email.split('@')[0],
        },
        { merge: true }
      );
      
      if (isUnlimited && !existingData.isUnlimited) {
        console.log('✅ User admin status updated to unlimited:', userCredential.user.uid);
      }
    }
    
    return userCredential;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error('Error signing in with Google:', firebaseError);
    throw error;
  }
};

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return {
        uid,
        ...userDoc.data(),
      } as UserData;
    }
    return null;
  } catch (error: unknown) {
    console.error('Error getting user data:', error);
    return null;
  }
};

// Get error message for display
export const getAuthErrorMessage = (error: unknown): string => {
  const firebaseError = error as { code?: string; message?: string };
  
  if (!firebaseError?.code) {
    return 'An unexpected error occurred. Please try again.';
  }
  
  switch (firebaseError.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address. Please check and try again.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please sign up first.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one popup request is allowed at a time. Please try again.';
    case 'auth/popup-blocked':
      return 'Popup was blocked by your browser. Please allow popups and try again.';
    default:
      return firebaseError.message || 'An error occurred. Please try again.';
  }
};

