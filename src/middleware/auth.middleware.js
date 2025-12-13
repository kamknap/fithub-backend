import { admin } from '../config/firebase.config.js';

/**
 * Middleware weryfikujący token Firebase Authorization
 * Wymaga headera: Authorization: Bearer <firebase_id_token>
 * 
 * Po pomyślnej weryfikacji dodaje do req.user:
 * - uid: Firebase UID użytkownika
 * - email: email użytkownika (jeśli dostępny)
 * - inne właściwości z decoded token
 */
export async function verifyToken(req, res, next) {
  try {
    // Pobierz token z headera Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Brak tokenu autoryzacyjnego. Wymagany format: Authorization: Bearer <token>' 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ 
        message: 'Token autoryzacyjny jest pusty' 
      });
    }

    // Weryfikuj token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Dodaj zdekodowane dane użytkownika do request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      // Dodaj cały decoded token dla dodatkowych informacji
      ...decodedToken
    };

    console.log(`[Auth] Authenticated user: ${req.user.uid}`);
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    
    // Różne typy błędów Firebase Auth
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ 
        message: 'Token wygasł. Zaloguj się ponownie.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/argument-error') {
      return res.status(401).json({ 
        message: 'Nieprawidłowy format tokenu',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    return res.status(403).json({ 
      message: 'Nieprawidłowy token autoryzacyjny',
      code: 'INVALID_TOKEN'
    });
  }
}

/**
 * Opcjonalny middleware - próbuje wyciągnąć Firebase UID z tokenu,
 * ale nie blokuje requestu jeśli token nie istnieje lub jest nieprawidłowy.
 * 
 * Przydatny dla endpointów, które mogą działać zarówno dla
 * zalogowanych jak i niezalogowanych użytkowników.
 */
export async function extractFirebaseUid(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split('Bearer ')[1];
      
      if (token) {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
          uid: decodedToken.uid,
          email: decodedToken.email,
          emailVerified: decodedToken.email_verified,
          ...decodedToken
        };
        console.log(`[Auth] Optional auth - user identified: ${req.user.uid}`);
      }
    }
  } catch (error) {
    // Nie blokuj requestu - po prostu loguj błąd
    console.log('[Auth] Optional auth - token invalid or missing, continuing without auth');
  }
  
  next();
}

/**
 * Middleware sprawdzający czy zalogowany użytkownik ma dostęp do zasobu
 * Używaj po verifyToken()
 * 
 * Sprawdza czy req.user.uid === req.params.firebaseUid lub req.body.firebaseUid
 */
export function checkResourceOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ 
      message: 'Użytkownik niezalogowany. Użyj verifyToken przed checkResourceOwnership' 
    });
  }

  const resourceUid = req.params.firebaseUid || req.body.firebaseUid;
  
  if (resourceUid && resourceUid !== req.user.uid) {
    return res.status(403).json({ 
      message: 'Brak dostępu do tego zasobu',
      code: 'FORBIDDEN'
    });
  }

  next();
}
