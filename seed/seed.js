import 'dotenv/config';
import { connectDB } from '../src/db.js';
import { User } from '../src/models/User.js';
import { UserGoal } from '../src/models/UserGoal.js';

async function run() {
await connectDB(process.env.MONGODB_URI);

// Usuń istniejące dane
await User.deleteMany({});
await UserGoal.deleteMany({});

const userData = [
{
username: 'User1',
auth: { provider: 'local', firebaseUid: null },
profile: { sex: 'Male', age: 20, heightCm: 180, weightKg: 75 },
computed: { bmi: 23.1, bmr: 1800 },
settings: {
activityLevel: 3,
notifications: {
enabled: true,
types: { workoutReminders: true, mealReminders: false, measureReminders: true }
},
preferredTrainingFrequencyPerWeek: 3
}
},
{
username: 'User2',
auth: { provider: 'local', firebaseUid: null },
profile: { sex: 'Female', age: 24, heightCm: 168, weightKg: 60 },
computed: { bmi: 21.3, bmr: 1400 },
settings: {
activityLevel: 2,
notifications: {
enabled: true,
types: { workoutReminders: true, mealReminders: true, measureReminders: true }
},
preferredTrainingFrequencyPerWeek: 4
}
},
{
username: 'User3',
auth: { provider: 'local', firebaseUid: null },
profile: { sex: 'Male', age: 30, heightCm: 182, weightKg: 82 },
computed: { bmi: 24.8, bmr: 1900 },
settings: {
activityLevel: 4,
notifications: {
enabled: false,
types: { workoutReminders: false, mealReminders: false, measureReminders: false }
},
preferredTrainingFrequencyPerWeek: 5
}
}
];

// Dodaj użytkowników
const createdUsers = [];
for (const u of userData) {
const user = await User.create(u);
createdUsers.push(user);
}

// Dodaj przykładowe cele
const goalData = [
{
userId: createdUsers[0]._id,
type: 'lose_weight',
targetWeightKg: 70,
plan: {
trainingFrequencyPerWeek: 3,
estimatedDurationWeeks: 12,
calorieTarget: 2000
},
startedAt: new Date(),
notes: 'Chcę schudnąć 5 kg'
},
{
userId: createdUsers[1]._id,
type: 'maintain',
targetWeightKg: 60,
plan: {
trainingFrequencyPerWeek: 4,
estimatedDurationWeeks: null,
calorieTarget: 1800
},
startedAt: new Date(),
notes: 'Utrzymanie obecnej wagi'
},
{
userId: createdUsers[2]._id,
type: 'gain_weight',
targetWeightKg: 88,
plan: {
trainingFrequencyPerWeek: 5,
estimatedDurationWeeks: 16,
calorieTarget: 2800
},
startedAt: new Date(),
notes: 'Nabieranie masy mięśniowej'
}
];

const createdGoals = [];
for (const g of goalData) {
const goal = await UserGoal.create(g);
createdGoals.push(goal);
}

// Zaktualizuj currentGoalId dla użytkowników
for (let i = 0; i < createdUsers.length; i++) {
await User.findByIdAndUpdate(createdUsers[i]._id, { currentGoalId: createdGoals[i]._id });
}

const userCount = await User.countDocuments();
const goalCount = await UserGoal.countDocuments();
console.log(`[seed] Users in DB: ${userCount}`);
console.log(`[seed] Goals in DB: ${goalCount}`);
process.exit(0);
}

run().catch((e) => { console.error(e); process.exit(1); });