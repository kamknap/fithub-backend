import admin from 'firebase-admin';

let firebaseInitialized = false;

/**
 * Inicjalizacja Firebase Admin SDK
 * 
 * Dla Azure Container Apps użyj zmiennych środowiskowych:
 * - FIREBASE_PROJECT_ID
 * - FIREBASE_CLIENT_EMAIL  
 * - FIREBASE_PRIVATE_KEY (pamiętaj o zachowaniu znaków nowej linii: \n)
 * 
 * Alternatywnie możesz użyć FIREBASE_SERVICE_ACCOUNT_JSON z całym JSONem
 */
export function initializeFirebaseAdmin() {
  if (firebaseInitialized) {
    console.log('[Firebase] Already initialized');
    return admin;
  }

  try {
    // Opcja 1: Użyj pełnego JSONa z service account (dla development lokalnie)
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('[Firebase] Initialized with service account JSON');
    }
    // Opcja 2: Użyj osobnych zmiennych środowiskowych (REKOMENDOWANE dla Azure)
    else if (process.env.FIREBASE_PROJECT_ID && 
             process.env.FIREBASE_CLIENT_EMAIL && 
             process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          // Zamień literalne \n na prawdziwe znaki nowej linii
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('[Firebase] Initialized with environment variables');
    }
    // Opcja 3: Fallback do default credentials (dla Google Cloud/Firebase)
    else {
      console.warn('[Firebase] No explicit credentials found, trying default credentials...');
      admin.initializeApp();
      console.log('[Firebase] Initialized with default credentials');
    }

    firebaseInitialized = true;
    return admin;
  } catch (error) {
    console.error('[Firebase] Initialization failed:', error.message);
    throw new Error('Firebase Admin SDK initialization failed');
  }
}

export { admin };
