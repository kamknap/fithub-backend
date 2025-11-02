import mongoose from 'mongoose';

const userWeightHistorySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    weightKg: { type: Number, required: true, min: 0 },
    measuredAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Index dla szybkiego wyszukiwania po userId
userWeightHistorySchema.index({ userId: 1, measuredAt: -1 });

export const UserWeightHistory = mongoose.model('UserWeightHistory', userWeightHistorySchema, 'user_weight_history');
