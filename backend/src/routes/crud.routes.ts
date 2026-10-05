import { Router } from 'express';
import { createBook, deleteBook, getBookForEdit, getReferenceData, updateBook } from '../services/crudService.js';
import { syncMongoFromMysql } from '../services/mongoSyncService.js';
import { errorMessage } from '../utils/errors.js';

export const crudRouter = Router();

crudRouter.get('/books/:id', async (req, res) => {
  try {
    res.json(await getBookForEdit(Number(req.params.id)));
  } catch (error) {
    res.status(404).json({ error: errorMessage(error) });
  }
});

crudRouter.get('/reference-data', async (_req, res) => {
  try {
    res.json(await getReferenceData());
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});

crudRouter.post('/books', async (req, res) => {
  try {
    res.status(201).json(await createBook(req.body));
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

crudRouter.put('/books/:id', async (req, res) => {
  try {
    res.json(await updateBook(Number(req.params.id), req.body));
  } catch (error) {
    res.status(400).json({ error: errorMessage(error) });
  }
});

crudRouter.delete('/books/:id', async (req, res) => {
  try {
    res.json(await deleteBook(Number(req.params.id)));
  } catch (error) {
    res.status(409).json({ error: errorMessage(error) });
  }
});

crudRouter.post('/sync-mongo', async (_req, res) => {
  try {
    res.json({ synchronized: true, counts: await syncMongoFromMysql() });
  } catch (error) {
    res.status(500).json({ error: errorMessage(error) });
  }
});
