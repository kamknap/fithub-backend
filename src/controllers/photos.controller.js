import { Photo } from '../models/Photo.js';

export async function listPhotos(req, res, next) {
  try {
    const photos = await Photo.find().sort({ uploadedAt: -1 });
    res.json(photos);
  } catch (e) { 
    next(e); 
  }
}

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

export async function createPhoto(req, res, next) {
  try {
    const { photoUrl, uploadedAt, weightKg } = req.body;

    if (!photoUrl || weightKg == null) {
      return res.status(400).json({ 
        message: 'photoUrl i weightKg są wymagane' 
      });
    }

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

export async function updatePhoto(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

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
