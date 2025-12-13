import { User } from '../models/User.js';

/**
 * Helper function do konwersji Firebase UID na MongoDB ObjectId
 * 
 * @param {string} id - Firebase UID lub MongoDB ObjectId
 * @returns {Promise<string|null>} MongoDB ObjectId jako string lub null jeśli nie znaleziono
 */
export async function resolveUserId(id) {
  // Sprawdź czy to już MongoDB ObjectId (24 hex chars)
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
  
  if (isMongoId) {
    // To już MongoDB ID, zwróć bez zmian
    return id;
  }
  
  // To Firebase UID - znajdź odpowiadający MongoDB _id
  const user = await User.findOne({ 'auth.firebaseUid': id }, '_id');
  return user ? user._id.toString() : null;
}

/**
 * Helper synchroniczny - tylko sprawdza format
 * @param {string} id 
 * @returns {boolean}
 */
export function isMongoObjectId(id) {
  return /^[0-9a-fA-F]{24}$/.test(id);
}
