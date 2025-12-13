import { UserProgress } from '../models/UserProgress.js';
import { User } from '../models/User.js';

// GET /api/user-progress/me - postęp zalogowanego użytkownika
export async function getCurrentUserProgress(req, res, next) {
  try {
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    let progress = await UserProgress.findOne({ userId: user._id });

    // Jeśli postęp nie istnieje, utwórz go automatycznie z domyślnymi wartościami
    if (!progress) {
      progress = await UserProgress.create({
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
          totalWeightEntries: 0,
          longestStreak: 1,
          weightChange: 0
        },
        photos: []
      });
    }

    res.json(progress);
  } catch (e) { 
    next(e); 
  }
}

// POST /api/user-progress/me - utworzenie postępu dla zalogowanego użytkownika
export async function createCurrentUserProgress(req, res, next) {
  try {
    const { level, currentPoints, totalPoints, pointsToNextLevel, lastLoginDate, loginStreak, badges, completedChallenges, activeChallenges, statistics, photos } = req.body;

    // BEZPIECZEŃSTWO: Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const existingProgress = await UserProgress.findOne({ userId: user._id });
    if (existingProgress) {
      return res.status(409).json({ message: 'Postęp dla tego użytkownika już istnieje' });
    }

    const progress = await UserProgress.create({
      userId: user._id,
      level,
      currentPoints,
      totalPoints,
      pointsToNextLevel,
      lastLoginDate,
      loginStreak,
      badges,
      completedChallenges,
      activeChallenges,
      statistics,
      photos
    });

    res.status(201).json(progress);
  } catch (e) {
    next(e);
  }
}

// Stara funkcja (może być używana przez admina)
export async function createUserProgress(req, res, next) {
  try {
    const { userId, level, currentPoints, totalPoints, pointsToNextLevel, lastLoginDate, loginStreak, badges, completedChallenges, activeChallenges, statistics, photos } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'userId jest wymagane' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    const existingProgress = await UserProgress.findOne({ userId });
    if (existingProgress) {
      return res.status(409).json({ message: 'Postęp dla tego użytkownika już istnieje' });
    }

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
      statistics,
      photos
    });

    res.status(201).json(progress);
  } catch (e) {
    next(e);
  }
}

// PUT /api/user-progress/me - aktualizacja postępu zalogowanego użytkownika
export async function updateCurrentUserProgress(req, res, next) {
  try {
    const updateData = req.body;

    if (updateData.activeChallenges !== undefined) {
      if (updateData.activeChallenges === null) {
      } else if (typeof updateData.activeChallenges === 'object') {
        if (!updateData.activeChallenges.challengeId || 
            Object.keys(updateData.activeChallenges).length === 0) {
          updateData.activeChallenges = null;
        }
      }
    }

    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: user._id },
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

// DELETE /api/user-progress/me - usunięcie postępu zalogowanego użytkownika
export async function deleteCurrentUserProgress(req, res, next) {
  try {
    // Pobierz Firebase UID z tokenu
    const firebaseUid = req.user.uid;
    
    // Znajdź użytkownika po Firebase UID
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOneAndDelete({ userId: user._id });

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json({ message: 'Postęp użytkownika został usunięty', progress });
  } catch (e) {
    next(e);
  }
}
