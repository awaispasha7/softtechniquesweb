import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminDbInstance: Firestore | null = null;

// Initialize Firebase Admin (only once)
function initializeAdmin(): Firestore {
  if (adminDbInstance) {
    return adminDbInstance;
  }

  // Check if already initialized
  let app: App;
  const existingApps = getApps();
  
  if (existingApps.length > 0) {
    app = existingApps[0];
  } else {
    try {
      // Option 1: Use environment variable with JSON string
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      // Option 2: Use file path
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (serviceAccountKey) {
        // Parse JSON string from environment variable
        const serviceAccount = JSON.parse(serviceAccountKey);
        app = initializeApp({
          credential: cert(serviceAccount),
        });
      } else if (serviceAccountPath) {
        // Use file path (for local development)
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const serviceAccount = require(serviceAccountPath);
        app = initializeApp({
          credential: cert(serviceAccount),
        });
      } else {
        // Fallback: Try to use default credentials (for production environments like Vercel)
        // This works if FIREBASE_SERVICE_ACCOUNT_KEY is set as a JSON string
        throw new Error(
          'Firebase Admin credentials not found. ' +
          'Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or FIREBASE_SERVICE_ACCOUNT_PATH (file path) in environment variables.'
        );
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }

  adminDbInstance = getFirestore(app);
  return adminDbInstance;
}

// Export Admin Firestore instance (lazy initialization)
export const adminDb = initializeAdmin();

