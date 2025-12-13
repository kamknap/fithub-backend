import { UserProgress } from '../models/UserProgress.js';
import { User } from '../models/User.js';
import { resolveUserId } from '../utils/idResolver.js';

export async function getUserProgress(req, res, next) {
  try {
    const { userId } = req.params;

    // Konwertuj Firebase UID na MongoDB ObjectId jeśli potrzeba
    const resolvedUserId = await resolveUserId(userId);
    
    if (!resolvedUserId) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOne({ userId: resolvedUserId });

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json(progress);
  } catch (e) { 
    next(e); 
  }
}

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

export async function updateUserProgress(req, res, next) {
  try {
    const { userId } = req.params;
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

    // Konwertuj Firebase UID na MongoDB ObjectId jeśli potrzeba
    const resolvedUserId = await resolveUserId(userId);
    
    if (!resolvedUserId) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOneAndUpdate(
      { userId: resolvedUserId },
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

export async function deleteUserProgress(req, res, next) {
  try {
    const { userId } = req.params;

    // Konwertuj Firebase UID na MongoDB ObjectId jeśli potrzeba
    const resolvedUserId = await resolveUserId(userId);
    
    if (!resolvedUserId) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const progress = await UserProgress.findOneAndDelete({ userId: resolvedUserId });

    if (!progress) {
      return res.status(404).json({ message: 'Postęp użytkownika nie został znaleziony' });
    }

    res.json({ message: 'Postęp użytkownika został usunięty', progress });
  } catch (e) {
    next(e);
  }
}
