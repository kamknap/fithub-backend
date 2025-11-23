import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    photoUrl: { type: String, required: true },
    uploadedAt: { type: Date, required: true, default: () => new Date() },
    weightKg: { type: Number, required: true, min: 0 }
  },
  { timestamps: true }
);

export const Photo = mongoose.model('Photo', photoSchema, 'photos');
