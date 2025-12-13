import { User } from '../models/User.js';
import { UserWeightHistory } from '../models/UserWeightHistory.js';
import { UserProgress } from '../models/UserProgress.js';

// GET /api/users/me → dane zalogowanego użytkownika
export async function getCurrentUser(req, res, next) {
  try {
    // req.user jest ustawiane przez verifyToken
    const firebaseUid = req.user.uid;
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (e) { 
    next(e); 
  }
}

// GET /api/users → lista użytkowników
export async function listUsers(req, res, next) {
try {
const users = await User.find().sort({ createdAt: -1 });
res.json(users);
} catch (e) { next(e); }
}

// Funkcje getUserById i getUserByFirebaseUid zostały usunięte.
// Zamiast nich używaj getCurrentUser() dla endpointu /me

export async function createUser(req, res, next) {
try {
const { username, auth, profile, computed, settings } = req.body;

// BEZPIECZEŃSTWO: Pobierz Firebase UID z tokenu, nie z body
const firebaseUidFromToken = req.user.uid;

if (!username || !profile || !settings) {
return res.status(400).json({ message: 'username, profile i settings są wymagane' });
}

if (!profile.sex || profile.birthDate == null || profile.heightCm == null || profile.weightKg == null) {
return res.status(400).json({ message: 'profile.sex, profile.birthDate, profile.heightCm, profile.weightKg są wymagane' });
}

if (settings.activityLevel == null || settings.preferredTrainingFrequencyPerWeek == null) {
return res.status(400).json({ message: 'settings.activityLevel i settings.preferredTrainingFrequencyPerWeek są wymagane' });
}

const user = await User.create({ 
username, 
// Nadpisz firebaseUid tym z tokenu (bezpieczne)
auth: { 
  ...(auth || {}), 
  provider: auth?.provider || 'firebase', 
  firebaseUid: firebaseUidFromToken 
},
profile, 
computed: computed || {}, 
settings 
});

// Automatyczne tworzenie początkowych dokumentów dla nowego użytkownika
await UserWeightHistory.create({
userId: user._id,
weightKg: profile.weightKg,
measuredAt: new Date()
});

// Tworzenie pustego dokumentu UserProgress z domyślnymi wartościami
await UserProgress.create({
userId: user._id,
level: 1,
currentPoints: 0,
totalPoints: 0,
pointsToNextLevel: 100,
lastLoginDate: new Date(),
loginStreak: 1,
badges: [],
completedChallenges: [],
activeChallenges: null,
statistics: {
  totalMealsLogged: 0,
  totalExercisesCompleted: 0,
  totalWeightEntries: 1, // Mamy już jeden wpis wagi
  longestStreak: 1,
  weightChange: 0
},
photos: []
});

res.status(201).json(user);
} catch (e) {
if (e.code === 11000) return res.status(409).json({ message: 'username already exists' });
next(e);
}
}

function removeNullUndefined(obj) {
  if (obj === null || obj === undefined || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj;
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = removeNullUndefined(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return cleaned;
}

// PUT /api/users/me → aktualizacja danych zalogowanego użytkownika
export async function updateCurrentUser(req, res, next) {
  try {
    // Pobierz Firebase UID z tokenu (ustalonego przez verifyToken)
    const firebaseUid = req.user.uid;
    
    const updateData = removeNullUndefined(req.body);
    
    // Znajdź użytkownika po Firebase UID
    const existingUser = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const weightChanged = updateData.profile?.weightKg && 
                         updateData.profile.weightKg !== existingUser.profile.weightKg;

    // Update używając MongoDB _id
    const user = await User.findByIdAndUpdate(existingUser._id, updateData, { new: true });

    if (weightChanged) {
      await UserWeightHistory.create({
        userId: user._id,
        weightKg: updateData.profile.weightKg,
        measuredAt: new Date()
      });
    }

    res.json(user);
  } catch (e) {
    next(e);
  }
}