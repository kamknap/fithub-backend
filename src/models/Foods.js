import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, default: null },
  barcode: { type: String, default: null },
  nutritionPer100g: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    fat: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  category: { type: String, default: 'other' },
  verified: { type: Boolean, default: false },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, { timestamps: true });

foodSchema.index({ name: 'text', brand: 'text' });
foodSchema.index({ barcode: 1 });

export const Food = mongoose.model('Food', foodSchema, 'foods');