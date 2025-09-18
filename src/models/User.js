import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
{
username: { type: String, required: true, trim: true, unique: true },
auth: {
provider: { type: String, required: true, default: 'local' },
firebaseUid: { type: String, default: null }
},
profile: {
sex: { type: String, enum: ['Male', 'Female', 'Other', 'PreferNotToSay'], required: true },
birthDate: { type: Date, required: true},
heightCm: { type: Number, required: true, min: 0 },
weightKg: { type: Number, required: true, min: 0 }
},
computed: {
bmi: { type: Number, min: 0 },
bmr: { type: Number, min: 0 }
},
settings: {
activityLevel: { type: Number, required: true, min: 1, max: 5 },
notifications: {
enabled: { type: Boolean, default: true },
types: {
workoutReminders: { type: Boolean, default: true },
mealReminders: { type: Boolean, default: false },
measureReminders: { type: Boolean, default: true }
},
channels: {
push: { type: Boolean, default: true },
email: { type: Boolean, default: false }
}
},
preferredTrainingFrequencyPerWeek: { type: Number, required: true, min: 1, max: 7 }
},
currentGoalId: { type: mongoose.Schema.Types.ObjectId, ref: 'UserGoal', default: null }
},
{ timestamps: true }
);

export const User = mongoose.model('User', userSchema, 'users');