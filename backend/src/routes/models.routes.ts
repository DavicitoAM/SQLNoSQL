import { Router } from 'express';
import { documentModel, relationalModel, relations } from '../data/modelDefinition.js';

export const modelsRouter = Router();

modelsRouter.get('/', (_req, res) => {
  res.json({
    relational: {
      engine: 'MySQL',
      tables: relationalModel,
      relations
    },
    document: {
      engine: 'MongoDB',
      collections: documentModel
    }
  });
});
