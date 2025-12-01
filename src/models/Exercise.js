import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    muscleIds: { type: [String], required: true },
    desc: { type: String, required: true },
    instructions: { type: [String], required: true },
    videoUrl: { type: String, required: false },
    METS: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

exerciseSchema.index({ name: 1 });

export const Exercise = mongoose.model('Exercise', exerciseSchema, 'exercises');
