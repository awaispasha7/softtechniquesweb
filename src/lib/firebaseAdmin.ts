import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminDbInstance: Firestore | null = null;
let initializationError: Error | null = null;

// Initialize Firebase Admin (only when actually used, not at module load)
function initializeAdmin(): Firestore {
  if (adminDbInstance) {
    return adminDbInstance;
  }

  // If we already tried and failed, throw the cached error
  if (initializationError) {
    throw initializationError;
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
        // Validate and parse JSON string from environment variable
        try {
          const serviceAccount = JSON.parse(serviceAccountKey);
          // Validate it has required fields
          if (!serviceAccount.private_key || !serviceAccount.client_email) {
            throw new Error('Invalid service account: missing required fields (private_key or client_email)');
          }
          app = initializeApp({
            credential: cert(serviceAccount),
          });
        } catch (parseError) {
          const error = new Error(
            `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY: ${parseError instanceof Error ? parseError.message : 'Invalid JSON'}. ` +
            'Make sure it\'s a valid JSON string containing the full service account key.'
          );
          initializationError = error;
          throw error;
        }
      } else if (serviceAccountPath) {
        // Use file path (for local development)
        try {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const serviceAccount = require(serviceAccountPath);
          app = initializeApp({
            credential: cert(serviceAccount),
          });
        } catch (requireError) {
          const error = new Error(
            `Failed to load service account from ${serviceAccountPath}: ${requireError instanceof Error ? requireError.message : 'Unknown error'}`
          );
          initializationError = error;
          throw error;
        }
      } else {
        // No credentials found - only throw when actually trying to use it
        const error = new Error(
          'Firebase Admin credentials not found. ' +
          'Set FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or FIREBASE_SERVICE_ACCOUNT_PATH (file path) in environment variables. ' +
          'This is only needed for API routes that use Firebase Admin SDK.'
        );
        initializationError = error;
        throw error;
      }
    } catch (error) {
      initializationError = error instanceof Error ? error : new Error(String(error));
      console.error('Error initializing Firebase Admin:', error);
      throw initializationError;
    }
  }

  adminDbInstance = getFirestore(app);
  return adminDbInstance;
}

// Export function to get Admin Firestore instance (lazy initialization)
// This prevents build-time errors if credentials aren't set
// Only initializes when actually called, not at module load
export function getAdminDb(): Firestore {
  return initializeAdmin();
}

