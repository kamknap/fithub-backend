import { admin } from '../config/firebase.config.js';

export async function verifyToken(req, res, next) {
  try {
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

    const decodedToken = await admin.auth().verifyIdToken(token);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      ...decodedToken
    };

    console.log(`[Auth] Authenticated user: ${req.user.uid}`);
    next();
  } catch (error) {
    console.error('[Auth] Token verification failed:', error.message);
    
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
