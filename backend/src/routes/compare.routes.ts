import { Router } from 'express';
import { operations, type OperationId } from '../data/operations.js';
import { compareOperation } from '../services/comparisonService.js';
import { errorMessage } from '../utils/errors.js';

export const compareRouter = Router();

compareRouter.get('/operations', (_req, res) => {
  res.json(operations);
});

compareRouter.post('/query', async (req, res) => {
  try {
    const operation = req.body?.operation as OperationId;
    const params = req.body?.params ?? {};
    const valid = operations.some((item) => item.id === operation);
    if (!valid) return res.status(400).json({ error: 'Selecciona una operación válida.' });
    const result = await compareOperation(operation, params);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: errorMessage(error) });
  }
});
