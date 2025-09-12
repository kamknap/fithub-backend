import mongoose from 'mongoose';

const userGoalSchema = new mongoose.Schema(
{
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
type: { type: String, enum: ['lose_weight', 'gain_weight', 'maintain'], required: true },
targetWeightKg: { type: Number, required: true, min: 0 },
plan: {
trainingFrequencyPerWeek: { type: Number, required: true, min: 1, max: 7 },
estimatedDurationWeeks: { type: Number, min: 1 },
calorieTarget: { type: Number, min: 0 }
},
status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
startedAt: { type: Date, required: true },
completedAt: { type: Date, default: null },
notes: { type: String, default: null }
},
{ timestamps: true }
);

export const UserGoal = mongoose.model('UserGoal', userGoalSchema, 'user_goals');
