import { User } from '../models/User.js';
import { UserWeightHistory } from '../models/UserWeightHistory.js';

// GET /api/users → lista użytkowników
export async function listUsers(req, res, next) {
try {
const users = await User.find().sort({ createdAt: -1 });
res.json(users);
} catch (e) { next(e); }
}

export async function getUserById(req, res, next) {
  try {
    const { id } = req.params;
    
    // Auto-detect: czy to MongoDB ObjectId (24 hex) czy Firebase UID
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let user;
    
    if (isMongoId) {
      // MongoDB ObjectId - szukaj po _id
      user = await User.findById(id);
    } else {
      // Firebase UID - szukaj po auth.firebaseUid
      user = await User.findOne({ 'auth.firebaseUid': id });
    }
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (e) { next(e); }
}

export async function getUserByFirebaseUid(req, res, next) {
  try {
    const { firebaseUid } = req.params;
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (e) { next(e); }
}

export async function createUser(req, res, next) {
try {
const { username, auth, profile, computed, settings } = req.body;

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
auth: auth || { provider: 'local', firebaseUid: null },
profile, 
computed: computed || {}, 
settings 
});

await UserWeightHistory.create({
userId: user._id,
weightKg: profile.weightKg,
measuredAt: new Date()
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

export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    
    const updateData = removeNullUndefined(req.body);

    // Auto-detect: MongoDB ObjectId vs Firebase UID
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    let existingUser;
    if (isMongoId) {
      existingUser = await User.findById(id);
    } else {
      existingUser = await User.findOne({ 'auth.firebaseUid': id });
    }
    
    if (!existingUser) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const weightChanged = updateData.profile?.weightKg && 
                         updateData.profile.weightKg !== existingUser.profile.weightKg;

    // Update używając MongoDB _id (niezależnie od tego co przyszło w params)
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