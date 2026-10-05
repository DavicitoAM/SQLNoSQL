import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.routes.js';
import { modelsRouter } from './routes/models.routes.js';
import { compareRouter } from './routes/compare.routes.js';
import { crudRouter } from './routes/crud.routes.js';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/api', (_req, res) => {
  res.json({
    name: 'Biblioteca SQL vs NoSQL API',
    purpose: 'Comparar el modelo relacional de MySQL con el modelo documental de MongoDB.'
  });
});

app.use('/api/health', healthRouter);
app.use('/api/models', modelsRouter);
app.use('/api/compare', compareRouter);
app.use('/api/crud', crudRouter);
