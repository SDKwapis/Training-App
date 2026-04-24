import { Router } from 'express';
import { pool } from '../db/index.js';
import { authenticate } from '../middleware/authenticate.js';

export const routinesRouter = Router();

routinesRouter.use(authenticate);

// Returns user's own routines + global templates (user_id IS NULL)
routinesRouter.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM routines
       WHERE user_id = $1 OR user_id IS NULL
       ORDER BY user_id NULLS LAST, created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

routinesRouter.get('/:id', async (req, res, next) => {
  try {
    const routineRes = await pool.query(
      'SELECT * FROM routines WHERE id = $1 AND (user_id = $2 OR user_id IS NULL)',
      [req.params.id, req.user.id]
    );
    if (!routineRes.rows.length) return res.status(404).json({ error: 'Routine not found' });

    const slotsRes = await pool.query(
      `SELECT rs.*, mg.name AS muscle_group_name, mg.description AS muscle_group_description
       FROM routine_slots rs
       JOIN muscle_groups mg ON mg.id = rs.muscle_group_id
       WHERE rs.routine_id = $1
       ORDER BY rs.slot_order`,
      [req.params.id]
    );

    res.json({ ...routineRes.rows[0], slots: slotsRes.rows });
  } catch (err) {
    next(err);
  }
});

routinesRouter.post('/', async (req, res, next) => {
  try {
    const { name, description, slots = [] } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const routineRes = await client.query(
        'INSERT INTO routines (name, description, user_id) VALUES ($1, $2, $3) RETURNING *',
        [name, description || null, req.user.id]
      );
      const routine = routineRes.rows[0];

      for (let i = 0; i < slots.length; i++) {
        const s = slots[i];
        await client.query(
          `INSERT INTO routine_slots (routine_id, muscle_group_id, slot_order, sets_target, rep_range_min, rep_range_max, tut_target_seconds)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [routine.id, s.muscle_group_id, i + 1, s.sets_target || 1, s.rep_range_min || 8, s.rep_range_max || 12, s.tut_target_seconds || 60]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ ...routine, slots });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

routinesRouter.put('/:id', async (req, res, next) => {
  try {
    const { name, description, slots } = req.body;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Only allow editing own routines, not global templates
      const routineRes = await client.query(
        `UPDATE routines SET name = COALESCE($1, name), description = COALESCE($2, description)
         WHERE id = $3 AND user_id = $4 RETURNING *`,
        [name, description, req.params.id, req.user.id]
      );
      if (!routineRes.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Routine not found or not editable' });
      }

      if (slots) {
        await client.query('DELETE FROM routine_slots WHERE routine_id = $1', [req.params.id]);
        for (let i = 0; i < slots.length; i++) {
          const s = slots[i];
          await client.query(
            `INSERT INTO routine_slots (routine_id, muscle_group_id, slot_order, sets_target, rep_range_min, rep_range_max, tut_target_seconds)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [req.params.id, s.muscle_group_id, i + 1, s.sets_target || 1, s.rep_range_min || 8, s.rep_range_max || 12, s.tut_target_seconds || 60]
          );
        }
      }
      await client.query('COMMIT');
      res.json(routineRes.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

routinesRouter.delete('/:id', async (req, res, next) => {
  try {
    // Only allow deleting own routines
    const { rowCount } = await pool.query(
      'DELETE FROM routines WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (!rowCount) return res.status(404).json({ error: 'Routine not found or not deletable' });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});
