import { UserWeightHistory } from '../models/UserWeightHistory.js';
import { User } from '../models/User.js';

export async function getCurrentUserWeightHistory(req, res, next) {
  try {
    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    const weightHistory = await UserWeightHistory.find({ userId: user._id })
      .sort({ measuredAt: -1 });

    res.json(weightHistory);
  } catch (e) { 
    next(e); 
  }
}

export async function createCurrentUserWeightMeasurement(req, res, next) {
  try {
    const { weightKg, measuredAt } = req.body;

    const firebaseUid = req.user.uid;
    
    const user = await User.findOne({ 'auth.firebaseUid': firebaseUid });
    if (!user) {
      return res.status(404).json({ message: 'Użytkownik nie został znaleziony' });
    }

    if (weightKg == null || !measuredAt) {
      return res.status(400).json({ 
        message: 'weightKg i measuredAt są wymagane' 
      });
    }

    const weightMeasurement = await UserWeightHistory.create({
      userId: user._id,
      weightKg,
      measuredAt: new Date(measuredAt)
    });

    res.status(201).json(weightMeasurement);
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
