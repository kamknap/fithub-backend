import { resolveUserId } from '../utils/idResolver.js';

/**
 * Middleware do automatycznej konwersji userId w req.params
 * z Firebase UID na MongoDB ObjectId
 * 
 * Użycie:
 * router.get('/:userId', autoResolveUserId, controller)
 */
export async function autoResolveUserId(req, res, next) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return next(); // Brak userId w params, kontynuuj
    }
    
    // Konwertuj Firebase UID na MongoDB ObjectId jeśli potrzeba
    const resolvedUserId = await resolveUserId(userId);
    
    if (!resolvedUserId) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    // Zamień userId w params na resolved MongoDB ID
    req.params.userId = resolvedUserId;
    
    next();
  } catch (error) {
    next(error);
  }
}
