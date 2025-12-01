import { Food } from '../models/Foods.js';
import mongoose from 'mongoose';

export async function listFoods(req, res, next) {
  try {
    const { search, category, limit = 20, skip = 0 } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { brand: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    if (category && category !== 'all') {
      query.category = category;
    }

    const foods = await Food.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ verified: -1, createdAt: -1 });

    const total = await Food.countDocuments(query);
    
    res.json({ foods, total });
  } catch (e) { next(e); }
}

export async function getFoodById(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Nieprawidłowy format ID produktu' });
    }
    
    const food = await Food.findById(id);
    
    if (!food) {
      return res.status(404).json({ message: 'Produkt nie został znaleziony' });
    }
    
    res.json(food);
  } catch (e) { next(e); }
}

export async function createFood(req, res, next) {
  try {
    const { name, brand, barcode, nutritionPer100g, category, addedBy } = req.body;

    if (!name || !nutritionPer100g) {
      return res.status(400).json({ message: 'name i nutritionPer100g są wymagane' });
    }

    const food = await Food.create({
      name,
      brand,
      barcode,
      nutritionPer100g,
      category: category || 'other',
      addedBy: addedBy || null
    });

    res.status(201).json(food);
  } catch (e) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Produkt z tym kodem kreskowym już istnieje' });
    }
    next(e);
  }
}

export async function updateFood(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Nieprawidłowy format ID produktu' });
    }

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!food) {
      return res.status(404).json({ message: 'Produkt nie został znaleziony' });
    }
    
    res.json(food);
  } catch (e) { next(e); }
}

export async function deleteFood(req, res, next) {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Nieprawidłowy format ID produktu' });
    }
    
    const food = await Food.findByIdAndDelete(id);
    
    if (!food) {
      return res.status(404).json({ message: 'Produkt nie został znaleziony' });
    }
    
    res.json({ message: 'Produkt został usunięty' });
  } catch (e) { next(e); }
}

export async function getFoodByBarcode(req, res, next) {
  try {
    const { barcode } = req.params;
    const food = await Food.findOne({ barcode });
    
    if (!food) {
      return res.status(404).json({ message: 'Produkt z tym kodem kreskowym nie został znaleziony' });
    }
    
    res.json(food);
  } catch (e) { next(e); }
}