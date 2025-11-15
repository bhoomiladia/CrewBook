import * as admin from 'firebase-admin';
import { UserProfile } from './types'; // Import your types

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. This is required for server-side admin access.');
}

// --- THIS IS THE FIX ---
// We remove the explicit ': admin.app.ServiceAccount' type.
// We'll let 'serviceAccount' be inferred as 'any' from JSON.parse(),
// as the cert() function is built to handle this.
let serviceAccount: any;
// --- END FIX ---

try {
  serviceAccount = JSON.parse(serviceAccountKey);
} catch (error) {
  throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY. Make sure it is a valid, single-line JSON string.');
}

// --- Initialize Firebase Admin SDK ---
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      // This line will now work perfectly.
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    console.error('Firebase Admin Initialization Error:', error.message);
  }
}

// Export the initialized admin services
export const adminAuth = admin.auth();
export const adminDb = admin.firestore();