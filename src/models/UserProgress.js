import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    level: { type: Number, default: 1, min: 1 },
    currentPoints: { type: Number, default: 0, min: 0 },
    totalPoints: { type: Number, default: 0, min: 0 },
    pointsToNextLevel: { type: Number, default: 100, min: 0 },
    lastLoginDate: { type: Date, default: null },
    loginStreak: { type: Number, default: 0, min: 0 },
    badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
    completedChallenges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Challenge' }],
    activeChallenges: {
      type: {
        challengeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
        counter: { type: Number, default: 0, min: 0 },
        totalToFinish: { type: Number, default: 0, min: 0 },
        startedDate: { type: Date, default: null }
      },
      default: null
    },
    motivationNotifications: {
      enabled: { type: Boolean, default: true },
      achivementAlerts: { type: Boolean, default: true },
      dailyReminder: { type: Boolean, default: true },
      quotes: { type: Boolean, default: true },
      reminderTime: { type: String, default: '09:00' }
    },
    statistics: {
      totalMealsLogged: { type: Number, default: 0, min: 0 },
      totalExercisesCompleted: { type: Number, default: 0, min: 0 },
      totalWeightEntries: { type: Number, default: 0, min: 0 },
      longestStreak: { type: Number, default: 0, min: 0 },
      weightChange: { type: Number, default: 0 }
    },
    photos: [
      {
        photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
        tag: { type: String, enum: ['before', 'after', 'progress', 'other'], default: 'other' }
      }
    ]
  },
  { timestamps: true }
);

export const UserProgress = mongoose.model('UserProgress', userProgressSchema, 'user_progress');
