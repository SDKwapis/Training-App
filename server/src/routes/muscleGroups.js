import { Router } from 'express';
import { pool } from '../db/index.js';

export const muscleGroupsRouter = Router();

muscleGroupsRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM muscle_groups ORDER BY display_order, name'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});
