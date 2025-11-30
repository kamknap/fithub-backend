import { UserGoal } from '../models/UserGoal.js';
import { User } from '../models/User.js';

// Funkcja pomocnicza do usuwania pól z null/undefined
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
      // Rekurencyjnie oczyść zagnieżdżone obiekty
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = removeNullUndefined(value);
        // Dodaj tylko jeśli zagnieżdżony obiekt ma jakieś pola
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

    // Sprawdź czy użytkownik istnieje i pobierz jego aktualną wagę
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    // Pobierz aktualną wagę użytkownika jako firstWeightKg
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

// GET /api/user-goals/user/:userId → cele konkretnego użytkownika
export async function getUserGoalsByUserId(req, res, next) {
  try {
    const { userId } = req.params;
    const userGoals = await UserGoal.find({ userId }).sort({ createdAt: -1 });
    res.json(userGoals);
  } catch (e) { next(e); }
}

// GET /api/user-goals/:id → pobierz konkretny cel po ID
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

// PUT /api/user-goals/:id → aktualizuj cel użytkownika
export async function updateUserGoal(req, res, next) {
  try {
    const { id } = req.params;
    
    // Usuń pola z null/undefined przed aktualizacją
    const updateData = removeNullUndefined(req.body);

    const userGoal = await UserGoal.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('userId');

    if (!userGoal) {
      return res.status(404).json({ message: 'Cel użytkownika nie został znaleziony' });
    }

    // Jeśli zmieniono status na active, zaktualizuj currentGoalId użytkownika
    if (updateData.status === 'active') {
      await User.findByIdAndUpdate(userGoal.userId._id, { currentGoalId: userGoal._id });
    }

    res.json(userGoal);
  } catch (e) {
    next(e);
  }
}

// DELETE /api/user-goals/:id → usuń cel użytkownika
export async function deleteUserGoal(req, res, next) {
  try {
    const { id } = req.params;
    const userGoal = await UserGoal.findByIdAndDelete(id);

    if (!userGoal) {
      return res.status(404).json({ message: 'Cel użytkownika nie został znaleziony' });
    }

    // Jeśli usuwany cel był aktywny, usuń currentGoalId z użytkownika
    if (userGoal.status === 'active') {
      await User.findByIdAndUpdate(userGoal.userId, { currentGoalId: null });
    }

    res.json({ message: 'Cel użytkownika został usunięty', userGoal });
  } catch (e) {
    next(e);
  }
}