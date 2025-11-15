import { Exercise } from '../models/Exercise.js';

// GET /api/exercises → lista wszystkich ćwiczeń lub wyszukiwanie po nazwie i/lub muscleId
export async function listExercises(req, res, next) {
  try {
    const { name, muscleId } = req.query;
    
    let query = {};
    
    // Wyszukiwanie po nazwie (case-insensitive)
    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }
    
    // Wyszukiwanie po muscleId (sprawdza czy zawiera dany muscleId w tablicy)
    if (muscleId) {
      query.muscleIds = muscleId;
    }
    
    const exercises = await Exercise.find(query).sort({ name: 1 });
    res.json(exercises);
  } catch (e) { 
    next(e); 
  }
}

// GET /api/exercises/:id → pobierz ćwiczenie po ID
export async function getExerciseById(req, res, next) {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findById(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Ćwiczenie nie zostało znalezione' });
    }
    
    res.json(exercise);
  } catch (e) { 
    next(e); 
  }
}

// POST /api/exercises → dodaj nowe ćwiczenie
export async function createExercise(req, res, next) {
  try {
    const { name, muscleIds, desc, instructions, videoUrl, METS } = req.body;

    // Walidacja wymaganych pól
    if (!name || !muscleIds || !desc || !instructions || METS == null) {
      return res.status(400).json({ 
        message: 'name, muscleIds, desc, instructions i METS są wymagane' 
      });
    }

    // Walidacja typów
    if (!Array.isArray(muscleIds) || muscleIds.length === 0) {
      return res.status(400).json({ 
        message: 'muscleIds musi być niepustą tablicą' 
      });
    }

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return res.status(400).json({ 
        message: 'instructions musi być niepustą tablicą' 
      });
    }

    if (typeof METS !== 'number' || METS < 0) {
      return res.status(400).json({ 
        message: 'METS musi być liczbą większą lub równą 0' 
      });
    }

    const exercise = await Exercise.create({ 
      name, 
      muscleIds, 
      desc, 
      instructions, 
      videoUrl: videoUrl || null,
      METS 
    });

    res.status(201).json(exercise);
  } catch (e) {
    next(e);
  }
}

// PUT /api/exercises/:id → aktualizuj ćwiczenie
export async function updateExercise(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const exercise = await Exercise.findByIdAndUpdate(id, updateData, { 
      new: true,
      runValidators: true 
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Ćwiczenie nie zostało znalezione' });
    }

    res.json(exercise);
  } catch (e) {
    next(e);
  }
}

// DELETE /api/exercises/:id → usuń ćwiczenie
export async function deleteExercise(req, res, next) {
  try {
    const { id } = req.params;
    const exercise = await Exercise.findByIdAndDelete(id);

    if (!exercise) {
      return res.status(404).json({ message: 'Ćwiczenie nie zostało znalezione' });
    }

    res.json({ message: 'Ćwiczenie zostało usunięte', exercise });
  } catch (e) {
    next(e);
  }
}
