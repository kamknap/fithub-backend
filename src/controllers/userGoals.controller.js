import { UserGoal } from '../models/UserGoal.js';
import { User } from '../models/User.js';

// GET /api/user-goals → lista celów użytkowników
export async function listUserGoals(req, res, next) {
try {
const userGoals = await UserGoal.find().populate('userId').sort({ createdAt: -1 });
res.json(userGoals);
} catch (e) { next(e); }
}

// POST /api/user-goals → dodaj cel użytkownika
export async function createUserGoal(req, res, next) {
try {
const { userId, type, targetWeightKg, plan, status, startedAt, notes } = req.body;

if (!userId || !type || targetWeightKg == null || !plan || !startedAt) {
return res.status(400).json({ message: 'userId, type, targetWeightKg, plan i startedAt są wymagane' });
}

if (!plan.trainingFrequencyPerWeek) {
return res.status(400).json({ message: 'plan.trainingFrequencyPerWeek jest wymagane' });
}

// Sprawdź czy użytkownik istnieje
const user = await User.findById(userId);
if (!user) {
return res.status(404).json({ message: 'Użytkownik nie istnieje' });
}

const userGoal = await UserGoal.create({ 
userId, 
type, 
targetWeightKg, 
plan, 
status: status || 'active',
startedAt: new Date(startedAt),
notes 
});

// Zaktualizuj currentGoalId użytkownika, jeśli cel jest aktywny
if (userGoal.status === 'active') {
await User.findByIdAndUpdate(userId, { currentGoalId: userGoal._id });
}

const populatedGoal = await UserGoal.findById(userGoal._id).populate('userId');
res.status(201).json(populatedGoal);
} catch (e) {
next(e);
}
}

// GET /api/user-goals/:userId → cele konkretnego użytkownika
export async function getUserGoalsByUserId(req, res, next) {
try {
const { userId } = req.params;
const userGoals = await UserGoal.find({ userId }).sort({ createdAt: -1 });
res.json(userGoals);
} catch (e) { next(e); }
}
