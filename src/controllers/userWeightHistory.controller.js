import { UserWeightHistory } from '../models/UserWeightHistory.js';
import { User } from '../models/User.js';
import { resolveUserId } from '../utils/idResolver.js';

export async function getUserWeightHistory(req, res, next) {
  try {
    const { userId } = req.params;

    // Konwertuj Firebase UID na MongoDB ObjectId jeśli potrzeba
    const resolvedUserId = await resolveUserId(userId);
    
    if (!resolvedUserId) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const weightHistory = await UserWeightHistory.find({ userId: resolvedUserId })
      .sort({ measuredAt: -1 });

    res.json(weightHistory);
  } catch (e) { 
    next(e); 
  }
}

export async function createWeightMeasurement(req, res, next) {
  try {
    const { userId, weightKg, measuredAt } = req.body;

    if (!userId || weightKg == null || !measuredAt) {
      return res.status(400).json({ 
        message: 'userId, weightKg i measuredAt są wymagane' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    const weightMeasurement = await UserWeightHistory.create({
      userId,
      weightKg,
      measuredAt: new Date(measuredAt)
    });

    res.status(201).json(weightMeasurement);
  } catch (e) {
    next(e);
  }
}
