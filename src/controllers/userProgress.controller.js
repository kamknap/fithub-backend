import { UserProgress } from '../models/UserProgress.js';
import { User } from '../models/User.js';

// GET /api/user-progress/:userId → pobierz postęp użytkownika
export async function getUserProgress(req, res, next) {
  try {
    const { userId } = req.params;

    // Sprawdź czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Pobierz postęp użytkownika
    const progress = await UserProgress.findOne({ userId });

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json(progress);
  } catch (e) { 
    next(e); 
  }
}

// POST /api/user-progress → utwórz nowy postęp użytkownika
export async function createUserProgress(req, res, next) {
  try {
    const { userId, level, currentPoints, totalPoints, pointsToNextLevel, lastLoginDate, loginStreak, badges, completedChallenges, activeChallenges, motivationNotifications, statistics, photos } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId jest wymagane' });
    }

    // Sprawdź czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    // Sprawdź czy postęp już istnieje dla tego użytkownika
    const existingProgress = await UserProgress.findOne({ userId });
    if (existingProgress) {
      return res.status(409).json({ message: 'Postęp dla tego użytkownika już istnieje' });
    }

    // Utwórz nowy postęp
    const progress = await UserProgress.create({
      userId,
      level,
      currentPoints,
      totalPoints,
      pointsToNextLevel,
      lastLoginDate,
      loginStreak,
      badges,
      completedChallenges,
      activeChallenges,
      motivationNotifications,
      statistics,
      photos
    });

    res.status(201).json(progress);
  } catch (e) {
    next(e);
  }
}

// PUT /api/user-progress/:userId → zaktualizuj postęp użytkownika
export async function updateUserProgress(req, res, next) {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    // ✅ Jeśli activeChallenges to pusty obiekt, zamień na null
    if (updateData.activeChallenges !== undefined) {
      if (updateData.activeChallenges === null) {
        // OK - null jest dozwolony
      } else if (typeof updateData.activeChallenges === 'object') {
        // Sprawdź czy obiekt jest pusty lub nie ma challengeId
        if (!updateData.activeChallenges.challengeId || 
            Object.keys(updateData.activeChallenges).length === 0) {
          updateData.activeChallenges = null; // ✅ Zamień na null
        }
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json(progress);
  } catch (e) {
    next(e);
  }
}

// DELETE /api/user-progress/:userId → usuń postęp użytkownika
export async function deleteUserProgress(req, res, next) {
  try {
    const { userId } = req.params;

    const progress = await UserProgress.findOneAndDelete({ userId });

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json({ message: 'Postęp użytkownika został usunięty', progress });
  } catch (e) {
    next(e);
  }
}
