import { Badge } from '../models/Badge.js';

export async function listBadges(req, res, next) {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.json(badges);
  } catch (e) { 
    next(e); 
  }
}

export async function getBadgeById(req, res, next) {
  try {
    const { id } = req.params;
    const badge = await Badge.findById(id);
    
    if (!badge) {
      return res.status(404).json({ message: 'Odznaka nie została znaleziona' });
    }
    
    res.json(badge);
  } catch (e) { 
    next(e); 
  }
}
