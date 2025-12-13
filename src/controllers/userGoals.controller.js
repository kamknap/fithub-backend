import { UserGoal } from '../models/UserGoal.js';
import { User } from '../models/User.js';

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

export async function listUserGoals(req, res, next) {
  try {
    const userGoals = await UserGoal.find().populate('userId').sort({ createdAt: -1 });
    res.json(userGoals);
  } catch (e) { next(e); }
}

// POST /api/user-goals/me - utworzenie celu dla zalogowanego użytkownika
export async function createCurrentUserGoal(req, res, next) {
  try {
    const { type, targetWeightKg, plan, status, startedAt, notes } = req.body;

    // BEZPIECZEŃSTWO: Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (!type || targetWeightKg == null || !plan || !startedAt) {
      return res.status(400).json({ message: 'type, targetWeightKg, plan i startedAt są wymagane' });
    }

    if (!plan.trainingFrequencyPerWeek) {
      return res.status(400).json({ message: 'plan.trainingFrequencyPerWeek jest wymagane' });
    }

    const firstWeightKg = user.profile.weightKg;

    const userGoal = await UserGoal.create({ 
      userId: user._id, 
      type, 
      firstWeightKg,
      targetWeightKg, 
      plan, 
      status: status || 'active',
      startedAt: new Date(startedAt),
      notes 
    });

    if (userGoal.status === 'active') {
      await User.findByIdAndUpdate(user._id, { currentGoalId: userGoal._id });
    }

    const populatedGoal = await UserGoal.findById(userGoal._id).populate('userId');
    res.status(201).json(populatedGoal);
  } catch (e) {
    next(e);
  }
}

// Stara funkcja (może być używana przez admina)
export async function createUserGoal(req, res, next) {
  try {
    const { userId, type, targetWeightKg, plan, status, startedAt, notes } = req.body;

    if (!userId || !type || targetWeightKg == null || !plan || !startedAt) {
      return res.status(400).json({ message: 'userId, type, targetWeightKg, plan i startedAt są wymagane' });
    }

    if (!plan.trainingFrequencyPerWeek) {
      return res.status(400).json({ message: 'plan.trainingFrequencyPerWeek jest wymagane' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    const firstWeightKg = user.profile.weightKg;

    const userGoal = await UserGoal.create({ 
      userId, 
      type, 
      firstWeightKg,
      targetWeightKg, 
      plan, 
      status: status || 'active',
      startedAt: new Date(startedAt),
      notes 
    });

    if (userGoal.status === 'active') {
      await User.findByIdAndUpdate(userId, { currentGoalId: userGoal._id });
    }

    const populatedGoal = await UserGoal.findById(userGoal._id).populate('userId');
    res.status(201).json(populatedGoal);
  } catch (e) {
    next(e);
  }
}

// GET /api/user-goals/me - cele zalogowanego użytkownika
export async function getCurrentUserGoals(req, res, next) {
  try {
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }
    
    const userGoals = await UserGoal.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(userGoals);
  } catch (e) { next(e); }
}

export async function getUserGoalById(req, res, next) {
  try {
    const { id } = req.params;
    const userGoal = await UserGoal.findById(id).populate('userId');
    
    if (!userGoal) {
      return res.status(404).json({ message: 'Cel użytkownika nie został znaleziony' });
    }
    
    res.json(userGoal);
  } catch (e) { 
    next(e); 
  }
}

export async function updateUserGoal(req, res, next) {
  try {
    const { id } = req.params;
    
    const updateData = removeNullUndefined(req.body);

    const userGoal = await UserGoal.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('userId');

    if (!userGoal) {
      return res.status(404).json({ message: 'Cel użytkownika nie został znaleziony' });
    }

    if (updateData.status === 'active') {
      await User.findByIdAndUpdate(userGoal.userId._id, { currentGoalId: userGoal._id });
    }

    res.json(userGoal);
  } catch (e) {
    next(e);
  }
}

export async function deleteUserGoal(req, res, next) {
  try {
    const { id } = req.params;
    const userGoal = await UserGoal.findByIdAndDelete(id);

    if (!userGoal) {
      return res.status(404).json({ message: 'Cel użytkownika nie został znaleziony' });
    }

    if (userGoal.status === 'active') {
      await User.findByIdAndUpdate(userGoal.userId, { currentGoalId: null });
    }

    res.json({ message: 'Cel użytkownika został usunięty', userGoal });
  } catch (e) {
    next(e);
  }
}