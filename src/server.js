import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { connectDB } from './db.js';
import usersRouter from './routes/users.routes.js';
import userGoalsRouter from './routes/userGoals.routes.js';
import foodsRouter from './routes/foods.routes.js';
import nutritionRouter from './routes/dailyNutrition.routes.js';
import weightHistoryRouter from './routes/userWeightHistory.routes.js';
import exercisesRouter from './routes/exercises.routes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://10.0.2.2:3000',
    'http://10.0.2.2:5173',
    'http://192.168.1.28:3000',
    'http://192.168.1.28:5173'
  ],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Healthcheck
app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Routes
app.use('/api/users', usersRouter);
app.use('/api/user-goals', userGoalsRouter);
app.use('/api/foods', foodsRouter); 
app.use('/api/nutrition', nutritionRouter);
app.use('/api/weight-history', weightHistoryRouter); 
app.use('/api/exercises', exercisesRouter); 

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[error]', err);
  res.status(500).json({ message: 'Internal Server Error' });
});

// Start
connectDB(process.env.MONGODB_URI)
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {  // ← ZMIANA: dodaj '0.0.0.0'
      console.log(`API listening on:`);
      console.log(`  - http://localhost:${PORT}`);
      console.log(`  - http://192.168.1.28:${PORT}`);  // ← Twój lokalny IP
    });
  })
  .catch((err) => {
    console.error('DB connection failed:', err);
    process.exit(1);
  });