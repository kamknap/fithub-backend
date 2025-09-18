import { User } from '../models/User.js';

// GET /api/users → lista użytkowników
export async function listUsers(req, res, next) {
try {
const users = await User.find().sort({ createdAt: -1 });
res.json(users);
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
res.status(201).json(user);
} catch (e) {
if (e.code === 11000) return res.status(409).json({ message: 'username already exists' });
next(e);
}
}