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
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    res.json(user);
  } catch (e) { next(e); }
}

// POST /api/users → dodaj użytkownika
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

// Automatycznie dodaj pierwszą wagę do historii
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

// PUT /api/users/:id → aktualizuj użytkownika
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Sprawdź czy użytkownik istnieje
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Sprawdź czy waga się zmieniła
    const weightChanged = updateData.profile?.weightKg && 
                         updateData.profile.weightKg !== existingUser.profile.weightKg;

    // Zaktualizuj użytkownika
    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    // Jeśli waga się zmieniła, dodaj nowy wpis do historii
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