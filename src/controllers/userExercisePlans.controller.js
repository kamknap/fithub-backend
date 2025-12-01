import { UserExercisePlan } from '../models/UserExercisePlan.js';

export async function getUserExercisePlans(req, res, next) {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ message: 'user_id jest wymagane w query' });
    }

    const plans = await UserExercisePlan.find({ user_id })
      .populate('plan_exercises.exercise_id')
      .sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (e) { 
    next(e); 
  }
}

export async function getUserExercisePlanById(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await UserExercisePlan.findById(id)
      .populate('plan_exercises.exercise_id');
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
    }
    
    res.json(plan);
  } catch (e) { 
    next(e); 
  }
}

export async function createUserExercisePlan(req, res, next) {
  try {
    const { user_id, plan_name, plan_exercises } = req.body;

    if (!user_id || !plan_name) {
      return res.status(400).json({ 
        message: 'user_id i plan_name są wymagane' 
      });
    }

    if (plan_exercises && !Array.isArray(plan_exercises)) {
      return res.status(400).json({ 
        message: 'plan_exercises musi być tablicą' 
      });
    }

    const existingPlan = await UserExercisePlan.findOne({
      user_id,
      plan_name: { $regex: `^${plan_name}$`, $options: 'i' }
    });

    if (existingPlan) {
      return res.status(409).json({ 
        message: 'Masz już plan treningowy o takiej nazwie' 
      });
    }

    const plan = await UserExercisePlan.create({ 
      user_id, 
      plan_name, 
      plan_exercises: plan_exercises || []
    });

    const populatedPlan = await UserExercisePlan.findById(plan._id)
      .populate('plan_exercises.exercise_id');

    res.status(201).json(populatedPlan);
  } catch (e) {
    next(e);
  }
}

export async function updateUserExercisePlan(req, res, next) {
  try {
    const { id } = req.params;
    const { plan_name, plan_exercises } = req.body;

    if (plan_name !== undefined) {
      const currentPlan = await UserExercisePlan.findById(id);
      
      if (!currentPlan) {
        return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
      }

      const existingPlan = await UserExercisePlan.findOne({
        _id: { $ne: id },
        user_id: currentPlan.user_id,
        plan_name: { $regex: `^${plan_name}$`, $options: 'i' }
      });

      if (existingPlan) {
        return res.status(409).json({ 
          message: 'Masz już plan treningowy o takiej nazwie' 
        });
      }
    }

    const updateData = {};
    if (plan_name !== undefined) updateData.plan_name = plan_name;
    if (plan_exercises !== undefined) updateData.plan_exercises = plan_exercises;

    const plan = await UserExercisePlan.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('plan_exercises.exercise_id');

    if (!plan) {
      return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
    }

    res.json(plan);
  } catch (e) {
    next(e);
  }
}

export async function deleteUserExercisePlan(req, res, next) {
  try {
    const { id } = req.params;
    const plan = await UserExercisePlan.findByIdAndDelete(id);

    if (!plan) {
      return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
    }

    res.json({ message: 'Plan treningowy został usunięty', plan });
  } catch (e) {
    next(e);
  }
}

export async function addExerciseToPlan(req, res, next) {
  try {
    const { id } = req.params;
    const { exercise_id } = req.body;

    console.log('addExerciseToPlan - planId:', id);
    console.log('addExerciseToPlan - exercise_id from body:', exercise_id);

    if (!exercise_id) {
      return res.status(400).json({ message: 'exercise_id jest wymagane' });
    }

    const plan = await UserExercisePlan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
    }

    console.log('addExerciseToPlan - found plan:', plan._id);
    console.log('addExerciseToPlan - current exercises:', plan.plan_exercises);

    const exerciseExists = plan.plan_exercises.some(
      ex => ex.exercise_id.toString() === exercise_id.toString()
    );

    if (exerciseExists) {
      return res.status(400).json({ message: 'To ćwiczenie już istnieje w planie' });
    }

    plan.plan_exercises.push({ exercise_id });
    console.log('addExerciseToPlan - after push:', plan.plan_exercises);
    
    await plan.save();
    console.log('addExerciseToPlan - saved successfully');

    const updatedPlan = await UserExercisePlan.findById(id)
      .populate('plan_exercises.exercise_id');

    console.log('addExerciseToPlan - returning updated plan');
    res.json(updatedPlan);
  } catch (e) {
    console.error('addExerciseToPlan - error:', e);
    next(e);
  }
}

export async function removeExerciseFromPlan(req, res, next) {
  try {
    const { id, exercise_id } = req.params;

    const plan = await UserExercisePlan.findById(id);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan treningowy nie został znaleziony' });
    }

    const exerciseIndex = plan.plan_exercises.findIndex(
      ex => ex.exercise_id.toString() === exercise_id
    );

    if (exerciseIndex === -1) {
      return res.status(404).json({ message: 'Ćwiczenie nie zostało znalezione w planie' });
    }

    plan.plan_exercises.splice(exerciseIndex, 1);
    await plan.save();

    const updatedPlan = await UserExercisePlan.findById(id)
      .populate('plan_exercises.exercise_id');

    res.json(updatedPlan);
  } catch (e) {
    next(e);
  }
}
