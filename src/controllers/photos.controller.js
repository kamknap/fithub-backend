import { Photo } from '../models/Photo.js';

// GET /api/photos → lista wszystkich zdjęć
export async function listPhotos(req, res, next) {
  try {
    const photos = await Photo.find().sort({ uploadedAt: -1 });
    res.json(photos);
  } catch (e) { 
    next(e); 
  }
}

// GET /api/photos/:id → pobierz zdjęcie po ID
export async function getPhotoById(req, res, next) {
  try {
    const { id } = req.params;
    const photo = await Photo.findById(id);
    
    if (!photo) {
      return res.status(404).json({ message: 'Zdjęcie nie zostało znalezione' });
    }
    
    res.json(photo);
  } catch (e) { 
    next(e); 
  }
}

// POST /api/photos → dodaj nowe zdjęcie
export async function createPhoto(req, res, next) {
  try {
    const { photoUrl, uploadedAt, weightKg } = req.body;

    if (!photoUrl || weightKg == null) {
      return res.status(400).json({ 
        message: 'photoUrl i weightKg są wymagane' 
      });
    }

    // Utwórz nowe zdjęcie
    const photo = await Photo.create({
      photoUrl,
      uploadedAt: uploadedAt ? new Date(uploadedAt) : new Date(),
      weightKg
    });

    res.status(201).json(photo);
  } catch (e) {
    next(e);
  }
}

// PUT /api/photos/:id → zaktualizuj zdjęcie
export async function updatePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Zaktualizuj zdjęcie
    const photo = await Photo.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!photo) {
      return res.status(404).json({ message: 'Zdjęcie nie zostało znalezione' });
    }

    res.json(photo);
  } catch (e) {
    next(e);
  }
}

// DELETE /api/photos/:id → usuń zdjęcie
export async function deletePhoto(req, res, next) {
  try {
    const { id } = req.params;

    const photo = await Photo.findByIdAndDelete(id);

    if (!photo) {
      return res.status(404).json({ message: 'Zdjęcie nie zostało znalezione' });
    }

    res.json({ message: 'Zdjęcie zostało usunięte', photo });
  } catch (e) {
    next(e);
  }
}
