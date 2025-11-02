import { UserWeightHistory } from '../models/UserWeightHistory.js';
import { User } from '../models/User.js';

// GET /api/weight-history/:userId → wszystkie pomiary dla użytkownika
export async function getUserWeightHistory(req, res, next) {
  try {
    const { userId } = req.params;

    // Sprawdź czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    // Pobierz wszystkie pomiary, posortowane od najnowszych
    const weightHistory = await UserWeightHistory.find({ userId })
      .sort({ measuredAt: -1 });

    res.json(weightHistory);
  } catch (e) { 
    next(e); 
  }
}

// POST /api/weight-history → dodaj nowy pomiar
export async function createWeightMeasurement(req, res, next) {
  try {
    const { userId, weightKg, measuredAt } = req.body;

    if (!userId || weightKg == null || !measuredAt) {
      return res.status(400).json({ 
        message: 'userId, weightKg i measuredAt są wymagane' 
      });
    }

    // Sprawdź czy użytkownik istnieje
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie istnieje' });
    }

    // Utwórz nowy pomiar
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
