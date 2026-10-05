import { Router } from 'express';
import { mysqlPool } from '../config/mysql.js';
import { getMongoDb } from '../config/mongodb.js';
import { errorMessage } from '../utils/errors.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  const result: Record<string, unknown> = {
    api: { status: 'online' },
    mysql: { status: 'offline' },
    mongodb: { status: 'offline' }
  };

  try {
    await mysqlPool.query('SELECT 1 AS ok');
    result.mysql = { status: 'online' };
  } catch (error) {
    result.mysql = { status: 'offline', error: errorMessage(error) };
  }

  try {
    const db = await getMongoDb();
    await db.command({ ping: 1 });
    result.mongodb = { status: 'online' };
  } catch (error) {
    result.mongodb = { status: 'offline', error: errorMessage(error) };
  }

  res.json(result);
});
