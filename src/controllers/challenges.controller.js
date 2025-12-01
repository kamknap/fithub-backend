import { Challenge } from '../models/Challenge.js';

export async function listChallenges(req, res, next) {
  try {
    const challenges = await Challenge.find().sort({ createdAt: -1 });
    res.json(challenges);
  } catch (e) { 
    next(e); 
  }
}

export async function getChallengeById(req, res, next) {
  try {
    const { id } = req.params;
    const challenge = await Challenge.findById(id);
    
    if (!challenge) {
      return res.status(404).json({ message: 'Wyzwanie nie zostało znalezione' });
    }
    
    res.json(challenge);
  } catch (e) { 
    next(e); 
  }
}
