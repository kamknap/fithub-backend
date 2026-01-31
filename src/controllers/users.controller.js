import { User } from '../models/User.js';
import { UserWeightHistory } from '../models/UserWeightHistory.js';
import { UserProgress } from '../models/UserProgress.js';

// POST /api/users/google-login → logowanie/rejestracja przez Google
export async function googleLogin(req, res, next) {
  try {
    const { uid, email, name, picture } = req.user;

    if (!email) {
      return res.status(400).json({ message: 'Brak adresu email w tokenie Google' });
    }

    let user = await User.findOne({ 'auth.firebaseUid': uid });

    if (!user) {
      return res.status(404).json({ 
        message: 'Użytkownik nie istnieje. Wymagana rejestracja.',
        requiresRegistration: true,
        googleData: {
          email,
          name,
          picture
        }
      });
    }

    res.status(200).json({
      message: 'Logowanie przez Google zakończone sukcesem',
      user
    });

  } catch (error) {
    console.error('Google Login Error:', error);
    next(error);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
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

export async function listUsers(req, res, next) {
try {
const users = await User.find().sort({ createdAt: -1 });
res.json(users);
} catch (e) { next(e); }
}


export async function createUser(req, res, next) {
try {
const { username, auth, profile, computed, settings } = req.body;

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
auth: { 
  ...(auth || {}), 
  provider: auth?.provider || 'firebase', 
  firebaseUid: firebaseUidFromToken 
},
profile, 
computed: computed || {}, 
settings 
});

await UserWeightHistory.create({
userId: user._id,
weightKg: profile.weightKg,
measuredAt: new Date()
});

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
  totalWeightEntries: 1,
  longestStreak: 1,
  weightChange: 0
},
photos: []
});

res.status(201).json(user);
} catch (e) {
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

export async function updateCurrentUser(req, res, next) {
  try {
    const firebaseUid = req.user.uid;
    
    const updateData = removeNullUndefined(req.body);
    
    const existingUser = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const weightChanged = updateData.profile?.weightKg && 
                         updateData.profile.weightKg !== existingUser.profile.weightKg;

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